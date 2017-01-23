pragma solidity ^0.4.8;

//Small utility that batch checks to determine if an address is an external account or a contract address
//This utility is useful for SuperDAO'S prommissory contract batch address input. 
//Only regular accounts can recieve ether and can be passed into the withdrawal process
//Only menbers of the internal team initial leadership can pass in batches to avoid spam
//
//
//
//


contract AddressChecker {

event ContractAddressesDetected(uint _batchId, uint _badAddresses, bool badBatch);

address[]Team;
uint[] batchNumber;
uint number = 0;

mapping(uint => address[]) public Batches;


        function AddressChecker(){
            Team.push(0x5B44efC8E385371F524E508475eBE741A3858FdC);
            Team.push(0xBe715F6BfbEF7E45583ec6c87d4664d04b5C88Fd);
            Team.push(0x28013bf56eafd00664afc2d9ba649930976227b2);
            Team.push(0xc205B5B867EC8b769836c5D356A058881e3ce056);
            Team.push(0x653851cf3B10E017B25d6bC78bEceEA6d2D3100c);
            Team.push(0x6fC7Ff5baB36b1784047419847edC3Cc9C788b81);
        }
        
        

        //submit a batch of addresses to check if they are contracts or external addresses
        function checkAddressBatch(address[] _AddressesToBeChecked) 
        external 
        NotTeam 
        returns (uint _batchNum, bool _goodOrBadBatch, uint _numberOfBad){
            
            uint badAddresses = 0;
            Batches[batchNumber[number]] = _AddressesToBeChecked;
                for (uint i = 0; i < _AddressesToBeChecked.length; i++) {
                    
                     
                    if (getSize(_AddressesToBeChecked[i]) > 0){
                        badAddresses += 1;
                    }
                }
                
                if(badAddresses > 0){
                     ContractAddressesDetected(number, badAddresses, true);
                     number += 1;
                     return (number,false, badAddresses);
                 }
                 
                 ContractAddressesDetected(number, badAddresses, false);
                 number += 1;
                 return (number,true, badAddresses);
        }

        //check some historical processed batch
        function specificBatchCheck(uint _batchNumber) external constant returns(address[]) {
        
            return Batches[batchNumber[_batchNumber]];
            
        }


        //retrieve address code size
        function getSize(address _addr) internal returns (uint size) {
                assembly {
                    // retrieve the size of the code, this needs assembly
                     size := extcodesize(_addr)
                     mstore(mload(0x40), size)
                    
                }
            }

    //return accidental ether
      function () {
            throw;
        }
    
    
    modifier NotTeam{

          // Team[msg.sender]
        _;
        }
    
}
