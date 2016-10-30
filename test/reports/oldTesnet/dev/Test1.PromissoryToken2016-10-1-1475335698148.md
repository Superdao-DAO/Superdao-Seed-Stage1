-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy PromissoryToken test instance with founderHash: 1234 and accounts[1] as cofounder | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 79536 | passed | [0xaa860b3300ab346ed573a1a9cb6b158c1404514ae725fa72c5808cce93d10ef8](https://testnet.etherscan.io/tx/0xaa860b3300ab346ed573a1a9cb6b158c1404514ae725fa72c5808cce93d10ef8)|
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 23548 | passed | [0xc3a4b66d857c1ede635341192f4bfbbb7aa7061d8040515a3818cf44899d8bf0](https://testnet.etherscan.io/tx/0xc3a4b66d857c1ede635341192f4bfbbb7aa7061d8040515a3818cf44899d8bf0)|
