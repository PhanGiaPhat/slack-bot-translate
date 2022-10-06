const mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
    channel: {
        type: String,
        default: ''
    },
    language: {
        type: Array,
        default: ''
    }
});

const Record = mongoose.model('record', recordSchema, 'record');

module.exports = {
    Record: Record
}