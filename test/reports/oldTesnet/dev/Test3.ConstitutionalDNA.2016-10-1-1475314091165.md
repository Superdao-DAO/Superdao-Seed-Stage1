-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 583 | passed | [0xc622d1e99eeadb9849269077b9174149fe464be790b65c090a9a7b00d8b0a3cd](https://testnet.etherscan.io/tx/0xc622d1e99eeadb9849269077b9174149fe464be790b65c090a9a7b00d8b0a3cd)|
|should set consensusX address from founderAddress | setHome | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 407 | passed | [0xb80bfb8a388e7d053e3f286a4200884d9bf6d87594f9415768061d166425d649](https://testnet.etherscan.io/tx/0xb80bfb8a388e7d053e3f286a4200884d9bf6d87594f9415768061d166425d649)|
|should fail to set consensusX address from non founderAddress | setHome | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 455 | passed | [0xe584302f8677ba11c520084326e654173f65d42991ba1905f10e7d8dbde0853e](https://testnet.etherscan.io/tx/0xe584302f8677ba11c520084326e654173f65d42991ba1905f10e7d8dbde0853e)|
|should add amendable article from founderAddress | addArticle | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 488 | passed | [0xf0b03734931373b9c22439fde9bd8eb530ceeda0ea63550229672f65c9482222](https://testnet.etherscan.io/tx/0xf0b03734931373b9c22439fde9bd8eb530ceeda0ea63550229672f65c9482222)|
|should fail to add an item to non existing article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should add an item to an existing amendable article | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 468 | passed | [0x74e1ae3aadd435f988bdee1400b123b59c0182dbe24dc32df158898ba0bf02d7](https://testnet.etherscan.io/tx/0x74e1ae3aadd435f988bdee1400b123b59c0182dbe24dc32df158898ba0bf02d7)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad |  | failed | |
|should amend an amendable article item | amendArticleItem | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 525 | passed | [0x3b10110708167d9d122c4db4875d73afcad99f910f63247f75e7c38b0fbe752f](https://testnet.etherscan.io/tx/0x3b10110708167d9d122c4db4875d73afcad99f910f63247f75e7c38b0fbe752f)|
|should add a founding team from founderAddress | setFoundingTeam | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 616 | passed | [0x75bd181a2055203c32d39b6233b0c59408462049a1fea7c480c9f327b552a8e3](https://testnet.etherscan.io/tx/0x75bd181a2055203c32d39b6233b0c59408462049a1fea7c480c9f327b552a8e3)|
|should update a founding team members profile | updateProfile | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 542 | passed | [0x6c846233d2ce83cb464982abe2278c7f8373dc22799bf870384d782caa096eb6](https://testnet.etherscan.io/tx/0x6c846233d2ce83cb464982abe2278c7f8373dc22799bf870384d782caa096eb6)|
