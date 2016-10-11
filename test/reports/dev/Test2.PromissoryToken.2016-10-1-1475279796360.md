-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 42087 | passed | [0x40b889f3b2d743ba9b7e925de6dbbd87199655f2ba94e36a59bd2c07aabcd04b](https://testnet.etherscan.io/tx/0x40b889f3b2d743ba9b7e925de6dbbd87199655f2ba94e36a59bd2c07aabcd04b)
Backers> accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 56240 | passed | [0x78cb8d08ccb309ce6c6d2b882895e574973d23db596397daee407c2eff08700c](https://testnet.etherscan.io/tx/0x78cb8d08ccb309ce6c6d2b882895e574973d23db596397daee407c2eff08700c)
Backers> accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 58211 | passed | [0xcfd73b1b9f665e2d95a5eb8a1656f8a6bc11bac7e97db64f12f18249b8e064d0](https://testnet.etherscan.io/tx/0xcfd73b1b9f665e2d95a5eb8a1656f8a6bc11bac7e97db64f12f18249b8e064d0)
