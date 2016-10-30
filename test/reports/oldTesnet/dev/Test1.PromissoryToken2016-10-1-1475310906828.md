-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 635 | passed | [0x7c919712fd39b677bdde287519814eefb94d2e86aa83d9458a71065308da8cf5](https://testnet.etherscan.io/tx/0x7c919712fd39b677bdde287519814eefb94d2e86aa83d9458a71065308da8cf5)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 381 | passed | [0xf121b1bb55c8ba4c11c7a44fc90068aa98c2c6a065412c27871f7bdc080d8945](https://testnet.etherscan.io/tx/0xf121b1bb55c8ba4c11c7a44fc90068aa98c2c6a065412c27871f7bdc080d8945)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 1253 | passed | [0x361f000fe8458861a236ff10e4d127b85fc8d7009f6db7808e1554ab8c90a0b0](https://testnet.etherscan.io/tx/0x361f000fe8458861a236ff10e4d127b85fc8d7009f6db7808e1554ab8c90a0b0)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 | 1429 | passed | [0x57981466cfcfb0f314ae4f9a8ee2918f6ef9d60190362b92a1bff8f80fe1a093](https://testnet.etherscan.io/tx/0x57981466cfcfb0f314ae4f9a8ee2918f6ef9d60190362b92a1bff8f80fe1a093)|
