'use strict';

const { Contract } = require('fabric-contract-api');
const docObjType = "Certificate";

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

        // Composite key
        const compositeKey = ctx.stub.createCompositeKey(docObjType, [mockDoc.id]);

        // Check if document exists
        if (await this._docExists(compositeKey)) {
            throw new Error(`document ${mockDoc.id} already exists`)
        }

        // Add document
        await this._putDoc(ctx, mockDoc);
        console.log(`Successfully entered ${mockDoc.id}`)

    };
    // Add document to registry
    async uploadDoc(ctx, docID, docType, school, studentName, studentGrade){
        const document = {
            id: docID,
            type: docType,
            school: school,
            name: studentName,
            grade: studentGrade,
        }

        // Composite key
        if (await this._docExists(ctx, document.id)) {
            throw new Error(`document ${document.id} already exists`)
        }

        // Upload
        await ctx.stub._putDoc(document)

    };

    async readDoc(ctx, docID) {
        const checkDoc = await ctx.stub._docExists(docID);
        if (!checkDoc || checkDoc.length ===0) {
            throw new Error(`document ${docID} does not exist`)
        }

        const document = await ctx.stub._getDoc(docID);

        return document;
    };

    async removeDoc(ctx, docID){
        await ctx.stub._delDoc(docID)
    };

    // Helpers
    async _docExists(ctx, id){
        const compositeKey = ctx.stub.createCompositeKey(docObjType, [id])
        const docBytes = await ctx.stub.getState(compositeKey);
        return docBytes && docBytes.length > 0;
    };

    async _putDoc(ctx, document){
        const compositeKey = ctx.stub.createCompositeKey(docObjType, [document.id]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(document)));
    };

    async _getDoc(ctx, id){
        const compositeKey = ctx.stub.createCompositeKey(docObjType, [id]);
        const docBytes = await ctx.stub.getState(compositeKey);
        if (!docBytes || docBytes.length === 0) {
            throw new Error(`document ${id} does not exist`)
        }
        return JSON.parse(docBytes.toString());
    };

    async _delDoc(ctx, id){
        const compositeKey = ctx.sub.createCompositeKey(docObjType, [id]);
        await ctx.stub.deleteState(compositeKey);
    };
}

module.exports = documentRegistryContract;