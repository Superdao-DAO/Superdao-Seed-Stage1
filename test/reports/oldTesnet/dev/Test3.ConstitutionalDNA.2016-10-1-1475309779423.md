-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 404 | passed | [0xa81bc6acebeedd8ce6ac7380ec55f6e977d40cbf6caef3f89eb474ccd2805082](https://testnet.etherscan.io/tx/0xa81bc6acebeedd8ce6ac7380ec55f6e977d40cbf6caef3f89eb474ccd2805082)
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 302 | passed | [0x3dd6811e631734f74bff170d0e78734aa169436577653877b3c045307be60e59](https://testnet.etherscan.io/tx/0x3dd6811e631734f74bff170d0e78734aa169436577653877b3c045307be60e59)
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 737 | passed | [0xad4a2357d1c43e8d7512374c625dd81eaa282842c8b5134687dfb6f483d14724](https://testnet.etherscan.io/tx/0xad4a2357d1c43e8d7512374c625dd81eaa282842c8b5134687dfb6f483d14724)
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 301 | passed | [0xae9fea99186ac2056a63ed1038fa1042e741da506869c1dc86a9bfeb597e3689](https://testnet.etherscan.io/tx/0xae9fea99186ac2056a63ed1038fa1042e741da506869c1dc86a9bfeb597e3689)
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 249 | passed | [0x06aff944c9c2be6cc53f3b9a9bbd022fa14cabdf9be471bc3d62a0cd50a909c3](https://testnet.etherscan.io/tx/0x06aff944c9c2be6cc53f3b9a9bbd022fa14cabdf9be471bc3d62a0cd50a909c3)
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | 
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 964 | passed | [0xf8c95f4a4a7e1867fb8e95a78273ffc928eb4a488c4d5e002ebb9848df08d224](https://testnet.etherscan.io/tx/0xf8c95f4a4a7e1867fb8e95a78273ffc928eb4a488c4d5e002ebb9848df08d224)
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 989 | passed | [0x2bcf9d6e8feb58091c58bf36081f50ee7b9e223f9a44dbf9eb5cb2cb168bc20d](https://testnet.etherscan.io/tx/0x2bcf9d6e8feb58091c58bf36081f50ee7b9e223f9a44dbf9eb5cb2cb168bc20d)
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 746 | passed | [0x14d4f3c4fbfbcc5f50b74c8fabd67924e6a81bf4b1a675d46c0832cd097890a1](https://testnet.etherscan.io/tx/0x14d4f3c4fbfbcc5f50b74c8fabd67924e6a81bf4b1a675d46c0832cd097890a1)
