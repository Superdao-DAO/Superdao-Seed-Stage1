-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 407 | passed | [0xe965d913ae5500c60f3c7df2e0f9bcc10fb271ffd0720db805d31adb3ce0c823](https://testnet.etherscan.io/tx/0xe965d913ae5500c60f3c7df2e0f9bcc10fb271ffd0720db805d31adb3ce0c823)|
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 330 | passed | [0x0adfd075024a36e76e9fc97f5f05032ae3c23d29b3f882fac920392d370a5e2e](https://testnet.etherscan.io/tx/0x0adfd075024a36e76e9fc97f5f05032ae3c23d29b3f882fac920392d370a5e2e)|
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 984 | passed | [0x03b9a4f89b346a221aed7e59b9072013d031170a0a8bc8c1dd3451a520b20a84](https://testnet.etherscan.io/tx/0x03b9a4f89b346a221aed7e59b9072013d031170a0a8bc8c1dd3451a520b20a84)|
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 1054 | passed | [0x5a61fa07864423c9263f3147640a1dae6e46da82c7cf7a264ac5bc6e4ebe2050](https://testnet.etherscan.io/tx/0x5a61fa07864423c9263f3147640a1dae6e46da82c7cf7a264ac5bc6e4ebe2050)|
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 530 | passed | [0xb1eaf4dcb57743b5e934443507e691b8de013d609f8faaf8906308fc6022e44f](https://testnet.etherscan.io/tx/0xb1eaf4dcb57743b5e934443507e691b8de013d609f8faaf8906308fc6022e44f)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | |
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 597 | passed | [0xf5ab975703b97022498910e26e3338a280267c6e503315ce68cbf504ebff700d](https://testnet.etherscan.io/tx/0xf5ab975703b97022498910e26e3338a280267c6e503315ce68cbf504ebff700d)|
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 561 | passed | [0xf6c8f111c75a7855c7f8d3a4e1ad818da38cbe343b3eeaeba60c537f1d5b48a3](https://testnet.etherscan.io/tx/0xf6c8f111c75a7855c7f8d3a4e1ad818da38cbe343b3eeaeba60c537f1d5b48a3)|
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 398 | passed | [0x54e7b8a6a6dc8cc5bcd0e8268e26b69e618bc01746be84281424304bce45bbb2](https://testnet.etherscan.io/tx/0x54e7b8a6a6dc8cc5bcd0e8268e26b69e618bc01746be84281424304bce45bbb2)|
