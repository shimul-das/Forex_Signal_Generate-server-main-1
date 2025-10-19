const express = require('express');
const router = express.Router();
const DirectSignal = require('../models/DirectSignal'); // Adjust path if needed

// POST /api/direct-signal
// Called by MQL4 to log a NEW, PENDING signal
router.post('/', async (req, res) => {
    try {
        const {
            mqlSignalId,
            indicatorName,
            pair,
            timeframe,
            direction,
            entryTime, // MQL4 should send this as a UNIX timestamp (integer)
            expirationTime // MQL4 should send this as a UNIX timestamp (integer)
        } = req.body;

        // Convert UNIX timestamps (in seconds) to JavaScript Date objects (in milliseconds)
        const entryDate = new Date(entryTime * 1000);
        const expirationDate = new Date(expirationTime * 1000);

        const newSignal = new DirectSignal({
            mqlSignalId,
            indicatorName,
            pair,
            timeframe,
            direction,
            entryTime: entryDate,
            expirationTime: expirationDate,
            status: 'PENDING'
        });

        await newSignal.save();

        // You could also emit this to socket.io clients here
        // const io = req.app.get('socketio'); // See server.js update below
        // io.emit('new_signal', newSignal);
        
        console.log('✅ [DirectSignal] Logged new signal:', mqlSignalId);
        res.status(201).json({
            message: "Signal logged successfully",
            signal: newSignal
        });

    } catch (error) {
        console.error('❌ [DirectSignal] Error logging signal:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/direct-signal/update
// Called by MQL4 (from OnTimer) to update the RESULT of a signal
router.put('/update', async (req, res) => {
    try {
        const { mqlSignalId, status } = req.body; // status should be "WIN", "LOSS", or "DOJI"

        if (!mqlSignalId || !status) {
            return res.status(400).json({ error: 'mqlSignalId and status are required.' });
        }

        const updatedSignal = await DirectSignal.findOneAndUpdate(
            { mqlSignalId: mqlSignalId }, // Find by our custom MQL ID
            { $set: { status: status } },
            { new: true } // Return the updated document
        );

        if (!updatedSignal) {
            console.warn('⚠️ [DirectSignal] Signal to update not found:', mqlSignalId);
            return res.status(404).json({ error: 'Signal not found' });
        }

        // You could also emit this to socket.io clients here
        // const io = req.app.get('socketio');
        // io.emit('signal_update', updatedSignal);

        console.log('✅ [DirectSignal] Updated signal:', mqlSignalId, 'to', status);
        res.status(200).json({
            message: "Signal updated successfully",
            signal: updatedSignal
        });

    } catch (error) {
        console.error('❌ [DirectSignal] Error updating signal:', error.message);
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;