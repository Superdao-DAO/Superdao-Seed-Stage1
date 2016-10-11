-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 19561 | passed | [0x4f0861bac6288871c8fb58e3f91c44cfba5e513bb60dd280ccd64df425a4f1ac](https://testnet.etherscan.io/tx/0x4f0861bac6288871c8fb58e3f91c44cfba5e513bb60dd280ccd64df425a4f1ac)
accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 10111 | passed | [0x4a265deddfb42de4dffbd45688463c4c1c3f40d62a71a1873c41afdcbc25f16e](https://testnet.etherscan.io/tx/0x4a265deddfb42de4dffbd45688463c4c1c3f40d62a71a1873c41afdcbc25f16e)
accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 | 6142 | passed | [0x429df859bd7b8136a537ccd8e2de8fe7dfda7bcca77a4766fc3acfe74c519037](https://testnet.etherscan.io/tx/0x429df859bd7b8136a537ccd8e2de8fe7dfda7bcca77a4766fc3acfe74c519037)
accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[3] should request founder change | founderSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[3] should try to approve founder change request and fail | cofounderApproveSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[2] should try to approve founder change request with wrong switchHash and fail | cofounderApproveSwitchRequest | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | 
accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | 
