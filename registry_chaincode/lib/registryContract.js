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

    async readDocument(ctx, id) {
        if (this._documentExists(ctx, document.id)) {
            throw new Error(`this document ${document.id} does not exist`)
        }

        const document = await this._getDocument(ctx, id);

        return document;
    };

    async deleteDocument(ctx, id) {
        const compositeKey = ctx.stub.createCompositeKey(documentObjType, [id]);
        await this._delDocument(ctx, compositeKey);
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
    
    async _getDocument(ctx, id) {
        const compositeKey = ctx.stub.createCompositeKey(documentObjType, [id]);
        const documentBytes = await ctx.stub.getState(compositeKey);

        if (!documentBytes || documentBytes.length === 0) {
            throw new Error(`this document ${id} does not exist`)
        }

        return JSON.parse(documentBytes.toString());
    }

    async _delDocument(ctx, id) {
        const compositeKey = ctx.stub.createCompositeKey(documentObjType, [id]);
        await ctx.stub.deleteState(compositeKey);
    }
    
}

module.exports = RegistryContract;