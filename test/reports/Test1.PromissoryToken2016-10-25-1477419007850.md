-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 | 259 | passed | [0x9e221a1607bf91cd0cf22ec29402ff61c99ed2f479ee8f19d46a1c497d1fb812](https://testnet.etherscan.io/tx/0x9e221a1607bf91cd0cf22ec29402ff61c99ed2f479ee8f19d46a1c497d1fb812)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xe8f920e423bb7cab7bed22c8be3a59913255f7c7 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0xb4fc4b4655caee48cccd8adabd7ddfff14f2cd98 | 147 | passed | [0x18f25708025261a8ac5fc43640bff8c67add107ad785185d921a2ecb38a4859f](https://testnet.etherscan.io/tx/0x18f25708025261a8ac5fc43640bff8c67add107ad785185d921a2ecb38a4859f)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xe7a949ea2727dbc38fca79ade1a87a84a8b5c9c4 |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xe7a949ea2727dbc38fca79ade1a87a84a8b5c9c4 | 95 | passed | [0x751b6d675642bdd25ec4ad73eea4f43e1c61005f78527425d66240ed4ec68ce3](https://testnet.etherscan.io/tx/0x751b6d675642bdd25ec4ad73eea4f43e1c61005f78527425d66240ed4ec68ce3)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xe7a949ea2727dbc38fca79ade1a87a84a8b5c9c4 |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x45eb4efb3c09c0542fdafe7dbea43250b7767193 | 187 | passed | [0xd13ca8e3edf456c6aa647e50ae648a9ff7157ba4d3bc3f08763e14e967308e3d](https://testnet.etherscan.io/tx/0xd13ca8e3edf456c6aa647e50ae648a9ff7157ba4d3bc3f08763e14e967308e3d)|
