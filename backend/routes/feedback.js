const express = require('express')
const feedbackRoutes = express.Router()
const FeedbackModel = require("../models/feedback");

feedbackRoutes.post('/feedback', async (req,res) => {
    try {
      const { type, rating, title, description, email, rideId } = req.body;
      console.log("Received feedback:", { type, rating, title, description, email, rideId });

      // Create a new feedback document
      const feedback = new FeedbackModel({
        feedbackType: type,
        rating: rating,
        title: title,
        description: description,
        email: email,
        rideId: rideId
      });

      await feedback.save();
      console.log("Feedback saved successfully:", feedback);
      
      res.status(200).json({ 
        success: true, 
        message: 'Feedback Submitted Successfully', 
        feedback 
      });

    } catch (error) {
      console.error("Error submitting feedback:", error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to submit feedback. Please try again.' 
      });
    }
})

module.exports = feedbackRoutes;