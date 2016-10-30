-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 24086 | passed | [0xadfbb735f75982a2b9e1d2cbe8d463e56f43393254b1f499df769d357c0f8e0a](https://testnet.etherscan.io/tx/0xadfbb735f75982a2b9e1d2cbe8d463e56f43393254b1f499df769d357c0f8e0a)
Backers> accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 41220 | passed | [0x057f15b924008135b3392dd0fca7083d9c1ab4f08b4e7c3194e440883e6d4417](https://testnet.etherscan.io/tx/0x057f15b924008135b3392dd0fca7083d9c1ab4f08b4e7c3194e440883e6d4417)
Backers> accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 37084 | passed | [0x25bf533b75703b82f97bd9e24df17e5955861328b5b2e880427ad6694ce37966](https://testnet.etherscan.io/tx/0x25bf533b75703b82f97bd9e24df17e5955861328b5b2e880427ad6694ce37966)
Backers> accounts[0] should add early backer accounts[2] with two batches of 100 000 tokens  | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 209437 | passed | [0xfb455a72ee6d2900bc3730cea1fbbd5dbcd0b1b5e1a807bacf298e4b324e2a12](https://testnet.etherscan.io/tx/0xfb455a72ee6d2900bc3730cea1fbbd5dbcd0b1b5e1a807bacf298e4b324e2a12), [0x4afd55ff5f527b7346a15be73fec09e112414448c589a1a104c356880f55fa38](https://testnet.etherscan.io/tx/0x4afd55ff5f527b7346a15be73fec09e112414448c589a1a104c356880f55fa38)
Backers> accounts[1] should claim one batch of 200 000 prepaid tokens | claimPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 36081 | passed | [0xdac8307c4dec5e77b18e46536e062433a2c5477386e6af022607a5a374f85aba](https://testnet.etherscan.io/tx/0xdac8307c4dec5e77b18e46536e062433a2c5477386e6af022607a5a374f85aba)
Backers> accounts[2] should claim two batches (100 000 prepaid tokens each) | claimPrepaid | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 12055 | passed | [0xb26557757672b51e15a98481df23764c4417fe37da621e55aea91267cd6bc5de](https://testnet.etherscan.io/tx/0xb26557757672b51e15a98481df23764c4417fe37da621e55aea91267cd6bc5de), [0xbd050207e5db97934ec34cfb8f47b805b735029da113c9eb1d21a08cfd20a435](https://testnet.etherscan.io/tx/0xbd050207e5db97934ec34cfb8f47b805b735029da113c9eb1d21a08cfd20a435)
Backers> accounts[1] should claim one batch of 600 000 tokens | claim | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [0x885639e19f7fbf75735d540270e96d0b1a45149b65a92e045c626a8bec3cb995](https://testnet.etherscan.io/tx/0x885639e19f7fbf75735d540270e96d0b1a45149b65a92e045c626a8bec3cb995)
Backers> accounts[2] should claim two batches (500 000 tokens each) | claim | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | [0x3501311e489d8924b8a6e266f30bd9259f2e14287f206f4b92b3f3b3e32eebec](https://testnet.etherscan.io/tx/0x3501311e489d8924b8a6e266f30bd9259f2e14287f206f4b92b3f3b3e32eebec)
Backers> accounts[1] should fail to claim 4 000 000 tokens | claim | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [0xbf7b5fbf8094407673a70f546d3ac759106318e898123c4da95af0a3bd1b23b7](https://testnet.etherscan.io/tx/0xbf7b5fbf8094407673a70f546d3ac759106318e898123c4da95af0a3bd1b23b7)
Withdrawal> should fail to approve withdrawal with invalid withdrawalID | approveWithdraw | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | 