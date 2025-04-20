import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  url = "https://smartdriver-technological-approach-for.onrender.com/"
  // private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http :HttpClient) { }

  getcard(id:any ){
    // console.log(id);
    return this.http.get(`${this.url}/getcard/` + id)
  }

  deletecard(id:any){
    return this.http.delete(`${this.url}/deletecard/` + id)
  }
}
