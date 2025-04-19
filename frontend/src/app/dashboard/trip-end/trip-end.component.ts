import { Component, OnInit } from '@angular/core';
declare var Stripe: any;

@Component({
  selector: 'app-trip-end',
  templateUrl: './trip-end.component.html',
  styleUrls: ['./trip-end.component.css']
})
export class TripEndComponent implements OnInit{
  private stripe: any;
  private card: any;  

  constructor() {
    this.stripe = Stripe('pk_test_51PA7DZJ4JtpKs8bK3vGwn6RroPqBjFzVKlHxUAImOruSdVUIVT2ed4tCI5qgO0GFOKe4O7U0zGNPU8OiVVzMzlc600xZIbMaBE');
  }

  ngOnInit(): void {
    // Create a new card element and mount it to the DOM
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  }

  async confirmPayment() {
    const { token, error } = await this.stripe.createToken(this.card);
    if (error) {
      // Handle error
      console.error(error);
    } else {
      // Send the token to your backend for payment processing
      this.sendTokenToServer(token);
    }
  }

  sendTokenToServer(token: any) {
    // Send the token to your Node.js backend to process the payment
    // You can use Angular's HTTP client or any other method to send the token
    // to your server where you'll create the charge using the Stripe API
    // Example using Angular's HTTP client:
    // this.httpClient.post('/your-server-endpoint', { token }).subscribe(
    //   (response) => {
    //     // Handle server response
    //   },
    //   (error) => {
    //     // Handle error
    //   }
    // );
  }

}
