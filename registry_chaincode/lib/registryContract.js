'use strict';

const { Contract } = require('fabric-contract-api');

class RegistryContract extends Contract {

    async initDocument(ctx) {
        console.info("========== START: Initialize Ledger ==========");
        const documents = [
            {
                id: "doc-1",
                school: "Cranshaw College",
                major: "Note Sticking",
                name: "Grothendieck"
            },
            {
                id: "doc-2",
                school: "Salisbury College",
                major: "Bean Counting",
                name: "Erdos"
            }
        ];

        for (let i=0; i < documents.length; i++) {
            documents[i].docType = "certificate";
            await this._putDocument(ctx, documents[i]);
            console.info("Added --->", documents[i].id);
        }

        console.info("========== END: Initialize Ledger ==========")
    };

    async uploadDocument(ctx, id, school, major, name) {
        console.log("========== START: uploadDocument ==========");
        const document = {
            id: id,
            docType: "certificate",
            school: school,
            major: major,
            name: name
        };

        const compositeKey = ctx.stub.createCompositeKey(document.docType, [id]);


        console.log("========== END: uploadDocument ==========");
    };

    async readDocument(ctx, id) {
        console.log("========== START: readDocument ==========");
        // code goes here ...
        console.info("========== END: readDocument ==========");
    };

    async deleteDocument(ctx, id) {
        console.info("========== START: deleteDocument ==========");
        // code goes here ...
        console.info("========== END: deleteDocument ==========");
    }

    // Helpers
    
}

module.exports = RegistryContract;