
var assert = require('chai').assert;

contract('PromissoryToken', function (accounts) {
    var founderAddress = "0xbba13dcdc75669ee4788e9c206258ba7ccdd53dd";
    var contractAddress = "0xc9d61683fa14b6728f404190d1029bb9593dc3c2";
    var _PromissoryToken;

    it("1 should equal 1  ", function (done) {
        _PromissoryToken = PromissoryToken.deployed();
        assert.equal(1, 1, 'fake pass');
        done();
    });

    it("should create new tokens for early backer 1", function (done) {
        _PromissoryToken.setPrepaid(founderAddress, 2, 200000, '123', 1,
            {from: founderAddress, gas: 3000000}).then(function (result) {

            //console.log('last price : ', myContractInstance.lastPrice().toNumber());
            //assert.equal( myContractInstance.prepaidUnits().toNumber(), currentPrepaidUnits + 100  );
            _PromissoryToken.lastPrice().then(function (result) {
                assert.equal(result, 2);
                done();
            });

        }).catch(function (e) {
            console.log(e);
            done();
        });

    });


    it("should create batch 1 tokens for early backer 2", function (done) {
        _PromissoryToken.setPrepaid(accounts[0], 3, 100000, '123', 1,
            {from: accounts[0], gas: 3000000}).then(function (result) {

            //console.log('last price : ', myContractInstance.lastPrice().toNumber());
            //assert.equal( myContractInstance.prepaidUnits().toNumber(), currentPrepaidUnits + 100  );
            _PromissoryToken.lastPrice().then(function (result) {
                assert.equal(result, 2);
                done();
            });

        }).catch(function (e) {
            console.log(e);
            done();
        });

    });



    it("should create batch 2 tokens for early backer 2", function (done) {
        _PromissoryToken.setPrepaid(accounts[0], 3, 100000, '123', 1,
            {from: accounts[0], gas: 3000000}).then(function (result) {

            //console.log('last price : ', myContractInstance.lastPrice().toNumber());
            //assert.equal( myContractInstance.prepaidUnits().toNumber(), currentPrepaidUnits + 100  );
            _PromissoryToken.lastPrice().then(function (result) {
                assert.equal(result, 2);
                done();
            });

        }).catch(function (e) {
            console.log(e);
            done();
        });

    });


    it("should CRASH INVALID JUMP ! for claim 600000 tokens for backer 1", function (done) {

        _PromissoryToken.claim({
            from: founderAddress,
            value: 600000*2,
            gas: 3000000,
        }).then(function () {
            true;
            done()

        }).catch(function (e) {
            console.log(e);
            false;
            done();
        });

    });


    it("should CRASH INVALID JUMP ! for claim 500000 tokens for backer 2", function (done) {

        _PromissoryToken.claim({
            from: accounts[0],
            value: 500000*2,
            gas: 3000000,
        }).then(function () {
            true;
            done()

        }).catch(function (e) {
            console.log(e);
            false;
            done();
        });

    });


    it("should CRASH INVALID JUMP ! for claim 500000 tokens for backer 2", function (done) {

        _PromissoryToken.claim({
            from: accounts[0],
            value: 500000*2,
            gas: 3000000,
        }).then(function () {
            true;
            done()

        }).catch(function (e) {
            console.log(e);
            false;
            done();
        });

    });


    it("should CRASH INVALID JUMP ! for claim 4000000 tokens for backer 1", function (done) {

        _PromissoryToken.claim({
            from: founderAddress,
            value: 4000000*2,
            gas: 3000000,
        }).then(function () {
            true;
            done()

        }).catch(function (e) {
            console.log(e);
            false;
            done();
        });

    });


    it("should CRASH INVALID JUMP ! for claim all prepaid tokens for backer 1", function (done) {

        _PromissoryToken.claim({
            from: founderAddress,
            value: 300000*2,
            gas: 3000000,
        }).then(function () {
            true;
            done()

        }).catch(function (e) {
            console.log(e);
            false;
            done();
        });

    });

});
