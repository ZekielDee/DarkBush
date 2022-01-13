const fs = require("fs");


const generateWitness = async (inputSignals, wasm, WITNESS_FILE, witness_calculator) => {
    const buffer = fs.readFileSync(wasm);
    const witnessCalculator = await witness_calculator(buffer);
    const buff = await witnessCalculator.calculateWTNSBin(inputSignals, 0);
    fs.writeFileSync(WITNESS_FILE, buff);
    return buff;
  }

module.exports = {
    generateWitness
}