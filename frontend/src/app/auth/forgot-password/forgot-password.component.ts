import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const email = this.forgotPasswordForm.get('email')?.value;
      
      this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email })
        .subscribe({
          next: (response: any) => {
            this.toastr.success('Password reset instructions sent to your email', 'Success');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error in forgot password:', error);
            this.isLoading = false;
            
            if (error.status === 404) {
              this.errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
            } else if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Failed to process request. Please try again later.';
            }
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }
} 