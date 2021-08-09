'use strict';

const { Contract } = require('fabric-contract-api');

class RegistryContract extends Contract {

    async uploadDocument(ctx, key, value) {
        await ctx.stub.putState(key, Buffer.from(value));
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
}

module.exports = RegistryContract;