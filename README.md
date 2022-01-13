# DarkBush

npm install

#how to test smart contracts on remix

#Get the spawn proof:
cd ./circuits/init
bash compile.sh
bash generate_calldata.sh

#Get the move proof
cd ./circuits/move
bash compile.sh
bash generate_calldata.sh

deploy the State.sol and Verifier.sol
copy and paste the data into remix 

copy and paste the init proof into remix to spawn a player.
then copy and paste the move proof into remix to move that same player
