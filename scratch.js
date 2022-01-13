const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const gameAddr = '0xE3Ee3252A568511676ABf88A79E79D3f2A904288'; //replace w/ game_addr
const StateContract = require('/home/zekiel/DarkBush/build/contracts/DarkBush.json');
const DarkBush = new web3.eth.Contract(StateContract.abi, gameAddr);
const moveZkey = './circuits/move/circuit_0001.zkey';
const moveWasm = './circuits/move/circuit.wasm';
const moveWitnessFile = './circuits/move/witness.wtns';
const moveWitnessCalculator = require('/home/zekiel/DarkBush/circuits/move/witness_calculator.js');
const { generateWitness } = require('./client/verify.js');
const snarkjs = require('snarkjs');
const ff = require("ffjavascript");
const {unstringifyBigInts} = ff.utils;


const movePlayer = async (address, x1, y1, x2, y2) => {
    const witness = await generateWitness(
      { x1 , y1 , x2, y2, r: 128 , distMax: 16 }, 
      moveWasm, 
      moveWitnessFile, 
      moveWitnessCalculator
      );
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      moveZkey,
      moveWitnessFile
    );
  
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
  
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );
  
    //console.log(editedPublicSignals);
    console.log(calldata);
    const calldataSplit = calldata.split(",");
    let a = eval(calldataSplit.slice(0, 2).join());
    let b = eval(calldataSplit.slice(2, 6).join());
    let c = eval(calldataSplit.slice(6, 8).join());
    let input = eval(calldataSplit.slice(8, 12).join());
    //access blockchain.
    console.log('a: ', a);
    console.log('b: ', b);
    console.log('c: ', c);
    console.log("input: ", input);
  
    await DarkBush.methods.move(
      a,
      b,
      c,
      input
    ).send({from: address, gas: 600000}).on('error', console.log);
  }

const init = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = '0x7ce77721D5f3398818C1DA2e26aC2aa608F5aeE5';
    const result = await DarkBush.methods.planets('8525220226097238731530394052586973851543729417208920927504009826152213341808').call({from: account})
    console.log(result);
    //await movePlayer(account, 40, 36, 39, 35);

}

init();