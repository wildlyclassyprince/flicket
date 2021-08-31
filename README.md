# flicket

A mock implementation of a Hyperledger Fabric blockchain app for authenticating academic documents.

***


### Short Version

The workflow above is bound to have you *pulling your hair* with typos and errors. To simplify things, use the following:

Tear down artifacts & start the network:

```bash
./network.sh down && ./network.sh up createChannel -ca -s couchdb
```

Deploy the chaincode:

```bash
$ ./network.sh deployCC -ccn registryCC -ccp path-to-file/registry_chaincode -ccl javascript -ccv 1.0 -cci initRegistry
```

It accomplishes the same goals as the longer workflow.

Note, however, with this script you cannot define the `--label` flag because it is not available in version `2.x`. But, providing the `label` in the format `<chaincode-name>_<version-number>`is a standard requirement as of version `2.2`.

***

### Invoke the chaincode using the client application

While in the `test-network` folder, copy the client application and navigate to the folder:

```bash
cp -r path-to-client-app/registry_app ../applications/
pushd ~/go/src/github.com/hyperledger/fabric-samples/applications/registry_app
```

Add identities to the wallet:
```bash
node addToWallet.js
```

Invoke the chaincode using `User1@org1.example.com` by running `submitTransaction.js`:

```bash
node submitTransaction.js 'User1@org1.example.com' initRegistry
node submitTransaction.js 'User1@org1.example.com' uploadDocument 'doc-3' 'Just Another School' 'Yet Another Comp-Sci Student' 'Good Guy'
node submitTransaction.js 'User1@org1.example.com' deleteDocument 'certificate' 'doc-3'
node submitTransaction.js 'User1@org1.example.com' getHistory 'certificate' 'doc-3'
```

***