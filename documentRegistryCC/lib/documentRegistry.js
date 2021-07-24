'use strict';

const { Contract } = require('fabric-contract-api');

class documentRegistryContract extends Contract {
    // Initialize
    async init(ctx) {
        
        if (!ctx.clientIdentity.assertAttributeValue("init", "true")) {
            throw new Error(`you do not have permissions to initialize an account`)
        }

        // Initialize with mock entry
        const mockDoc = {
            id: "mock-document",
            type: "bachelors",
            school: "Cornell",
            name: "Andy",
            grade: "Merit",
        }

        // Check if document exists
        if (await this._docExists(ctx, mockDoc.id)) {
            throw new Error(`document ${mockDoc.id} already exists`)
        }

        // Add document
        await this._putDoc(ctx, mockDoc);
        console.log(`Successfully entered ${mockDoc.id}`)

    };
    // Add document to registry
    async uploadDoc(ctx, docID, docType, school, studentName, studentGrade, studentScore){
        const document = {
            id: docID,
            type: docType,
            school: school,
            name: studentName,
            grade: studentGrade,
            score: studentScore,
        }
    };
    async getDoc(){}
    async delDoc(){}

    // Helpers
    async _docExists(ctx, id){
        const compositeKey = ctx.stub.createCompositeKey(docType, [id]);
        const docBytes = await ctx.stub.getState(compositeKey);
        return docBytes && docBytes.length > 0;
    };

    async _putDoc(ctx, document){
        const compositeKey = ctx.stub.createCompositeKey(docType, [document.id]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(document)));
    };

    async _getDoc(){}
    async _getTxCreatorUID(){}
}

module.exports = documentRegistryContract;