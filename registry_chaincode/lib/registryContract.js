'use strict';

const { Contract } = require('fabric-contract-api');

class RegistryContract extends Contract {

    async initRegistry(ctx) {
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
            let compositeKey = await this._createCompositeKey(ctx, documents[i].docType, documents[i].id);
            await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(documents[i])));
            console.info("Added --->", compositeKey);
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

        const compositeKey = await this._createCompositeKey(ctx, document.docType, document.id);

        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(document)));

        console.log("========== END: uploadDocument ==========");
    };

    async readDocument(ctx, objType="certificate", id) {
        console.log("========== START: readDocument ==========");
        const compositeKey = await this._createCompositeKey(ctx, objType, id);
        const result = await ctx.stub.getState(compositeKey);
        if (!result || result.length === 0) {
            throw new Error(`this document ${id} does not exist`)
        }

        return result.toString();

        console.info("========== END: readDocument ==========");
    };

    async deleteDocument(ctx, objType="certificate", id) {
        console.info("========== START: deleteDocument ==========");
        const compositeKey = await this._createCompositeKey(ctx, objType, id);
        await ctx.stub.deleteState(compositeKey);
        console.info("========== END: deleteDocument ==========");
    }

    // Read history of documents
    async getHistory(ctx, objType="certificate", id) {
        console.info("========== START: getHistory ==========");
        const compositeKey = this._createCompositeKey(ctx, objType, id);
        const iteratorPromise = ctx.stub.getHistoryForKey(compositeKey);

        let history = [];
        for await (const res of iteratorPromise) {
            history.push({
                txId: res.txId,
                value: res.value.toString(),
                isDelete: res.isDelete
            });
        }

        return JSON.stringify({
            id: id,
            values: history
        });
    }

    // Helpers
    _createCompositeKey(ctx, objType, id) {
        if (!id || id === "") {
            throw new Error('id should be a non-empty string')
        }

        if (objType === "") {
            return id;
        }

        return ctx.stub.createCompositeKey(objType, [id]);
    }

}

module.exports = RegistryContract;