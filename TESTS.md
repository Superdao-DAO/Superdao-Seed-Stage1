## Test 1 - PromissoryToken 

1. **Founder switch**

	* Try to switch the cofounder from a different address than the cofounder's.
	* Switch cofounder.
	* Try to make a founder switch request with wrong founderHash.
	* Add founder switch request.
	* Try to approve founder switch from a different address than the cofounder's.
	* Try to approve founder switch with wrong switchHash.
	* Cofounder approves founder switch.

## Test 2 - PromissoryToken

1. **Backers**

	* Create PromissoryToken with 2 early backers.
	* Try to set an early backer from a different address than the founder's.
	* Set first early backer (200000 tokens) and confirm the data.
	* Set second early backer with 2 batches of tokens (100000 each) and confirm the data.
	* Claim all prepaid tokens.
	* Use claim() from address1 (600000 tokens) and confirm the data.
	* Use claim() 2 times from address2 (500000 tokens each) and confirm the data.
	* Use claim() from address1 with 4000000 tokens to test the promissoryUnits limit.

2. **Withdrawal**

	* Use approveWithdraw() with withdrawalId 0 to check the modifier.
	* Create valid withdrawal request.
	* Vote on withdrawal request from first backer address.
	* Try voting again from the first backer address.
	* Vote on withdrawal request from second backer address to trigger the approval.
	* Create withdrawal request with larger amount than available balance.
	* Vote on the invalid withdrawal request from second backer address to try to trigger the approval and fail

3. **Redeem**

	* Redeem tokens from first backer address   
	

## Test 3 - ConstitutionalDNA

* Set Founder Address    
* add article from founder address    
* add article item from founder address
* Try to add article from address other than Founder
* Try to add article item from address other than founder
* Try and add article item for invalid article num
* Try and amend an from non consensusX
* Try and amend a non amendable article item
* Get an article item
* set founding team via founder address
* set founding team from address other than founder
* update profile
* setHome from founder address
* set Home from address other that founder