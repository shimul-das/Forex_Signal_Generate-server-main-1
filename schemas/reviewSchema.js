const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userImg: {
        type: String,
        required: true
    },
    deliveryMen: {
        type: String,
        required: true
    },
    ratting: {
        type: String,
        required: true
    },
    feedback: {
        type: String,
        required: true
    }
});

module.exports = reviewSchema;