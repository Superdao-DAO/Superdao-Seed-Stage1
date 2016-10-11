var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("PromissoryToken error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("PromissoryToken error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("PromissoryToken contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of PromissoryToken: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to PromissoryToken.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: PromissoryToken not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "2": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "lastPrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newFounderAddr",
            "type": "address"
          },
          {
            "name": "_oneTimesharedPhrase",
            "type": "bytes32"
          }
        ],
        "name": "cofounderApproveSwitchRequest",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "getWithdrawalData",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bytes"
          },
          {
            "name": "",
            "type": "address[]"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "address[]"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "backersAddresses",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numOfBackers",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_totalAmount",
            "type": "uint256"
          },
          {
            "name": "_reason",
            "type": "bytes"
          },
          {
            "name": "_destination",
            "type": "address[]"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_backer",
            "type": "address"
          },
          {
            "name": "_tokenPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "setPrepaid",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_backerAddress",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "checkBalance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_founderHash",
            "type": "bytes32"
          },
          {
            "name": "_oneTimesharedPhrase",
            "type": "bytes32"
          }
        ],
        "name": "founderSwitchRequest",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "claimedPrepaidUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "promissoryUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "withdrawals",
        "outputs": [
          {
            "name": "Amount",
            "type": "uint256"
          },
          {
            "name": "approved",
            "type": "bool"
          },
          {
            "name": "spent",
            "type": "bool"
          },
          {
            "name": "reason",
            "type": "bytes"
          },
          {
            "name": "totalStake",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "backers",
        "outputs": [
          {
            "name": "tokenPrice",
            "type": "uint256"
          },
          {
            "name": "tokenAmount",
            "type": "uint256"
          },
          {
            "name": "privateHash",
            "type": "bytes32"
          },
          {
            "name": "prepaid",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "backerRank",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "prepaidUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_amount",
            "type": "uint256"
          },
          {
            "name": "_backerAddr",
            "type": "address"
          }
        ],
        "name": "redeem",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "backersRedeemed",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "cofounderSwitchAddress",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "previousFounders",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "withdrawalsVotes",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "claimedUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "minimumPrepaidClaimedPercent",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "redeemedTokens",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "approveWithdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "earlyBackerList",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          },
          {
            "name": "_boughtTokensPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "claimPrepaid",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_founderHash",
            "type": "bytes32"
          },
          {
            "name": "_cofounderAddress",
            "type": "address"
          },
          {
            "name": "_numOfBackers",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchRequestEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "CofounderSwitchedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60606040819052622dc6c060055560006006819055600781905560088190556009558080611fdb81395060c06040525160805160a05160008054600160a060020a0319908116331790915560c0848152602090206001556003805490911683179055600b819055505050611f64806100776000396000f3606060405236156101325760e060020a6000350463053f14da811461013b5780631423649b146101445780631ebdd39a146101ba578063269ecc6d1461032f578063359829db14610375578063413bba971461037e578063453fef69146103ba5780634d7b9bd5146103f55780634e71d92d146105325780634f4e1b7414610572578063538df6f21461059d5780635b54f077146105a65780635cc07076146105af57806368808769146106495780636e9c4650146106a85780637bde82f2146106b15780638b03fcfd146106e9578063a47c6b8414610704578063b68165901461072a578063c10fa78914610770578063c63ebcbb14610798578063d0f13638146107a1578063d86b8739146107a9578063ec4673d1146107b2578063fd8bb68114610851578063fedabacf14610897575b6108c55b610002565b6108c7600a5481565b6108d9600435602435600354600090600160a060020a0390811633919091161415806101b05750600160a060020a03831680825260026020526040805181842054600154606060020a949094028252601482019390935260348101859052905190819003605401902014155b15610b8b57610002565b6108ed60043560408051602081810183526000808352835180830185528181528451928301909452808252601080549194859493909285929088908110156100025750825260068702600080516020611f4483398151915201825054601080548990811015610002579060005260206000209060060201600050601080546001929092015460ff16918a9081101561000257906000526020600020906006020160005060020160005060106000508a815481101561000257906000526020600020906006020160005060030160005060106000508b81548110156100025790600052602060002090600602016000506004016000505460106000508c8154811015610002575050604080518454602060026001831615610100026000190190921691909104601f810182900482028301820190935282825260068f02600080516020611f2483398151915201928691830182828015610c5f5780601f10610c3457610100808354040283529160200191610c5f565b6109e8600435600d8054829081101561000257506000527fd7b6990105719101dabeb77144f2a3385c8033acd3af97e9423a695e81ad1eb50154600160a060020a031681565b6108c7600b5481565b6108c560048035906024803580820192908101359160443590810191013560008054600160a060020a03908116339190911614610e0b57610002565b6108c7600480359060248035916044359160643590810191013560843560008054600160a060020a0390811633919091161461100757610002565b610a05600435602435600160a060020a0382166000908152600e602052604081208054829182918291829187908110156100025750805481835260208320600589020154600160a060020a038a1684529190889081101561000257906000526020600020906005020160005060010154600160a060020a0389166000908152600e602052604090208054899081101561000257906000526020600020906005020160005060020154600160a060020a038a166000908152600e6020526040902080548a9081101561000257906000526020600020906005020160005060030154600160a060020a038b166000908152600e60205260409020805460ff92909216918b908110156100025790600052602060002090600502016000506003015493985091965094509250610100900460ff1690509295509295909350565b6108c5600060006006600050546000148061054e575060085481145b806105685750604160066000505460086000505460640204105b1561137557610002565b6108d96004356024356040805160015484825291519081900360200190206000911461156a57610002565b6108c760085481565b6108c760055481565b610a346004356010805482908110156100025750600052600602600080516020611f448339815191528101547f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae676820154600080516020611f04833981519152830154919260ff83811693610100900416917f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae674919091019085565b610ae0600435602435600e6020526000828152604090208054829081101561000257506000908152602090206005909102018054600482015460018301546003840154600294909401549294509260ff81811692610100909204169086565b6108c760065481565b6108d9600435602435600160a060020a0381166000908152600f60205260408120548190819060ff161515600114156115eb5761171d565b6108d9600435600f6020526000908152604090205460ff1681565b6108d9600435600354600090600160a060020a0390811633919091161461172557610002565b6109e860043560048054829081101561000257506000527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b0154600160a060020a031681565b6011602090815260043560009081526040808220909252602435815220546108d99060ff1681565b6108c760075481565b6108c7604181565b6108c760095481565b6108c5600435600160a060020a0333166000908152600e6020526040812054819081908190859082148061081457506010805482908110156100025750825260068102600080516020611f048339815191520154610100900460ff1615156001145b806108475750600160a060020a033316600090815260116020908152604080832084845290915290205460ff1615156001145b1561177b57610002565b6109e8600435600c8054829081101561000257506000527fdf6966c971051c3d54ec59162606531493a51404a002842f56009d7e5cf4a8c70154600160a060020a031681565b6108c56004803590602480359160443591606435908101910135608435600b54600c541015611c7157610002565b005b60408051918252519081900360200190f35b604080519115158252519081900360200190f35b6040518087815260200186151581526020018060200180602001858152602001806020018481038452888181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156109695780820380516001836020036101000a031916815260200191505b508481038352878181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050018481038252858181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f150905001995050505050505050505060405180910390f35b60408051600160a060020a03929092168252519081900360200190f35b604080519586526020860194909452848401929092521515606084015215156080830152519081900360a00190f35b604080518681528515156020820152841515918101919091526080810182905260a0606082018181528454600260018216156101000260001901909116049183018290529060c083019085908015610acd5780601f10610aa257610100808354040283529160200191610acd565b820191906000526020600020905b815481529060010190602001808311610ab057829003601f168201915b5050965050505050505060405180910390f35b6040805196875260208701959095528585019390935290151560608501521515608084015260a0830152519081900360c00190f35b505050600092835250602080832090910180548354600160a060020a03908116600160a060020a0319928316179092558354168617909255604080519286168352517fa92634dc2cc259bcd1937df78de0b4944924ac657eab9e8e273cfdc7f57207ad9281900390910190a15060015b92915050565b60048054600181018083558281838015829011610b1557818360005260206000209182019101610b159190610c1c565b50506006015b80821115610c305760008082556001828101805461ffff1916905560028381018054848255909281161561010002600019011604601f819010610ef357505b5060038201805460008083559182526020909120610f11918101905b80821115610c305760008155600101610c1c565b5090565b820191906000526020600020905b815481529060010190602001808311610c4257829003601f168201915b5050505050935082805480602002602001604051908101604052809291908181526020018280548015610cbc57602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610c9d575b5050505050925080805480602002602001604051908101604052809291908181526020018280548015610d1957602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610cfa575b5050505050905095509550955095509550955091939550919395565b5050600060106000508281548110156100025781835260068102600080516020611f0483398151915201805460ff1916905581548110156100025750815260068202600080516020611f4483398151915201815060010160016101000a81548160ff021916908302179055507f2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613818787876040518085815260200184815260200180602001828103825284848281815260200192508082843782019150509550505050505060405180910390a15b505050505050565b8530600160a060020a0316311015610e2257610002565b6010805460018101808355909190828015829011610e5957600602816006028360005260206000209182019101610e599190610bc1565b505050905085601060005082815481101561000257906000526020600020906006020160005055601080548691869184908110156100025790600052602060002090600602016000506002016000509190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610f3857803560ff19168380011785555b50610f68929150610c1c565b601f016020900490600052602060002090810190610c009190610c1c565b506000600483018190556005830180548282559082526020909120610bbb91810190610c1c565b82800160010185558215610ee7579182015b82811115610ee7578235826000505591602001919060010190610f4a565b505082826010600050838154811015610002575050505060068102600080516020611f24833981519152018054838255600082815260209020908101908490868215610fe1579160200282015b82811115610fe1578154600160a060020a03191683351782556020929092019160019190910190610fb5565b50610d359291505b80821115610c30578054600160a060020a0319168155600101610fe9565b85600014806110165750846000145b806110245750600854600090115b80611039575060055460065460075490870101115b1561104357610002565b600b54600c5414801561106c5750600160a060020a0387166000908152600e6020526040812054145b1561107657610002565b600160a060020a0387166000908152600e602052604081205414156110e557600c8054600181018083558281838015829011611162578183600052602060002091820191016111629190610c1c565b5050506000928352506020909120018054600160a060020a031916881790555b600160a060020a0387166000908152600e6020526040902080546001810180835582818380158290116111b1576005028160050283600052602060002091820191016111b191905b80821115610c30576000808255600182018190556002820181905560038201805461ffff19169055600482015560050161112d565b5050506000928352506020909120018054600160a060020a03191688179055600d80546001810180835582818380158290116110c5578183600052602060002091820191016110c59190610c1c565b50505091909060005260206000209060050201600060c0604051908101604052808a815260200189815260200188888d60405180848480828437820191505082600160a060020a0316606060020a028152601401935050505060405180910390208152602001600181526020016000815260200186815260200150909190915060008201518160000160005055602082015181600101600050556040820151816002016000505560608201518160030160006101000a81548160ff0219169083021790555060808201518160030160016101000a81548160ff0219169083021790555060a0820151816004016000505550505084600660008282825054019250508190555085600a600050819055507fd184b88ef1d6bef3169b2cd0b097417a9d36bab8fa2569359bfa66a753acdf71876001600e60005060008b600160a060020a03168152602001908152602001600020600050805490500388886040518085600160a060020a0316815260200184815260200183815260200182815260200194505050505060405180910390a16001600e600050600089600160a060020a03168152602001908152602001600020600050805490500390509695505050505050565b600a546000141561138557610002565b6064600a60005054603c02049150813404905060056000505460066000505460076000505483010111156113b857610002565b600160a060020a0333166000908152600e6020526040812054141561142757600d8054600181018083558281838015829011611407578183600052602060002091820191016114079190610c1c565b5050506000928352506020909120018054600160a060020a031916331790555b600160a060020a0333166000908152600e60205260409020805460018101808355828183801582901161147357600502816005028360005260206000209182019101611473919061112d565b50505060009283525060408051602080852060c0830184528783528282018781528451606060020a33600160a060020a0316908102825286519182900360140190912085870181905260608681018a90526001608088810182905260a089018c9052975160059a909a02909501988955925193880193909355600287019290925560038601805461ffff19166101001790556004959095018690556007805488019055808652600e8252948390205483519586526000190190850152838201869052918301849052517fdf761fff98210bc6ea2730381881437f9c6906bf5c55547ca736462f0d994c919281900390910190a15050565b60408051600154606060020a600160a060020a03331690810283526014830191909152603482018590528251918290036054018220600082815260026020908152908590209190915590825291517f8ce060fbfcbf4f73f2a8afc74a79fe50080cb2a58ff2de1938be6c6d15504519929181900390910190a1506001610b85565b5060009050805b600160a060020a0384166000908152600e60205260409020548110156116665760406000908120600160a060020a038616909152600e6020528054829081101561000257906000526020600020906005020160005060030154610100900460ff161515600014156116d4576000925061171d565b8482141561171857600160a060020a0384166000818152600f6020908152604091829020805460ff191660011790558151928352820184905280517fc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda9281900390910190a16001925061171d565b600160a060020a0384166000908152600e602052604090208054829081101561000257906000526020600020906005020160005060010154909101906001016115f2565b600092505b505092915050565b60038054600160a060020a0319168317905560408051600160a060020a038416815290517fd1fae327cdd912a890e6b443d3c0143d323f644ab39e65708c2dafa146960e9b9181900360200190a1506001919050565b600160a060020a03331660009081526011602090815260408083208984529091528120805460ff1916600117905594508493505b600160a060020a0333166000908152600e6020526040902054841015611804576040600020805485908110156100025790600052602060002090600502016000506001015490940193600193909301926117af565b60108054879081101561000257506000527f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae67560068702018054600181018083558281838015829011611869578183600052602060002091820191016118699190610c1c565b5050506000928352506020909120018054600160a060020a0319163317905560108054869190889081101561000257506000819052600688027f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae67601805490920190915580547ff53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb918891339189918490811015610002579060005260206000209060060201600050600401600050546040518085815260200184600160a060020a0316815260200183815260200182815260200194505050505060405180910390a160036005600050540460106000508781548110156100025790600052602060002090600602016000506004015410610e03576001601060005087815481101561000257505060068702600080516020611f24833981519152015411915060008214156119db5760108054879081101561000257505060068602600080516020611f4483398151915201549250611a2b565b601080548790811015610002575080546000829052600080516020611f248339815191526006890201549190889081101561000257505060068702600080516020611f4483398151915201540492505b60016010600050878154811015610002576000829052600080516020611f048339815191526006820201805460ff1916841790558154811015610002579060005260206000209060060201600050600101805461ff00191661010092909202919091179055600093505b60108054879081101561000257906000526020600020906006020160005060050154841015611b295760108054879081101561000257602060009081209290526006020160050180548590811015610002579060005260206000209001600060405191546101009190910a9004600160a060020a031690600090859082818181858883f193505050501515611c2057610002565b7f4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a584866010600050888154811015610002579060005260206000209060060201600050600401600050548460106000508a815481101561000257602060009081209290526006020154601080548c908110156100025790600052602060002090600602016000506040805186815260208101869052841515918101919091526060810183905260a060808201818152600293840180546001811615610100026000190116949094049183018290529060c083019084908015611c575780601f10611c2c57610100808354040283529160200191611c57565b60019390930192611a95565b820191906000526020600020905b815481529060010190602001808311611c3a57829003601f168201915b5050965050505050505060405180910390a1505050505050565b600160a060020a0333166000908152600e60205260409020805487908110156100025790600052602060002090600502016000506003015460ff1615156001148015611cfe5750600160a060020a0333166000908152600e602052604090208054879081101561000257906000526020600020906005020160005060030154610100900460ff1615156000145b8015611d425750600160a060020a0333166000908152600e602052604090208054859190889081101561000257906000526020600020906005020160005060010154145b8015611d835750600160a060020a0333166000908152600e602052604090208054869190889081101561000257906000526020600020906005020160005054145b8015611e05575082823360405180848480828437820191505082600160a060020a0316606060020a0281526014019350505050604051809103902060001916600e600050600033600160a060020a0316815260200190815260200160002060005087815481101561000257906000526020600020906005020160005060020154145b8015611e495750600160a060020a0333166000908152600e602052604090208054829190889081101561000257906000526020600020906005020160005060040154145b15610136576001600e600050600033600160a060020a0316815260200190815260200160002060005087815481101561000257906000526020600020906005020160005060030180546101009290920261ff001992909216919091179055600880548501905560408051600160a060020a0333168152602081018890528082018790526060810186905290517f4d13a583c8d4198f45df34a5c6f90d8ad0769df809aab1087290350edbf3011c9181900360800190a1610e03561b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae6731b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae6771b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672",
    "events": {
      "0x8ce060fbfcbf4f73f2a8afc74a79fe50080cb2a58ff2de1938be6c6d15504519": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchRequestEvent",
        "type": "event"
      },
      "0xa92634dc2cc259bcd1937df78de0b4944924ac657eab9e8e273cfdc7f57207ad": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchedEvent",
        "type": "event"
      },
      "0xd1fae327cdd912a890e6b443d3c0143d323f644ab39e65708c2dafa146960e9b": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "CofounderSwitchedEvent",
        "type": "event"
      },
      "0xd184b88ef1d6bef3169b2cd0b097417a9d36bab8fa2569359bfa66a753acdf71": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      "0x4d13a583c8d4198f45df34a5c6f90d8ad0769df809aab1087290350edbf3011c": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      },
      "0xdf761fff98210bc6ea2730381881437f9c6906bf5c55547ca736462f0d994c91": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      "0xc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      "0x2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      "0xf53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      "0x4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a584": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      }
    },
    "updated_at": 1475266319182
  },
  "1999": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "lastPrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "getWithdrawalData",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bytes"
          },
          {
            "name": "",
            "type": "address[]"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "address[]"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_totalAmount",
            "type": "uint256"
          },
          {
            "name": "_reason",
            "type": "bytes"
          },
          {
            "name": "_destination",
            "type": "address[]"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_backer",
            "type": "address"
          },
          {
            "name": "_tokenPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "setPrepaid",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_backerAddress",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "checkBalance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "promissoryUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "backers",
        "outputs": [
          {
            "name": "tokenPrice",
            "type": "uint256"
          },
          {
            "name": "tokenAmount",
            "type": "uint256"
          },
          {
            "name": "privateHash",
            "type": "bytes32"
          },
          {
            "name": "prepaid",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "backerRank",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "prepaidUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_amount",
            "type": "uint256"
          },
          {
            "name": "_backerAddr",
            "type": "address"
          }
        ],
        "name": "redeem",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "backersRedeemed",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "EarlyBackerList",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "claimedUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numberEarliestBackers",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "redeemedTokens",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "approveWithdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          },
          {
            "name": "_boughtTokensPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "claimPrepaid",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_founderAddress",
            "type": "address"
          },
          {
            "name": "_prepaidBackers",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60606040818152622dc6c060025560006003819055600481905560055580611a60833960a090525160805160078054600160a060020a0319168317905560008190555050611a0f806100516000396000f3606060405236156100cf5760e060020a6000350463053f14da81146100d75780631ebdd39a146100e0578063413bba9714610255578063453fef69146102935780634d7b9bd5146102d05780634e71d92d1461040d5780635b54f0771461042a57806368808769146104335780636e9c4650146104925780637bde82f21461049b5780638b03fcfd146104d3578063af576fec146104ee578063c63ebcbb14610534578063caff3bf61461053d578063d86b873914610546578063ec4673d11461054f578063fedabacf146105cb575b6105f9610002565b6105fb60065481565b61060d60043560408051602081810183526000808352835180830185528181528451928301909452808252600b805491948594939092859290889081101561000257508252600687026000805160206119ef83398151915201825054600b80548990811015610002579060005260206000209060060201600050600b80546001929092015460ff16918a90811015610002579060005260206000209060060201600050600201600050600b6000508a8154811015610002579060005260206000209060060201600050600301600050600b6000508b815481101561000257906000526020600020906006020160005060040160005054600b6000508c8154811015610002575050604080518454602060026001831615610100026000190190921691909104601f810182900482028301820190935282825260068f026000805160206119cf833981519152019286918301828280156107c85780601f1061079d576101008083540402835291602001916107c8565b6105f9600480359060248035808201929081013591604435908101910135600754600090600160a060020a0390811633919091161461089e57610002565b6105fb6004803590602480359160443591606435908101910135608435600754600090600160a060020a03908116339190911614610be357610002565b610708600435602435600160a060020a03821660009081526009602052604081208054829182918291829187908110156100025750805481835260208320600589020154600160a060020a038a1684529190889081101561000257906000526020600020906005020160005060010154600160a060020a03891660009081526009602052604090208054899081101561000257906000526020600020906005020160005060020154600160a060020a038a16600090815260096020526040902080548a9081101561000257906000526020600020906005020160005060030154600160a060020a038b166000908152600960205260409020805460ff92909216918b908110156100025790600052602060002090600502016000506003015493985091965094509250610100900460ff1690509295509295909350565b6105f96002546004546006543404919082011115610ef257610002565b6105fb60025481565b61073760043560243560096020526000828152604090208054829081101561000257506000908152602090206005909102018054600482015460018301546003840154600294909401549294509260ff81811692610100909204169086565b6105fb60035481565b61076c600435602435600160a060020a0381166000908152600a60205260408120548190819060ff16151560011415611096576111c8565b61076c600435600a6020526000908152604090205460ff1681565b61078060043560018054829081101561000257506000527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf60154600160a060020a031681565b6105fb60045481565b6105fb60005481565b6105fb60055481565b6105f9600435600160a060020a0333166000908152600960205260408120548190819084908214806105c15750600b8054829081101561000257508252600681027f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dba0154610100900460ff1615156001145b156111d057610002565b6105f9600480359060248035916044359160643590810191013560843560005460015410156116c857610002565b005b60408051918252519081900360200190f35b6040518087815260200186151581526020018060200180602001858152602001806020018481038452888181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156106895780820380516001836020036101000a031916815260200191505b508481038352878181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050018481038252858181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f150905001995050505050505050505060405180910390f35b604080519586526020860194909452848401929092521515606084015215156080830152519081900360a00190f35b6040805196875260208701959095528585019390935290151560608501521515608084015260a0830152519081900360c00190f35b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b820191906000526020600020905b8154815290600101906020018083116107ab57829003601f168201915b505050505093508280548060200260200160405190810160405280929190818152602001828054801561082557602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610806575b505050505092508080548060200260200160405190810160405280929190818152602001828054801561088257602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610863575b5050505050905095509550955095509550955091939550919395565b600b8054600181018083559091908280158290116108d5576006028160060283600052602060002091820191016108d59190610975565b505050905085600b60005082815481101561000257906000526020600020906006020160005055600b80548691869184908110156100025790600052602060002090600602016000506002016000509190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610a2d57803560ff19168380011785555b50610a5d9291506109d0565b50506006015b80821115610a025760008082556001828101805461ffff1916905560028381018054848255909281161561010002600019011604601f8190106109e457505b5060038201805460008083559182526020909120610a06918101905b80821115610a0257600081556001016109d0565b601f0160209004906000526020600020908101906109b491906109d0565b5090565b50600060048301819055600583018054828255908252602090912061096f918101906109d0565b82800160010185558215610963579182015b82811115610963578235826000505591602001919060010190610a3f565b50508282600b6000508381548110156100025750505050600681026000805160206119cf833981519152018054838255600082815260209020908101908490868215610ad6579160200282015b82811115610ad6578154600160a060020a03191683351782556020929092019160019190910190610aaa565b50610afc9291505b80821115610a02578054600160a060020a0319168155600101610ade565b50506000600b60005082815481101561000257818352600681027f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dba01805460ff19169055815481101561000257508152600682026000805160206119ef83398151915201815060010160016101000a81548160ff021916908302179055507f2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613818787876040518085815260200184815260200180602001828103825284848281815260200192508082843782019150509550505050505060405180910390a1505050505050565b6000546001541480610bfa57506002546003548601115b15610c0457610002565b600160a060020a0387166000908152600960205260408120541415610c7257600180548082018083558281838015829011610cef57818360005260206000209182019101610cef91906109d0565b5050506000928352506020909120018054600160a060020a031916881790555b600160a060020a03871660009081526009602052604090208054600181018083558281838015829011610d3e57600502816005028360005260206000209182019101610d3e91905b80821115610a02576000808255600182018190556002820181905560038201805461ffff191690556004820155600501610cba565b5050506000928352506020909120018054600160a060020a0319168817905560088054600181018083558281838015829011610c5257818360005260206000209182019101610c5291906109d0565b50505091909060005260206000209060050201600060c0604051908101604052808a815260200189815260200188888d60405180848480828437820191505082600160a060020a0316606060020a028152601401935050505060405180910390208152602001600181526020016000815260200186815260200150909190915060008201518160000160005055602082015181600101600050556040820151816002016000505560608201518160030160006101000a81548160ff0219169083021790555060808201518160030160016101000a81548160ff0219169083021790555060a08201518160040160005055505050846003600082828250540192505081905550856006600050819055507f197ec0a1b0e5190ab42d5032d648351666ba1cbe46d4f821c9e27aa75fdac435876001600960005060008b600160a060020a0316815260200190815260200160002060005080549050036040518083600160a060020a031681526020018281526020019250505060405180910390a160016009600050600089600160a060020a03168152602001908152602001600020600050805490500390509695505050505050565b600160a060020a0333166000908152600960205260408120541415610f615760088054600181018083558281838015829011610f4157818360005260206000209182019101610f4191906109d0565b5050506000928352506020909120018054600160a060020a031916331790555b600160a060020a03331660009081526009602052604090208054600181018083558281838015829011610fad57600502816005028360005260206000209182019101610fad9190610cba565b50505060009283525060408051602080852060c08301845260065483528282018781528451606060020a33600160a060020a031690810282528651918290036014019091208587018190526060860189905260016080870181905260a087018a90529551600598909802909301968755905193860193909355600285015560038401805461ffff19166101001790556004938401859055835486019093558084526009835292819020548151938452600019019183019190915280517f3a2930cbb83ccd4bf0673633a892d247d5f08554b312d77dcd47c60bd095f3729281900390910190a150565b5060009050805b600160a060020a0384166000908152600960205260409020548110156111115760406000908120600160a060020a03861690915260096020528054829081101561000257906000526020600020906005020160005060030154610100900460ff1615156000141561117f57600092506111c8565b848214156111c357600160a060020a0384166000818152600a6020908152604091829020805460ff191660011790558151928352820184905280517fc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda9281900390910190a1600192506111c8565b600160a060020a038416600090815260096020526040902080548290811015610002579060005260206000209060050201600050600101549091019060010161109d565b600092505b505092915050565b600093508392505b600160a060020a0333166000908152600960205260409020548410156112295760406000208054859081101561000257506000908152602090206005850201600190810154940193909201916111d8565b600b8054869081101561000257506000527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dbc6006860201805460018101808355828183801582901161128e5781836000526020600020918201910161128e91906109d0565b5050506000928352506020909120018054600160a060020a03191633179055600b8054849190879081101561000257506000819052600687027f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dbd01805490920190915580547ff53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb918791339187918490811015610002579060005260206000209060060201600050600401600050546040518085815260200184600160a060020a0316815260200183815260200182815260200194505050505060405180910390a1600360026000505404600b600050868154811015610002579060005260206000209060060201600050600401541061143657600b80548690811015610002575050600685026000805160206119cf83398151915201546001141561143d57600b80548690811015610002575050600685026000805160206119ef8339815191520154915061148d565b820191906000526020600020905b81548152906001019060200180831161140657829003601f168201915b5050965050505050505060405180910390a15b5050505050565b600b805486908110156100025750805460008290526000805160206119cf83398151915260068802015491908790811015610002575050600686026000805160206119ef83398151915201540491505b6001600b6000508681548110156100025760008290527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dba6006820201805460ff1916841790558154811015610002579060005260206000209060060201600050600101805461ff00191661010092909202919091179055600093505b600b805486908110156100025790600052602060002090600602016000506005015484101561159d57600b8054869081101561000257602060009081209290526006020160050180548590811015610002579060005260206000209001600060405191546101009190910a9004600160a060020a031690600090849082818181858883f1935050505015156116bc57610002565b7f4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a58485600b600050878154811015610002579060005260206000209060060201600050600401600050546001600b60005089815481101561000257602060009081209290526006020160050154600b805492909111918a9081101561000257906000526020600020906006020160005054600b80548b908110156100025790600052602060002090600602016000506040805186815260208101869052841515918101919091526060810183905260a060808201818152600293840180546001811615610100026000190116949094049183018290529060c0830190849080156114235780601f106113f857610100808354040283529160200191611423565b60019390930192611509565b600160a060020a0333166000908152600960205260409020805487908110156100025790600052602060002090600502016000506003015460ff16151560011480156117555750600160a060020a03331660009081526009602052604090208054879081101561000257906000526020600020906005020160005060030154610100900460ff1615156000145b801561179a5750600160a060020a0333166000908152600960205260409020805485919088908110156100025790600052602060002090600502016000506001015411155b80156117db5750600160a060020a03331660009081526009602052604090208054869190889081101561000257906000526020600020906005020160005054145b801561185d575082823360405180848480828437820191505082600160a060020a0316606060020a02815260140193505050506040518091039020600019166009600050600033600160a060020a0316815260200190815260200160002060005087815481101561000257906000526020600020906005020160005060020154145b80156118a15750600160a060020a03331660009081526009602052604090208054829190889081101561000257906000526020600020906005020160005060040154145b156119bf57600160a060020a0333166000908152600960205260409020805485919088908110156100025790600052602060002090600502016000506001018054919091039055600160a060020a03331660009081526009602052604090208054879081101561000257906000526020600020906005020160005060010154600014156119bf57600160a060020a0333166000908152600960205260409020805460019190889081101561000257906000526020600020906005020160005060030180546101009290920261ff00199290921691909117905560408051600160a060020a03331681526020810188905281517f87c358f4ca585170ecd5a651b45d3ee4b3e104caeff4aa11fbb6e0839cc183dd929181900390910190a15b6004805485019055505050505050560175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dbe0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db9",
    "events": {
      "0x2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      "0xf53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      "0x4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a584": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      },
      "0xc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      "0x197ec0a1b0e5190ab42d5032d648351666ba1cbe46d4f821c9e27aa75fdac435": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      "0x3a2930cbb83ccd4bf0673633a892d247d5f08554b312d77dcd47c60bd095f372": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      "0x87c358f4ca585170ecd5a651b45d3ee4b3e104caeff4aa11fbb6e0839cc183dd": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      }
    },
    "updated_at": 1473326449499,
    "address": "0x9476c0cce1f7c539484dd9461e719d7cdc489383",
    "links": {}
  },
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "lastPrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newFounderAddr",
            "type": "address"
          },
          {
            "name": "_oneTimesharedPhrase",
            "type": "bytes32"
          }
        ],
        "name": "cofounderApproveSwitchRequest",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "getWithdrawalData",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bytes"
          },
          {
            "name": "",
            "type": "address[]"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "address[]"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "backersAddresses",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numOfBackers",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_totalAmount",
            "type": "uint256"
          },
          {
            "name": "_reason",
            "type": "bytes"
          },
          {
            "name": "_destination",
            "type": "address[]"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_backer",
            "type": "address"
          },
          {
            "name": "_tokenPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "setPrepaid",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_backerAddress",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "checkBalance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_founderHash",
            "type": "bytes32"
          },
          {
            "name": "_oneTimesharedPhrase",
            "type": "bytes32"
          }
        ],
        "name": "founderSwitchRequest",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "claimedPrepaidUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "promissoryUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "withdrawals",
        "outputs": [
          {
            "name": "Amount",
            "type": "uint256"
          },
          {
            "name": "approved",
            "type": "bool"
          },
          {
            "name": "spent",
            "type": "bool"
          },
          {
            "name": "reason",
            "type": "bytes"
          },
          {
            "name": "totalStake",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "backers",
        "outputs": [
          {
            "name": "tokenPrice",
            "type": "uint256"
          },
          {
            "name": "tokenAmount",
            "type": "uint256"
          },
          {
            "name": "privateHash",
            "type": "bytes32"
          },
          {
            "name": "prepaid",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "backerRank",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "prepaidUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_amount",
            "type": "uint256"
          },
          {
            "name": "_backerAddr",
            "type": "address"
          }
        ],
        "name": "redeem",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "backersRedeemed",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "cofounderSwitchAddress",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "previousFounders",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "withdrawalsVotes",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "claimedUnits",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "minimumPrepaidClaimedPercent",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "redeemedTokens",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_withdrawalID",
            "type": "uint256"
          }
        ],
        "name": "approveWithdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "earlyBackerList",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          },
          {
            "name": "_boughtTokensPrice",
            "type": "uint256"
          },
          {
            "name": "_tokenAmount",
            "type": "uint256"
          },
          {
            "name": "_privatePhrase",
            "type": "string"
          },
          {
            "name": "_backerRank",
            "type": "uint256"
          }
        ],
        "name": "claimPrepaid",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_founderHash",
            "type": "bytes32"
          },
          {
            "name": "_cofounderAddress",
            "type": "address"
          },
          {
            "name": "_numOfBackers",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchRequestEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "CofounderSwitchedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60606040819052622dc6c060055560006006819055600781905560088190556009558080611fe281395060c06040525160805160a05160008054600160a060020a0319908116331790915560c0848152602090206001556003805490911683179055600b819055505050611f6b806100776000396000f3606060405236156101325760e060020a6000350463053f14da811461013b5780631423649b146101445780631ebdd39a146101ba578063269ecc6d1461032f578063359829db14610375578063413bba971461037e578063453fef69146103ba5780634d7b9bd5146103f55780634e71d92d146105325780634f4e1b7414610572578063538df6f21461059d5780635b54f077146105a65780635cc07076146105af57806368808769146106495780636e9c4650146106a85780637bde82f2146106b15780638b03fcfd146106e9578063a47c6b8414610704578063b68165901461072a578063c10fa78914610770578063c63ebcbb14610798578063d0f13638146107a1578063d86b8739146107a9578063ec4673d1146107b2578063fd8bb68114610851578063fedabacf14610897575b6108c55b610002565b6108c7600a5481565b6108d9600435602435600354600090600160a060020a0390811633919091161415806101b05750600160a060020a03831680825260026020526040805181842054600154606060020a949094028252601482019390935260348101859052905190819003605401902014155b15610b8b57610002565b6108ed60043560408051602081810183526000808352835180830185528181528451928301909452808252601080549194859493909285929088908110156100025750825260068702600080516020611f4b83398151915201825054601080548990811015610002579060005260206000209060060201600050601080546001929092015460ff16918a9081101561000257906000526020600020906006020160005060020160005060106000508a815481101561000257906000526020600020906006020160005060030160005060106000508b81548110156100025790600052602060002090600602016000506004016000505460106000508c8154811015610002575050604080518454602060026001831615610100026000190190921691909104601f810182900482028301820190935282825260068f02600080516020611f2b83398151915201928691830182828015610c5f5780601f10610c3457610100808354040283529160200191610c5f565b6109e8600435600d8054829081101561000257506000527fd7b6990105719101dabeb77144f2a3385c8033acd3af97e9423a695e81ad1eb50154600160a060020a031681565b6108c7600b5481565b6108c560048035906024803580820192908101359160443590810191013560008054600160a060020a03908116339190911614610e0b57610002565b6108c7600480359060248035916044359160643590810191013560843560008054600160a060020a0390811633919091161461100757610002565b610a05600435602435600160a060020a0382166000908152600e602052604081208054829182918291829187908110156100025750805481835260208320600589020154600160a060020a038a1684529190889081101561000257906000526020600020906005020160005060010154600160a060020a0389166000908152600e602052604090208054899081101561000257906000526020600020906005020160005060020154600160a060020a038a166000908152600e6020526040902080548a9081101561000257906000526020600020906005020160005060030154600160a060020a038b166000908152600e60205260409020805460ff92909216918b908110156100025790600052602060002090600502016000506003015493985091965094509250610100900460ff1690509295509295909350565b6108c5600060006006600050546000148061054e575060085481145b806105685750604160066000505460086000505460640204105b1561137557610002565b6108d96004356024356040805160015484825291519081900360200190206000911461156a57610002565b6108c760085481565b6108c760055481565b610a346004356010805482908110156100025750600052600602600080516020611f4b8339815191528101547f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae676820154600080516020611f0b833981519152830154919260ff83811693610100900416917f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae674919091019085565b610ae0600435602435600e6020526000828152604090208054829081101561000257506000908152602090206005909102018054600482015460018301546003840154600294909401549294509260ff81811692610100909204169086565b6108c760065481565b6108d9600435602435600160a060020a0381166000908152600f60205260408120548190819060ff161515600114156115eb5761171d565b6108d9600435600f6020526000908152604090205460ff1681565b6108d9600435600354600090600160a060020a0390811633919091161461172557610002565b6109e860043560048054829081101561000257506000527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b0154600160a060020a031681565b6011602090815260043560009081526040808220909252602435815220546108d99060ff1681565b6108c760075481565b6108c7604181565b6108c760095481565b6108c5600435600160a060020a0333166000908152600e6020526040812054819081908190859082148061081457506010805482908110156100025750825260068102600080516020611f0b8339815191520154610100900460ff1615156001145b806108475750600160a060020a033316600090815260116020908152604080832084845290915290205460ff1615156001145b1561177b57610002565b6109e8600435600c8054829081101561000257506000527fdf6966c971051c3d54ec59162606531493a51404a002842f56009d7e5cf4a8c70154600160a060020a031681565b6108c56004803590602480359160443591606435908101910135608435600b54600c541015611c7857610002565b005b60408051918252519081900360200190f35b604080519115158252519081900360200190f35b6040518087815260200186151581526020018060200180602001858152602001806020018481038452888181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156109695780820380516001836020036101000a031916815260200191505b508481038352878181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050018481038252858181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f150905001995050505050505050505060405180910390f35b60408051600160a060020a03929092168252519081900360200190f35b604080519586526020860194909452848401929092521515606084015215156080830152519081900360a00190f35b604080518681528515156020820152841515918101919091526080810182905260a0606082018181528454600260018216156101000260001901909116049183018290529060c083019085908015610acd5780601f10610aa257610100808354040283529160200191610acd565b820191906000526020600020905b815481529060010190602001808311610ab057829003601f168201915b5050965050505050505060405180910390f35b6040805196875260208701959095528585019390935290151560608501521515608084015260a0830152519081900360c00190f35b505050600092835250602080832090910180548354600160a060020a03908116600160a060020a0319928316179092558354168617909255604080519286168352517fa92634dc2cc259bcd1937df78de0b4944924ac657eab9e8e273cfdc7f57207ad9281900390910190a15060015b92915050565b60048054600181018083558281838015829011610b1557818360005260206000209182019101610b159190610c1c565b50506006015b80821115610c305760008082556001828101805461ffff1916905560028381018054848255909281161561010002600019011604601f819010610ef357505b5060038201805460008083559182526020909120610f11918101905b80821115610c305760008155600101610c1c565b5090565b820191906000526020600020905b815481529060010190602001808311610c4257829003601f168201915b5050505050935082805480602002602001604051908101604052809291908181526020018280548015610cbc57602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610c9d575b5050505050925080805480602002602001604051908101604052809291908181526020018280548015610d1957602002820191906000526020600020905b8154600160a060020a0316815260019190910190602001808311610cfa575b5050505050905095509550955095509550955091939550919395565b5050600060106000508281548110156100025781835260068102600080516020611f0b83398151915201805460ff1916905581548110156100025750815260068202600080516020611f4b83398151915201815060010160016101000a81548160ff021916908302179055507f2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613818787876040518085815260200184815260200180602001828103825284848281815260200192508082843782019150509550505050505060405180910390a15b505050505050565b8530600160a060020a0316311015610e2257610002565b6010805460018101808355909190828015829011610e5957600602816006028360005260206000209182019101610e599190610bc1565b505050905085601060005082815481101561000257906000526020600020906006020160005055601080548691869184908110156100025790600052602060002090600602016000506002016000509190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610f3857803560ff19168380011785555b50610f68929150610c1c565b601f016020900490600052602060002090810190610c009190610c1c565b506000600483018190556005830180548282559082526020909120610bbb91810190610c1c565b82800160010185558215610ee7579182015b82811115610ee7578235826000505591602001919060010190610f4a565b505082826010600050838154811015610002575050505060068102600080516020611f2b833981519152018054838255600082815260209020908101908490868215610fe1579160200282015b82811115610fe1578154600160a060020a03191683351782556020929092019160019190910190610fb5565b50610d359291505b80821115610c30578054600160a060020a0319168155600101610fe9565b85600014806110165750846000145b806110245750600854600090115b80611039575060055460065460075490870101115b1561104357610002565b600b54600c5414801561106c5750600160a060020a0387166000908152600e6020526040812054145b1561107657610002565b600160a060020a0387166000908152600e602052604081205414156110e557600c8054600181018083558281838015829011611162578183600052602060002091820191016111629190610c1c565b5050506000928352506020909120018054600160a060020a031916881790555b600160a060020a0387166000908152600e6020526040902080546001810180835582818380158290116111b1576005028160050283600052602060002091820191016111b191905b80821115610c30576000808255600182018190556002820181905560038201805461ffff19169055600482015560050161112d565b5050506000928352506020909120018054600160a060020a03191688179055600d80546001810180835582818380158290116110c5578183600052602060002091820191016110c59190610c1c565b50505091909060005260206000209060050201600060c0604051908101604052808a815260200189815260200188888d60405180848480828437820191505082600160a060020a0316606060020a028152601401935050505060405180910390208152602001600181526020016000815260200186815260200150909190915060008201518160000160005055602082015181600101600050556040820151816002016000505560608201518160030160006101000a81548160ff0219169083021790555060808201518160030160016101000a81548160ff0219169083021790555060a0820151816004016000505550505084600660008282825054019250508190555085600a600050819055507fd184b88ef1d6bef3169b2cd0b097417a9d36bab8fa2569359bfa66a753acdf71876001600e60005060008b600160a060020a03168152602001908152602001600020600050805490500388886040518085600160a060020a0316815260200184815260200183815260200182815260200194505050505060405180910390a16001600e600050600089600160a060020a03168152602001908152602001600020600050805490500390509695505050505050565b600a546000141561138557610002565b6064600a60005054603c02049150813404905060056000505460066000505460076000505483010111156113b857610002565b600160a060020a0333166000908152600e6020526040812054141561142757600d8054600181018083558281838015829011611407578183600052602060002091820191016114079190610c1c565b5050506000928352506020909120018054600160a060020a031916331790555b600160a060020a0333166000908152600e60205260409020805460018101808355828183801582901161147357600502816005028360005260206000209182019101611473919061112d565b50505060009283525060408051602080852060c0830184528783528282018781528451606060020a33600160a060020a0316908102825286519182900360140190912085870181905260608681018a90526001608088810182905260a089018c9052975160059a909a02909501988955925193880193909355600287019290925560038601805461ffff19166101001790556004959095018690556007805488019055808652600e8252948390205483519586526000190190850152838201869052918301849052517fdf761fff98210bc6ea2730381881437f9c6906bf5c55547ca736462f0d994c919281900390910190a15050565b60408051600154606060020a600160a060020a03331690810283526014830191909152603482018590528251918290036054018220600082815260026020908152908590209190915590825291517f8ce060fbfcbf4f73f2a8afc74a79fe50080cb2a58ff2de1938be6c6d15504519929181900390910190a1506001610b85565b5060009050805b600160a060020a0384166000908152600e60205260409020548110156116665760406000908120600160a060020a038616909152600e6020528054829081101561000257906000526020600020906005020160005060030154610100900460ff161515600014156116d4576000925061171d565b8482141561171857600160a060020a0384166000818152600f6020908152604091829020805460ff191660011790558151928352820184905280517fc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda9281900390910190a16001925061171d565b600160a060020a0384166000908152600e602052604090208054829081101561000257906000526020600020906005020160005060010154909101906001016115f2565b600092505b505092915050565b60038054600160a060020a0319168317905560408051600160a060020a038416815290517fd1fae327cdd912a890e6b443d3c0143d323f644ab39e65708c2dafa146960e9b9181900360200190a1506001919050565b600160a060020a03331660009081526011602090815260408083208984529091528120805460ff1916600117905594508493505b600160a060020a0333166000908152600e6020526040902054841015611804576040600020805485908110156100025790600052602060002090600502016000506001015490940193600193909301926117af565b60108054879081101561000257506000527f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae67560068702018054600181018083558281838015829011611869578183600052602060002091820191016118699190610c1c565b5050506000928352506020909120018054600160a060020a0319163317905560108054869190889081101561000257506000819052600688027f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae67601805490920190915580547ff53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb918891339189918490811015610002579060005260206000209060060201600050600401600050546040518085815260200184600160a060020a0316815260200183815260200182815260200194505050505060405180910390a16003600760005054600860005054010460106000508781548110156100025790600052602060002090600602016000506004015410610e03576001601060005087815481101561000257505060068702600080516020611f2b833981519152015411915060008214156119e25760108054879081101561000257505060068602600080516020611f4b83398151915201549250611a32565b601080548790811015610002575080546000829052600080516020611f2b8339815191526006890201549190889081101561000257505060068702600080516020611f4b83398151915201540492505b60016010600050878154811015610002576000829052600080516020611f0b8339815191526006820201805460ff1916841790558154811015610002579060005260206000209060060201600050600101805461ff00191661010092909202919091179055600093505b60108054879081101561000257906000526020600020906006020160005060050154841015611b305760108054879081101561000257602060009081209290526006020160050180548590811015610002579060005260206000209001600060405191546101009190910a9004600160a060020a031690600090859082818181858883f193505050501515611c2757610002565b7f4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a584866010600050888154811015610002579060005260206000209060060201600050600401600050548460106000508a815481101561000257602060009081209290526006020154601080548c908110156100025790600052602060002090600602016000506040805186815260208101869052841515918101919091526060810183905260a060808201818152600293840180546001811615610100026000190116949094049183018290529060c083019084908015611c5e5780601f10611c3357610100808354040283529160200191611c5e565b60019390930192611a9c565b820191906000526020600020905b815481529060010190602001808311611c4157829003601f168201915b5050965050505050505060405180910390a1505050505050565b600160a060020a0333166000908152600e60205260409020805487908110156100025790600052602060002090600502016000506003015460ff1615156001148015611d055750600160a060020a0333166000908152600e602052604090208054879081101561000257906000526020600020906005020160005060030154610100900460ff1615156000145b8015611d495750600160a060020a0333166000908152600e602052604090208054859190889081101561000257906000526020600020906005020160005060010154145b8015611d8a5750600160a060020a0333166000908152600e602052604090208054869190889081101561000257906000526020600020906005020160005054145b8015611e0c575082823360405180848480828437820191505082600160a060020a0316606060020a0281526014019350505050604051809103902060001916600e600050600033600160a060020a0316815260200190815260200160002060005087815481101561000257906000526020600020906005020160005060020154145b8015611e505750600160a060020a0333166000908152600e602052604090208054829190889081101561000257906000526020600020906005020160005060040154145b15610136576001600e600050600033600160a060020a0316815260200190815260200160002060005087815481101561000257906000526020600020906005020160005060030180546101009290920261ff001992909216919091179055600880548501905560408051600160a060020a0333168152602081018890528082018790526060810186905290517f4d13a583c8d4198f45df34a5c6f90d8ad0769df809aab1087290350edbf3011c9181900360800190a1610e03561b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae6731b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae6771b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672",
    "events": {
      "0x2548bbbd9451d72acb31e7f0e34e88e1282fc3da07e04bbc5c1bd5b9c5daa613": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalCreatedEvent",
        "type": "event"
      },
      "0xf53708849e2765f9b464fe0ea277477781cd015e043b4f9b443808baceab4bbb": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "backerStakeWeigth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "totalStakeWeight",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalVotedEvent",
        "type": "event"
      },
      "0x4e79909c1fdabdd02c67913800b14c33e14b5529911a1bd2da94c7ffa4b3a584": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "withdrawalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "stakeWeight",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "isMultiPayment",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "reason",
            "type": "bytes"
          }
        ],
        "name": "WithdrawalApproved",
        "type": "event"
      },
      "0xc9d6669025387097e071b826ec190162155c20568d80a132d0bbfefe11c08fda": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RedeemEvent",
        "type": "event"
      },
      "0x197ec0a1b0e5190ab42d5032d648351666ba1cbe46d4f821c9e27aa75fdac435": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      "0x3a2930cbb83ccd4bf0673633a892d247d5f08554b312d77dcd47c60bd095f372": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      "0x87c358f4ca585170ecd5a651b45d3ee4b3e104caeff4aa11fbb6e0839cc183dd": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      },
      "0x66a452a2c2bf4fea54d2712eb5113c3bf7e4eddebdb0fa83cc6982325978f2b5": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "tokenAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "claimedUnits",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "prepaid",
            "type": "uint256"
          }
        ],
        "name": "debugClaimEvent",
        "type": "event"
      },
      "0x47cc5be13f7369e0082c0f70c7fb7f45f67668a99ddb51fc507b3648196543c3": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "tokenAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "claimedUnits",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "prepaid",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "canClaim",
            "type": "bool"
          }
        ],
        "name": "debugClaimEvent",
        "type": "event"
      },
      "0x222c8e956acf58f56a9203a4b5c4a0d1c9d846f2d410577fa2d1e49c6db4fbe3": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchRequest",
        "type": "event"
      },
      "0xa92634dc2cc259bcd1937df78de0b4944924ac657eab9e8e273cfdc7f57207ad": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchedEvent",
        "type": "event"
      },
      "0xd1fae327cdd912a890e6b443d3c0143d323f644ab39e65708c2dafa146960e9b": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newCofounderAddr",
            "type": "address"
          }
        ],
        "name": "CofounderSwitchedEvent",
        "type": "event"
      },
      "0x8ce060fbfcbf4f73f2a8afc74a79fe50080cb2a58ff2de1938be6c6d15504519": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_newFounderAddr",
            "type": "address"
          }
        ],
        "name": "FounderSwitchRequestEvent",
        "type": "event"
      },
      "0xd184b88ef1d6bef3169b2cd0b097417a9d36bab8fa2569359bfa66a753acdf71": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "AddedPrepaidTokensEvent",
        "type": "event"
      },
      "0x4d13a583c8d4198f45df34a5c6f90d8ad0769df809aab1087290350edbf3011c": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PrepaidTokensClaimedEvent",
        "type": "event"
      },
      "0xdf761fff98210bc6ea2730381881437f9c6906bf5c55547ca736462f0d994c91": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "backer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TokensClaimedEvent",
        "type": "event"
      },
      "0x9e7e9d8a4f72d591be6c2579245d21eabb2284fb9a63262bb6879ec21f9e6fc6": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "stake",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "min",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "check",
            "type": "bool"
          }
        ],
        "name": "debugApproveWithdrawEvent",
        "type": "event"
      }
    },
    "updated_at": 1475281015573,
    "address": "0xdfcc5f8b1ef024fd71ec47e750791906f2821464",
    "links": {}
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "PromissoryToken";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.PromissoryToken = Contract;
  }
})();
