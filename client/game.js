const readline = require('readline');
const _ = require('lodash');
const snarkjs = require("snarkjs");
const fs = require("fs");
const ff = require("ffjavascript");
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const game_addr = '0xaaD515E4E38ED05e21CA3e2b0acbE72dC2e16e0d'; //replace w/ game_addr
//const verifier_addr = '0x13cba4ac4aa6da5658938c79add0301c6deb15df'; //replace w/ verifier_addr
const wasm = './circuit_js/circuit.wasm';
const zkey = './circuit_0001.zkey';
const WITNESS_FILE = './witness.wtns';
const witness_calculator = require('/home/zekiel/assignment1/circuit_js/witness_calculator.js'); //replace w/ absolute path
const State_contract = require('/home/zekiel/assignment1/build/contracts/DarkBush.json'); // replace w/ absolute path
const { spawn } = require("child_process");
const {unstringifyBigInts} = ff.utils;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



// helper functions
const getCoordinates = () => {
  let success = false;
  let x;
  let y;
  while (!success){
    x = getRandomInt(0, 64**2);
    y = getRandomInt(0, 64**2);
    if (
      x**2 + y**2 <= 64**2 &&
      x**2 + y**2 >= 32 **2 &&
      GCD(x,y) > 1 &&
      ! isPrimeAndNot1(GCD(x,y))
    ){
      success = true;
    }
  }
  return [x,y];
}

//Euclid's Algorithm for finding GCD
function GCD (x,y) {
  let n1;
  let n2;
  n1 = x;
  n2 = y;
  while (n1 != n2) {
      if (n1 > n2){
          n1 = n1 - n2;
      } else {
          n2 = n2 - n1;
      }
  }
  return n2;
}

// returns 1 if prime.
function isPrimeAndNot1(n) {
  if (n == 1) {
      return 0;
  }
  for (let i=2; i<n; i++){
      if (n % i == 0){
          return 0;
      }
  }
  return 1;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const generateWitness = async (inputSignals) => {
  const buffer = fs.readFileSync(wasm);
  const witnessCalculator = await witness_calculator(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(inputSignals, 0);
  fs.writeFileSync(WITNESS_FILE, buff);
  return buff;
}

const submitProof = async (stdout) => {
  console.log(`address used on chain: ${address}`);
  const calldata = _.split(stdout, '"');
  let hexes = [];
  for (let i=0; i< calldata.length; i++){
    if (Number(calldata[i])){
      hexes.push(calldata[i]);
    }
  }
  /*
            uint[2] memory _a,
            uint[2][2] memory _b,
            uint[2] memory _c,
            uint[1] memory _input
  */
  const _a = [hexes[0], hexes[1]];
  const _b = [[hexes[2],hexes[3]],[hexes[4],hexes[5]]];
  const _c = [hexes[6],hexes[7]];
  const _input = [hexes[8]];
  console.log(_a);
  console.log(_b);
  console.log(_c);
  console.log(_input);
  Contract.methods.spawn(_a, _b, _c, _input).send({from: address}).on('transactionHash', function(hash){
    })
      .on('confirmation', function(confirmationNumber, receipt){  
    })
      .on('receipt', function(receipt){
      console.log(JSON.stringify(result));
      rl.question('Get PlanetIDs? (Y/N) ', getIds);
    }).on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log(error);
      console.log(receipt);
      console.log("error initializing player...");
    });

}

// main functions

/*
    Things to implement:
    create address on ganache chain for player
    create valid coordinates locally => need to get planets array from blockchain 
    + have a psuedorandom algo for creating coordinates that fit those mathematical constraints.
    create proof for those valid coordinates,
    call spawn user on the blockchain with proof solidity call data
    output address + private coordinates for user.

    can call simple function on the blockchain that gets the current user's location.

    After you have spawned. Can you log back in to the program?
    First ask if you are an existing player then you can input your address and log in. then you can either make simple interaction or exit.
    */ 

const Contract = new web3.eth.Contract(State_contract.abi, game_addr);

const spawnPlayer = async (answer) => {
  if (answer == 'Y'){
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    const [x,y] = getCoordinates();
    console.log(`Coords: (${x},${y})`);
    const witness = await generateWitness({ x , y , r1: 64 , r2: 32 });
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      zkey,
      WITNESS_FILE
    );
  
      const editedPublicSignals = unstringifyBigInts(publicSignals);
      const editedProof = unstringifyBigInts(proof);
  
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );
  
    const calldataSplit = calldata.split(",");
    let a = eval(calldataSplit.slice(0, 2).join());
    let b = eval(calldataSplit.slice(2, 6).join());
    let c = eval(calldataSplit.slice(6, 8).join());
    let input = eval(calldataSplit.slice(8, 12).join());
  
    await Contract.methods
      .spawn(a,b,c,input)
      .send({ from: accounts[0], gas: 3000000 })
      .then(console.log);
    console.log("Calling the smart contract function to get the planet Ids");
    await Contract.methods.getPlanetIds().call({from: accounts[0]}).then(console.log);
    process.exit(0);
  } else {
    console.log('GoodBye!');
    process.exit(0);
  }
}

const getIds = async (answer) => {
  Contract.methods.getPlanetIds().send({from: address}, function(error, result) {
    if (error) {
      console.log("error getting ids ...");
      process.exit(0);
    }
    console.log(result);
  });
}

// rl.question('input address: ', (addr) => {
//   address = addr;
//   console.log(address);
// })

rl.question('Spawn Player? (Y/N) ', spawnPlayer);

//rl.question('Get PlanetIDs? (Y/N) ', getIds);





// async function run() {
//     const { proof, publicSignals } = await snarkjs.groth16.fullProve({a: 10, b: 21}, "circuit.wasm", "circuit_final.zkey");

//     console.log("Proof: ");
//     console.log(JSON.stringify(proof, null, 1));

//     const vKey = JSON.parse(fs.readFileSync("verification_key.json"));

//     const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

//     if (res === true) {
//         console.log("Verification OK");
//     } else {
//         console.log("Invalid proof");
//     }

// }

// run().then(() => {
//     process.exit(0);
// });

