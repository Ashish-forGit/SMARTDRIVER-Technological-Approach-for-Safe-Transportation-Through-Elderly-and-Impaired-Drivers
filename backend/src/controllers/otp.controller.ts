import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { OtpService } from '../services/otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOTP(@Body() body: { email: string }) {
    try {
      const success = await this.otpService.sendOTP(body.email);
      if (success) {
        return { message: 'OTP sent successfully' };
      } else {
        throw new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify')
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    try {
      const isValid = this.otpService.verifyOTP(body.email, body.otp);
      if (isValid) {
        return { message: 'OTP verified successfully' };
      } else {
        throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }
  }
} 