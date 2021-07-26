# flicket
A mock implementation of an academic document registry using Hyperledger Fabric.

***

## How-to

Copy the chaincode folder `documentRegistryCC` into the `chaincode` folder:
```bash
cp -r documentRegistryCC/ $HOME/go/src/github.com/hyperledger/fabric-samples/chaincodes/
```

Navigate to the `test-network` folder:
```bash
cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network
```

Start the network:
```bash
./network.sh createChannel -ca -s couchdb
```

Export environment variables for `Org1MSP`:
```bash
export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export PATH=${PWD}/../bin:$PATH
```

Open another terminal window and export the environmental variables for `Org2MSP`:
```bash
export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
export PATH=${PWD}/../bin:$PATH
```

Create chaincode package:
```bash
peer lifecycle chaincode package documentregistrycc.tar.gz --path ../chaincode/documentRegistryCC --lang node --label documentregistrycc_1.0
```

Install package on `Org1` and `Org2` by running the same command on **both** terminal windows:
```bash
peer lifecycle chaincode install documentregistrycc.tar.gz
```

Query and save chaincode package identifier. Do this on both terminal windows:
```bash
export PACKAGE_ID=`peer lifecycle chaincode queryinstalled | awk 'NR==2{print $3}'`
```

Approve chaincode definition on both organizations:
```bash
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name documentregistrycc --version 1.0 --package-id $PACKAGE_ID --sequence 1 --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

Ensure number of submitted approvals is sufficient:
```bash
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name documentregistrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
```

If approvals are sufficient, we can now commit the chaincode on both organizations:
```bash
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name documentregistrycc --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

Confirm successful commit:
```bash
peer lifecycle chaincode querycommitted --channelID mychannel --name documentregistrycc --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
Try to run `init()` function:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n documentregistrycc --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"init","Args":[]}'
```

***