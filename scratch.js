
// // helper functions
// const getCoordinates = () => {
//   let success = false;
//   let x;
//   let y;
//   while (!success){
//     x = getRandomInt(0, 64**2);
//     y = getRandomInt(0, 64**2);
//     if (
//       x**2 + y**2 <= 64**2 &&
//       x**2 + y**2 >= 32 **2 &&
//       GCD(x,y) > 1 &&
//       ! isPrimeAndNot1(GCD(x,y))
//     ){
//       success = true;
//     }
//   }
//   return [x,y];
// }

// //Euclid's Algorithm for finding GCD
// function GCD (x,y) {
//   let n1;
//   let n2;
//   n1 = x;
//   n2 = y;
//   while (n1 != n2) {
//       if (n1 > n2){
//           n1 = n1 - n2;
//       } else {
//           n2 = n2 - n1;
//       }
//   }
//   return n2;
// }

// // returns 1 if prime.
// function isPrimeAndNot1(n) {
//   if (n == 1) {
//       return 0;
//   }
//   for (let i=2; i<n; i++){
//       if (n % i == 0){
//           return 0;
//       }
//   }
//   return 1;
// }

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
// }

// console.log(getCoordinates());

// let x = 2174260317413963038796703389099204017356909597728865606878447131083847655665;
// hexString = x.toString(16);
// console.log(hexString);
var ganache = require("ganache-cli");
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const game_addr = '0xfcf714e9c1e3685c7d690062eaefd1221d343e60'; //replace w/ game_addr
const verifier_addr = '0x13cba4ac4aa6da5658938c79add0301c6deb15df'; //replace w/ verifier_addr
const State_contract = require('/home/zekiel/assignment1/build/contracts/DarkBush.json'); // replace w/ absolute path
const verifier_contract = require('/home/zekiel/assignment1/build/contracts/Verifier.json');
const accounts = web3.eth.personal.getAccounts().then(console.log);
console.log(accounts);
const Contract = new web3.eth.Contract(State_contract.abi, game_addr);
// Contract.methods.getPlanetIds().call({from: '0xbE93c5BdAf9a922440d0312992D30640c3b9c951', function (err, result){
//   console.log(result);
//   console.log(err);
// }});

// const Contract = new web3.eth.Contract(verifier_contract.abi, verifier_addr);
// Contract.methods.verifyProof([
//   '0x2e2d049202064093b06bec7ef3bb09bc793d0fbbc846fb54a4b7d56d1068e4f4',
//   '0x0332dd05fc20338ba53e9a6b073b1d5c953bf2fa3a7fb0ec0b5e2fc589dba742'
// ],
// [
//   [
//     '0x2303e0049c44da3b7280d344a5ff6cf410f98291b8b69729ccb603aaa648f0c5',
//     '0x0d000399cfdc8ccfc85d9af5ce14ac52ad4af6d0fed662ab5bda7624566d47fe'
//   ],
//   [
//     '0x2f2a18515c43f3e1d737ded4ed62b02ccde8bb86279193fe9b784d8c96030cef',
//     '0x08c5a452a73a80ff8d1cf38ccb02b9d6c55cb509a428f392888336d60c477de9'
//   ]
// ],
// [
//   '0x24cc1c10810a7bf81c6868a4941a35048b46b09edbf976c219d4350c86012786',
//   '0x11edc556d68f63e032a6b2b3e0f01d1e7cd134f86b40e1bbe0be12823771bb67'
// ],
// [
//   '0x0a1a277a0aa3882ffabedcea62e2dcebff1f99396bb1c9b1c682cc2a1487476a'
// ]).send({from: '0xbE93c5BdAf9a922440d0312992D30640c3b9c951'}).on;

// Contract.methods.getPlanetId().call({from:'0x7E644C599E36DD3E14fE548b2Ae738e699b6daAe'},function(err, result){
//   console.log(err);
//   console.log(result);
// });
