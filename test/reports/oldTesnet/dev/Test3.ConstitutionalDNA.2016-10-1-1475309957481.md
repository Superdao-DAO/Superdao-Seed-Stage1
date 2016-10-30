-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 418 | passed | [0x15ea9324ea0f723d3271fda8be4237863c4c95e5f9eff3fb7877475c8af9d982](https://testnet.etherscan.io/tx/0x15ea9324ea0f723d3271fda8be4237863c4c95e5f9eff3fb7877475c8af9d982)|
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 306 | passed | [0x8e6d9d64868b7945b27699065b0235b5785904119acf85014d17c629e0c16c35](https://testnet.etherscan.io/tx/0x8e6d9d64868b7945b27699065b0235b5785904119acf85014d17c629e0c16c35)|
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 288 | passed | [0xf747ee3cc9158cc425373a8a416b1c5d977f61409717aca1ca4f86a70edb1fcc](https://testnet.etherscan.io/tx/0xf747ee3cc9158cc425373a8a416b1c5d977f61409717aca1ca4f86a70edb1fcc)|
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 290 | passed | [0xd1784ef2eea4de81a2e258d48888bd4a0a64fd342ae5463041181d9e5f50c6b9](https://testnet.etherscan.io/tx/0xd1784ef2eea4de81a2e258d48888bd4a0a64fd342ae5463041181d9e5f50c6b9)|
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 901 | passed | [0xcae0e17ba72af16047fd914e8da23d3d82eb7a21b9949bc2d02532c9b0b22c35](https://testnet.etherscan.io/tx/0xcae0e17ba72af16047fd914e8da23d3d82eb7a21b9949bc2d02532c9b0b22c35)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | |
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 456 | passed | [0xbb99d411eb334998434b154af8bd9cfcee01c6f07d84a1705ca925594f50eb4d](https://testnet.etherscan.io/tx/0xbb99d411eb334998434b154af8bd9cfcee01c6f07d84a1705ca925594f50eb4d)|
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 630 | passed | [0x06d094b682d9faff5be4029bad166bf6614a0d42900e3af89a72b97aca4ba11d](https://testnet.etherscan.io/tx/0x06d094b682d9faff5be4029bad166bf6614a0d42900e3af89a72b97aca4ba11d)|
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 374 | passed | [0x11d183d7dcb77d0c45578dc143faa07a167a929bc69008cf8703f3349773e101](https://testnet.etherscan.io/tx/0x11d183d7dcb77d0c45578dc143faa07a167a929bc69008cf8703f3349773e101)|
