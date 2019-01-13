const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Log = require('./Log');
const web3 = require('web3');

const Contract = new Schema({
    name: {
        required: true,
        type: String
    },
    version: {
        required: true,
        type: Number
    },
    byteCode: {
        required: true,
        type: String
    },
    abi: {
        required: true,
        type: Object
    }
});

Contract.index({ name: 1, version: 1 }, { unique: true });

Contract.post('save', async function (contract) {
    for (let i = 0; i < contract.abi.length; i++) {
        const data = contract.abi[i];
        let functionConstruct = '';
        const inputs = [];
        const indexedInputs = [];
        if (data.type === 'event') {
            functionConstruct = data.name;
            let params = '';
            for (let j = 0; j < data.inputs.length; j++) {
                const input = data.inputs[j];
                if (params.length > 0) {
                    params += ',';
                }
                params += input.type;
                if (input.indexed) {
                    indexedInputs.push(input);
                } else {
                    inputs.push(input);
                }
            }
            functionConstruct += ('(' + params + ')');
            functionConstruct = web3.utils.soliditySha3(functionConstruct);
            await Log.create({
                contract: contract.name,
                topic: functionConstruct,
                name: data.name,
                inputs: inputs,
                indexedInputs: indexedInputs
            });
        }
    }
});

module.exports = mongoose.model('Contract', Contract);
