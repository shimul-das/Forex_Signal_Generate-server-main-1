// models/Signal.js

const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        trim: true,
    },
    direction: {
        type: String,
        required: true,
        enum: ['CALL', 'PUT'], // Or ['BUY', 'SELL']
    },
    timeframe: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'win', 'loss'],
        default: 'pending',
    },
    entryTime: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Signal = mongoose.model('Signal', signalSchema);

module.exports = Signal;