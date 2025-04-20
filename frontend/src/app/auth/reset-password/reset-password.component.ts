import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('Token from URL:', this.token);
      
      if (!this.token) {
        this.errorMessage = 'Invalid or missing reset token. Please request a new password reset.';
        this.toastr.error('Invalid or missing reset token', 'Error');
        setTimeout(() => {
          this.router.navigate(['/forgot-password']);
        }, 3000);
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    console.log('Form submitted');
    console.log('Form valid:', this.resetPasswordForm.valid);
    console.log('Token:', this.token);
    
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const password = this.resetPasswordForm.get('password')?.value;
      
      console.log('Submitting new password with token:', this.token);
      
      // Use the correct endpoint format
      this.http.post(`${environment.apiUrl}/auth/reset-password/${this.token}`, {
        password: password
      }).subscribe({
        next: (response: any) => {
          console.log('Password reset successful:', response);
          this.successMessage = 'Password has been reset successfully. You can now login with your new password.';
          this.toastr.success('Password reset successful', 'Success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Password reset error:', error);
          if (error.status === 400) {
            this.errorMessage = error.error.message || 'Invalid or expired reset token.';
          } else if (error.status === 404) {
            this.errorMessage = 'Reset token not found.';
          } else {
            this.errorMessage = 'Failed to reset password. Please try again.';
          }
          this.toastr.error(this.errorMessage, 'Error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form validation errors:', this.resetPasswordForm.errors);
      console.log('Password errors:', this.resetPasswordForm.get('password')?.errors);
      console.log('Confirm password errors:', this.resetPasswordForm.get('confirmPassword')?.errors);
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        const control = this.resetPasswordForm.get(key);
        control?.markAsTouched();
      });
      
      if (!this.token) {
        this.errorMessage = 'Invalid or missing reset token. Please request a new password reset.';
      }
    }
  }
} 