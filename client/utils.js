const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const game_addr = '0xE3Ee3252A568511676ABf88A79E79D3f2A904288'; //replace w/ game_addr
const State_contract = require('/home/zekiel/DarkBush/build/contracts/DarkBush.json');
const DarkBush = new web3.eth.Contract(State_contract.abi, game_addr);
// helper functions


const getNewAddress = async () => {
    const accounts = await web3.eth.getAccounts();
    for (let i = 0; i<accounts.length; i++ ){
        const result = await DarkBush.methods.playerExists().call({from: accounts[i]});
        if (!result){
            return accounts[i]
        }
    }
}

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

module.exports = {
    getCoordinates,
    GCD,
    isPrimeAndNot1,
    getRandomInt,
    getNewAddress
}