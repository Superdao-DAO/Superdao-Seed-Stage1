|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 565 | passed | [0x9722d25be36572a1d3b379f9c43e055aa0428c1b232d3cd9755c7154136c8809](https://testnet.etherscan.io/tx/0x9722d25be36572a1d3b379f9c43e055aa0428c1b232d3cd9755c7154136c8809)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 1693 | passed | [0x3408d17a0f5b4066b1ab1b2539b8e3488c58759758fb95cd6f8e07f70b4b9b99](https://testnet.etherscan.io/tx/0x3408d17a0f5b4066b1ab1b2539b8e3488c58759758fb95cd6f8e07f70b4b9b99)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 1950 | passed | [0xf71f4727303a2e845851bf747cecbeb133a262394f5a50582d8534959173e347](https://testnet.etherscan.io/tx/0xf71f4727303a2e845851bf747cecbeb133a262394f5a50582d8534959173e347)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
