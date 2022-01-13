// SPDX-License-Identifier: UNLICENCED
pragma solidity >=0.4.22 <0.9.0;

//import "./MerkleTree.sol";

interface ProofVerifier {
    function verifyInitProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external view returns (bool);

    function verifyMoveProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input
    ) external view returns (bool);
}

contract DarkBush {

    struct Planet {
        address owner;
        uint256 last_spawn;
        bool occupied;
        uint max_collection;
        address[6] players; // players currently on the planet
        mapping(address => ResidentData) residents_data; //data of players currently residing on planet
        bool init;
    }

    struct ResidentData {
        uint arrival_time;
    }

    struct Player {
        uint location;  
        uint resources;
        uint pending_resources;
        uint lastMoved;
    }

    ProofVerifier verifier;
    //MerkleTree tree;

    //hashed position to Planet
    mapping(uint256 => Planet) public planets;

    //address to Player location, current number of resources, 
    mapping(address => Player) public players;
    
    
    // stores locations where players have spawned
    uint[] public spawnLocations;

    event Spawned(address player, uint hash);
    event Colection(uint location);
    event Move(address player, uint initialPosition, uint finalPosition);

    modifier onlyPlayer() {
        require(players[msg.sender].location != 0, "you must be a player");
        _;
    }

    constructor (address _verifier) public {
        verifier = ProofVerifier(_verifier);   
    }

    function spawn(
            uint[2] memory _a,
            uint[2][2] memory _b,
            uint[2] memory _c,
            uint[3] memory _input
        ) public returns (bool) {
        require(players[msg.sender].location == 0, "This account already has a player");

        bool valid = verifier.verifyInitProof(_a, _b, _c, _input);
        require(valid, "invalid proof");

        // initialize the planet/location of player
        Planet storage planet = planets[_input[0]];

        require(planet.last_spawn < block.timestamp - 5 minutes , "Another player has spawned here recently");
        require(planet.occupied == false, "Planet already occupied");
        

        planet.last_spawn = block.timestamp;
        planet.occupied = true;
        planet.max_collection = R(_input[0]);
        planet.owner = msg.sender;
        planet.players[0] = (msg.sender);
        planet.init = true;
        planet.residents_data[msg.sender] = ResidentData(block.timestamp);

        // map player to address.
        Player storage player = players[msg.sender];
        player.location = _input[0];

        spawnLocations.push(_input[0]);
        emit Spawned(msg.sender, _input[0]);
        return true;
    }

    function R(uint hash) public returns (uint) {
        return hash % 4;
    }

    function move(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[4] memory _input
    ) onlyPlayer public returns (bool) {
        bool valid = verifier.verifyMoveProof(_a, _b, _c, _input);
        require(valid, "invalid proof");

        // initial and final position hashes
        uint256 pi = _input[0];
        uint256 pf = _input[1];

        Player storage player = players[msg.sender];
        require(block.timestamp - 30 > player.lastMoved, "wait 30 seconds after moving");
        player.lastMoved = block.timestamp;

        require(player.location == pi, "initial position doesn't match");
        
        // if player didn't move
        if (pi == pf) {
            return true;
        }

        // move player
        player.location = pf;

        // leaving mechanism
        Planet storage fromPlanet = planets[pi];
        // remove player from the planet record of players
        for (uint i=0; i<fromPlanet.players.length; i++) {
            if (msg.sender == fromPlanet.players[i]){
                fromPlanet.players[i] = address(0);
                break;
            }
        } 

        // if owner then collect and transfer ownership
        if (fromPlanet.owner == msg.sender) {
            //collecting 
            player.resources += player.pending_resources;

            //transfer ownership
            fromPlanet.owner = address(0);
            uint most_recent = 0;
            address recent_player;
            for (uint i=0; i<fromPlanet.players.length; i++) {
                address addr = fromPlanet.players[i];
                if (addr == address(0)) {
                    continue;
                } else if (fromPlanet.residents_data[addr].arrival_time > most_recent) {
                    most_recent = fromPlanet.residents_data[addr].arrival_time;
                    recent_player = addr;
                }
            }
            fromPlanet.owner = recent_player;
            if (fromPlanet.owner == address(0)) {
                fromPlanet.occupied = false;
            }
        }
        player.pending_resources = 0;

        // arrival mechanism
        Planet storage toPlanet = planets[pf];

        // if planet not initialized
        if (! toPlanet.init) {
            toPlanet.max_collection = R(pf);
        }
        toPlanet.residents_data[msg.sender] = ResidentData(block.timestamp);
        address prevOwner = toPlanet.owner;
        toPlanet.owner = msg.sender;
        
        // add player to players on the planet.
        for (uint i =0; i < toPlanet.players.length; i++) {
            if (toPlanet.players[i] == address(0) ){
                toPlanet.players[i] = msg.sender;
            }
        }
        // get previous owner's pending resources
        players[msg.sender].resources += players[prevOwner].pending_resources;
        players[prevOwner].pending_resources = 0;
        return true;
    }

    function collect(uint _amount) onlyPlayer external returns (uint pending_resources) {
        Player storage player = players[msg.sender];
        Planet storage planet = planets[player.location];
        require(_amount >= 0 && _amount <= planet.max_collection, "invalid amount to collect, must be in range of [0,R(T)]");
        if (planet.owner == msg.sender) {
            player.pending_resources += _amount;
            return player.pending_resources;
        } else {
            // you weren't owner of the planet.
            return 0;
        }
    }

    function getLocationHash() external view returns (uint) {
        require(players[msg.sender].location != 0);
        return players[msg.sender].location;
    }

    function getLocationMaxResources() onlyPlayer external returns (uint) {
        return R(players[msg.sender].location);
    }

    function playerExists() external view returns (bool) {
        if (players[msg.sender].location != 0){
            return true;
        } else {
            return false;
        }
    }

    function getSpawnedLocations() external view returns (uint[] memory) {
        return spawnLocations;
    }
 }