var fs = require("fs");
var exports = module.exports = function(testConfig) {

    function addToLog(messageArr) {
        if (testConfig.report == false) {
            return;
        }
        for (var i in messageArr) {
            if (messageArr[i]) {
                if (messageArr[i].split) {
                    messageArr[i] = messageArr[i].split('|').join(' ');
                }
            } else {
                messageArr[i] = '';
            }
        }
        fs.appendFileSync(testConfig.report_path, '|' + messageArr.join(' | ') + '|' + "\n");
    }

    return {
        beforeHook: function(done) {
            if (!testConfig.report) {
                done();
                return;
            }
            var header = "-------------------------------------\n| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |\n|-----|:-------:|:-------:| ------:|------:| :------ |\n";
            fs.open(testConfig.report_path, 'w+', (err, fd) => {
                if (err) {
                    testConfig.report = false;
                    console.log(err);
                } else {
                    fs.appendFileSync(testConfig.report_path, header);
                }
                done();
            });
        },

        afterEachHook: function() {
            if (!this.currentTest.logSender) return;
            if (this.currentTest.logTxnId) {
                if (typeof this.currentTest.logTxnId === "object") {
                    for (var i = 0; i < this.currentTest.logTxnId.length; i++) {
                        this.currentTest.logTxnId[i] = "[" + this.currentTest.logTxnId[i] + "](https://testnet.etherscan.io/tx/" + this.currentTest.logTxnId[i] + ")";
                    }

                    this.currentTest.logTxnId = this.currentTest.logTxnId.join(", ");
                } else {
                    this.currentTest.logTxnId = "[" + this.currentTest.logTxnId + "](https://testnet.etherscan.io/tx/" + this.currentTest.logTxnId + ")";
                }
            }
            var messageArr = [
                this.currentTest.title,
                this.currentTest.parent.title,
                this.currentTest.logSender,
                this.currentTest.duration,
                this.currentTest.state,
                this.currentTest.logTxnId,
            ];

            addToLog(messageArr);
        },

        checkProperty: function(TestInstance, property, amount, cb) {
            TestInstance[property].call().then(function(value) {
                console.log("\t", property, value, amount);

                assert.equal(value, amount);

                if (typeof cb == "function") {
                    cb();
                }
            });
        },

        etherToWei: function(value) {
            return web3.toWei(value, 'ether');
        }
    }
};