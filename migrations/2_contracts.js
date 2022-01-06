var DarkBush = artifacts.require("DarkBush");

var Verifier = artifacts.require("Verifier");

module.exports = function(deployer) {
    deployer.deploy(Verifier).then(function() {
    return deployer.deploy(DarkBush, Verifier.address);
  });
};