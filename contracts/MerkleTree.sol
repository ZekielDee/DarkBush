// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract MerkleProof {
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        uint index
    ) public pure returns (bool) {
        bytes32 hash = leaf;

        for (uint i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, proofElement));
            } else {
                hash = keccak256(abi.encodePacked(proofElement, hash));
            }

            index = index / 2;
        }

        return hash == root;
    }
}

contract MerkleTree is MerkleProof {
    bytes32 root;
    bytes32[] leaves;
    uint max_leaves;
    uint next;
    bytes32 [] next_proof;
    
    // number of levels including leaves
    uint8 levels;

    // index of zero_nodes corresponds to level.
    bytes32[] zero_nodes;

    constructor (uint8 _levels) {
        levels = _levels;
        next = 0;

        zero_nodes.push(keccak256(abi.encodePacked('0')));

        // fill up zero_nodes
        for (uint8 i=1; i < levels; i++){
            bytes32 node = Hash(zero_nodes[i-1], zero_nodes[i-1]);
            zero_nodes.push(node);
            next_proof.push(zero_nodes[i]);
        }

        max_leaves = 2**(levels - 1);
        root = Hash(zero_nodes[levels - 1], zero_nodes[levels - 1]);
    }

    function Hash(bytes32 _x, bytes32 _y) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(_x, _y)
            );
    }

    function insert(bytes32 _leaf) public returns (bool) {
        if (next >= max_leaves){
            return false;
        }
        uint current = next;
        next++;
        bytes32 current_hash = _leaf;
        bytes32 left;
        bytes32 right;

        bool always_right_nodes = true;
        for (uint8 i = 0; i < levels; i++) {
            if (current % 2 == 0) {

                left = current_hash;
                right = zero_nodes[i];     

                if (always_right_nodes) {
                    next_proof[i] = left;
                }       
                always_right_nodes = false;   
            } else {
                left = next_proof[i];
                right = current_hash;
            }
            current_hash = Hash(left, right);
            current /= 2;
        }
        root = current_hash;
        return true;
    }

}