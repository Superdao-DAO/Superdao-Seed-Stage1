-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0x608f25ac35e57005952a66ac9ed4514ae5d2a9ef | 122169 | passed | [0x74bad6b566177aa24db3f7a9345006b9d87cb24ef7a4de3312ef5e14eac0ed6d](https://testnet.etherscan.io/tx/0x74bad6b566177aa24db3f7a9345006b9d87cb24ef7a4de3312ef5e14eac0ed6d)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0x756f9ce9fa7f004635a41fef13ca52b223277d92 |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0x756f9ce9fa7f004635a41fef13ca52b223277d92 |  | failed | |
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0x756f9ce9fa7f004635a41fef13ca52b223277d92 |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x6c57a6397879df7ce5af3d66e9954f3230127daa |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x6c57a6397879df7ce5af3d66e9954f3230127daa |  | failed | |
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderApproveSwitchRequest | 0x6c57a6397879df7ce5af3d66e9954f3230127daa | 100371 | passed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderApproveSwitchRequest | 0x6c57a6397879df7ce5af3d66e9954f3230127daa |  | failed | |
