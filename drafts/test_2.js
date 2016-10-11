
var assert = require('chai').assert;

contract('PromissoryToken', function(accounts) {
var founder_address = "0xbba13dcdc75669ee4788e9c206258ba7ccdd53dd"; // address of founder
var account_one = "0xb01d394a8c54de6abaa4c50f41b5a1b8236eb787"; //backer address
var account_two = "0x704f82df128f3dc2e732a45599e3f483e3b4fbb1"; //backer address
var account_three = "0x3521dbf5962f4e3754e5c9b701d39946438922dd"; //backer address
var account_four = "0x45e4470fc4dd45f4012f2a11937a07442018902a"; //backer address
var account_five = "0x5e364c0975556b26c857e62583f8d8785f641f30"; //backer address
var account_six = "0xf79d4eceb4b85df4b1ae064c3eef6f311f6c5d49"; //backer address

it("should fail while trying to set early backer from address other than founder address",function(){
    PromissoryToken.deployed().setPrepaid(account_one,10,100000,"og43",2,{from: account_two}).then(function(backerid){
        //this test is expected to fail so this callback shouldnt be called
        return false;
    }).catch(function(e){
        return true;
    });

});

it("should set an early backer with 1000000 tokens",function(){
    PromissoryToken.deployed().setPrepaid(account_two,20,1000000,"wonder40",1,{from: founder_address}).then(function(backerid){
        return true;
    }).catch(function(e){
        return false;
    });
});

it("should set an early backer with 5000000 tokens",function(){
    PromissoryToken.deployed().setPrepaid(account_one,30,500000,"wonder140",3,{from: founder_address}).then(function(backerid){
        return true;
    }).catch(function(e){
        return false;
    });
});

it("claim tokens as an early backer:account_one", function(){
    PromissoryToken.deployed().claimPrepaid(1,30,500000,"wonder140",3,{from: founder_address}).then(function(tx_id){
        return true;
    }).catch(function(e){
        return false;
    });
});

it("should fail while setting an early backer with 4000000 tokens",function(){
    PromissoryToken.deployed().setPrepaid(account_three,30,4000000,"wonder1400",4,{from: founder_address}).then(function(backerid){
        return false;
    }).catch(function(e){
        return true;
    });
});

it("should fail why trying to set more than five backers",function(){
PromissoryToken.deployed().setPrepaid(account_three,30,2000000,"wonder14000",4,{from: founder_address}).then(function(backerid){

}).then(function(){
    PromissoryToken.deployed().setPrepaid(account_four,30,1000000,"wonder140000",5,{from: founder_address}).then(function(backerid){

    });
}).then(function(){
    PromissoryToken.deployed().setPrepaid(account_five,40,200000,"wonder1400000",6,{from: founder_address}).then(function(backerid){

    });
}).then(function(){
    PromissoryToken.deployed().setPrepaid(account_six,50,400000,"wonder1400000",7,{from: founder_address}).then(function(backerid){
        return false;
    }).catch(function(e){
        return true;
    });
});
});
});
