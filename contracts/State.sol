// SPDX-License-Identifier: UNLICENCED
pragma solidity >=0.4.22 <0.9.0;

import "./MerkleTree.sol"

interface ProofVerifier {
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[1] memory input
        ) external returns (bool r);
}

contract DarkBush {

    struct Planet {
        address owner;
        uint256 last_spawn;
        bool occupied;
    }

    ProofVerifier verifier;
    MerkleTree tree;

    //hashed position to planet
    mapping(uint256 => Planet) public planets;

    constructor (address _verifier) public {
        verifier = ProofVerifier(_verifier);   
    }

    function spawn(
            uint[2] memory _a,
            uint[2][2] memory _b,
            uint[2] memory _c,
            uint[1] memory _input
        ) public {
        bool valid = verifier.verifyProof(_a, _b, _c, _input);
        require(valid, "invalid proof");

        Planet storage planet = planets[_input[0]];
        require(planet.last_spawn < block.timestamp - 5 minutes , "Another player has spawned here recently");
        require(planet.occupied == false, "Planet already occupied");

        planet.last_spawn = block.timestamp;
        planet.occupied = true;
    }
 }