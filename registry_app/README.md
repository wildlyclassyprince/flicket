# How to run the application

***

## Setup

First install `npm` packages:

```bash
npm install
```

***

## Adding user credentials to the wallet

Run `addToWallet.js` to add default credentials for `Org1` and `Org2`:

```bash
node addToWallet.js
```

Use the identity we just added `User1@org1.example.com` to initialize the registry:

```bash
node submitTransaction.js 'User1@org1.example.com' initRegistry
```

If everything went smoothly, you should be able to view `doc-1`:

```bash
node submitTransaction.js 'User1@org1.example.com' readDocument certificate doc-1
```

***

## Registering & enrolling a user

When we started the network, we also created a 3rd organization, `Org3`. We need to create the necessary credentials and enroll its users.

To do this, we need to create a bootstrap identity for the certificate authority:

```bash
node enrollUser.js 'CAAdmin@org1.example.com' admin adminpw
```

Using the bootstrap identity `CAAdmin@org1.example.com` as a registrar, we can register and enroll `User1@org3.example.com`:

```bash
node registerUser.js 'CAAdmin@example.com' 'User1@org3.example.com' '{"secret": "userpw"}'

node enrollUser.js 'User1@org3.example.com' 'User1@org3.example.com' userpw
```

***