'use strict';

const { Wallets, Gateway } = require('fabric-network');
const _ = require('lodash');

async function main() {
    const gateway = new Gateway();
    const wallet = await Wallets.newFileSystemWallet('./wallet');
}