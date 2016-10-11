-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 18302 | passed | [0xf0f4f3c3bf76e0c5919f7830eef0cf4b254a1e59984250b96d653b909316094f](https://testnet.etherscan.io/tx/0xf0f4f3c3bf76e0c5919f7830eef0cf4b254a1e59984250b96d653b909316094f)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 13000 | passed | [0x88641026cea72754b226d0020528310ec5e0c752b9f7a0e6092853970cc1ee0f](https://testnet.etherscan.io/tx/0x88641026cea72754b226d0020528310ec5e0c752b9f7a0e6092853970cc1ee0f)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 13809 | passed | [0xf30d54e38db71b282c2ed2ca44a3260cc1b18b7fce553ce819364f288336c99a](https://testnet.etherscan.io/tx/0xf30d54e38db71b282c2ed2ca44a3260cc1b18b7fce553ce819364f288336c99a)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 | 6732 | passed | [0xf1944bc8d70d430599352a7716020d57aa2c95defb7b790ef8552a47e5b4e95f](https://testnet.etherscan.io/tx/0xf1944bc8d70d430599352a7716020d57aa2c95defb7b790ef8552a47e5b4e95f)|
