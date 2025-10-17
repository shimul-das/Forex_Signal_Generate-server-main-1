const mongoose = require('mongoose');

const forexDataSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        index: true // Index for faster queries by symbol
    },
    price: {
        type: Number,
        required: true
    },
    lastRefreshed: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const ForexData = mongoose.model('ForexData', forexDataSchema);

module.exports = ForexData;