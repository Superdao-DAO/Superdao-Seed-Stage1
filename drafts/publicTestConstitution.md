var PromissoryToken  =






##- Add your variations and results in comment below and I'll update this file    


## List of test vectors   

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
ConsensusX = accounts[1]

#### Base Conditions
accounts[0]: 0x0  
accounts[1]: 0x0  
accounts[2]: 0x0  
accounts[3]: 0x0  


### Results / documentation for (Mordern) Tesnet tests:
----------------------------------------     
| Test   | Function |     Sender Address    | Gas Used | Txn time| Expected | Status | Txn Hash |
|-----|:-------:| -------:|------:| ------:|:------:| ------:| :------|
| Init: accounts[0] should deploy ConstitutionalDNA to the blockchain |  N/A | account[0] |  300000 | 15 secs | Successful |  Pass | [0xbc99651bd0ab0ce73e7d4e9af70915f5d74aca0056b6155382c72f1c3459a58d](https://testnet.etherscan.io/tx/0xbc99651bd0ab0ce73e7d4e9af70915f5d74aca0056b6155382c72f1c3459a58d)|
| set consensusX address from non founderAddress | setHome() |    accounts[2]  |   3000000 | 30 Secs |  Failure |  Pass| [0x0](https://testnet.etherscan.io/tx/)|
| set consensusX address from founderAddress | setHome() |  accounts[0] | 3000000 | 12 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add article from non founderAddress | addArticle() |  accounts[2] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add article from founderAddress | addArticle() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |
| add ammendable article from founderAddress | addArticle() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add an item to an existing article from non founder Address | addArticleItem() |  accounts[3] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add an item to an existing article from founderAddress | addArticleItem() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |
| add an item to an ammendable existing article from founderAddress | addArticleItem() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add an item to a non-existent article | addArticleItem() |  accounts[0] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| amend and article item from non consensusX address | amendArticleItem() |  accounts[0] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| amend a non-amendable article item from consensusX address | amendArticleItem() |  accounts[1] | 3000000 | 10 Secs | Failure | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| amend an ammendable article item from consensusX address | amendArticleItem() |  accounts[1] | 3000000 | 10 Secs | Successful | Pass | [0x0](https://testnet.etherscan.io/tx/)|
| Retreive an article item | getArticleItem() |  accounts[3] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| add a founding team member from founderAddress | setfoundingTeam() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
| update a founding team members profile from founderAddress | updateProfile() |  accounts[0] | 3000000 | 10 Secs | Successful | Pass |  [0x0](https://testnet.etherscan.io/tx/)|
