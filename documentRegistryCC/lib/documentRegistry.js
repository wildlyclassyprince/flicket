'use strict';

const { Contract } = require('fabric-contract-api');
const docType = "Certificate";
const studentGrade = "Amateur";
const studentScore = "Passed";

class documentRegistry extends Contract {
    // Initialize
    async init(ctx, docID, docType, school, studentName, studentGrade, studentScore) {
        
        if (!ctx.clientIdentity.assertAttributeValue("init", "true")) {
            throw new Error(`you do not have permissions to initialize an account`)
        }

        const document = {
            id: docID,
            type: docType,
            school: this._getTxCreatorUID(),
            name: studentName,
            grade: studentGrade,
            score: studentScore,
        }

        // Check if document exists
        if (await this._docExists(ctx, document.id)) {
            throw new Error(`document ${document.id} already exists`)
        }

    };
    // Add document to registry
    async uploadDoc(ctx, docID, docType, school, studentName, studentGrade, studentScore){    
    };
    async getDoc(){}
    async delDoc(){}

    // Helpers
    async _docExists(ctx, docID){
        const compositeKey = ctx.stub.createCompositeKey(docType, [id]);
        const docBytes = await ctx.stub.getState(compositeKey);
        return docBytes && docBytes.length > 0;
    };

    async _putDoc(){}
    async _getDoc(){}
    async _getTxCreatorUID(){}
}

exports.module = documentRegistry;