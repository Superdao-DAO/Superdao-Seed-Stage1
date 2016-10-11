var accounts;
var account;
var balance;
var _PromissoryToken  =  PromissoryToken.at("0x2e4f9a525634ed07613ccd96773eed544e988533");
var myContractInstance;


window.onload = function() {

    web3.eth.getAccounts(function(err, accs) {
        
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }

        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }

        accounts = accs;
        account = accounts[0];

        var abi = _PromissoryToken.abi;
        var MyContract = web3.eth.contract(abi);
        myContractInstance = MyContract.at(_PromissoryToken.address);

        refreshBalance();  
        LoadContractData();


        function refreshBalance(){

            var data = [];
            
            accounts.forEach(function(acc){
                var balanse = web3.eth.getBalance(acc);
                data.push({ acc: acc, bal:  parseFloat( web3.fromWei(balanse.toNumber()) )  });
            });

            $("#card-accounts").html( _.template($('#template-accounts').html())({ data: data })) ;

        }


        //-- Ui  events

        $("#btnSetPrepaidModal").on("click", function(){
            $('.ui.modal').modal('show');
        });

        $('#setPrepaidForm').submit(function() {
            var formData = $('#setPrepaidForm').serializeObject();
            console.log('From data : ', formData);
            setPrepaid(formData);
            return false;
        });

        $("#card-accounts").on("click", ".button",   function(e){
            var address =  $(e.currentTarget).attr("id");
            console.log('Address : ', address);
            BuyTockens(address);
        });


        function setPrepaid(data){

            _PromissoryToken.setPrepaid(

                  data._backer,
                  data._tokenPrice,
                  data._tokenAmount,
                  data._privatePhrase,
                  data._backerRank,

                {from: account ,  gas: 4712388  }).then(function() {
                
                console.log("Transaction complete!");
                refreshBalance();

            }).catch(function(e) {
                console.log(e);
            });
        }

        function BuyTockens(address) {

            myContractInstance.claim({
                  //from: web3.eth.coinbase,
                  from: address,
                  value:web3.toWei(10,'ether'),
                  gas: 4700000

              }, function (err, data) {

                console.log('err : ', err);
                console.log('data : ', data);
            });
        }


        //-- Get Public Data from COntract 
        function LoadContractData() {

            var publicVariables = [];

            var numberEarliestBackers = myContractInstance.numberEarliestBackers().toNumber();
            //var EarlyBackerList = myContractInstance.EarlyBackerList();
            var promissoryUnits = myContractInstance.promissoryUnits().toNumber();
            var prepaidUnits = myContractInstance.prepaidUnits().toNumber();
            var claimedUnits = myContractInstance.claimedUnits().toNumber();
            var redeemedTokens = myContractInstance.redeemedTokens().toNumber();
            var lastPrice = myContractInstance.lastPrice().toNumber();
            
            // -- Update widget 

            publicVariables.push({ name: "numberEarliestBackers", val : numberEarliestBackers  });
            //publicVariables.push({ name: "EarlyBackerList", val : EarlyBackerList  });
            publicVariables.push({ name: "promissoryUnits", val : promissoryUnits  });
            publicVariables.push({ name: "prepaidUnits", val : prepaidUnits  });
            publicVariables.push({ name: "claimedUnits", val : claimedUnits  });
            publicVariables.push({ name: "redeemedTokens", val : redeemedTokens  });
            publicVariables.push({ name: "lastPrice", val : lastPrice  });

            $("#card-variables").html( _.template($('#template-variables').html())({ data: publicVariables })) ;

        }


        //-------------------   Event  Loggers  ---------------------//
        function logger(data){
            var str = "<br><b>" + data.event + "</b> " + JSON.stringify(data.args);
            str += "----------------------" 
            $("#card-logs").prepend(str);
        
        }

        var events = myContractInstance.allEvents();

        // watch for changes
        events.watch(function(error, event){
          if (!error)
            console.log(event);
            logger(event);
        });

    });

}


//-- Helpers
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    console.log(a);
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
