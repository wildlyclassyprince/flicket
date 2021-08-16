# How to run the application

- Initialize `package.json`

```bash
npm init -y
```

- Add dependencies

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