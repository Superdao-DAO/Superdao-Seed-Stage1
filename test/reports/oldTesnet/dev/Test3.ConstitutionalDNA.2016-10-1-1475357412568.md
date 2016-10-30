-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 315 | passed | [0x8ef1847f4dfa589467d57c3bc94cfed38e37b4cdc69509a56027c3ab475430a2](https://testnet.etherscan.io/tx/0x8ef1847f4dfa589467d57c3bc94cfed38e37b4cdc69509a56027c3ab475430a2)|
|should set consensusX address from founderAddress | setHome | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 332 | passed | [0x972cee91dee87481fd47b7932be0bf725a3eaf279987ec971142dfb071ec3a7c](https://testnet.etherscan.io/tx/0x972cee91dee87481fd47b7932be0bf725a3eaf279987ec971142dfb071ec3a7c)|
|should fail to set consensusX address from non founderAddress | setHome | 0x21ed4ea6045716d6fe59481e7dc94e99a331e803 |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0x21ed4ea6045716d6fe59481e7dc94e99a331e803 |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 330 | passed | [0xe99334714c208dbd33e20d91f448a08ff49d961fa6e3646f718c8f312d795bca](https://testnet.etherscan.io/tx/0xe99334714c208dbd33e20d91f448a08ff49d961fa6e3646f718c8f312d795bca)|
|should add amendable article from founderAddress | addArticle | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 264 | passed | [0x95ffa2c6ec148523953434d812f02b5a8849ed5cd92fd4558d913140dee0105f](https://testnet.etherscan.io/tx/0x95ffa2c6ec148523953434d812f02b5a8849ed5cd92fd4558d913140dee0105f)|
|should fail to add an item to non existing article | addArticleItem | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 |  | failed | |
|should add an item to an existing amendable article | addArticleItem | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 290 | passed | [0x24c505c2664f8cf7e579f6e017f2dd041ddedb9be7e8f72030445a7599b6c22c](https://testnet.etherscan.io/tx/0x24c505c2664f8cf7e579f6e017f2dd041ddedb9be7e8f72030445a7599b6c22c)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x21ed4ea6045716d6fe59481e7dc94e99a331e803 |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0x21ed4ea6045716d6fe59481e7dc94e99a331e803 |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0x7b264ddfc89fd807cd3a7954982b4ee9382327a2 |  | failed | |
|should amend an amendable article item | amendArticleItem | 0x7b264ddfc89fd807cd3a7954982b4ee9382327a2 | 183 | passed | [0x499486c9ca169561d4e2e2484b5a997a710490c3c5dc2175f7cc4202805390be](https://testnet.etherscan.io/tx/0x499486c9ca169561d4e2e2484b5a997a710490c3c5dc2175f7cc4202805390be)|
|should add a founding team from founderAddress | setFoundingTeam | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 291 | passed | [0xdaef12fca8f220ad9e3cd4aa692ecfa102549a95582bc712eca76d10cdc9088f](https://testnet.etherscan.io/tx/0xdaef12fca8f220ad9e3cd4aa692ecfa102549a95582bc712eca76d10cdc9088f)|
|should update a founding team members profile | updateProfile | 0x6c2481d1f6eefe41d3da6797deed7b947147c776 | 187 | passed | [0x97aefcfacedda66401e2d2b7035a3c3707902f8ed631e9dc5a628a8327c44da0](https://testnet.etherscan.io/tx/0x97aefcfacedda66401e2d2b7035a3c3707902f8ed631e9dc5a628a8327c44da0)|
