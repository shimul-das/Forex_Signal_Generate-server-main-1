const express = require('express');
const fetch = require('node-fetch'); // For making HTTP requests to the Python service
const router = express.Router();
const Signal = require('../models/Signal'); // Import the Mongoose model for signals

// This route is the endpoint for the MQL4 indicator
router.get('/', async (req, res) => {
    // 1. Destructure and validate incoming query parameters from MQL4
    const { symbol, rsi, cci, adx, body, direction } = req.query;
    if (!symbol || !rsi || !cci || !adx || !body || !direction) {
        console.error('Validation Aborted: Missing required query parameters.');
        return res.status(400).send('false'); // Bad Request
    }

    // 2. Get the Python service URL from environment variables for security and flexibility
    const pythonApiUrl = process.env.PYTHON_API_URL;
    if (!pythonApiUrl) {
        console.error("Configuration Error: PYTHON_API_URL is not set in the environment.");
        return res.status(500).send('false'); // Internal Server Error
    }

    let isSignalValid = false; // Default to false for safety

    // 3. Forward the data to the Python AI service for validation
    try {
        const queryParams = new URLSearchParams({ rsi, cci, adx, body }).toString();
        const response = await fetch(`${pythonApiUrl}?${queryParams}`);

        if (!response.ok) {
            // Log if the Python server returns an error (e.g., 400, 500)
            throw new Error(`Python AI service responded with status: ${response.status}`);
        }
        
        const predictionResult = await response.json();
        isSignalValid = predictionResult.valid === true; // Ensure a strict boolean check
        console.log(`AI Validation Result for ${symbol}: ${isSignalValid ? 'VALID' : 'INVALID'}`);

    } catch (error) {
        console.error("Error during AI validation request:", error.message);
        // If the AI service fails, we treat the signal as invalid and still log it
        isSignalValid = false;
    }

    // 4. Asynchronously save the signal and its validation outcome to MongoDB
    try {
        const newSignal = new Signal({
            symbol,
            direction: direction.toUpperCase(),
            rsi: parseFloat(rsi),
            cci: parseFloat(cci),
            adx: parseFloat(adx),
            body: parseFloat(body),
            isValidated: isSignalValid, // The result from the AI
        });
        await newSignal.save();
        console.log(`💾 Signal for ${symbol} (${direction}) successfully logged to database.`);
    } catch (dbError) {
        console.error("❌ Database Error: Failed to save signal:", dbError.message);
        // Note: Even if saving fails, we still send a response to MQL4 to prevent it from timing out.
    }

    // 5. Send the final, definitive result back to the MQL4 indicator
    res.send(isSignalValid ? "true" : "false");
});

module.exports = router;

