-------------------------------------
| Test   | Function |     Sender Address    | Test Time (ms) | Status | Txn Hash |
|-----|:-------:|:-------:| ------:|------:| :------ |
|accounts[0] should fail to change the cofounder to accounts[2] | cofounderSwitchAddress | 0x44d853ad08ce9fb0c8145f33c20676dc19bfacf8 | 1 | failed | |
|accounts[1] should change the cofounder to accounts[2] | cofounderSwitchAddress | 0xd2cb526350164f4869bcbc66ffce7380e8dfd16f | 1 | failed | |
|accounts[3] should request founder change with wrong founderHash and fail | founderSwitchRequest | 0x4a2a34dcf37bb7e0b46f4e089fe66595868d32ff | 1 | failed | |
|accounts[3] should request founder change | founderSwitchRequest | 0x4a2a34dcf37bb7e0b46f4e089fe66595868d32ff | 1 | failed | |
|accounts[3] should fail to approve founder change request | cofounderApproveSwitchRequest | 0x4a2a34dcf37bb7e0b46f4e089fe66595868d32ff | 1 | failed | |
|accounts[2] should fail to approve founder change request with wrong switchHash | cofounderApproveSwitchRequest | 0xd4d58c488883352f2760237aa2ef99cf5351653c |  | failed | |
|accounts[2] should approve founder change request | cofounderApproveSwitchRequest | 0xd4d58c488883352f2760237aa2ef99cf5351653c |  | failed | |
