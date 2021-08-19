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
        console.info("========== START: uploadDocument ==========");
        const document = {
            id: id,
            docType: "certificate",
            school: school,
            major: major,
            name: name
        };

        const compositeKey = await this._createCompositeKey(ctx, document.docType, document.id);

        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(document)));

        console.info("========== END: uploadDocument ==========");
    };

    async readDocument(ctx, objType, id) {
        console.info("========== START: readDocument ==========");
        const compositeKey = await this._createCompositeKey(ctx, objType, id);
        const result = await ctx.stub.getState(compositeKey);
        if (!result || result.length === 0) {
            throw new Error(`this document ${id} does not exist`)
        }

        return result.toString();

    };

    async readDocumentsByType(ctx, objType) {
        console.info("========== START: readDocumentByType ==========");
        const iteratorPromise = ctx.stub.getStateByPartialCompositeKey(objType, []);
        
        let documents = [];

        for await (const result of iteratorPromise) {
            const splitKey = ctx.stub.splitCompositeKey(result.key);
            documents.push({
                objType: splitKey.objectType,
                key: splitKey.attributes[0],
                value: result.value.toString()
            });
        }

        return JSON.stringify(documents);
    }

    async deleteDocument(ctx, objType, id) {
        console.info("========== START: deleteDocument ==========");
        const compositeKey = await this._createCompositeKey(ctx, objType, id);
        await ctx.stub.deleteState(compositeKey);
        console.info("========== END: deleteDocument ==========");
    }

    // Read history of documents
    async getHistory(ctx, objType, id) {
        console.info("========== START: getHistory ==========");
        const compositeKey = this._createCompositeKey(ctx, objType, id);
        const iteratorPromise = ctx.stub.getHistoryForKey(compositeKey);

        let history = [];

        for await(const result of iteratorPromise) {
            history.push({
                txId: result.txId,
                value: result.value.toString(),
                isDelete: result.isDelete
            });
        }

        return JSON.stringify({
            objType: objType,
            docId: id,
            values: history
        });
    }

    // Get all documents
    async readAllDocuments(ctx) {
        const startKey = '';
        const endKey = '';
        const iteratorPromise = ctx.stub.getStateByRange(startKey, endKey);

        let allResults = [];

        for await (const result of iteratorPromise) {
            allResults.push({
                key: result.key,
                value: result.value.toString('utf-8')
            })
        }

        console.info(allResults);
        return JSON.stringify(allResults); // returns empty array
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