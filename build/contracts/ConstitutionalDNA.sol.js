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
      throw new Error("ConstitutionalDNA error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("ConstitutionalDNA error: contract binary not set. Can't deploy new instance.");
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

      throw new Error("ConstitutionalDNA contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of ConstitutionalDNA: " + unlinked_libraries);
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
      throw new Error("Invalid address passed to ConstitutionalDNA.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: ConstitutionalDNA not deployed or address not set.");
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
        "constant": false,
        "inputs": [],
        "name": "initializedRatify",
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
            "type": "address"
          }
        ],
        "name": "foundingTeam",
        "outputs": [
          {
            "name": "addr",
            "type": "address"
          },
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "role",
            "type": "bytes"
          },
          {
            "name": "rank",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          }
        ],
        "name": "getArticleItem",
        "outputs": [
          {
            "name": "article",
            "type": "bytes"
          },
          {
            "name": "articleNum",
            "type": "uint256"
          },
          {
            "name": "amendible",
            "type": "bool"
          },
          {
            "name": "itemText",
            "type": "bytes"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_founderRanks",
            "type": "uint256[]"
          },
          {
            "name": "_founderAddrs",
            "type": "address[]"
          }
        ],
        "name": "setfoundingTeam",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_article",
            "type": "bytes"
          },
          {
            "name": "_ammendable",
            "type": "bool"
          }
        ],
        "name": "addArticle",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_consensusX",
            "type": "address"
          }
        ],
        "name": "setHome",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_addr",
            "type": "address"
          },
          {
            "name": "_profileName",
            "type": "bytes"
          }
        ],
        "name": "updateProfile",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          },
          {
            "name": "_textChange",
            "type": "bytes"
          }
        ],
        "name": "amendArticleItem",
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
        "name": "constitutionalArticles",
        "outputs": [
          {
            "name": "article",
            "type": "bytes"
          },
          {
            "name": "articleNum",
            "type": "uint256"
          },
          {
            "name": "itemNums",
            "type": "uint256"
          },
          {
            "name": "ammendable",
            "type": "bool"
          },
          {
            "name": "set",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_itemText",
            "type": "bytes"
          }
        ],
        "name": "addArticleItem",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_articleHeading",
            "type": "bytes"
          }
        ],
        "name": "Added",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_itemNum",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_itemText",
            "type": "bytes"
          }
        ],
        "name": "AddedItem",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "_item",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_changeText",
            "type": "bytes"
          }
        ],
        "name": "Amended",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_item",
            "type": "uint256"
          }
        ],
        "name": "Accessed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_addr",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_name",
            "type": "bytes"
          }
        ],
        "name": "FounderUpdate",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_foundingTeam",
            "type": "address[]"
          },
          {
            "indexed": false,
            "name": "_ranks",
            "type": "uint256[]"
          }
        ],
        "name": "teamSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_home",
            "type": "address"
          }
        ],
        "name": "homeSet",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60028054600160b060020a03191681556000600581905533600160a060020a03811682526001602081815260408085208054600160a060020a031916909417845560a0905260076060527f466f756e646572000000000000000000000000000000000000000000000000006080529184018054818552938390207f466f756e6465720000000000000000000000000000000000000000000000000e825590946100d49492831615610100026000190190921691909104601f01919091048101905b8082111561012357600081556001016100c0565b505033600160a060020a031660009081526001602081905260408220600301819055815490810180835582818380158290116101275781836000526020600020918201910161012791906100c0565b5090565b50505060009283525060208220018054600160a060020a0319163317905561122590819061015490396000f3606060405236156100825760e060020a60003504631148d93e811461008a578063284cdd97146100b457806337629dda146100e957806337ee9e64146101955780634a2ee75f146101ee5780636ef0f37f1461023f578063bc9904ec14610284578063ec6c32cd146102f6578063f195528f1461036c578063fb659c3a146103a0575b6103f0610002565b6103f2600160a060020a033381166000818152600160205260408120549092161461066b57610002565b610406600435600160208190526000918252604090912080546003820154600160a060020a0391909116928201916002019084565b61052260043560243560408051602081810183526000808352835180830185528181528682526006835284822060018181015460048301548986526003840187528851898720855460029581161561010002600019011694909404601f8101899004890282018901909a5289815297989597889795969495929460ff929092169392909186918301828280156107a65780601f1061077b576101008083540402835291602001916107a6565b6103f06024600480358281019290820135918135918201910135600160a060020a03338116600081815260016020526040812080546003919091015491931691821415806101e4575080600114155b1561084c57610002565b6103f0602460048035828101929101359035600160a060020a0333811660008181526001602052604090208054600391909101549216919082141580610235575080600114155b15610bce57610002565b6103f0600435600160a060020a033381166000818152600160205260409020805460039190910154921691908214158061027a575080600114155b15610cf957610002565b604080516020601f602480356004818101359384018590048502860185019096528285526103f0958035959094604494919392909201918190840183828082843750949650505050505050600160a060020a0333811660008181526001602052604090205490911614610d8957610002565b604080516020604435600481810135601f81018490048402850184019095528484526103f09481359460248035959394606494929391019181908401838280828437509496505050505050506000838152600660205260409020600401548390610100900460ff161515600114610eea57610002565b6105ff6004356006602052600090815260409020600481015460018201546002830154909160ff8181169161010090041685565b6103f0600480359060248035908101910135600160a060020a033381166000818152600160205260408120805460039091015491931691821415806103e6575080600114155b1561106357610002565b005b604080519115158252519081900360200190f35b60408051600160a060020a038616815260608101839052608060208201818152865460026001821615610100026000190190911604918301829052919283019060a08401908790801561049a5780601f1061046f5761010080835404028352916020019161049a565b820191906000526020600020905b81548152906001019060200180831161047d57829003601f168201915b50508381038252855460026001821615610100026000190190911604808252602091909101908690801561050f5780601f106104e45761010080835404028352916020019161050f565b820191906000526020600020905b8154815290600101906020018083116104f257829003601f168201915b5050965050505050505060405180910390f35b60405180806020018581526020018415158152602001806020018381038352878181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156105945780820380516001836020036101000a031916815260200191505b508381038252848181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156105ed5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b60408051602081018690529081018490528215156060820152811515608082015260a0808252865460026001821615610100026000190190911604908201819052819060c08201908890801561050f5780601f106104e45761010080835404028352916020019161050f565b600160a060020a033316600090815260016020819052604090912060030154148015906106eb5750600360005060006000600050600081548110156100025750507f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56354600160a060020a03168152602091909152604081205460ff161515145b156106f557610002565b600160a060020a03331660009081526003602052604090205460ff1615156001141561072057610002565b600054600454141561075957506002805475ff000000000000000000000000000000000000000000191660a860020a1790556001610778565b50600160a060020a033316600090815260036020526004805460010190555b90565b820191906000526020600020905b81548152906001019060200180831161078957829003601f168201915b5050845460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152959950869450925084019050828280156108345780601f1061080957610100808354040283529160200191610834565b820191906000526020600020905b81548152906001019060200180831161081757829003601f168201915b50505050509050935093509350935092959194509250565b86868080602002602001604051908101604052809392919081815260200183836020028082843750506040805160208b810280830182019093528b82529095508b94508a9350839250850190849080828437820191505050505050600060005060008154811015610002578080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56391509054906101000a9004600160a060020a0316600160a060020a031681600081518110156100025750506020820151600160a060020a0316141580610934575081600081518110156100025750506020820151600114155b1561093e57610002565b88888080602002602001604051908101604052809392919081815260200183836020028082843750506040805160208d810280830182019093528d82529095508d94508c9350839250850190849080828437820191505050505050805182511415156109a957610002565b600196505b898710156109e45760008054600181018083558281838015829011610a6a57600083815260209020610a6a918101908301610bb6565b7fffda94decc6598f19c87cc7b2bb84ca5f721b8a0018ffd6a1f1fb41207a727f089898d8d6040518080602001806020018381038352878782818152602001925060200280828437820191505083810382528585828181526020019250602002808284378201915050965050505050505060405180910390a15050505050505050505050565b5050509190906000526020600020900160008b8b8b818110156100025750508254600160a060020a03191660208c029091013517909155508990508888818110156100025750505060208702890135600160008b8b8b8181101561000257505050600160a060020a0383168152602091909152604090208054600160a060020a03191690911790558a8a888181101561000257505050602087028b0135600160008b8b8b8181101561000257905090906020020135600160a060020a0316815260200190815260200160002060005060030160005081905550600196909601956109ae565b6005805460019081019182905560009182526006602090815260408320805481855293829020909360029381161561010002600019011692909204601f9081019190910482019187918990839010610c2b57803560ff19168380011785555b50610c5b9291505b80821115610bca5760008155600101610bb6565b5090565b600160a060020a033316600090815260016020819052604090912060030154148015610c08575060025460a860020a900460ff1615156001145b15610c1257610002565b600254600160a060020a031660001415610b4f57610002565b82800160010185558215610bae579182015b82811115610bae578235826000505591602001919060010190610c3d565b505060058054600081815260066020908152604080832060018101949094556004938401805460ff1916891790558454835291829020909201805461ff00191661010017905591548251828152918201879052917fe64dd94d70327a3f3ed562f0242b2b9c33455db8d9454eea6d75f9c14222f877918891889190819081018484808284378201915050935050505060405180910390a25050505050565b60025460a060020a900460ff16151560011415610d1557610002565b6002805474ff0000000000000000000000000000000000000000191660a060020a17600160a060020a03191684179081905560408051600160a060020a03929092168252517f4bf1531761d0c69f60681534e995a44cf8fb92de7820db8dcddcdd7dfb93d19a9181900360200190a1505050565b600160a060020a0382811660009081526001602081815260408084208054600160a060020a0319168817905533909416835292822084519082018054818552938590209094600293851615610100026000190190941692909204601f908101849004830193919291860190839010610e1457805160ff19168380011785555b50610e44929150610bb6565b82800160010185558215610e08579182015b82811115610e08578251826000505591602001919060010190610e26565b50507f6e0e53edef43cad25eda8a4d0e5ca0ee1dbe0380b50e4940ae7e9dca6d07410982826040518083600160a060020a03168152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610ed85780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15050565b600254600160a060020a039081163390911614610f0657610002565b600084815260066020526040812060040154859160ff9190911615151415610f2d57610002565b6000858152600660209081526040808320878452600301825282208551815482855293839020919360026001821615610100026000190190911604601f908101849004830193919291880190839010610f9957805160ff19168380011785555b50610fc9929150610bb6565b82800160010185558215610f8d579182015b82811115610f8d578251826000505591602001919060010190610fab565b505083857f77af61b19f5fb040ab13f5e6d2ee976eb5d77af6b91f165633887374ff7408dc8560405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561104f5780820380516001836020036101000a031916815260200191505b509250505060405180910390a35050505050565b6000868152600660205260409020600401548690610100900460ff16151560011461108d57610002565b600160a060020a0333166000908152600160208190526040909120600301541480156110c7575060025460a860020a900460ff1615156001145b156110d157610002565b600254600160a060020a0316600014156110ea57610002565b600087815260066020526040902060020154600190101561111957604060009081208882526006602052600201555b600087815260066020908152604080832060028181018054600181810190925580875260039390930185529285208054818752958590209299509492831615610100026000190190921691909104601f908101929092048101918891908a9083901061119857803560ff19168380011785555b506111c8929150610bb6565b8280016001018555821561118c579182015b8281111561118c5782358260005055916020019190600101906111aa565b5050837faf3e2dff71e2c016d6f352ad3fa99568f05a9c5e3e80674eec635ece3f5fca2c8787604051808060200182810382528484828181526020019250808284378201915050935050505060405180910390a25050505050505056",
    "events": {
      "0xe64dd94d70327a3f3ed562f0242b2b9c33455db8d9454eea6d75f9c14222f877": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_articleHeading",
            "type": "bytes"
          }
        ],
        "name": "Added",
        "type": "event"
      },
      "0xaf3e2dff71e2c016d6f352ad3fa99568f05a9c5e3e80674eec635ece3f5fca2c": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_itemNum",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_itemText",
            "type": "bytes"
          }
        ],
        "name": "AddedItem",
        "type": "event"
      },
      "0x77af61b19f5fb040ab13f5e6d2ee976eb5d77af6b91f165633887374ff7408dc": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "_item",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_changeText",
            "type": "bytes"
          }
        ],
        "name": "Amended",
        "type": "event"
      },
      "0x67629e0777d4901827e4c3cdc5f61f305f0b29a1df90656573a4279b403f2762": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_item",
            "type": "uint256"
          }
        ],
        "name": "Accessed",
        "type": "event"
      },
      "0x6e0e53edef43cad25eda8a4d0e5ca0ee1dbe0380b50e4940ae7e9dca6d074109": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_addr",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_name",
            "type": "bytes"
          }
        ],
        "name": "FounderUpdate",
        "type": "event"
      },
      "0xffda94decc6598f19c87cc7b2bb84ca5f721b8a0018ffd6a1f1fb41207a727f0": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_foundingTeam",
            "type": "address[]"
          },
          {
            "indexed": false,
            "name": "_ranks",
            "type": "uint256[]"
          }
        ],
        "name": "teamSet",
        "type": "event"
      },
      "0x4bf1531761d0c69f60681534e995a44cf8fb92de7820db8dcddcdd7dfb93d19a": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_home",
            "type": "address"
          }
        ],
        "name": "homeSet",
        "type": "event"
      }
    },
    "updated_at": 1475255310654
  },
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [],
        "name": "initializedRatify",
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
            "type": "address"
          }
        ],
        "name": "foundingTeam",
        "outputs": [
          {
            "name": "addr",
            "type": "address"
          },
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "role",
            "type": "bytes"
          },
          {
            "name": "rank",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          }
        ],
        "name": "getArticleItem",
        "outputs": [
          {
            "name": "article",
            "type": "bytes"
          },
          {
            "name": "articleNum",
            "type": "uint256"
          },
          {
            "name": "amendible",
            "type": "bool"
          },
          {
            "name": "itemText",
            "type": "bytes"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_article",
            "type": "bytes"
          },
          {
            "name": "_amendable",
            "type": "bool"
          }
        ],
        "name": "addArticle",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_founderRanks",
            "type": "uint256[]"
          },
          {
            "name": "_founderAddrs",
            "type": "address[]"
          }
        ],
        "name": "setFoundingTeam",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_consensusX",
            "type": "address"
          }
        ],
        "name": "setHome",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_addr",
            "type": "address"
          },
          {
            "name": "_profileName",
            "type": "bytes"
          }
        ],
        "name": "updateProfile",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          },
          {
            "name": "_textChange",
            "type": "bytes"
          }
        ],
        "name": "amendArticleItem",
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
        "name": "constitutionalArticles",
        "outputs": [
          {
            "name": "article",
            "type": "bytes"
          },
          {
            "name": "articleNum",
            "type": "uint256"
          },
          {
            "name": "itemNums",
            "type": "uint256"
          },
          {
            "name": "amendable",
            "type": "bool"
          },
          {
            "name": "set",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_articleNum",
            "type": "uint256"
          },
          {
            "name": "_itemText",
            "type": "bytes"
          }
        ],
        "name": "addArticleItem",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "articleHeading",
            "type": "bytes"
          },
          {
            "indexed": false,
            "name": "amendable",
            "type": "bool"
          }
        ],
        "name": "ArticleAddedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "itemId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "itemText",
            "type": "bytes"
          }
        ],
        "name": "ArticleItemAddedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "itemId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "newItemText",
            "type": "bytes"
          }
        ],
        "name": "ArticleAmendedEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "profileAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "profileName",
            "type": "bytes"
          }
        ],
        "name": "ProfileUpdateEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "foundingTeam",
            "type": "address[]"
          },
          {
            "indexed": false,
            "name": "ranks",
            "type": "uint256[]"
          }
        ],
        "name": "FoundingTeamSetEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "home",
            "type": "address"
          }
        ],
        "name": "HomeSetEvent",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60008054600160b060020a0319168155600581905533600160a060020a03811682526002602081815260408085208054600160a060020a031916909417845560a0905260076060527f466f756e646572000000000000000000000000000000000000000000000000006080529181018054818552938390207f466f756e6465720000000000000000000000000000000000000000000000000e825590936100d3936001821615610100026000190190911692909204601f01919091048101905b8082111561012457600081556001016100bf565b505033600160a060020a0316600090815260026020526040902060016003909101819055805480820180835582818380158290116101285781836000526020600020918201910161012891906100bf565b5090565b50505060009283525060208220018054600160a060020a0319163317905561164e90819061015590396000f3606060405236156100825760e060020a60003504631148d93e811461008a578063284cdd97146100b457806337629dda146100e95780634a2ee75f1461023d5780636c74e3411461028e5780636ef0f37f146102e7578063bc9904ec1461032c578063ec6c32cd1461039e578063f195528f1461043c578063fb659c3a14610482575b6104d2610002565b6104d4600160a060020a033381166000818152600260205260408120549092161461074d57610002565b6104e8600435600260208190526000918252604090912080546003820154600160a060020a0391909116926001830192019084565b6106046004356024356040805160208181018352600080835283519182019093528281526006805492939283929190879081101561000257508252600586027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f018250600680548890811015610002579060005260206000209060050201600050600101600050546006600050888154811015610002579060005260206000209060050201600050600680546004929092015460ff16918a908110156100025750507ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4260058a02018054899081101561000257508552602080862060408051865460026001821615610100026000190190911604601f8101859004850282018501909252818152918b019286919083018282801561086d5780601f106108425761010080835404028352916020019161086d565b6104d2602460048035828101929101359035600160a060020a0333811660008181526002602052604090208054600391909101549216919082141580610284575080600114155b1561091557610002565b6104d26024600480358281019290820135918135918201910135600160a060020a03338116600081815260026020526040812080546003919091015491931691821415806102dd575080600114155b15610cb357610002565b6104d2600435600160a060020a0333811660008181526002602052604090208054600391909101549216919082141580610322575080600114155b15610fb457610002565b604080516020601f602480356004818101359384018590048502860185019096528285526104d2958035959094604494919392909201918190840183828082843750949650505050505050600160a060020a033381166000818152600260205260409020549091161461104057610002565b604080516020604435600481810135601f81018490048402850184019095528484526104d294813594602480359593946064949293910191819084018382808284375094965050505050505082600660005081815481101561000257506000527ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4360058202015460ff61010090910416151560011461119f57610002565b6106e16004356006805482908110156100025790600052602060002090600502016000506002810154600182015460048301549293509160ff8181169161010090041685565b6104d2600480359060248035908101910135600160a060020a033381166000818152600260205260408120805460039091015491931691821415806104c8575080600114155b1561137c57610002565b005b604080519115158252519081900360200190f35b60408051600160a060020a038616815260608101839052608060208201818152865460026001821615610100026000190190911604918301829052919283019060a08401908790801561057c5780601f106105515761010080835404028352916020019161057c565b820191906000526020600020905b81548152906001019060200180831161055f57829003601f168201915b5050838103825285546002600182161561010002600019019091160480825260209190910190869080156105f15780601f106105c6576101008083540402835291602001916105f1565b820191906000526020600020905b8154815290600101906020018083116105d457829003601f168201915b5050965050505050505060405180910390f35b60405180806020018581526020018415158152602001806020018381038352878181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156106765780820380516001836020036101000a031916815260200191505b508381038252848181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156106cf5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b60408051602081018690529081018490528215156060820152811515608082015260a0808252865460026001821615610100026000190190911604908201819052819060c0820190889080156105f15780601f106105c6576101008083540402835291602001916105f1565b600160a060020a0333166000908152600260205260409020600301546001148015906107c857506001805460039160009182908110156100025750507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf654600160a060020a03168152602091909152604081205460ff161515145b156107d257610002565b600160a060020a03331660009081526003602052604090205460ff161515600114156107fd57610002565b600154600454141561082057506000805461ff001916610100179055600161083f565b50600160a060020a033316600090815260036020526004805460010190555b90565b820191906000526020600020905b81548152906001019060200180831161085057829003601f168201915b5050604080518654602060026001831615610100026000190190921691909104601f81018290048202830182019093528282529599509486945090925084019050828280156108fd5780601f106108d2576101008083540402835291602001916108fd565b820191906000526020600020905b8154815290600101906020018083116108e057829003601f168201915b50505050509050935093509350935092959194509250565b600160a060020a033316600090815260026020526040902060030154600114801561094c5750600054610100900460ff1615156001145b1561095657610002565b60008054620100009004600160a060020a0316141561097457610002565b6005600050546001016006600050818154818355818115116109af576005028160050283600052602060002091820191016109af9190610a56565b505060068054600554899450889350908110156100025760009182526005027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f0190506000016000509190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610b3a5760ff198135168380011785555b50610b6a929150610b04565b505060048101805461ffff191690556005015b80821115610b1857600060008201600050805460018160011615610100020316600290046000825580601f10610aea57505b50600060018301819055600283018190556003830180548282559082526020909120610a43918101905b80821115610b18576000818150805460018160011615610100020316600290046000825580601f10610b1c57505b5050600101610ab2565b601f016020900490600052602060002090810190610a8891905b80821115610b185760008155600101610b04565b5090565b601f016020900490600052602060002090810190610ae09190610b04565b82800160010185558215610a37579182015b82811115610a37578235826000505591602001919060010190610b4c565b50506006805460055491908290811015610002576000829052600581027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d400181905581548693508110156100025760009182526005027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f019050600401805460ff1916909117905560055460068054600192908110156100025760059081027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4301805461ff001916610100179055604080519154871515602084015281835290820188905292507f6ee070ad433d0f9eee396fa5f95778e68f69ac59aba31314e100e8a60ce531bf91508790879087908060608101858580828437820191505094505050505060405180910390a260056000818150548092919060010191905055505050505050565b86868080602002602001604051908101604052809392919081815260200183836020028082843750506040805160208b810280830182019093528b82529095508b94508a9350839250850190849080828437820191505050505050600160005060008154811015610002579081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6909054906101000a9004600160a060020a0316600160a060020a031681600081518110156100025750506020820151600160a060020a0316141580610d9a575081600081518110156100025750506020820151600114155b15610da457610002565b88888080602002602001604051908101604052809392919081815260200183836020028082843750506040805160208d810280830182019093528d82529095508d94508c935083925085019084908082843782019150505050505080518251141515610e0f57610002565b600196505b89871015610e4957600180548082018083558281838015829011610ecf57600083815260209020610ecf918101908301610b04565b7fba4a2ddcf70c6c55ad0be6d74ff7276c4e1a2d185955f01b8c1ee10671da3c7189898d8d6040518080602001806020018381038352878782818152602001925060200280828437820191505083810382528585828181526020019250602002808284378201915050965050505050505060405180910390a15050505050505050505050565b5050509190906000526020600020900160008b8b8b818110156100025750508254600160a060020a03191660208c029091013517909155508990508888818110156100025750505060208702890135600260008b8b8b8181101561000257505050600160a060020a0383168152602091909152604090208054600160a060020a03191690911790558a8a888181101561000257505050602087028b0135600260008b8b8b8181101561000257905090906020020135600160a060020a031681526020019081526020016000206000506003016000508190555060019690960195610e14565b60005460ff16151560011415610fc957610002565b6000805460ff191660011775ffffffffffffffffffffffffffffffffffffffff000019166201000085810291909117918290556040805191909204600160a060020a0316815290517fc6c0133e5ae71f1ae0745ff3426ef50f39a97496aa8a5736405e706f953a61829181900360200190a1505050565b600160a060020a0382811660009081526002602081815260408084208054600160a060020a0319168817905533909416835292822084516001918201805481865294869020909592851615610100026000190190941692909204601f908101829004840193918601908390106110c957805160ff19168380011785555b506110f9929150610b04565b828001600101855582156110bd579182015b828111156110bd5782518260005055916020019190600101906110db565b50507f21665895ee0222cfaa2684b1eeedba6dd86ee6792b502bdae2da007e3cd110ac82826040518083600160a060020a03168152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561118d5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15050565b600054620100009004600160a060020a0390811633909116146111c157610002565b83600660005081815481101561000257506000908152600582027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d43015460ff161515141561120e57610002565b8260066000508681548110156100025750600052600586027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4201805486908110156100025790600052602060002090016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106112b257805160ff19168380011785555b506112e2929150610b04565b828001600101855582156112a6579182015b828111156112a65782518260005055916020019190600101906112c4565b505083857fb91b60cedf341b9860f671af4922478f199b2addbcc2b306c138c30580ea0cdf8560405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156113685780820380516001836020036101000a031916815260200191505b509250505060405180910390a35050505050565b85600660005081815481101561000257906000526020600020906005020160005060040154610100900460ff1615156001146113b757610002565b600160a060020a03331660009081526002602052604090206003015460011480156113ee5750600054610100900460ff1615156001145b156113f857610002565b60008054620100009004600160a060020a0316141561141657610002565b6006805488908110156100025790600052602060002090600502016000506002015460068054919550600186019189908110156100025760206000908120929052600502016003018054828255829080158290116114855760008381526020902061148591810190830161152e565b50505050858560066000508981548110156100025750600052600589027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4201805487908110156100025790600052602060002090016000509190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061157e5760ff198135168380011785555b506115ae929150610b04565b50506001015b80821115610b18576000818150805460018160011615610100020316600290046000825580601f106115605750611528565b601f0160209004906000526020600020908101906115289190610b04565b8280016001018555821561151c579182015b8281111561151c578235826000505591602001919060010190611590565b50506006805488908110156100025760009190915250600587027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4101805460010190556040805160208082528101879052859189917f759e78be8722d39d9514a142842779496c0d079331d9e3c8db704271c4766557918a918a91819081018484808284378201915050935050505060405180910390a35050505050505056",
    "events": {
      "0xe64dd94d70327a3f3ed562f0242b2b9c33455db8d9454eea6d75f9c14222f877": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_articleHeading",
            "type": "bytes"
          }
        ],
        "name": "Added",
        "type": "event"
      },
      "0xaf3e2dff71e2c016d6f352ad3fa99568f05a9c5e3e80674eec635ece3f5fca2c": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_itemNum",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_itemText",
            "type": "bytes"
          }
        ],
        "name": "AddedItem",
        "type": "event"
      },
      "0x77af61b19f5fb040ab13f5e6d2ee976eb5d77af6b91f165633887374ff7408dc": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_article",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "_item",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_changeText",
            "type": "bytes"
          }
        ],
        "name": "Amended",
        "type": "event"
      },
      "0x67629e0777d4901827e4c3cdc5f61f305f0b29a1df90656573a4279b403f2762": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "item",
            "type": "uint256"
          }
        ],
        "name": "Accessed",
        "type": "event"
      },
      "0x6e0e53edef43cad25eda8a4d0e5ca0ee1dbe0380b50e4940ae7e9dca6d074109": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_addr",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_name",
            "type": "bytes"
          }
        ],
        "name": "FounderUpdate",
        "type": "event"
      },
      "0xffda94decc6598f19c87cc7b2bb84ca5f721b8a0018ffd6a1f1fb41207a727f0": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_foundingTeam",
            "type": "address[]"
          },
          {
            "indexed": false,
            "name": "_ranks",
            "type": "uint256[]"
          }
        ],
        "name": "teamSet",
        "type": "event"
      },
      "0x4bf1531761d0c69f60681534e995a44cf8fb92de7820db8dcddcdd7dfb93d19a": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_home",
            "type": "address"
          }
        ],
        "name": "homeSet",
        "type": "event"
      },
      "0x41101ff7a1d4701bd43b3bc3db06637dc2fbdca91a9174a39f52ba52bcf92d72": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "article",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "articleHeading",
            "type": "bytes"
          }
        ],
        "name": "ArticleAddedEvent",
        "type": "event"
      },
      "0x79a4c22a72cedd7a0736233646de6b0d510eecf67d1108d1b8ea3ef77cfa967e": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "itemNum",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "itemText",
            "type": "bytes"
          }
        ],
        "name": "ArticleItemAddedEvent",
        "type": "event"
      },
      "0xb91b60cedf341b9860f671af4922478f199b2addbcc2b306c138c30580ea0cdf": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "itemId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "newItemText",
            "type": "bytes"
          }
        ],
        "name": "ArticleAmendedEvent",
        "type": "event"
      },
      "0x7d05bcb82336aafaa2647dd264da108037de2801d625757e5c1c5096841f81c0": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "addr",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "name",
            "type": "bytes"
          }
        ],
        "name": "FounderUpdateEvent",
        "type": "event"
      },
      "0xba4a2ddcf70c6c55ad0be6d74ff7276c4e1a2d185955f01b8c1ee10671da3c71": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "foundingTeam",
            "type": "address[]"
          },
          {
            "indexed": false,
            "name": "ranks",
            "type": "uint256[]"
          }
        ],
        "name": "FoundingTeamSetEvent",
        "type": "event"
      },
      "0xc6c0133e5ae71f1ae0745ff3426ef50f39a97496aa8a5736405e706f953a6182": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "home",
            "type": "address"
          }
        ],
        "name": "HomeSetEvent",
        "type": "event"
      },
      "0x6ee070ad433d0f9eee396fa5f95778e68f69ac59aba31314e100e8a60ce531bf": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "articleHeading",
            "type": "bytes"
          },
          {
            "indexed": false,
            "name": "amendable",
            "type": "bool"
          }
        ],
        "name": "ArticleAddedEvent",
        "type": "event"
      },
      "0x759e78be8722d39d9514a142842779496c0d079331d9e3c8db704271c4766557": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "articleId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "itemId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "itemText",
            "type": "bytes"
          }
        ],
        "name": "ArticleItemAddedEvent",
        "type": "event"
      },
      "0x21665895ee0222cfaa2684b1eeedba6dd86ee6792b502bdae2da007e3cd110ac": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "profileAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "profileName",
            "type": "bytes"
          }
        ],
        "name": "ProfileUpdateEvent",
        "type": "event"
      }
    },
    "updated_at": 1475358544874
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

  Contract.contract_name   = Contract.prototype.contract_name   = "ConstitutionalDNA";
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
    window.ConstitutionalDNA = Contract;
  }
})();
