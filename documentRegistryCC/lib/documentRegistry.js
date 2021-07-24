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

    };
    // Add document to registry
    async addDoc(ctx, docID, docType, school, studentName, studentGrade, studentScore){    
    };
    async getDoc(){}
    async removeDoc(){}

    // Helpers
    async _getTxCreatorUID(){}
}

exports.module = documentRegistry;