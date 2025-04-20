const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Create transporter with more secure configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      console.error('No email provided in request');
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('Sending OTP to email:', email);
    
    const otp = generateOTP();
    const timestamp = Date.now();

    // Store OTP with timestamp
    otpStore.set(email, { otp, timestamp });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Ride Pickup',
      html: `
        <h1>OTP Verification</h1>
        <p>Your OTP for ride pickup is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      `,
    };
    
    console.log('Mail options:', mailOptions);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate inputs
    if (!email || !otp) {
      console.error('Missing email or OTP in request');
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    console.log('Verifying OTP for email:', email);
    
    const storedData = otpStore.get(email);

    if (!storedData) {
      console.error('No OTP found for email:', email);
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    // Check if OTP has expired
    if (Date.now() - storedData.timestamp > OTP_EXPIRY) {
      console.error('OTP expired for email:', email);
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    if (storedData.otp === otp) {
      console.log('OTP verified successfully for email:', email);
      otpStore.delete(email); // Clear OTP after successful verification
      return res.json({ message: 'OTP verified successfully' });
    }

    console.error('Invalid OTP for email:', email);
    res.status(400).json({ message: 'Invalid OTP' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 