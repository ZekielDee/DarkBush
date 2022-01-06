const readline = require('readline');
const _ = require('lodash');
const snarkjs = require("snarkjs");
const fs = require("fs");
const Web3 = require('web3');
const { isPrimitive } = require('util');
const web3 = new Web3('http://localhost:8545');
const game_addr = '0x7dF7F927494d4Fd0d10d7058c88805BBb3fAde17'; //replace w/ game_addr
const verifier_addr = '0x3E4d4D9D11509fe40c35aB545B7eD9914508b179'; //replace w/ verifier_addr
const wasm = './circuit_js/circuit.wasm';
const zkey = './circuit_0001.zkey';
const WITNESS_FILE = './witness.wtns';
const witness_calculator = require('/home/zekiel/assignment1/circuit_js/witness_calculator.js'); //replace w/ absolute path
const State_contract = require('/home/zekiel/assignment1/build/contracts/DarkBush.json'); // replace w/ absolute path
const { spawn } = require("child_process");

const Contract = new web3.eth.Contract(State_contract.abi, game_addr);

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
  const Account = web3.eth.accounts.create(web3.utils.randomHex(32));
  console.log(`address created on chain: ${Account.address}`);
  const calldata = _.split(stdout, '"');
  let hexes = [];
  for (let i=0; i< calldata.length; i++){
    if (Number(calldata[i])){
      hexes.push(calldata[i]);
    }
  }
  //console.log(hexes);
  
  //spawn arguments
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
  Contract.methods.spawn(_a, _b, _c, _input).call({from: Account.address}, function(error, result) {
    console.log(error);
    console.log(JSON.stringify(result));
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
const spawnPlayer = async (answer) => {
  if (answer == 'Y'){
    const [x,y] = getCoordinates();
    const witness = await generateWitness({ x , y , r1: 64 , r2: 32 });
    const cmd1 = spawn("snarkjs", ["groth16" ,"prove","circuit_0001.zkey" ,"./witness.wtns", "proof.json" ,"public.json"]);

    cmd1.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    cmd1.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    cmd1.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    cmd1.on("close", code => {
        console.log(`child process exited with code ${code}`);
        const cmd2 = spawn("snarkjs",["zkey", "export", "soliditycalldata", "public.json", "proof.json"]);
        cmd2.stdout.on("data", submitProof);
        cmd2.stderr.on("data", data => {
          console.log(`stderr: ${data}`);
        });
  
        cmd2.on('error', (error) => {
          console.log(`error: ${error.message}`);
        });
  
    });
    
    
  }
}

rl.question('Spawn Player? (Y/N) ', spawnPlayer); 





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

