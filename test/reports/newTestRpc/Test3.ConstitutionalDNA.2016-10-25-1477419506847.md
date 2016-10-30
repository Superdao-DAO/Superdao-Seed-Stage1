-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 333 | passed | [0x8e60c26a004b25caed24cd8f9d64e72df83afb50bfa495887d2702f4a6cb19d0](https://testnet.etherscan.io/tx/0x8e60c26a004b25caed24cd8f9d64e72df83afb50bfa495887d2702f4a6cb19d0)|
|should set consensusX address from founderAddress | setHome | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 312 | passed | [0xdf675f775d6d65263a2ac799cdb137f4ab72d885efd00978d61b962e5a71e488](https://testnet.etherscan.io/tx/0xdf675f775d6d65263a2ac799cdb137f4ab72d885efd00978d61b962e5a71e488)|
|should fail to set consensusX address from non founderAddress | setHome | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 214 | passed | [0x88d3020bbb3ed2f2086043cb0bf102045c7863e9b5719682bc7596aa8c080d34](https://testnet.etherscan.io/tx/0x88d3020bbb3ed2f2086043cb0bf102045c7863e9b5719682bc7596aa8c080d34)|
|should add amendable article from founderAddress | addArticle | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 301 | passed | [0xd5d0211242952582c81c9f5f2d3eb38d951207cd062bf67d9865bb975e08898b](https://testnet.etherscan.io/tx/0xd5d0211242952582c81c9f5f2d3eb38d951207cd062bf67d9865bb975e08898b)|
|should fail to add an item to non existing article | addArticleItem | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 |  | failed | |
|should add an item to an existing amendable article | addArticleItem | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 229 | passed | [0xbd0aba5a7841bcef6e4a6ebab74deb5367f51863633e85f180966f4c42447f9b](https://testnet.etherscan.io/tx/0xbd0aba5a7841bcef6e4a6ebab74deb5367f51863633e85f180966f4c42447f9b)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0xb4fc4b4655caee48cccd8adabd7ddfff14f2cd98 |  | failed | |
|should amend an amendable article item | amendArticleItem | 0xb4fc4b4655caee48cccd8adabd7ddfff14f2cd98 | 199 | passed | [0x05e5284c1fbe38c6393e71bd3209b2cf82fb32d0317e1900175db6b59f7a6ea3](https://testnet.etherscan.io/tx/0x05e5284c1fbe38c6393e71bd3209b2cf82fb32d0317e1900175db6b59f7a6ea3)|
|should add a founding team from founderAddress | setFoundingTeam | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 522 | passed | [0xa4809191220e99cb161bea4a5182a5d0ccd1628e995c14f603e857b52a7531dc](https://testnet.etherscan.io/tx/0xa4809191220e99cb161bea4a5182a5d0ccd1628e995c14f603e857b52a7531dc)|
|should update a founding team members profile | updateProfile | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 266 | passed | [0x80925af42e1d2a15589d4d6038b5f38c3e03ae175067cacea9558ce6908c7f9c](https://testnet.etherscan.io/tx/0x80925af42e1d2a15589d4d6038b5f38c3e03ae175067cacea9558ce6908c7f9c)|
