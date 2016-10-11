-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 | 602 | passed | [0x789f2692310d6adc40409ec08b11e1dccaf8336e737c90a5db92b089075dfce4](https://testnet.etherscan.io/tx/0x789f2692310d6adc40409ec08b11e1dccaf8336e737c90a5db92b089075dfce4)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0xc3ba31e3e76445ee213e8bfc8cb5f7768bd12bb0 |  | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x2f398d22c1aa12eacedad01f0301243cbb4647ad | 1759 | passed | [0xd352767713d2d0f46cac9d4a3ae7f95af2411fa2232801d5999862f71c4b9dd5](https://testnet.etherscan.io/tx/0xd352767713d2d0f46cac9d4a3ae7f95af2411fa2232801d5999862f71c4b9dd5)|
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b | 1273 | passed | [0xcf8683229c7f9804cf6b5c4cb61ca4d1238a745a907664fa527e20de9fcd86e4](https://testnet.etherscan.io/tx/0xcf8683229c7f9804cf6b5c4cb61ca4d1238a745a907664fa527e20de9fcd86e4)|
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0xfbde8d50ba5319e180c52f6860f732ceb35f035b |  | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0x8d7d34d7b43798a80047bee6e4b277e85e851504 | 968 | passed | [0xe0dcbee688e79df2cc16714a54acb7dfb36a0f0a2b3d468cb38a47ef1e7969ca](https://testnet.etherscan.io/tx/0xe0dcbee688e79df2cc16714a54acb7dfb36a0f0a2b3d468cb38a47ef1e7969ca)|
