contract('ConstitutionalDNA', function(accounts) {
    testConfig = {
        'report': true,
        'report_path': './test/reports/Test3.ConstitutionalDNA.' + (new Date()).getFullYear() + '-' + parseInt((new Date()).getMonth() + 1) + '-' + (new Date()).getDate() + '-' + (new Date()).getTime() + '.md'
    };
    helper = require('../lib/tests.helper.js')(testConfig);

    before(helper.beforeHook);
    afterEach(helper.afterEachHook);

    var founderAddress = accounts[0],
        consensusX = accounts[1],
        teamMember1 = accounts[2],
        TestInstance;

    describe('constructor', function() {
        it("accounts[0] should deploy ConstitutionalDNA TestInstance", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;

            ConstitutionalDNA.new({ from: founderAddress }).then(function(instance) {
                currentTest.logTxnId = instance.transactionHash;

                console.log("\tTest instance deployed at: " + instance.address);
                TestInstance = instance;

                done();
            }).catch(done);
        });
    });

    describe('setHome', function() {
        it("should set consensusX address from founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            TestInstance.setHome(consensusX, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.HomeSetEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.home, consensusX);

                    done();
                });
            });
        });

        it("should fail to set consensusX address from non founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = teamMember1;
            currentTest.logTxnId = '';

            TestInstance.setHome(consensusX, { from: teamMember1, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.HomeSetEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });
    });

    describe('addArticle', function() {
        it("should fail to add article from non founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = teamMember1;
            currentTest.logTxnId = '';

            var
                articleHeading = "developer relations",
                amendable = false;

            TestInstance.addArticle(articleHeading, amendable, { from: teamMember1, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should add non-amendable article from founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                articleHeading = "developer relations",
                amendable = false;

            TestInstance.addArticle(articleHeading, amendable, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.articleId.toNumber(), 0);
                    assert.equal(web3.toAscii(log[0].args.articleHeading), articleHeading);
                    assert.equal(log[0].args.amendable, amendable);

                    done();
                });
            });
        });

        it("should add amendable article from founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                articleHeading = "amendable developer relations",
                amendable = true;

            TestInstance.addArticle(articleHeading, amendable, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.articleId.toNumber(), 1);
                    assert.equal(web3.toAscii(log[0].args.articleHeading), articleHeading);
                    assert.equal(log[0].args.amendable, amendable);

                    done();
                });
            });
        });
    });

    describe('addArticleItem', function() {
        it("should fail to add an item to non existing article", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                articleId = 2,
                itemText = "do no evil";

            TestInstance.addArticleItem(articleId, itemText, { from: founderAddress, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleItemAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should add an item to an existing amendable article", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                articleId = 1,
                itemText = "do no evil";

            TestInstance.addArticleItem(articleId, itemText, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleItemAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.articleId.toNumber(), articleId);
                    assert.equal(log[0].args.itemId.toNumber(), 0);
                    assert.equal(web3.toAscii(log[0].args.itemText), itemText);

                    done();
                });
            });
        });

        it("should fail to add an item to an existing article from non founder Address", function(done) {
            var currentTest = this.test;
            currentTest.logSender = teamMember1;
            currentTest.logTxnId = '';

            var
                articleId = 1,
                itemText = "do no evil";

            TestInstance.addArticleItem(articleId, itemText, { from: teamMember1, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleItemAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should fail to add an item to an invalid article no", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                articleId = 4,
                itemText = "do no evil";

            TestInstance.addArticleItem(articleId, itemText, { from: founderAddress, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleItemAddedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });
    });

    describe('amendArticleItem', function() {
        it("should fail to amend an article from non consensusX address", function(done) {
            var currentTest = this.test;
            currentTest.logSender = teamMember1;
            currentTest.logTxnId = '';

            var
                articleId = 1,
                itemId = 1,
                itemText = "grow a beard";

            TestInstance.amendArticleItem(articleId, itemId, itemText, { from: teamMember1, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAmendedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should fail to amend a non-amendable article item", function(done) {
            var currentTest = this.test;
            currentTest.logSender = consensusX;
            currentTest.logTxnId = '';

            var
                articleId = 0,
                itemId = 0,
                itemText = "grow a beard";

            TestInstance.amendArticleItem(articleId, itemId, itemText, { from: consensusX, gas: 100000 }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAmendedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 0);
                    done();
                });
            });
        });

        it("should amend an amendable article item", function(done) {
            var currentTest = this.test;
            currentTest.logSender = consensusX;
            currentTest.logTxnId = '';

            var
                articleId = 1,
                itemId = 0,
                itemText = "grow an amended beard";

            TestInstance.amendArticleItem(articleId, itemId, itemText, { from: consensusX }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ArticleAmendedEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.articleId.toNumber(), articleId);
                    assert.equal(log[0].args.itemId.toNumber(), itemId);
                    assert.equal(web3.toAscii(log[0].args.newItemText), itemText);

                    done();
                });
            });
        });
    });

    describe('setFoundingTeam', function() {
        it("should add a founding team from founderAddress", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var
                founder_ranks = [1, 2, 3],
                founder_addresses = [founderAddress, accounts[3], accounts[2]];

            TestInstance.setFoundingTeam(founder_ranks, founder_addresses, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.FoundingTeamSetEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);

                    var ranks = new Array();
                    for (var i = 0; i < log[0].args.ranks.length; i++) {
                        ranks.push(log[0].args.ranks[i].toNumber());
                    }
                    assert.deepEqual(log[0].args.foundingTeam, founder_addresses);
                    assert.deepEqual(ranks, founder_ranks);

                    done();
                });
            });
        });
    });

    describe('updateProfile', function() {
        it("should update a founding team members profile", function(done) {
            var currentTest = this.test;
            currentTest.logSender = founderAddress;
            currentTest.logTxnId = '';

            var profileName = "CryptoInnovator";

            TestInstance.updateProfile(accounts[1], profileName, { from: founderAddress }).then(function(transactionId) {
                currentTest.logTxnId = transactionId;

                TestInstance.ProfileUpdateEvent().get(function(error, log) {
                    console.log(error, log);

                    assert.equal(log.length, 1);
                    assert.equal(log[0].args.profileAddress, accounts[1]);
                    assert.equal(web3.toAscii(log[0].args.profileName), profileName);

                    done();
                });
            });
        });
    });
});