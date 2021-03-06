# How-to

This is the long version chaincode lifecycle deployment and invocation document.

Navigate to the `test-network` folder:

```bash
$ cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network
```

Copy the chaincode folder `registry_chaincode` into the `chaincode` folder:

```bash
$ cp -r path-to-folder/registry_chaincode/ ../chaincode/
```

Kill any active or stale docker containers and remove previously generated artifacts:

```bash
$ ./network.sh down
```

Start the test network:

```bash
$ ./network.sh up createChannel -ca -s couchdb
```
Add `Org3`:

```bash
$ pushd addOrg3 && ./addOrg3.sh up -ca -s couchdb && popd
```

Setup `logspout` (optional):

```bash
$ cp ../commercial-paper/organization/digibank/configuration/cli/monitordocker.sh .
$ ./monitordocker.sh net_test
```

Export environment variables for `Org1MSP`:

```bash
$ export FABRIC_CFG_PATH=${PWD}/../config/
$ export CORE_PEER_TLS_ENABLED=true
$ export CORE_PEER_LOCALMSPID="Org1MSP"
$ export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
$ export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
$ export CORE_PEER_ADDRESS=localhost:7051
$ export PATH=${PWD}/../bin:$PATH
```

Open another terminal window and navigate to the `test-network` folder. Export the environmental variables for `Org2MSP`:

```bash
$ export FABRIC_CFG_PATH=${PWD}/../config/
$ export CORE_PEER_TLS_ENABLED=true
$ export CORE_PEER_LOCALMSPID="Org2MSP"
$ export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
$ export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
$ export CORE_PEER_ADDRESS=localhost:9051
$ export PATH=${PWD}/../bin:$PATH
```

Open a third terminal window, navigate to the `test-network` folder and export the environmental variables for `Org3MSP`:

```bash
$ export FABRIC_CFG_PATH=${PWD}/../config/
$ export CORE_PEER_TLS_ENABLED=true
$ export CORE_PEER_LOCALMSPID="Org3MSP"
$ export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
$ export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
$ export CORE_PEER_ADDRESS=localhost:11051
$ export PATH=${PWD}/../bin:$PATH

```

Check if you are now able to run the `peer` command:

```bash
$ peer version
```
***

### Package

Create chaincode package:

```bash
$ peer lifecycle chaincode package registrycc.tar.gz --path ../chaincode/registry_chaincode --lang node --label registrycc_1.0
```

***

### Install

Install the packaged chaincode by running the following command in all three terminal windows:

```bash
$ peer lifecycle chaincode install registrycc.tar.gz
```
***

### Approve

Query and save chaincode package identifier. Do this on all terminal windows:

```bash
$ x=`peer lifecycle chaincode queryinstalled | awk 'NR==2{print $3}'`
$ export PACKAGE_ID="${x%?}"
$ echo $PACKAGE_ID

```

We will be using the default endorsement policy, which requires a majority approval of 2 out of 2 organizations. So we will run the following command on all organizations to approve the chaincode definition:

```bash
$ peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name registrycc --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

Now we need to ensure if the number of submitted approvals is sufficient. We will use the `peer lifecycle chaincode commitreadiness`, which has the same flags as the command for approving a chaincode to our organization, though we do not need the `package-id` flag:

```bash
$ peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name registrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
```

```bash
{
        "approvals": {
                "Org1MSP": true,
                "Org2MSP": true,
                "Org3MSP": true,
        }
}
```

***

### Commit

If approvals are sufficient, we can now commit the chaincode on all organizations:

```bash
$ peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name registrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

Confirm successful commit:

```bash
$ peer lifecycle chaincode querycommitted --channelID mychannel --name registrycc --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

```bash
Committed chaincode definition for chaincode 'registrycc' on channel 'mychannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

***

### Invoke

Try to run the `uploadDocument` function:

```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"uploadDocument","Args":["doc-3", "Just Another School", "Yet Another Comp-Sci", "Good Guy"]}'
```


`initRegistry` adds 2 documents to the ledger. We can fetch them using `readDocument`, which implements `getState`.

```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"readDocument","Args":["certificate", "doc-1"]}'
```

Add another document:

```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"uploadDocument","Args":["doc-3","Just Another School", "Yet Another Comp-Sci", "Good Guy"]}'
```

Check if the document exists:

```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"readDocument","Args":["certificate", "doc-3"]}'
```

Delete the document we just added:


```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"deleteDocument","Args":["certificate", "doc-3"]}'
```

Read the history of the document:


```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n registrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"getHistory","Args":["certificate", "doc-3"]}'
```

***

## Private Data

Disseminating private data follows the same steps:
>1. Package
>2. Install
>3. Approve
>4. Commit
>5. Invoke

However, for the commit stage, we need to provide a private data collection to the flag `--collections-config`:

```bash
$ peer lifecycle chaincode commit -o localhost:7050 -C mychannel --name registrycc --version 1.0 --sequence 1 --collections-config myprivatecollection.json
```