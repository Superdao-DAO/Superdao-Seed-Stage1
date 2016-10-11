-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 12 | failed | |
|should set consensusX address from founderAddress | setHome | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should fail to set consensusX address from non founderAddress | setHome | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | |
|should fail to add article from non founderAddress | addArticle | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | |
|should add non-amendable article from founderAddress | addArticle | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should add amendable article from founderAddress | addArticle | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should fail to add an item to non existing article | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 1 | failed | |
|should add an item to an existing amendable article | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | |
|should fail to add an item to an invalid article no | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should fail to amend an article from non consensusX address | amendArticleItem | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | |
|should fail to amend a non-amendable article item | amendArticleItem | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | |
|should amend an amendable article item | amendArticleItem | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | |
|should add a founding team from founderAddress | setFoundingTeam | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
|should update a founding team members profile | updateProfile | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | |
