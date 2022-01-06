var DarkBush = artifacts.require("DarkBush");

var Verifier = artifacts.require("Verifier");

module.exports = function(deployer) {
    // Deploy A, then deploy B, passing in A's newly deployed address
    deployer.deploy(Verifier).then(function() {
    return deployer.deploy(DarkBush,Verifier.address);
  });
};