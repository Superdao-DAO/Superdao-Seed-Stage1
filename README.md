### Superdao Stage1

> First stage in the evolution of Superdao     
---

These contracts represent the foundational building blocks of the modular superdao framework. The foundation consist of the constitutional guiding principles on which the DAO(Superdao) framework is built. Also available is the private promissory contract that enables progressive development of the DAO frame work and services. At deployment of the next stage of SuperDAO, both contracts will be injected as building blocks to enable token redemption, progressive decentralization and a baseline immutable social contract that ecapsulates the essense of how SuperDAO evolves and operates.



### Table of Contents

* [Description & Usage](#DescriptionUsage)
* [Tests](#Tests)
* [OnchainResults](#OnchainResults)
* [Gas Costs](#GasCosts)
* [Contributors](#Contributors)



#<a name="DescriptionUsage"></a>
### Description & Usage    

**ConstitutionalDNA** :   

The constitustionalDNA is a contract that helps to define The mission, vision goals, anti-mission actions and operating ruleset of SuperDAO generally. It exposes each definition publicly so that they can be referenced, enforced and used within the operation of the DAO when needed.

- `setHome :` Set the component into which this contract is injected (consensusX).
- `addArticle :` Adds a new article number to the definition.
- `addArticleItem :` Adds and article item under an artcle specification.
- `amendArticleItem :` Modifies Amendable article items in the list.
- `setFoundingTeam :` Sets the founding team names and addresses.
- `initializedRatify :` Enables each member to agree to the set up rules in the document
- `updateProfile :` enables team member profile updates.      



**Promissory** :

The contract is backed by the constitustionalDNA of SuperDAO. The constitustionalDNA of the superdao is the social contract, terms, founding principles and definitions of the vision,mission, anti-missions, rules and operation guidelines of superDAO. The total number of 3,000,000 represents 3% of 100,000,000 immutable number of superDAO tokens, which is the alloted budget of operation for the earliest development activities. Every prommissory token does not constitute an investment and exchangeable for the real SuperDAO tokens on a one on one basis. Promissiory contract will be deployed during the second stage with the actual superdao token contract.Early backers can call the "redeem" function on the actual token contract, which would look in the promissory token to exchange promissory tokens for the final tokens automatically.

- `cofounderSwitchAddress :` Enables another cofounder to switch his multifactor address.
- `founderSwitchRequest :` Enables request by original founder to swtich to a new address.
- `cofounderApproveSwitchRequest :` Enables cofounder to approve founder address switch.
- `setPrepaid :` Set batches of offline prepaid tokens by founder.
- `claimPrepaid :` Enables backer claim and approval of offline prepaid tokens.
- `claim :` Freely participating action of backers during the current round.
- `withdraw :` Action requesting pre-scheduled spending.
- `approveWithdraw :` Approval of withdrawal request by a majority of backers.
- `redeem :` Called automatically by main token contract to enable 1 to 1 token redemption.






#<a name="Tests"></a>
### Tests



Files :   
https://github.com/Superdao-DAO/Superdao-Seed-Stage1/tree/master/test   

Detailed description :    
https://github.com/Superdao-DAO/Superdao-Seed-Stage1/blob/master/TESTS.md


#<a name="OnchainResults"></a>
### Onchain & Results      

Files & Descriptions :   
https://github.com/Superdao-DAO/Superdao-Seed-Stage1/tree/master/test/reports   


#<a name="GasCosts"></a>
### Gas costs    

Approximate gas costs which is subject to change.



 **Promissory** :   
 
- `constructor :` ~2317447 (0.2317447 / $2.75)
- `cofounderSwitchAddress :` ~29555 (0.0029555 Ether ($0.04)
- `founderSwitchRequest :` ~43737 (0.0043737 Ether / $0.05)
- `cofounderApproveSwitchRequest :` ~70329 (0.0070329 Ether / $0.08)
- `setPrepaid :` ~274932 (0.0274932 Ether / $0.33)
- `claimPrepaid :` ~38741 (0.0038741 Ether / $0.05)
- `claim :` ~120405 (0.0120405 Ether / $0.14)
- `withdraw :` ~203524 (0.0203524 Ether / $0.24)
- `approveWithdraw :` ~100000 (0.01 Ether / $0.12)
- `redeem :` ~47248 (0.0047248 Ether / $0.06)   
	

	
 **ConstitutionalDNA** :   
 
- `constructor :` ~1416069 (0.1416069 Ether /$1.68)   
- `setHome :` ~44570(0.004457 Ether / $0.05)   
- `addArticle :` ~100000 (0.01 Ether / $0.12)   
- `addArticleItem :` ~100000 (0.01 Ether / $0.12)   
- `amendArticleItem :` ~100000 (0.01 Ether / $0.12)   
- `setFoundingTeam :` ~164287 (0.0164287 Ether / $0.20)   
- `updateProfile :` ~67610 (0.006761 Ether / $0.08)   

Sample result Files :   

- https://github.com/Superdao-DAO/Superdao-Seed-Stage1/blob/master/test/reports/Test2.PromissoryToken.2016-10-2-1475361612179.md  
- https://github.com/Superdao-DAO/Superdao-Seed-Stage1/blob/master/test/reports/Test1.PromissoryToken2016-10-1-1475336744207.md   
- https://github.com/Superdao-DAO/Superdao-Seed-Stage1/blob/master/test/reports/Test3.ConstitutionalDNA.2016-10-1-1475340806774.md



#<a name="Contributors"></a>
### Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

[Ola](https://github.com/innovator256)   
[Patrick](https://github.com/patrickgamer)    
[Panos](https://github.com/ppanos)   
[Zlatinov](https://github.com/zlatinov)   
[Archil](https://github.com/achiko)   
[Adibas](https://github.com/adibas03)   
[Yemi](https://github.com/CoderWithAttitude)    
[rkmylo](https://github.com/rkmylo)   
[Esco](https://github.com/esco)   
[Vitaly](https://github.com/vitaliy-kuzmich)       