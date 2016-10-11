contract('throw test', function(accounts) {
    var assert = require('chai').assert;

    function checkProperty(property, amount, cb) {
        TestInstance[property].call().then(function(value) {
            console.log(property, value.toNumber(), amount);

            assert.equal(value.toNumber(), amount);

            if (typeof cb == "function") {
                cb();
            }
        });
    }

    function etherToWei(value) {
        return web3.toWei(value, 'ether');
    }

    var
        testPass = "1234",
        testTokenPrice = 0.00001,
        founderAccount = accounts[0],
        events,
        TestInstance;
    //console.log(web3.eth.accounts);
    it("accounts[0] should deploy PromissoryToken test instance", function(done) {
        PromissoryToken.new(testPass, accounts[1], 2, { from: founderAccount }).then(function(instance) {
            console.log("Test instance deployed at: " + instance.address);
            TestInstance = instance;
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it("should pass", function(done) {
        var
            tokenPrice = etherToWei(testTokenPrice),
            tokenAmount = 200000;


        TestInstance.setPrepaid(accounts[1], tokenPrice, tokenAmount, testPass, 1, { from: founderAccount }).then(function(transactionId) {
            console.log(transactionId);

            TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                console.log(error, log);

                checkProperty("prepaidUnits", 200000, done);
            });
        });
    });

    it("should fail", function(done) {
        var
            tokenPrice = etherToWei(testTokenPrice),
            tokenAmount = 200000;

        TestInstance.setPrepaid(accounts[1], tokenPrice, tokenAmount, testPass, 1, { from: accounts[1] }).then(function(transactionId) {
            console.log(transactionId);

            TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                console.log(error, log);

                checkProperty("prepaidUnits", 400000, done);
            });
        });
    });
});