const readline = require('readline');
const _ = require('lodash');
const snarkjs = require("snarkjs");
const fs = require("fs");
const Web3 = require('web3');

const web3 = new Web3('http://localhost:7545');

web3.eth.account;



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Input Coordinates (x,y) : ', (answer) => {
  process.exit(0);
});