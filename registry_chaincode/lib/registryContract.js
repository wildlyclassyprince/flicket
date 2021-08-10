'use strict';

const { Contract } = require('fabric-contract-api');
const documentObjType = "Certificate";

class RegistryContract extends Contract {

    async uploadDocument(ctx, id, school, major, name) {
        let document = {
            id: id,
            school: school,
            major: major,
            name: name
        };

        if (this._documentExists(ctx, document.id)) {
            throw new Error(`this document ${document.id} already exists`)
        }

        await this._putDocument(ctx, document);
    };

    async readDocument(ctx, key) {
        const value = await ctx.stub.getState(key);

        if (!value || value.length === 0) {
            throw new Error(`The asset ${key} does not exist`);
        }

        return value.toString();
    };

    async deleteDocument(ctx, key) {
        await ctx.stub.deleteState(key);
    }

    // Helpers
    async _documentExists(ctx, id){
        const compositeKey = ctx.stub.createCompositeKey(documentObjType, [id]);
        const documentBytes = await ctx.stub.getState(compositeKey);

        return documentBytes && documentBytes.length > 0;
    }

    async _putDocument(ctx, document){
        const compositeKey = ctx.stub.createCompositeKey(documentObjType, [id]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(document)));
    }
    
    async _getDocument(ctx, id) {}
    async _delDocument(ctx, id) {}
    
}

module.exports = RegistryContract;