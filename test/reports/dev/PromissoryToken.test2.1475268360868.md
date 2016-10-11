-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 6548 | passed | [0x53f5cc41dda11a7b78b2d0d15a12ad01f03e6ba93b09003a2683e3ff704ae76e](https://testnet.etherscan.io/tx/0x53f5cc41dda11a7b78b2d0d15a12ad01f03e6ba93b09003a2683e3ff704ae76e)
Backers> accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 18090 | passed | [0x7e4bd45c05ec12ab7c56c6fb8eb0ae166e6a938c8d9747b020f3603f8ad30641](https://testnet.etherscan.io/tx/0x7e4bd45c05ec12ab7c56c6fb8eb0ae166e6a938c8d9747b020f3603f8ad30641)
Backers> accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 22331 | passed | [0xe0e5e747b0cc2432ae8cae1b44ad6dc884c1b58dccacb81d80bf91ed45908ff8](https://testnet.etherscan.io/tx/0xe0e5e747b0cc2432ae8cae1b44ad6dc884c1b58dccacb81d80bf91ed45908ff8)
