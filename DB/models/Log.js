const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EthereumLogs = new Schema({
    contract: {
        required: true,
        type: String
    },
    topic: {
        required: true,
        type: String,
        unique: true
    },
    name: {
        required: true,
        type: String
    },
    inputs: {
        required: true,
        type: Object
    },
    indexedInputs: {
        required: true,
        type: Object
    }
});

module.exports = mongoose.model('EthereumLogs', EthereumLogs );
