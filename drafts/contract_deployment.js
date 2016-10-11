module.exports = function(deployer) {

  //var deployerAccount = 0xe405a5e9d87bc7ef7e95c0f13e92d7af12fc7639
  var deployerAccount = "0xbba13dcdc75669ee4788e9c206258ba7ccdd53dd";

  deployer.deploy(Migrations, {from: deployerAccount, gas: 3000000});
  deployer.deploy(PromissoryToken, deployerAccount, 10,
    {from: deployerAccount, gas: 3000000}).then(function() {
        try {
            PromissoryToken.deployed(); // throws if not deployed
            
            console.log('PromissoryToken deployed');
        }
        catch(e) {
            console.log('PromissoryToken deployment failed.');
        }
    });
};
