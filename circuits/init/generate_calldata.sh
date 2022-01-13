node ./circuit_js/generate_witness.js ./circuit_js/circuit.wasm ./input.json witness.wtns
snarkjs groth16 prove circuit_0001.zkey ./witness.wtns proof.json public.json
snarkjs groth16 verify verification_key.json ./public.json ./proof.json
snarkjs zkey export soliditycalldata public.json proof.json
