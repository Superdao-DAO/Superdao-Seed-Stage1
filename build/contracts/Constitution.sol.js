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
      throw new Error("Constitution error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Constitution error: contract binary not set. Can't deploy new instance.");
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

      throw new Error("Constitution contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Constitution: " + unlinked_libraries);
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
      throw new Error("Invalid address passed to Constitution.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Constitution not deployed or address not set.");
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
  "default": {
    "abi": [
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
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          },
          {
            "name": "_change",
            "type": "bytes"
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
            "name": "_article",
            "type": "uint256"
          },
          {
            "name": "_item",
            "type": "uint256"
          },
          {
            "name": "_change",
            "type": "bytes"
          }
        ],
        "name": "amendConstitution",
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
        "inputs": [],
        "name": "addArticleItem",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_item",
            "type": "uint256"
          }
        ],
        "name": "getArticleItem",
        "outputs": [
          {
            "name": "item",
            "type": "bytes"
          }
        ],
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
            "name": "ammendable",
            "type": "bool"
          }
        ],
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
            "name": "flagNum",
            "type": "uint256"
          }
        ],
        "name": "AntiFlagAccessed",
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
      }
    ],
    "unlinked_binary": "0x6002805460a060020a60ff0219168155600160a060020a033390811660009081526001602081815260408084208054600160a060020a031916909517855560a0905260076060527f466f756e646572000000000000000000000000000000000000000000000000006080529284018054818452928490207f466f756e6465720000000000000000000000000000000000000000000000000e825590946100ce9492841615610100026000190190931692909204601f01048101905b8082111561011d57600081556001016100ba565b5050600160a060020a03331660009081526001602081905260408220600301819055815490810180835582818380158290116101215781836000526020600020918201910161012191906100ba565b5090565b50505060009283525060208220018054600160a060020a03191633179055610aa290819061014e90396000f3606060405236156100775760e060020a6000350463284cdd97811461007957806337ee9e64146100ab5780633cebca931461015f5780634bdab5c7146101e95780636ef0f37f1461025257806395605af914610296578063b608f3621461029b578063bc9904ec14610318578063f195528f14610388575b005b6103ac600435600160208190526000918252604090912060038101548154600160a060020a0316928201916002019084565b604080516004803580820135602081810280860182019096528185526100779593946024949093850192918291908501908490808284375050604080518735808a013560208181028085018201909552818452989a9960449993985091909101955093508392508501908490808284375094965050505050505060015b82518110156105645760008054600181018083558281838015829011610569576000838152602090206105699181019083016106b3565b604080516020604435600481810135601f8101849004840285018401909552848452610077948135946024803595939460649492939101918190840183828082843750949650505050505050600160a060020a033381166000818152600160205260409020600381015490549092169190821415806101df575080600114155b1561064a57610002565b604080516020604435600481810135601f8101849004840285018401909552848452610077948135946024803595939460649492939101918190840183828082843750949650505050505050600254600160a060020a0390811633919091161461079557610002565b610077600435600160a060020a0333811660008181526001602052604090206003810154905490921691908214158061028c575080600114155b156108f057610002565b610077565b60408051602081019091526000815260405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561030a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60408051602060248035600481810135601f81018590048502860185019096528585526100779581359591946044949293909201918190840183828082843750949650505050505050600160a060020a033381166000818152600160205260409020549091161461094157610002565b6104c860043560046020526000908152604090206001810154600382015460ff1683565b60408051600160a060020a038616815260608101839052608060208201818152865460026001821615610100026000190190911604918301829052919283019060a0840190879080156104405780601f1061041557610100808354040283529160200191610440565b820191906000526020600020905b81548152906001019060200180831161042357829003601f168201915b5050838103825285546002600182161561010002600019019091160480825260209190910190869080156104b55780601f1061048a576101008083540402835291602001916104b5565b820191906000526020600020905b81548152906001019060200180831161049857829003601f168201915b5050965050505050505060405180910390f35b604080516020810184905282151591810191909152606080825284546002600182161561010002600019019091160490820181905281906080820190869080156105535780601f1061052857610100808354040283529160200191610553565b820191906000526020600020905b81548152906001019060200180831161053657829003601f168201915b505094505050505060405180910390f35b505050565b5050509190906000526020600020900160008484815181101561000257505084516020858102870101518354600160a060020a03191617909255508391508290811015610002579060200190602002015160016000506000848481518110156100025790602001906020020151600160a060020a0316815260200190815260200160002060005060000160006101000a815481600160a060020a03021916908302179055508060016000506000848481518110156100025750506020928302850190920151600160a060020a03168252604090912060030182905501610128565b600085815260046020908152604080832087845260029081018352908320805487518286529484902091946001821615610100026000190190911692909204601f9081018490048201938801908390106106cb57805160ff19168380011785555b506106fb9291505b808211156106c757600081556001016106b3565b5090565b828001600101855582156106ab579182015b828111156106ab5782518260005055916020019190600101906106dd565b505083857f77af61b19f5fb040ab13f5e6d2ee976eb5d77af6b91f165633887374ff7408dc8560405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156107815780820380516001836020036101000a031916815260200191505b509250505060405180910390a35050505050565b600083815260046020526040812060030154849160ff91909116151514156107bc57610002565b60008481526004602090815260408083208684526002908101835290832085518154828652948490209194600181161561010002600019011692909204601f90810184900482019387019083901061082757805160ff19168380011785555b506108579291506106b3565b8280016001018555821561081b579182015b8281111561081b578251826000505591602001919060010190610839565b505082847f77af61b19f5fb040ab13f5e6d2ee976eb5d77af6b91f165633887374ff7408dc8460405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156108dd5780820380516001836020036101000a031916815260200191505b509250505060405180910390a350505050565b60025460a060020a900460ff1615156001141561090c57610002565b50506002805474ff0000000000000000000000000000000000000000191660a060020a17600160a060020a0319168217905550565b600160a060020a0380831660009081526001602081815260408084208054600160a060020a0319168817905533909416835292822084519082018054818552938590209094600293851615610100026000190190941692909204601f9081018490048301939192918601908390106109cc57805160ff19168380011785555b506109fc9291506106b3565b828001600101855582156109c0579182015b828111156109c05782518260005055916020019190600101906109de565b50507f6e0e53edef43cad25eda8a4d0e5ca0ee1dbe0380b50e4940ae7e9dca6d07410982826040518083600160a060020a03168152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610a905780820380516001836020036101000a031916815260200191505b50935050505060405180910390a1505056",
    "events": {
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
      "0x1671e64fdcd86e62140aa51668feb252f7cfd92b7f5d88dd01d8216f38bff8f3": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "flagNum",
            "type": "uint256"
          }
        ],
        "name": "AntiFlagAccessed",
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
      }
    },
    "updated_at": 1474471030324
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

  Contract.contract_name   = Contract.prototype.contract_name   = "Constitution";
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
    window.Constitution = Contract;
  }
})();
