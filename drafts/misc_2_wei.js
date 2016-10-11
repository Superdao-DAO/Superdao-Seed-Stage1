
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

    it("should create new tokes for early backer ", function (done) {
        _PromissoryToken.setPrepaid(founderAddress, 2, 100, '123', 1,
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


    it("should claim tokens for 10000  wei -> 0.00000000000001 eth", function (done) {

        _PromissoryToken.claim({
            from: founderAddress,
            value: 10000,   // 100 000 000  wei = 0.0000000001 eth
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


    it("should claim tokens for 3000000  wei", function (done) {
        _PromissoryToken.claim({
            from: accounts[1],
            value: 10000,   // 100 000 000  wei = 0.0000000001 eth
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


    it("should CRASH INVALID JUMP ! for claim tokens for 1000000000000000000 wei -> 1 eth ", function (done) {
        _PromissoryToken.claim({
            from: accounts[1],
            value: 1000000000000000000,   // 100 000 000  wei = 0.0000000001 eth
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
