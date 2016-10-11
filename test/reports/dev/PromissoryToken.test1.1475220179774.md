-------------------------------------
| Test   | Function |     Sender Address    | Test Time | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:|:------:|
accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0x1e267261fb0dc55f94fa3127b609e9f7fbfb7adc | 199 | passed | [0xf08caaecc3426def58e8c0f206690c7d8a1512d42de427f06198dc9e5753ad82](https://testnet.etherscan.io/tx/0xf08caaecc3426def58e8c0f206690c7d8a1512d42de427f06198dc9e5753ad82)
accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0x1e267261fb0dc55f94fa3127b609e9f7fbfb7adc |  | failed | 
accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0x41ce2cef1a4141ac6ec5ee9d6a555e8036318cfe | 1075 | passed | [0xe9613358c2431c2bb7370f0b5682d2b020efc6673310ab9b0e5d3f2cc21b0404](https://testnet.etherscan.io/tx/0xe9613358c2431c2bb7370f0b5682d2b020efc6673310ab9b0e5d3f2cc21b0404)
accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0x6cec92651e05c371d5b6d81ca27f624e34cd216e |  | failed | 
accounts[3] should request founder change | founderSwitchRequest | 0x6cec92651e05c371d5b6d81ca27f624e34cd216e | 1053 | passed | [0xba85d01a11c2929b6abee8a9e9e38ed712871f8853e12ac1120ab50d2f731772](https://testnet.etherscan.io/tx/0xba85d01a11c2929b6abee8a9e9e38ed712871f8853e12ac1120ab50d2f731772)
accounts[3] should try to approve founder change request and fail | cofounderApproveSwitchRequest | 0x6cec92651e05c371d5b6d81ca27f624e34cd216e |  | failed | 
accounts[2] should try to approve founder change request with wrong switchHash and fail | cofounderApproveSwitchRequest | 0xcb8e08ae9c445905274e601ee66f6f79f4db3b09 |  | failed | 
accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0xcb8e08ae9c445905274e601ee66f6f79f4db3b09 | 1076 | passed | [0x4a01d60d6866ac9330e250d2ce4394d188440d0ca4a717620046e601202b8759](https://testnet.etherscan.io/tx/0x4a01d60d6866ac9330e250d2ce4394d188440d0ca4a717620046e601202b8759)
