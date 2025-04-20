import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();
  private readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

  private transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(email: string): Promise<boolean> {
    try {
      const otp = this.generateOTP();
      const timestamp = Date.now();

      // Store OTP with timestamp
      this.otpStore.set(email, { otp, timestamp });

      // Send email
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Ride Pickup',
        html: `
          <h1>OTP Verification</h1>
          <p>Your OTP for ride pickup is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        `,
      });

      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  verifyOTP(email: string, otp: string): boolean {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return false;
    }

    // Check if OTP has expired
    if (Date.now() - storedData.timestamp > this.OTP_EXPIRY) {
      this.otpStore.delete(email);
      return false;
    }

    // Verify OTP
    if (storedData.otp === otp) {
      this.otpStore.delete(email); // Clear OTP after successful verification
      return true;
    }

    return false;
  }
} 