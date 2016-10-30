-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 27086 | passed | [0x6d2e02289494f45b3d278d3883e415de7c0d4330c9b115c3937c925208549e65](https://testnet.etherscan.io/tx/0x6d2e02289494f45b3d278d3883e415de7c0d4330c9b115c3937c925208549e65)
Backers> accounts[1] should fail to add early backer accounts[2] | setPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 14212 | passed | [0x0da43e77aafe9ea2f681ce3ee6508c8b650caa8ec8e5008c05eb4d3d6ea1e8b5](https://testnet.etherscan.io/tx/0x0da43e77aafe9ea2f681ce3ee6508c8b650caa8ec8e5008c05eb4d3d6ea1e8b5)
Backers> accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 10238 | passed | [0xd56a0834deedc0e53a4e4dd127b584f2dc2ad03027c4c1d1f5fba1b6b400962b](https://testnet.etherscan.io/tx/0xd56a0834deedc0e53a4e4dd127b584f2dc2ad03027c4c1d1f5fba1b6b400962b)
Backers> accounts[0] should add early backer accounts[2] with two batches of 100 000 tokens  | setPrepaid | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 80383 | passed | [0x5d3abaa1dbd3eecf702bdea8c1ef16a2a74ffa7c93094618ce06161aa419adf3](https://testnet.etherscan.io/tx/0x5d3abaa1dbd3eecf702bdea8c1ef16a2a74ffa7c93094618ce06161aa419adf3), [0x4ce03af0ecbf72bedef44d02beee81fda28a28d52d75c88e3d79f5d56eee4edd](https://testnet.etherscan.io/tx/0x4ce03af0ecbf72bedef44d02beee81fda28a28d52d75c88e3d79f5d56eee4edd)
Backers> accounts[1] should claim one batch of 200 000 prepaid tokens | claimPrepaid | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 46706 | passed | [0xc7d39af704c956696720b17b64bcd84fc229cbcad01c52eb07806b88a7bd491e](https://testnet.etherscan.io/tx/0xc7d39af704c956696720b17b64bcd84fc229cbcad01c52eb07806b88a7bd491e)
Backers> accounts[2] should claim two batches (100 000 prepaid tokens each) | claimPrepaid | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 159583 | passed | [0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4](https://testnet.etherscan.io/tx/0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4), [0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455](https://testnet.etherscan.io/tx/0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455)
Backers> accounts[1] should claim one batch of 200 000 tokens | claim | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [[0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4](https://testnet.etherscan.io/tx/0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4), [0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455](https://testnet.etherscan.io/tx/0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455)](https://testnet.etherscan.io/tx/[0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4](https://testnet.etherscan.io/tx/0x4ef5df6517feffe36ad10da34a36f655d8e11072986f0e760843a971443f11c4), [0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455](https://testnet.etherscan.io/tx/0x55d7d0b556b70d740cf8d2aefdb12f5dfd4e6ecc032585014f5426ffa6b82455))
Backers> accounts[2] should claim two batches (500 000 tokens each) | claim | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | 
Backers> accounts[1] should fail to claim 4 000 000 tokens | claim | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [0x27df31199046b4737ad4cc14ecdd2e55475402bf7a6ccd9c71d87cf9ddab60db](https://testnet.etherscan.io/tx/0x27df31199046b4737ad4cc14ecdd2e55475402bf7a6ccd9c71d87cf9ddab60db)
Withdrawal> should fail to approve withdrawal with invalid withdrawalID | approveWithdraw | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 41611 | passed | [0xd74dcba08a8dc60edce005371b67abe2f79f2fc25eac0a86878a6019df51b80e](https://testnet.etherscan.io/tx/0xd74dcba08a8dc60edce005371b67abe2f79f2fc25eac0a86878a6019df51b80e)
Withdrawal> should create withdrawal request | withdraw | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | [0x7f1b94c06f3b5d9a9ef06f29722a5336da2d96942edb18f853874574413c8711](https://testnet.etherscan.io/tx/0x7f1b94c06f3b5d9a9ef06f29722a5336da2d96942edb18f853874574413c8711)
Withdrawal> accounts[1] should vote on withdrawal 0 with 400 000 tokens | approveWithdraw | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | [0xa2c4ae7eb36781cfc3b8111fe07fb5dbe5428f4966fb4f7a4a862bec40bb1bde](https://testnet.etherscan.io/tx/0xa2c4ae7eb36781cfc3b8111fe07fb5dbe5428f4966fb4f7a4a862bec40bb1bde)
Withdrawal> accounts[1] should fail to vote again on withdrawal 0 | approveWithdraw | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 36593 | passed | [0x2ec46a06ad9ef88d85990b79cb09ed8d06caa26e85ff7d5e2b6cdcb2a876b250](https://testnet.etherscan.io/tx/0x2ec46a06ad9ef88d85990b79cb09ed8d06caa26e85ff7d5e2b6cdcb2a876b250)
Withdrawal> accounts[2] should vote on withdrawal 0 with 1 200 000 tokens and trigger the approval | approveWithdraw | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | [0x314001b4a395229f52aea955335243437313f23c5555a6ec7e57c9d4ce52d02b](https://testnet.etherscan.io/tx/0x314001b4a395229f52aea955335243437313f23c5555a6ec7e57c9d4ce52d02b)
Withdrawal> should fail to create withdrawal request with bigger value than the available balance | withdraw | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 70396 | passed | [0x054baa9e7b2d583d0d2bb09722818fcc7a7a8e749414c1b5815cae871f178001](https://testnet.etherscan.io/tx/0x054baa9e7b2d583d0d2bb09722818fcc7a7a8e749414c1b5815cae871f178001)
Withdrawal> accounts[2] should fail to approve withdrawal 1 | approveWithdraw | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a | 21550 | passed | [0x51e061515cd4b770251aed14f3f66fbfe5c7726f434b0ad3e585fa44e4a15d94](https://testnet.etherscan.io/tx/0x51e061515cd4b770251aed14f3f66fbfe5c7726f434b0ad3e585fa44e4a15d94)