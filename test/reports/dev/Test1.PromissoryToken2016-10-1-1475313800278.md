-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 566 | passed | [0x5e7c46b1904ccdc0436024f82c64b00efaf7112bb2630c2144e177a403fe8a62](https://testnet.etherscan.io/tx/0x5e7c46b1904ccdc0436024f82c64b00efaf7112bb2630c2144e177a403fe8a62)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 376 | passed | [0xa924b58493ecf939e0f7a9a2beb813febc657f509050f6743970a602f0f39f2c](https://testnet.etherscan.io/tx/0xa924b58493ecf939e0f7a9a2beb813febc657f509050f6743970a602f0f39f2c)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 1101 | passed | [0xfc5790e122798fe894e3d05309aae28140505c3f7ca966da8921ef3ff67f9a61](https://testnet.etherscan.io/tx/0xfc5790e122798fe894e3d05309aae28140505c3f7ca966da8921ef3ff67f9a61)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 | 894 | passed | [0x4ebf331ab6dabc6b7df3807c7638648740fa53465f3e7333ec8eb1aabf82f777](https://testnet.etherscan.io/tx/0x4ebf331ab6dabc6b7df3807c7638648740fa53465f3e7333ec8eb1aabf82f777)|
