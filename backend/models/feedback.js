const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema(
  {
    feedbackType: {
      type: String,
      required: true,
      enum: ['ride', 'driver', 'app', 'payment', 'other']
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      minlength: 5
    },
    description: {
      type: String,
      required: true,
      minlength: 20
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'createRideModel',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const FeedbackModel = mongoose.model("FeedbackModel", feedbackSchema);

module.exports = FeedbackModel; 