var PromissoryToken  ='';




##- Add your variations and results in comment below and I'll update this file    


### List of test vectors   

We will be testing these various areas of concern in order to provide a summary of our testing activities as

- Out of gas deployment errors (OOG)
- Documenting high gas costs
- Test modifiers,
- Test indipendent functions
- Test state changes

### Passing Modifiers :
-----------------------     


### Passing Functions :
-----------------------      


### Notable State Observations :
---------------------------------     


### Attack vectors / Unintended functionalities
------------------------------------------------

### Test Variables / Conditions
------------------------------------------------
#### Variables
Contract Address: 0x0  
Founder Address: accounts[0]  

#### Base Conditions
accounts[0]: 0x0  
accounts[1]: 0x0  
accounts[2]: 0x0  
accounts[3]: 0x0  


### Results / documentation for (Mordern) Tesnet tests:
----------------------------------------     
| Test   | Function |     Sender Address    | Gas Used | Txn time| Expected | Status | Txn Hash |
|-----|:-------:| -------:|------:| ------:|:------:| ------:| :------|
| Init: accounts[0] should deploy PromissoryToken to blockchain with ` founderSecret ` and accounts[1] as cofounder |  N/A | account[0] |  300000 | 15 secs | Successful |  Pass | [0xbc99651bd0ab0ce73e7d4e9af70915f5d74aca0056b6155382c72f1c3459a58d](https://testnet.etherscan.io/tx/0xbc99651bd0ab0ce73e7d4e9af70915f5d74aca0056b6155382c72f1c3459a58d)|
| accounts[1] should add early backer accounts[2] | setPrepaid() |    accounts[0]  |   3000000 | 30 Secs |  Failure |  Pass| [0x0](https://testnet.etherscan.io/tx/)|
| accounts[0] should add early backer accounts[1] with one batch of 200 000 tokens | setPrepaid() |  accounts[0] | 3000000 | 12 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[0] should add early backer accounts[2] with two batches of 100 000 tokens | setPrepaid() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should claim one batch of 200 000 prepaid tokens | claimPrepaid() |  accounts[1] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should claim two batches of 100 000 each prepaid tokens | claimPrepaid() |  accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should claim one batch of 600 000 tokens | claim() |  accounts[1] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should claim two batches of 500 000 tokens each | claim() |  accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should claim 4 000 000 tokens | claim() |  accounts[1] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should vote on non-existing withdrawal with invalid withdrawalID | approveWithdraw() |  accounts[1] | 3000000 | 10 Secs | Failure | Pass | [0x0](https://testnet.etherscan.io/tx/)|
| accounts[0] should create withdrawal request for 3 Ethers | withdraw() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass | [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should vote on withdrawal with ID: 0 with 800 000 tokens | approveWithdraw() |  accounts[1] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should double vote on withdrawal with ID: 0 | approveWithdraw() |  accounts[1] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should vote on withdrawal with ID: 0 with 1 200 000 tokens and trigger the approval | approveWithdraw() |  accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[0] should create withdrawal request with bigger value than the available balance | approveWithdraw() |  accounts[0] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should vote on withdrawal with ID 1 (Rejected withdrawal) | approveWithdraw() |  accounts[2] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should redeem owned 800 000 tokens | approveWithdraw() |  accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should redeem owned 800 000 tokens | approveWithdraw() |  accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| --- | --- | --- | --- | --- | --- | --- | --- |
| accounts[0] should change the cofounder to accounts[2] | cofounderSwitchAddress() |  accounts[0] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[1] should change the cofounder to accounts[2]  | cofounderSwitchAddress() |  accounts[1] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[3] should request founder change with wrong founderHash  | founderSwitchRequest() |  accounts[3] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[3] should request founder change with correct founderSecret  | founderSwitchRequest() |  accounts[3] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[3] should approve founder change request | cofounderApproveSwitchRequest() | accounts[3] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should approve founder change request with wrong One time Secret | cofounderApproveSwitchRequest() | accounts[2] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| accounts[2] should approve founder change request | cofounderApproveSwitchRequest() | accounts[2] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
