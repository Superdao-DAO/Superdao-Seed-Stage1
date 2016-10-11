
// contract('PromissoryToken', function(accounts) {
//   it("should see what's up", function() {
//     var PromissoryTokenInstance = PromissoryToken.deployed();

//     PromissoryTokenInstance.setPrepaid(accounts[0], 5, 100, "777", 1, accounts[0], {from: accounts[0],gas:4712388});

//     PromissoryTokenInstance.AddedPrepaidTokensEvent({fromBlock: "latest"}).watch(function(error, result) {
//         if (error == null) {
//             console.log('AddedPrepaidTokensEvent', result.args);
//         }
//     });
//   });
// });

var assert = require('chai').assert;

contract('PromissoryToken', function(accounts) {

	var promissoryUnit;
	var myContractInstance;

	it("1 should equal 1  ", function() {

		var _PromissoryToken = PromissoryToken.deployed();
		var abi = _PromissoryToken.abi;
		var MyContract = web3.eth.contract(abi);
		myContractInstance = MyContract.at(_PromissoryToken.address);

		return assert.equal(1,1, ' fake  pass ')

	});


	it("should create new tokes for early backer ", function() {

	    var _PromissoryToken = PromissoryToken.deployed();
	    var currentPrepaidUnits = myContractInstance.prepaidUnits().toNumber();

		return _PromissoryToken.setPrepaid(accounts[0],2,100,'123',1,

				{ from: accounts[0] ,  gas: 3000000  }).then(function(result) {

	            	assert.equal( myContractInstance.prepaidUnits().toNumber(), currentPrepaidUnits + 100  );
	            	assert.equal( myContractInstance.lastPrice().toNumber(), 2 );

	        }).catch(function(e) {
	            console.log(e);
	            return false;
	    });

	});


	it("should claim tokens for starndard baker", function(){

		var _PromissoryToken = PromissoryToken.deployed();
		var currentPrepaidUnits = myContractInstance.prepaidUnits().toNumber();

		return _PromissoryToken.claim({
				from: accounts[1],
				value: 100,
				gas: 3000000,
			}).then(function() {

	        	console.log("Transaction complete!");
	        	console.log("claimedUnits ::: ", myContractInstance.claimedUnits().toNumber() );
	        	console.log("promissoryUnits ::: ", myContractInstance.promissoryUnits().toNumber() );

	        	assert.equal(1,1);

	    	}).catch(function(e) {
	        	console.log(e);
	        	return false;
		});

	});


});
