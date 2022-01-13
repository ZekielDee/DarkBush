const readline = require('readline');
const _ = require('lodash');
const snarkjs = require("snarkjs");
const fs = require("fs");
const ff = require("ffjavascript");
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const gameAddr = '0x0287300C29a53E2911b73be7838063fcf01CF00a'; //replace w/ game_addr
const inquirer = require('inquirer')
// const wasm = './circuit_js/circuit.wasm';
// const zkey = './circuit_0001.zkey';
// const WITNESS_FILE = './witness.wtns';
// const witness_calculator = require('/home/zekiel/DarkBush/circuit_js/witness_calculator.js'); //replace w/ absolute path
const StateContract = require('/home/zekiel/DarkBush/build/contracts/DarkBush.json'); // replace w/ absolute path
const {unstringifyBigInts} = ff.utils;


// Move Proof Files
const moveZkey = './circuits/move/circuit_0001.zkey';
const moveWasm = './circuits/move/circuit.wasm';
const moveWitnessFile = './circuits/move/witness.wtns';
const moveWitnessCalculator = require('/home/zekiel/DarkBush/circuits/move/witness_calculator.js');

// Init Proof Files
const initZkey = './circuits/init/circuit_0001.zkey';
const initWasm = './circuits/init/circuit.wasm';
const initWitnessFile = './circuits/init/witness.wtns';
const initWitnessCalculator = require('/home/zekiel/DarkBush/circuits/init/witness_calculator.js');


const { getCoordinates, getNewAddress } = require('./utils.js');
const { generateWitness } = require('./verify.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// main functions

const DarkBush = new web3.eth.Contract(StateContract.abi, gameAddr);

const spawnPlayer = async (address, x, y) => {
    //const accounts = await web3.eth.getAccounts();
    //console.log(accounts[0]);
    const witness = await generateWitness(
      { x , y , r1: 64 , r2: 32 }, 
      initWasm, 
      initWitnessFile, 
      initWitnessCalculator
      );
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      initZkey,
      initWitnessFile
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
  
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //console.log(editedPublicSignals);
  
    const calldataSplit = calldata.split(",");
    let a = eval(calldataSplit.slice(0, 2).join());
    let b = eval(calldataSplit.slice(2, 6).join());
    let c = eval(calldataSplit.slice(6, 8).join());
    let input = eval(calldataSplit.slice(8, 12).join());
    //console.log(input);
    //console.log(address);
    const spawn_result = await DarkBush.methods
      .spawn(a,b,c,input)
      .send({ from: address, gas: 5000000 });
    //console.log(spawn_result);
    //await DarkBush.methods.getPlanetIds().call({from: accounts[0]}).then(console.log);
}

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

  const calldataSplit = calldata.split(",");
  let a = eval(calldataSplit.slice(0, 2).join());
  let b = eval(calldataSplit.slice(2, 6).join());
  let c = eval(calldataSplit.slice(6, 8).join());
  let input = eval(calldataSplit.slice(8, 12).join());
  //access blockchain.
  console.log("input: ", input);
  try {
    await DarkBush.methods.move(
      a,
      b,
      c,
      input
    ).send({from: address, gas: 600000});
  } catch(err){
    console.log('Try again, must wait 30s before moving twice');
  }
  
}

const getIds = async (answer) => {
  DarkBush.methods.getPlanetIds().send({from: address}, function(error, result) {
    if (error) {
      console.log("error getting ids ...");
      process.exit(0);
    }
    console.log(result);
  });
}




const main = async () => {
  let running = true;
  let initialized = false;
  let address;
  let x;
  let y;
  // const ans = await inquirer.prompt([{type:'input', message: 'Existing player? (Enter address, if not enter "N" ):', name: 'login'}]);
   
  // if (ans.login == 'N') {
  // } else {
  //   const exists = await DarkBush.methods.playerExists().call({from: ans});
  //   if (exists) {
  //     address = ans;
  //     initialized = true;
  //   } else {
  //     console.log('Address not found');
  //   }
  // }

  // initialize player
  if (!initialized)
  {
    const ans = await inquirer.prompt([{type: 'input', message:'Spawn Player (Y/N) ? ', name: 'spawn'}]);
    if (ans.spawn == 'Y') {
      address = await getNewAddress();
      console.log(address);
      [x,y] = getCoordinates();
      console.log(`Coords: (${x},${y})`);
      await spawnPlayer(address, x, y);
      initialized = true;
    }
  }

  while (running) {
    const action = await inquirer.prompt(
      {
        type: 'list',
        choices: [
          'Quit',
          'Move',
          'Collect',
          'Find current locations\'s max collection amount',
          'Get player info',
          'Get all spawn locations',
          'Get current planet'
        ],
        name: 'choice'
      },
      {
        type:'input', message:'enter new x coordinate', name:'x'
      }
    );
    if (action.choice == 'Quit') {
      process.exit(0);
    }
    if (action.choice == 'Move') {
      const result1 = await inquirer.prompt({
        type:'input', message:'enter new x coordinate', name:'x'
      });
      const result2 = await inquirer.prompt({
        type: 'input', message: 'enter new y coordinate', name: 'y'
      });
      await movePlayer(address, x, y, result1.x, result2.y);
      x = result1.x;
      y = result2.y;
    } 
    if (action.choice == 'Collect') {
      const result = await inquirer.prompt({
        type:'input', message:'Amount to collect?', name:'amount'
      });
      await DarkBush.methods.collect(result.amount).send({from: address}).then(console.log);
    }
    if (action.choice == 'Find current locations\'s max collection amount') {
      const result = await DarkBush.methods.getLocationMaxResources().call({from: address});
      console.log(result);
    }
    if (action.choice == 'Get player info') {
      const result = await DarkBush.methods.players(address).call({from: address});
      console.log(result); 
    }
    if (action.choice == 'Get all spawn locations'){
      const planetIds = await DarkBush.methods.getSpawnedLocations().call({from:address});
      console.log(planetIds);
    }
    if (action.choice == 'Get current planet') {
      const player = await DarkBush.methods.players(address).call({from:address});
      const planet = await DarkBush.methods.planets(player.location).call({from:address});
      console.log(planet);
    }
    //process.stdout.write('\033c');
  }
}

main();

