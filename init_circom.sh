# circom circuits/circuit.circom --r1cs --wasm --sym --c

# sleep 5


# node ./circuit_js/generate_witness.js ./circuit_js/circuit.wasm ./circuit_js/input.json witness.wtns
# cd ../

# snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
# snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
# snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
# snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
# snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v
# snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json

snarkjs groth16 prove circuit_0001.zkey ./witness.wtns ./tmp/proof.json ./tmp/public.json
# snarkjs groth16 verify verification_key.json ./tmp/public.json ./tmp/proof.json

# snarkjs zkey export solidityverifier circuit_0001.zkey verifier.sol

snarkjs zkey export soliditycalldata ./tmp/public.json ./tmp/proof.json > ./tmp/calldata