|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 526 | passed | [0x0c3e2be4873191aa989aae1bc41d37216e2ce53751a875d7f774ade7e14ee02f](https://testnet.etherscan.io/tx/0x0c3e2be4873191aa989aae1bc41d37216e2ce53751a875d7f774ade7e14ee02f)|
-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 877 | passed | [0x09c6f62c01c99531adc757e33bd8e238991b75c49d3e06038300983a2435ace8](https://testnet.etherscan.io/tx/0x09c6f62c01c99531adc757e33bd8e238991b75c49d3e06038300983a2435ace8)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 713 | passed | [0x7af254af5705c6a2703d6e5b5bdd1d4edbafff1ee6a3a3d02086947d24a8323a](https://testnet.etherscan.io/tx/0x7af254af5705c6a2703d6e5b5bdd1d4edbafff1ee6a3a3d02086947d24a8323a)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 | 693 | passed | [0xd2c1c9427a790483917bab516a59d62c335380a2cb91b94bd9320e01e5136c85](https://testnet.etherscan.io/tx/0xd2c1c9427a790483917bab516a59d62c335380a2cb91b94bd9320e01e5136c85)|
