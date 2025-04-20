const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/login');
require('dotenv').config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Store reset tokens temporarily (in production, use Redis or similar)
const resetTokens = new Map();
const RESET_TOKEN_EXPIRY = 3600000; // 1 hour

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store token with expiry
    resetTokens.set(email, {
      token: hashedToken,
      expiry: Date.now() + RESET_TOKEN_EXPIRY
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reset email sent successfully');

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Failed to process request. Please try again later.' });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log('Reset password request with token:', token);
    console.log('Reset tokens map size:', resetTokens.size);
    
    // Find token in storage
    let tokenData = null;
    let userEmail = null;

    for (const [email, data] of resetTokens.entries()) {
      console.log('Checking token for email:', email);
      const isMatch = await bcrypt.compare(token, data.token);
      console.log('Token match:', isMatch);
      
      if (isMatch) {
        tokenData = data;
        userEmail = email;
        break;
      }
    }

    if (!tokenData || !userEmail) {
      console.log('Token not found in storage');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (Date.now() > tokenData.expiry) {
      console.log('Token expired');
      resetTokens.delete(userEmail);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    console.log('Updating password for user:', userEmail);
    
    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email: userEmail },
      { password: hashedPassword }
    );

    // Remove used token
    resetTokens.delete(userEmail);
    console.log('Password reset successful');

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router; 