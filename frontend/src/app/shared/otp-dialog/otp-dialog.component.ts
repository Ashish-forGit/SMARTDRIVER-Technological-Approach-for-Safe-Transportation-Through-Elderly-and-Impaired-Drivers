import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.css']
})
export class OtpDialogComponent implements OnInit {
  otpForm: FormGroup;
  private serverUrl = 'https://smartdriver-technological-approach-for.onrender.com/';
  // private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';
  userEmail: string = '';

  constructor(
    private dialogRef: MatDialogRef<OtpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    console.log('OTP Dialog Data:', data);
    
    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if userEmail is available
    this.userEmail = this.data?.userEmail;
    
    if (!this.userEmail) {
      console.error('User email not found in dialog data:', this.data);
      this.toastr.error('User email not found', 'Error');
      this.dialogRef.close(false);
      return;
    }
    
    console.log('OTP Dialog: User email is', this.userEmail);
    
    // Send OTP when dialog opens
    this.sendOTP();
  }

  sendOTP() {
    if (!this.userEmail) {
      console.error('User email is missing in sendOTP method');
      this.toastr.error('User email is missing', 'Error');
      return;
    }
    
    console.log('Sending OTP to:', this.userEmail);
    
    this.http.post(`${this.serverUrl}/send-otp`, { email: this.userEmail })
      .subscribe({
        next: (response: any) => {
          console.log('OTP sent successfully:', response);
          this.toastr.success('OTP sent to your email', 'Success');
        },
        error: (error) => {
          console.error('Error sending OTP:', error);
          this.toastr.error('Failed to send OTP: ' + (error.error?.message || error.message || 'Unknown error'), 'Error');
        }
      });
  }

  verifyOTP() {
    if (this.otpForm.valid) {
      const otp = this.otpForm.get('otp')?.value;
      
      if (!this.userEmail) {
        console.error('User email is missing in verifyOTP method');
        this.toastr.error('User email is missing', 'Error');
        return;
      }
      
      console.log('Verifying OTP for:', this.userEmail);
      
      this.http.post(`${this.serverUrl}/verify-otp`, { email: this.userEmail, otp })
        .subscribe({
          next: (response: any) => {
            console.log('OTP verified successfully:', response);
            this.toastr.success('OTP verified successfully', 'Success');
            this.dialogRef.close(true); // Close with success
          },
          error: (error) => {
            console.error('Error verifying OTP:', error);
            this.toastr.error('Invalid OTP: ' + (error.error?.message || error.message || 'Unknown error'), 'Error');
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
} 