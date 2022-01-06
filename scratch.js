const web3 = require('web3');
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
let hex = "0x10030243890152295658636601240053351346265826279175588697248336855544229606268";//"0x0b6d37e6214be13de0dee740f2a1f705a9183214a3815ee19a2e1d16044c6f18";
let num = 9386300031614224723096367947335726970742764014420585361177282100268713306737;
console.log(web3.utils.hexToNumberString(hex));
