# How to run the application

***

## Adding user credentials to the wallet

- Initialize `package.json`

```bash
npm init -y
```

- Add dependencies (if not added in previous step)

```javascript
"dependencies": {
    "fabric-network": ">2.2.0"
}
```

- Install

```bash
npm install
```

- Run `addToWallet.js`

```bash
node addToWallet.js
```

- Create an account on behalf of `User1` using `submitTransaction.js`

```bash
node submitTransaction.js 'User1@org1.example.com' initRegistry
```

- Check the document existence by listing all documents available to `User1`

```bash
node submitTransaction.js 'User1@org1.example.com' listDocuments
```

***

## Enrolling a user

- Update `package.json` 

```bash
"dependencies": {
    "fabric-ca-client": "^2.2.4",
}
```

- Install

```bash
npm install
```

- Enroll the `Org1`'s Fabric CA server administrator, using the bootstrapping credentials

```bash
node enrollUser.js 'CAAdmin@org1.example.com' admin adminpw
```

***

## Registering and enrolling a new user

- Register and enroll a new user with `CAAdmin@org1.example.com` as a registrar

```bash
node registerUser.js 'CAAdmin@example.com' 'User@org1.example.com' '{"secret": "userpw"}'

node enrollUser.js 'User@org1.example.com' 'User@org1.example.com' userpw
```