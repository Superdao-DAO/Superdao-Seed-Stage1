/**
 * PromissoryToken Test 1 Founder switch
 *
 * accounts[0] is founder address
 * accounts[1] is cofounder address
 * accounts[2] is the new cofounder address
 * accounts[3] is the new founder address
 *
 * All above accounts have to be unlocked before running the test.
 */
contract('PromissoryToken - Test 1', function(accounts) {
    testConfig = {
        'report': true,
        'report_path': './test/reports/Test1.PromissoryToken' + (new Date()).getFullYear() + '-' + parseInt((new Date()).getMonth() + 1) + '-' + (new Date()).getDate() + '-' + (new Date()).getTime() + '.md'
    };
    helper = require('../lib/tests.helper.js')(testConfig);

    before(helper.beforeHook);
    afterEach(helper.afterEachHook);

    var
        founderHash = "1234",
        founderAccount = accounts[0],
        switchHash = "8888",
        initialBackers = 2,
        TestInstance;

    describe('constructor', function() {
        it("accounts[0] should deploy PromissoryToken test instance with founderHash: " + founderHash + " and accounts[1] as cofounder", function(done) {
            var currentTest = this.test;

            PromissoryToken.new(founderHash, accounts[1], initialBackers, { from: founderAccount }).then(function(instance) {
                currentTest.logSender = founderAccount;
                currentTest.logTxnId = instance.transactionHash;

                console.log("\tTest instance deployed at: " + instance.address);

                TestInstance = instance;

                done();
            }).catch(done);
        });
    });

    describe('cofounderSwitchAddress', function() {
        it("accounts[0] should fail to change the cofounder to accounts[2]", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[0];
            currentTest.logTxnId = '';

            TestInstance.cofounderSwitchAddress(accounts[2], { from: accounts[0], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchRequestEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[1] should change the cofounder to accounts[2]", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];
            currentTest.logTxnId = '';

            TestInstance.cofounderSwitchAddress(accounts[2], { from: accounts[1] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.CofounderSwitchedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args._newCofounderAddr, accounts[2]);
                    done();
                });
            })
        });
    });

    describe('founderSwitchRequest', function() {
        it("accounts[3] should request founder change with wrong founderHash and fail", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[3];
            currentTest.logTxnId = '';

            TestInstance.founderSwitchRequest(Date.now(), switchHash, { from: accounts[3] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchRequestEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[3] should request founder change", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[3];
            currentTest.logTxnId = '';

            TestInstance.founderSwitchRequest(founderHash, switchHash, { from: accounts[3] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchRequestEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args._newFounderAddr, accounts[3]);
                    done();
                });
            });
        });
    });

    describe('cofounderApproveSwitchRequest', function() {
        it("accounts[3] should fail to approve founder change request", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[3];
            currentTest.logTxnId = '';

            TestInstance.cofounderApproveSwitchRequest(accounts[3], Date.now(), { from: accounts[3], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[2] should fail to approve founder change request with wrong switchHash", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[2];
            currentTest.logTxnId = '';

            TestInstance.cofounderApproveSwitchRequest(accounts[3], Date.now(), { from: accounts[2], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[2] should approve founder change request", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[2];
            currentTest.logTxnId = '';

            TestInstance.cofounderApproveSwitchRequest(accounts[3], switchHash, { from: accounts[2] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FounderSwitchedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args._newFounderAddr, accounts[3]);
                    done();
                });
            });
        });
    });
});