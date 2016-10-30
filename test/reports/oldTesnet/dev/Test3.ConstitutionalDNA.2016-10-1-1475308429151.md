-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 289 | passed | [0x0f2fb555b4cdeadc168f6194218edd176ffbdf72ea243d6a816b76ffbac054eb](https://testnet.etherscan.io/tx/0x0f2fb555b4cdeadc168f6194218edd176ffbdf72ea243d6a816b76ffbac054eb)
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 242 | passed | [0x2f2ec35d0d54e628e1e93d59a425efcbfb9ffa0895d9fe02a14667252cf37688](https://testnet.etherscan.io/tx/0x2f2ec35d0d54e628e1e93d59a425efcbfb9ffa0895d9fe02a14667252cf37688)
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 259 | passed | [0x51ad35beee88a174affa8752d6016eedcd3eb118d0b3a8d59cb247f7c46c6524](https://testnet.etherscan.io/tx/0x51ad35beee88a174affa8752d6016eedcd3eb118d0b3a8d59cb247f7c46c6524)
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 584 | passed | [0x5e21278f16bd9b147b6d98719d67a30d4fb3a5b8a5daed1e272ab2e5e462f7d7](https://testnet.etherscan.io/tx/0x5e21278f16bd9b147b6d98719d67a30d4fb3a5b8a5daed1e272ab2e5e462f7d7)
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 319 | passed | [0x5ee88a81eb6068026f2a2224f79204a72e2d30bb3e515407ab4cd0e01ec54579](https://testnet.etherscan.io/tx/0x5ee88a81eb6068026f2a2224f79204a72e2d30bb3e515407ab4cd0e01ec54579)
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | 
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 326 | passed | [0xc2bb2b22b81c2d9e4c7f0990053b54e9529c03e4b15bb0f50f2326af5fea9442](https://testnet.etherscan.io/tx/0xc2bb2b22b81c2d9e4c7f0990053b54e9529c03e4b15bb0f50f2326af5fea9442)
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 532 | passed | [0x2ecdf7ca47abc7d26dc7afd565d128c48b91b9713da68bf2f12341b74c002f29](https://testnet.etherscan.io/tx/0x2ecdf7ca47abc7d26dc7afd565d128c48b91b9713da68bf2f12341b74c002f29)
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 704 | passed | [0x140218287814686a553ffdd0431cdafb2afb82090e2caf6a71055c01a16b9137](https://testnet.etherscan.io/tx/0x140218287814686a553ffdd0431cdafb2afb82090e2caf6a71055c01a16b9137)
