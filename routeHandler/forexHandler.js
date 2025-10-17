const express = require('express');
const router = express.Router();
const ForexData = require('../models/forexDataModel');

// GET /forex/history/:symbol
// Fetches the last 100 data points for a specific currency pair
router.get('/history/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const history = await ForexData.find({ symbol: symbol })
            .sort({ lastRefreshed: -1 }) // Get the most recent data first
            .limit(100); // Limit to 100 entries

        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No historical data found for this symbol." });
        }

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching historical data.", error: error.message });
    }
});

module.exports = router;