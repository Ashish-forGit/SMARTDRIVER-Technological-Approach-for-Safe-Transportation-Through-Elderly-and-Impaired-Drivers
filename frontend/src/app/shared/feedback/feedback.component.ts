import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
// import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit{

  private serverUrl = 'http://localhost:4000';
  // private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';

  feedbackForm!: FormGroup;
  isLoading = false;
  feedbackTypes = [
    { id: 'ride', label: 'Ride Experience' },
    { id: 'driver', label: 'Driver Service' },
    { id: 'app', label: 'App Experience' },
    { id: 'payment', label: 'Payment Issue' },
    { id: 'other', label: 'Other' }
  ];
  ratings = [1, 2, 3, 4, 5];
  rideId: string = '';
  
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService
  ){
    this.feedbackForm = this.formBuilder.group({
      type: ['', Validators.required],
      rating: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }


  ngOnInit(): void {
    console.log('Feedback component initialized');
    console.log('Dialog data:', this.data);
    
    // Extract rideId from dialog data
    if (this.data && this.data._id) {
      this.rideId = this.data._id;
      console.log('Ride ID:', this.rideId);
    }
  }


  onSubmit() {
    if (this.feedbackForm.valid) {
      this.isLoading = true;
      
      // Add rideId to the form data
      const feedbackData = {
        ...this.feedbackForm.value,
        rideId: this.rideId
      };
      
      console.log('Submitting feedback:', feedbackData);

      this.http.post(`${environment.apiUrl}/feedback`, feedbackData)
        .subscribe({
          next: (response: any) => {
            console.log('Feedback submitted successfully:', response);
            this.toastr.success('Thank you for your feedback!', 'Success');
            this.feedbackForm.reset();
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error submitting feedback:', error);
            let errorMessage = 'Failed to submit feedback. Please try again.';
            
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            } else if (error.status === 0) {
              errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            } else if (error.status === 400) {
              errorMessage = 'Invalid feedback data. Please check your input.';
            }
            
            this.toastr.error(errorMessage, 'Error');
            this.isLoading = false;
          }
        });
    } else {
      console.log('Form validation failed:', this.feedbackForm.errors);
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
          console.log(`Invalid field ${key}:`, control.errors);
        }
      });
    }
  }

  getRatingLabel(rating: number): string {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  }

  resetForm() {
    this.feedbackForm.reset();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
