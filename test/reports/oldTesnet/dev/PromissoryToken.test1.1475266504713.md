-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 17077 | passed | [0x06f629f7e5a821e59f739a67597d2bc309c6507cfc48e63a90b5661e9f4099a4](https://testnet.etherscan.io/tx/0x06f629f7e5a821e59f739a67597d2bc309c6507cfc48e63a90b5661e9f4099a4)
accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | [0x4e1e53bc36cf4810fa1c10f34b0f9d87314c513d3cd8b67b775f70f1af2fe76d](https://testnet.etherscan.io/tx/0x4e1e53bc36cf4810fa1c10f34b0f9d87314c513d3cd8b67b775f70f1af2fe76d)
accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0xcdf6491a680815d1aabad51e58fc403651f4bb60 |  | failed | 
accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[3] should request founder change | founderSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[3] should try to approve founder change request and fail | cofounderApproveSwitchRequest | 0xc87d0befbddb9965f9c5c4fd95c4327973b2614b |  | failed | 
accounts[2] should try to approve founder change request with wrong switchHash and fail | cofounderApproveSwitchRequest | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | 
accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0xd7977a9976278552abd5fcea6fa013d2bfdb4b5a |  | failed | 
