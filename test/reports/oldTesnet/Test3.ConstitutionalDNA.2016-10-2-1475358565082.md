-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 42613 | passed | [0x0ff5969a6a52e4b794fb7d3ff06d09164e52b91b86b4fc3a2336fe2ac80131c9](https://testnet.etherscan.io/tx/0x0ff5969a6a52e4b794fb7d3ff06d09164e52b91b86b4fc3a2336fe2ac80131c9)|
|should set consensusX address from founderAddress | setHome | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 18114 | passed | [0xfdb1bba098cc4204be8f6aae257878c1b730472ee2bfa39416e7e6d055eb5937](https://testnet.etherscan.io/tx/0xfdb1bba098cc4204be8f6aae257878c1b730472ee2bfa39416e7e6d055eb5937)|
|should fail to set consensusX address from non founderAddress | setHome | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 37148 | passed | [0x842e68d49b46cf80ab608c042259c50685db63daa09deb6e056191d53e1e25f9](https://testnet.etherscan.io/tx/0x842e68d49b46cf80ab608c042259c50685db63daa09deb6e056191d53e1e25f9)|
|should fail to add article from non founderAddress | addArticle | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 16060 | passed | [0xc2109fe2ca425896447cf0df564e6580657ce2d71459b760a4a35e3d8864cf3c](https://testnet.etherscan.io/tx/0xc2109fe2ca425896447cf0df564e6580657ce2d71459b760a4a35e3d8864cf3c)|
|should add non-amendable article from founderAddress | addArticle | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 38124 | passed | [0x3cf8f4fe0e4a9c0feee6ba5df81bca93f65c2a5f32e8771c38793dd1db5e33df](https://testnet.etherscan.io/tx/0x3cf8f4fe0e4a9c0feee6ba5df81bca93f65c2a5f32e8771c38793dd1db5e33df)|
|should add amendable article from founderAddress | addArticle | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 69218 | passed | [0x18dd92e1f8e751b89acd8e784ed7653c218dc62440cb404bb166001914d2b43b](https://testnet.etherscan.io/tx/0x18dd92e1f8e751b89acd8e784ed7653c218dc62440cb404bb166001914d2b43b)|
|should fail to add an item to non existing article | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 40120 | passed | [0xafacb018b0c1904b1ebc4e758a731af1043380b7deaaeb121179d0adc1fbe87b](https://testnet.etherscan.io/tx/0xafacb018b0c1904b1ebc4e758a731af1043380b7deaaeb121179d0adc1fbe87b)|
|should add an item to an existing amendable article | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 77245 | passed | [0x245d3d5f3e2b91908343706812aa1290c2c76eb6feef6fe96ef441154c538d15](https://testnet.etherscan.io/tx/0x245d3d5f3e2b91908343706812aa1290c2c76eb6feef6fe96ef441154c538d15)|
|should fail to add an item to an existing article from non founder Address | addArticleItem | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 42132 | passed | [0x1a01c9fac4f2a7d3bcb7d8f25c13c0cfa57f7fd99230b486d8b96d080ef12d76](https://testnet.etherscan.io/tx/0x1a01c9fac4f2a7d3bcb7d8f25c13c0cfa57f7fd99230b486d8b96d080ef12d76)|
|should fail to add an item to an invalid article no | addArticleItem | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 36127 | passed | [0x5552359e64846abe8a05ea3fe364b71b45984b81287e86a1f077d0e5a03e098a](https://testnet.etherscan.io/tx/0x5552359e64846abe8a05ea3fe364b71b45984b81287e86a1f077d0e5a03e098a)|
|should fail to amend an article from non consensusX address | amendArticleItem | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 68240 | passed | [0x931b8d7ce1d6ae02487e7359de8d0fc23960eb9f373d1fb0c8675a1b529a3608](https://testnet.etherscan.io/tx/0x931b8d7ce1d6ae02487e7359de8d0fc23960eb9f373d1fb0c8675a1b529a3608)|
|should fail to amend a non-amendable article item | amendArticleItem | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 58169 | passed | [0x518d47cc28e9d28ed225af308254fe340c7dfbee7cb171d0245700336f353b64](https://testnet.etherscan.io/tx/0x518d47cc28e9d28ed225af308254fe340c7dfbee7cb171d0245700336f353b64)|
|should amend an amendable article item | amendArticleItem | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 46304 | passed | [0x579c32953cb72c755f2ee8de82cb5a053ed3441008e51286bea83b3e165b7ddd](https://testnet.etherscan.io/tx/0x579c32953cb72c755f2ee8de82cb5a053ed3441008e51286bea83b3e165b7ddd)|
|should add a founding team from founderAddress | setFoundingTeam | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 96274 | passed | [0x02a296f636082c3e6afeeced2aabfeed8846778d816670dc72742fdd6ba8ff42](https://testnet.etherscan.io/tx/0x02a296f636082c3e6afeeced2aabfeed8846778d816670dc72742fdd6ba8ff42)|
|should update a founding team members profile | updateProfile | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 22082 | passed | [0xca92d25b3bbf2d68329b9baefc9c41f12e49678c1bf5b972a5647d2324947ace](https://testnet.etherscan.io/tx/0xca92d25b3bbf2d68329b9baefc9c41f12e49678c1bf5b972a5647d2324947ace)|