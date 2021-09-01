# flicket

A mock implementation of a Hyperledger Fabric blockchain app for authenticating academic documents.

***


### Short Version

The workflow in `HOW-TO.md` is bound to have you *pulling your hair* with typos and errors in the first attempts. To simplify things, use the following:

Tear down artifacts & start the network:

```bash
$ ./network.sh down && ./network.sh up createChannel -ca -s couchdb
```

Add a 3rd organization:

```bash
$ pushd addOrg3/
$ ./addOrg3.sh up -ca -s couchdb
$ popd
```


***

### Deployment

Deploy the chaincode:

```bash
$ ./network.sh deployCC -ccn registryCC -ccp path-to-file/registry_chaincode -ccl javascript -ccv 1.0 -cci initRegistry
```

It accomplishes the same goals as the longer workflow in the `HOW-TO.md` file.

**Note:** Providing the `label` in the format `<chaincode-name>_<version-number>`is a standard requirement as of version `2.2`. With the longer commands in `HOW-TO.md`, you need to create the define the label explicity with the flag `--label`. Using the commmand `deployCC` creates the label implicitly.

***

### Invoke the chaincode using the client application

While in the `test-network` folder, copy the client application and navigate to the folder:

```bash
$ cp -r path-to-client-app/registry_app ../applications/
$ pushd ~/go/src/github.com/hyperledger/fabric-samples/applications/registry_app
```

Create a bootstrap identity. We will use it to register and enroll other users.

```bash
$ node enrollUser.js 'CAAdmin@org1.example.com' admin adminpw
```

We can now register and enroll a new user for `Org3` with `CAAdmin@org1.example.com` as a registrar:

```bash
$ node registerUser.js 'CAAdmin@org1.example.com' 'User@org3.example.com' '{"secret": "userpw"}'
$ node enrollUser.js 'User@org3.example.com' 'User@org3.example.com' userpw
```

Now we can add identities for `Org1` & `Org2` to the wallet:
```bash
$ node addToWallet.js
```

We'll first read documents of type `certificate` that were inserted by `initRegistry`. We do this by invoking the chaincode using the identity `User1@org1.example.com` to run `submitTransaction.js` with function parameters:

```bash
$ node submitTransaction.js 'User1@org1.example.com' getDocumentsByType 'certificate'
```

Then, we'll upload a document, delete it and fetch it's history:

```bash
$ node submitTransaction.js 'User1@org1.example.com' uploadDocument 'doc-3' 'Just Another School' 'Yet Another Comp-Sci Student' 'Good Guy'
$ node submitTransaction.js 'User1@org1.example.com' deleteDocument 'certificate' 'doc-3'
$ node submitTransaction.js 'User1@org1.example.com' getHistory 'certificate' 'doc-3'
```

***