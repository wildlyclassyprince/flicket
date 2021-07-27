'use strict';

const { Contract } = require('fabric-contract-api');

class documentRegistryContract extends Contract {
    async uploadDoc(){};
    async deleteDoc(){};
    async readDoc(){};
};

module.exports = documentRegistryContract;