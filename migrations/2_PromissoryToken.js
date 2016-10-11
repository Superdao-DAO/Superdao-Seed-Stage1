module.exports = function(deployer) {
    // TODO write migrations
    return;

    deployer.deploy(PromissoryToken, function() {
        console.log(PromissoryToken.deployed());
    });
};