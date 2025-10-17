// routeHandler/signalHandler.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import the Signal model
const Signal = require('../models/Signal'); 

// This function allows us to pass the 'io' object from index.js
const signalHandler = (io) => {
    
    // POST: Receive a new signal
    router.post('/', async (req, res) => {
        try {
            const { symbol, direction, timeframe } = req.body;

            if (!symbol || !direction || !timeframe) {
                return res.status(400).send({ error: "Missing required signal data: symbol, direction, timeframe." });
            }

            const newSignal = new Signal({
                symbol,
                direction,
                timeframe,
                // status defaults to 'pending'
            });

            const savedSignal = await newSignal.save();
            
            // Broadcast the new signal to all connected clients
            console.log("Broadcasting new signal:", savedSignal);
            io.emit('newSignal', savedSignal);

            res.status(201).send(savedSignal);
        } catch (error) {
            console.error("Error saving signal:", error);
            res.status(500).send({ error: "Failed to save signal." });
        }
    });

    // PATCH: Update a signal's status (win/loss)
    router.patch('/:id', async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid signal ID.' });
        }
        
        if (!status || (status !== 'win' && status !== 'loss')) {
            return res.status(400).send({ error: 'Invalid status. Must be "win" or "loss".' });
        }

        try {
            const updatedSignal = await Signal.findByIdAndUpdate(
                id,
                { status: status },
                { new: true } // Return the updated document
            );

            if (!updatedSignal) {
                return res.status(404).send({ error: 'Signal not found.' });
            }

            // Broadcast the updated signal status to all clients
            console.log("Broadcasting updated signal:", updatedSignal);
            io.emit('signalUpdated', updatedSignal);

            res.status(200).send(updatedSignal);
        } catch (error) {
            console.error("Error updating signal:", error);
            res.status(500).send({ error: 'Failed to update signal.' });
        }
    });

    return router;
};

module.exports = signalHandler;