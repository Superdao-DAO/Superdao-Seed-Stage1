-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 348 | passed | [0x6af310a0fa494935355e9496aee7f598c43091c70ac340614690d102ee27541e](https://testnet.etherscan.io/tx/0x6af310a0fa494935355e9496aee7f598c43091c70ac340614690d102ee27541e)
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 228 | passed | [0xb7603b40848eb9bf875abb92f678ed50fd82e4628889631794080da04b42549e](https://testnet.etherscan.io/tx/0xb7603b40848eb9bf875abb92f678ed50fd82e4628889631794080da04b42549e)
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 231 | passed | [0x98a3c9affab30bb21e27e40c50ed2621c1425de54df1a0d12f33b6e51959fbf8](https://testnet.etherscan.io/tx/0x98a3c9affab30bb21e27e40c50ed2621c1425de54df1a0d12f33b6e51959fbf8)
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 783 | passed | [0xcec2e2ed875ac5e9656c8afab59fbb9cddd6e25761e555dffa0b934deec978f0](https://testnet.etherscan.io/tx/0xcec2e2ed875ac5e9656c8afab59fbb9cddd6e25761e555dffa0b934deec978f0)
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 349 | passed | [0xc2c1af4a698156f1c83911ba8ad984516abaa20debf989e87c78eaebb82f3e81](https://testnet.etherscan.io/tx/0xc2c1af4a698156f1c83911ba8ad984516abaa20debf989e87c78eaebb82f3e81)
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | 
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | 
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | 
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 565 | passed | [0xbff8fcdf4268e92488a974119e45207a542d37c89c7f31d23458acf3d49c2c5b](https://testnet.etherscan.io/tx/0xbff8fcdf4268e92488a974119e45207a542d37c89c7f31d23458acf3d49c2c5b)
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 556 | passed | [0xe03a3fa67c69674ab59257192ed834ae607011dda7fd51a0df61fa92cbb6e3e6](https://testnet.etherscan.io/tx/0xe03a3fa67c69674ab59257192ed834ae607011dda7fd51a0df61fa92cbb6e3e6)
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 326 | passed | [0x9a6211cfa8bccf607735fc65ef6112675e3b8f6a1f4cfb3b1815498a507b59d4](https://testnet.etherscan.io/tx/0x9a6211cfa8bccf607735fc65ef6112675e3b8f6a1f4cfb3b1815498a507b59d4)
