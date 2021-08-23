'use strict';

const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const testNetworkRoot = path.resolve(require('os').homedir(), 'go/src/github.com/hyperledger/fabric-samples/test-network');

async function main() {
    try {
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        let args = process.argv.slice(2);

        const registrarLabel = args[0];

        let registrarIdentity = await wallet.get(registrarLabel);
        if (!registrarIdentity) {
            console.log(`An identity for the registrar user ${registrarLabel} does not exist in the wallet`);
            console.log('Run the enrollUser.js application before retrying');
            return;
        }

        // User registration
        // First create 'FabricCAServices' object to interact with the Fabric CA server:
        const orgName = registrarLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        let connectionProfile = JSON.parse(fs.readFileSync(path.join(testNetworkRoot, 'organizations/peerOrganizations', orgName, `/connection-${orgNameWithoutDomain}.json`), 'utf-8'));

        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);

        // Obtain registrar identity in the form or a 'User' object:
        const provider = wallet.getProviderRegistry().getProvider(registrarIdentity.type);
        const registrarUser = await provider.getUserContext(registrarIdentity, registrarLabel);

        // Parse command-line arguments to extract the enrollment ID and a JSON object containing optional fields if provided:
        const enrollmentID = args[1];

        let optional = {};
        if (args.length > 2) {
            optional = JSON.parse(args[2]);
        }

        let registrarRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: optional.secret || "",
            role: 'client',
        };

        const secret = await ca.register(registerRequest, registrarUser);
        console.log(`Successfully registered the user with the ${enrollmentID} enrollment ID and ${secret} enrollment secret`);

    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }

}

main().then(() => {
    console.log('User registration completed successfully');
}).catch((e) => {
    console.log('User registration exception');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});