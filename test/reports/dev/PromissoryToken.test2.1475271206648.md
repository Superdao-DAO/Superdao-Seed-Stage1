-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 27077 | passed | [0xf70a2610fe4d5115ab3689abf74e5bc9f39c68a8ddab7c515390953e6896e273](https://testnet.etherscan.io/tx/0xf70a2610fe4d5115ab3689abf74e5bc9f39c68a8ddab7c515390953e6896e273)
Backers> accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 6047 | passed | [0x67426b727ee0d9cd765220cce6b238ff032c86201cfe5c1ac6c636ddf0f28b7f](https://testnet.etherscan.io/tx/0x67426b727ee0d9cd765220cce6b238ff032c86201cfe5c1ac6c636ddf0f28b7f)
Backers> accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 50467 | passed | [0x6ce0fdc8b1c23eff3905879e3a9600ba42076badb82e58174e9555fd58e3ffad](https://testnet.etherscan.io/tx/0x6ce0fdc8b1c23eff3905879e3a9600ba42076badb82e58174e9555fd58e3ffad)
