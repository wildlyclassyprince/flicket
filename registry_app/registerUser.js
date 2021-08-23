'use strict';

const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const testNetworkRoot = path.resolve(require('os').homedir(), 'go/src/github.com/hyperledger/fabric-samples/test-network');

async function main() {

}

main().then(() => {
    console.log('User registration completed successfully');
}).catch((e) => {
    console.log('User registration exception');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});