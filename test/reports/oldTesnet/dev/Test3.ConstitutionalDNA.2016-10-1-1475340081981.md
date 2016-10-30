-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should deploy ConstitutionalDNA TestInstance | constructor | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 23919 | passed | [0xb76751cafb2c15d59c71b6133a307950b4e442c1bc4ce686c8d6d2bace82189c](https://testnet.etherscan.io/tx/0xb76751cafb2c15d59c71b6133a307950b4e442c1bc4ce686c8d6d2bace82189c)|
|should add a founding team from founderAddress | setFoundingTeam | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed |  | failed | [0xeec6945519264ca94f7e202bf4c1cfab42dd28fe18773efe470b5a21ea47c327](https://testnet.etherscan.io/tx/0xeec6945519264ca94f7e202bf4c1cfab42dd28fe18773efe470b5a21ea47c327)|
|should update a founding team members profile | updateProfile | 0x67aa741429f95db9ecb7b9e3a7810f13fa17efed | 51917 | passed | [0x7d25d1e15a6d0740dbcb1de0148e3b87dfeb871c68c0d54c96ee861d8160c054](https://testnet.etherscan.io/tx/0x7d25d1e15a6d0740dbcb1de0148e3b87dfeb871c68c0d54c96ee861d8160c054)|
