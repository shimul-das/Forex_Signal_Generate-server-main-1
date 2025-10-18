// // models/Signal.js

// const mongoose = require('mongoose');

// const signalSchema = new mongoose.Schema({
//     symbol: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     direction: {
//         type: String,
//         required: true,
//         enum: ['CALL', 'PUT'], // Or ['BUY', 'SELL']
//     },
//     timeframe: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         required: true,
//         enum: ['pending', 'win', 'loss'],
//         default: 'pending',
//     },
//     entryTime: {
//         type: Date,
//         default: Date.now,
//     }
// }, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// const Signal = mongoose.model('Signal', signalSchema);

// module.exports = Signal;

const mongoose = require('mongoose');

// This schema defines the structure of each signal document stored in MongoDB.
// It includes a 'source' to differentiate between direct and AI-validated signals.
const signalSchema = new mongoose.Schema({
    // The currency pair or asset, e.g., "EURUSD"
    symbol: {
        type: String,
        required: [true, 'Symbol is a required field.'],
        trim: true,
        uppercase: true,
    },
    // The trade direction predicted by the indicator
    direction: {
        type: String,
        required: [true, 'Direction is a required field.'],
        enum: ['CALL', 'PUT'], // Only allows these two values
    },
    // This field identifies the origin of the signal, allowing you to compare models.
    source: {
        type: String,
        required: [true, 'Signal source is required.'],
        enum: ['AI_VALIDATED', 'DIRECT_MQL4'],
    },
    // The RSI value at the time of the signal
    rsi: {
        type: Number,
        required: true,
    },
    // The CCI value at the time of the signal
    cci: {
        type: Number,
        required: true,
    },
    // The ADX value at the time of the signal
    adx: {
        type: Number,
        required: true,
    },
    // The candle body size
    body: {
        type: Number,
        required: true,
    },
    // The final decision from the Python AI model (only present for AI_VALIDATED source)
    isValidated: {
        type: Boolean,
        // This field is optional because direct MQL4 signals will not have it.
    },
    // The timestamp when the signal was processed and saved
    timestamp: {
        type: Date,
        default: Date.now, // Automatically sets the current date and time
    },
});

// The collection in MongoDB will be named "signals" (pluralized from "Signal")
const Signal = mongoose.model('Signal', signalSchema);

module.exports = Signal;

