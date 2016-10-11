-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 71103 | passed | [0x31ce482970ffd8200473fe81c08ba666d915632cd486282d793b2574d875621e](https://testnet.etherscan.io/tx/0x31ce482970ffd8200473fe81c08ba666d915632cd486282d793b2574d875621e)|
|accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [0x267a146d2e95021f44fd5c6daf2f06b1e3c465c5f06fb93cee644c01b382a38a](https://testnet.etherscan.io/tx/0x267a146d2e95021f44fd5c6daf2f06b1e3c465c5f06fb93cee644c01b382a38a)|
|accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | [0x5ccf203ffe0399ac76b3859df773b51c30d237226578b7f8296376fb5a1ef692](https://testnet.etherscan.io/tx/0x5ccf203ffe0399ac76b3859df773b51c30d237226578b7f8296376fb5a1ef692)|
