The SDN-Flow-Monitoring-Service (SDN-FMS) is an integration of Software-Defined Networking (SDN) and blockchain technology, with a primary goal of securely tracking and logging flow rules from a controller in a SDN environment to an ethereum blockchain network.


To Run this service, do the following:

1. Install nodejs
2. Clone this repo
3. Setup Ethereum blockchain network on kaleido
4. Deploy Smart contract and retrieve the following:
    smart contract address,
    Ethereum node's RPC_Url Address
5. On your terminal and navigate into the cloned repo using the command "cd sdn_blockchain"
6. Run the generate-wallet.js script to generate a dummy private key(This is for demo/test purposes only, not recommended in production). Store the generated key somewhere safe
7. Create a .env file and enter the following:
     KALEIDO_RPC_URL=<retrieved in step 4 above>
     PRIVATE_KEY=<generated in step 6 above>
     SMART_CONTRACT_ADDRESS=<retrieved in step 4 above>
8. Switch to root user, using "sudo su"
9. Run the start up bash script. "./sdn_start_up_script.sh"


