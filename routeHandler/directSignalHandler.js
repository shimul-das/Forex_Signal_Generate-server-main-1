const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal'); // Import the Mongoose model for signals

// This endpoint is for MQL4 indicators to log signals directly without AI validation.
router.get('/', async (req, res) => {
    // 1. Destructure and validate incoming query parameters
    const { symbol, rsi, cci, adx, body, direction } = req.query;
    if (!symbol || !rsi || !cci || !adx || !body || !direction) {
        console.error('Direct Log Aborted: Missing required query parameters.');
        return res.status(400).send({ success: false, message: 'Missing parameters.' });
    }

    // 2. Asynchronously save the signal with the "DIRECT_MQL4" source
    try {
        const newSignal = new Signal({
            symbol,
            direction: direction.toUpperCase(),
            source: 'DIRECT_MQL4', // Explicitly set the source
            rsi: parseFloat(rsi),
            cci: parseFloat(cci),
            adx: parseFloat(adx),
            body: parseFloat(body),
            // 'isValidated' field is intentionally omitted
        });
        await newSignal.save();
        console.log(`💾 Direct signal for ${symbol} (${direction}) successfully logged.`);
        
        // 3. Send a success response back to the MQL4 indicator
        res.status(200).send({ success: true, message: 'Signal logged.' });

    } catch (dbError) {
        console.error("❌ Database Error: Failed to save direct signal:", dbError.message);
        res.status(500).send({ success: false, message: 'Database error.' });
    }
});

module.exports = router;

