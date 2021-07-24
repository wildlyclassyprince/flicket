
# Strip down stale network
./network.sh down

# Start the network
./network.sh createChannel -ca -s couchdb

# Create chaincode package
peer lifecycle chaincode package documentregistrycc.tar.gz --path ~/Documents/github.com/flicket/documentRegistryCC --lang node --label documentregistrycc_1.0
