# flicket
A mock implementation of an academic document registry using Hyperledger Fabric.

***

## How-to

Copy the chaincode folder `documentRegistryCC` into the `chaincode` folder:
```bash
$ cp -r documentRegistryCC/ $HOME/go/src/github.com/hyperledger/fabric-samples/chaincodes/
```

Navigate to the `test-network` folder:
```bash
$ cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network
```

Kill any active or stale docker containers and remove previously generated artifacts:
```bash
$ ./network.sh down
```

Start the test network:
```bash
$ ./network.sh up createChannel -ca -s couchdb
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

Check if you are now able to run the `peer` command:
```bash
$ peer version
```
***

### Package

Create chaincode package:

```bash
$ peer lifecycle chaincode package documentregistrycc.tar.gz --path ../chaincode/documentRegistryCC --lang node --label documentregistrycc_1.0
```

***

### Install

Install package on `Org1` and `Org2` by running the same command on **both** terminal windows:

```bash
$ peer lifecycle chaincode install documentregistrycc.tar.gz
```
***

### Approve

Query and save chaincode package identifier. Do this on both terminal windows:

```bash
$ x=`peer lifecycle chaincode queryinstalled | awk 'NR==2{print $3}'`
$ export PACKAGE_ID="${x%?}"

```

We will be using the default endorsement policy, which requires a majority approval of 2 out of 2 organizations. So we will run the following command on both organizations to approve the chaincode definition:
```bash
$ peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name documentregistrycc --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

Now we need to ensure if the number of submitted approvals is sufficient. We will use the `peer lifecycle chaincode commitreadiness`, which has the same flags as the command for approving a chaincode to our organization, though we do not need the `package-id` flag:
```bash
$ peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name documentregistrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
```

```bash
{
        "approvals": {
                "Org1MSP": true,
                "Org2MSP": true
        }
}
```

If approvals are sufficient, we can now commit the chaincode on both organizations:
```bash
$ peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name documentregistrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

Confirm successful commit:
```bash
$ peer lifecycle chaincode querycommitted --channelID mychannel --name documentregistrycc --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

```bash
Committed chaincode definition for chaincode 'documentregistrycc' on channel 'mychannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```
Try to run `init()` function:
```bash
$ peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n documentregistrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"init","Args":[]}'
```

***