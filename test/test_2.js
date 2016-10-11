/**
 * PromissoryToken Test 2
 *
 * accounts[0] is used as founder address
 * accounts[1] and accounts[2] are used for claims of tokens
 *
 * All three accounts have to be unlocked before running the test.
 */
contract('PromissoryToken - Test 2', function(accounts) {
    testConfig = {
        'report': true,
        'report_path': './test/reports/Test2.PromissoryToken.' + (new Date()).getFullYear() + '-' + parseInt((new Date()).getMonth() + 1) + '-' + (new Date()).getDate() + '-' + (new Date()).getTime() + '.md'
    };
    helper = require('../lib/tests.helper.js')(testConfig);

    before(helper.beforeHook);
    afterEach(helper.afterEachHook);

    var
        testPass = "1234",
        testTokenPrice = 0.00001,
        claimAmount1 = helper.etherToWei(1.2),
        claimAmount2 = helper.etherToWei(3),
        withdrawalAmount = helper.etherToWei(7.2),
        withdrawalReason = "test withdrawal to accounts[0], accounts[1]",
        withdrawalAmount2 = helper.etherToWei(1000),
        withdrawalReason2 = "crash test",
        founderAccount = accounts[0],
        initialBackers = 2,
        TestInstance;

    describe('constructor', function() {
        it("accounts[0] should deploy PromissoryToken test instance", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAccount;

            PromissoryToken.new(testPass, "0x0", initialBackers, { from: founderAccount }).then(function(instance) {
                currentTest.logTxnId = instance.transactionHash;

                console.log("\tTest instance deployed at: " + instance.address);

                TestInstance = instance;

                done();
            }).catch(done);
        });
    });

    describe('setPrepaid', function() {
        it("accounts[1] should fail to add early backer accounts[2]", function(done) {
            var
                currentTest = this.test,
                tokenPrice = helper.etherToWei(testTokenPrice),
                tokenAmount = 200000;

            currentTest.logSender = accounts[1];

            TestInstance.setPrepaid(accounts[2], tokenPrice, tokenAmount, testPass, 1, { from: accounts[1], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    helper.checkProperty(TestInstance, "prepaidUnits", 0, done);
                });
            });
        });

        it("accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens", function(done) {
            var
                currentTest = this.test,
                tokenPrice = helper.etherToWei(testTokenPrice),
                tokenAmount = 200000;

            currentTest.logSender = founderAccount;

            TestInstance.setPrepaid(accounts[1], tokenPrice, tokenAmount, testPass, 1, { from: founderAccount }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[1]);
                    assert.equal(log[0].args.index.toNumber(), 0);
                    assert.equal(log[0].args.price.toNumber(), tokenPrice);
                    assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                    helper.checkProperty(TestInstance, "prepaidUnits", tokenAmount, done);
                });
            });
        });

        it("accounts[0] should add early backer accounts[2] with two batches of 100 000 tokens ", function(done) {
            var
                currentTest = this.test,
                tokenPrice = helper.etherToWei(testTokenPrice),
                tokenAmount = 100000;

            currentTest.logSender = founderAccount;
            currentTest.logTxnId = new Array();

            TestInstance.setPrepaid(accounts[2], tokenPrice, tokenAmount, testPass, 1, { from: founderAccount }).then(function(transactionId1) {
                currentTest.logTxnId.push(transactionId1);

                TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[2]);
                    assert.equal(log[0].args.index.toNumber(), 0);
                    assert.equal(log[0].args.price.toNumber(), tokenPrice);
                    assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                    helper.checkProperty(TestInstance, "prepaidUnits", 300000, function() {
                        TestInstance.setPrepaid(accounts[2], tokenPrice, tokenAmount, testPass, 1, { from: founderAccount }).then(function(transactionId2) {
                            currentTest.logTxnId.push(transactionId2);

                            TestInstance.AddedPrepaidTokensEvent().get(function(error, log) {
                                console.log(error, log);

                                assert.equal(log.length, 1);
                                assert.equal(log[0].args.backer, accounts[2]);
                                assert.equal(log[0].args.index.toNumber(), 1);
                                assert.equal(log[0].args.price.toNumber(), tokenPrice);
                                assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                                helper.checkProperty(TestInstance, "prepaidUnits", 400000, done);
                            });
                        });
                    });
                });
            });
        });
    });

    describe('claimPrepaid', function() {
        it("accounts[1] should claim one batch of 200 000 prepaid tokens", function(done) {
            var
                currentTest = this.test,
                tokenPrice = helper.etherToWei(testTokenPrice),
                tokenAmount = 200000;

            currentTest.logSender = accounts[1];

            TestInstance.claimPrepaid(0, tokenPrice, tokenAmount, testPass, 1, { from: accounts[1] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.PrepaidTokensClaimedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[1]);
                    assert.equal(log[0].args.index.toNumber(), 0);
                    assert.equal(log[0].args.price.toNumber(), tokenPrice);
                    assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                    helper.checkProperty(TestInstance, "claimedPrepaidUnits", tokenAmount, done);
                });
            });
        });

        it("accounts[2] should claim two batches (100 000 prepaid tokens each)", function(done) {
            var
                currentTest = this.test,
                tokenPrice = helper.etherToWei(testTokenPrice),
                tokenAmount = 100000;

            currentTest.logSender = accounts[2];
            currentTest.logTxnId = new Array();

            TestInstance.claimPrepaid(0, tokenPrice, tokenAmount, testPass, 1, { from: accounts[2] }).then(function(transactionId1) {
                currentTest.logTxnId.push(transactionId1);

                TestInstance.PrepaidTokensClaimedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[2]);
                    assert.equal(log[0].args.index.toNumber(), 0);
                    assert.equal(log[0].args.price.toNumber(), tokenPrice);
                    assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                    helper.checkProperty(TestInstance, "claimedPrepaidUnits", 300000, function() {
                        TestInstance.claimPrepaid(1, tokenPrice, tokenAmount, testPass, 1, { from: accounts[2] }).then(function(transactionId2) {
                            currentTest.logTxnId.push(transactionId2);

                            TestInstance.PrepaidTokensClaimedEvent().get(function(error, log) {
                                console.log(error, log);

                                assert.equal(log.length, 1);
                                assert.equal(log[0].args.backer, accounts[2]);
                                assert.equal(log[0].args.index.toNumber(), 1);
                                assert.equal(log[0].args.price.toNumber(), tokenPrice);
                                assert.equal(log[0].args.amount.toNumber(), tokenAmount);

                                helper.checkProperty(TestInstance, "claimedPrepaidUnits", 400000, done);
                            });
                        });
                    });
                });
            });
        });
    });

    describe('claim', function() {
        it("accounts[1] should claim one batch of 200 000 tokens", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];

            TestInstance.claim({ from: accounts[1], value: claimAmount1 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.TokensClaimedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[1]);
                    assert.equal(log[0].args.index.toNumber(), 1);
                    assert.equal(log[0].args.price.toNumber(), helper.etherToWei(0.000006));
                    assert.equal(log[0].args.amount.toNumber(), 200000);

                    helper.checkProperty(TestInstance, "claimedUnits", 200000, done);
                });
            });
        });

        it("accounts[2] should claim two batches (500 000 tokens each)", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[2];
            currentTest.logTxnId = new Array();

            TestInstance.claim({ from: accounts[2], value: claimAmount2 }).then(function(transactionId1) {
                currentTest.logTxnId.push(transactionId1);

                TestInstance.TokensClaimedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[2]);
                    assert.equal(log[0].args.index.toNumber(), 2);
                    assert.equal(log[0].args.price.toNumber(), helper.etherToWei(0.000006));
                    assert.equal(log[0].args.amount.toNumber(), 500000);

                    helper.checkProperty(TestInstance, "claimedUnits", 700000, function() {
                        TestInstance.claim({ from: accounts[2], value: claimAmount2 }).then(function(transactionId2) {
                            currentTest.logTxnId.push(transactionId2);

                            TestInstance.TokensClaimedEvent().get(function(error, log) {
                                console.log(error, log);

                                assert.equal(log.length, 1);
                                assert.equal(log[0].args.backer, accounts[2]);
                                assert.equal(log[0].args.index.toNumber(), 3);
                                assert.equal(log[0].args.price.toNumber(), helper.etherToWei(0.000006));
                                assert.equal(log[0].args.amount.toNumber(), 500000);

                                helper.checkProperty(TestInstance, "claimedUnits", 1200000, done);
                            });
                        });
                    });
                });
            });
        });

        it("accounts[1] should fail to claim 4 000 000 tokens", function(done) {
            var
                currentTest = this.test,
                claimValue = helper.etherToWei(24);

            currentTest.logSender = accounts[1];

            TestInstance.claim({ from: accounts[1], value: claimValue, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.TokensClaimedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    helper.checkProperty(TestInstance, "claimedUnits", 1200000, done);
                });
            });
        });
    });

    describe('withdraw', function() {
        it("should fail to create withdrawal request with bigger value than the available balance", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAccount;
            currentTest.logTxnId = '';

            TestInstance.withdraw(withdrawalAmount2, withdrawalReason2, new Array(accounts[0]), { from: founderAccount, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalCreatedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should create withdrawal request", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAccount;
            currentTest.logTxnId = '';

            TestInstance.withdraw(withdrawalAmount, withdrawalReason, new Array(accounts[0], accounts[1]), { from: founderAccount }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalCreatedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.withdrawalId.toNumber(), 0);
                    assert.equal(log[0].args.amount.toNumber(), withdrawalAmount);
                    assert.equal(web3.toAscii(log[0].args.reason), withdrawalReason);

                    done();
                });
            });
        });
    });

    describe('approveWithdraw', function() {
        it("should fail to approve withdrawal with invalid withdrawalID", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];
            currentTest.logTxnId = '';

            TestInstance.approveWithdraw(0, { from: accounts[1], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalVotedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[1] should vote on withdrawal 0 with 400 000 tokens", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];
            currentTest.logTxnId = '';

            TestInstance.approveWithdraw(0, { from: accounts[1] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalVotedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.withdrawalId.toNumber(), 0);
                    assert.equal(log[0].args.backer, accounts[1]);
                    assert.equal(log[0].args.backerStakeWeigth.toNumber(), 400000);
                    assert.equal(log[0].args.totalStakeWeight.toNumber(), 400000);

                    done();
                });
            });
        });

        it("accounts[1] should fail to vote again on withdrawal 0", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];
            currentTest.logTxnId = '';

            TestInstance.approveWithdraw(0, { from: accounts[1], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalVotedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("accounts[2] should vote on withdrawal 0 with 1 200 000 tokens and trigger the approval", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[2];
            currentTest.logTxnId = '';

            TestInstance.approveWithdraw(0, { from: accounts[2] }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalVotedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.withdrawalId, 0);
                    assert.equal(log[0].args.backer, accounts[2]);
                    assert.equal(log[0].args.backerStakeWeigth, 1200000);
                    assert.equal(log[0].args.totalStakeWeight, 1600000);

                    TestInstance.WithdrawalApproved().get(function(error, log) {
                        console.log(error, log);

                        assert.equal(log.length, 1);
                        assert.equal(log[0].args.withdrawalId, 0);
                        assert.equal(log[0].args.stakeWeight, 1600000);
                        assert.equal(log[0].args.isMultiPayment, true);
                        assert.equal(log[0].args.amount.toNumber(), withdrawalAmount);
                        assert.equal(web3.toAscii(log[0].args.reason), withdrawalReason);

                        done();
                    });
                });
            })
        });

        it("accounts[2] should fail to approve unexisting withdrawal 1", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[2];
            currentTest.logTxnId = '';

            TestInstance.approveWithdraw(1, { from: accounts[2], gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.WithdrawalApproved().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });
    });

    describe('redeem', function() {
        it("should redeem accounts[1]'s 400 000 tokens", function(done) {
            var currentTest = this.test;
            currentTest.logSender = accounts[1];
            currentTest.logTxnId = '';

            TestInstance.redeem(400000, accounts[1], { from: founderAccount }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.RedeemEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.backer, accounts[1]);
                    assert.equal(log[0].args.amount.toNumber(), 400000);

                    done();
                });
            });
        });
    });
});