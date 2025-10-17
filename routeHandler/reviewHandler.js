const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middlewares/verifyToken')
const reviewSchema = require('../schemas/reviewSchema');

const Review = new mongoose.model("review", reviewSchema);

router.get('/',  async(req, res) => {
    try {
        const reviews = await Review.find();
    
        if (!reviews || reviews.length === 0) {
          return res.status(404).json({ message: 'No reviews found' });
        }
    
        res.status(200).json(reviews);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

// router.post('/', async (req, res) => {
//         console.log("Request Body:", req.body);
//       try {
//         const newReview = new Review(req.body);
//         await newReview.save();
//         res.status(200).json({
//             message: "Review was added successfully"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error: "There was a server side error!"
//         });
//     }   
//   });

router.post('/', async (req, res) => {
  try {
      const reviewData = { ...req.body };

      // Ensure all required fields are provided (if necessary, set default values)
      if (!reviewData.ratting) {
          reviewData.ratting = 1;  // Default rating if not provided
      }
      
      // Ensure 'deliveryMen' exists and is a valid ID (or use a default)
      if (!reviewData.deliveryMen) {
          return res.status(400).json({ error: "Delivery Men ID is required." });
      }

      // Create a new review object using the provided data
      const newReview = new Review(reviewData);

      // Save the new review to the database
      await newReview.save();

      res.status(200).json({
          message: 'Review successfully created',
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: 'There was a server-side error!',
      });
  }
});


module.exports = router;