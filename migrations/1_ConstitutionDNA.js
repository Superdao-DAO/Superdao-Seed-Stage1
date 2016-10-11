module.exports = function(deployer, network) {
    // TODO write migrations
    return;

    deployer.deploy(ConstitutionalDNA, function() {
        console.log(ConstitutionalDNA.deployed());
    });
};