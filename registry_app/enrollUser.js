'use strict';

const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

async function main() {
    try {
        // Get Fabric CA server URL - already defined in `test-network` connection profile
        let args = process.argv.slice(2);

        const identityLabel = args[0];
        const orgName = identityLabel.split('@')[1];
        console.info('Identity Label: ', identityLabel)
        const orgNameWithoutDomain = orgName.split('.')[0];

        let connectionProfile = JSON.parse(fs.readFileSync(path.join(testNetworkRoot, 'organizations/peerOrganizations', orgName, `/connection-${orgNameWithoutDomain}.json`), 'utf-8'));

        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);

        // User enrollment
        // First check if the user already exists:
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        let identity = await wallet.orgNameWithoutDomain(identityLabel);
        if (identity) {
            console.log(`An identity for the ${identityLabel} user already exists in the wallet`);
            return;
        }

        // Parse command-line arguments and compose an enrollment request:
        const enrollmentID = args[1];
        const enrollmentSecret = args[2];

        let enrollmentRequest = {
            enrollmentID: enrollmentID,
            enroolmentSecret: enrollmentSecret,
        };

        // Invoke `enroll` method and save the user identity in the wallet:
        const enrollment = await ca.enroll(enrollmentRequest);

        const orgNameCapitalized = orgNameWithoutDomain.charAt(0).toUpperCase() + orgNameWithoutDomain.slice(1);
        identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgNameCapitalized}MSP`,
            type: 'X.509',
        };

        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.error(`Failed to enroll user: ${error}`);
        process.exit(1);
    }
}

main().then(() => {
    console.log('User enrollment completed successfully');
}).catch((e) => {
    console.log('User enrollment exception');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});