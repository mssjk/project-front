import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.donations}`;

  constructor(private http: HttpClient) {}

  getUserDonations(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  addDonation(donation: any) {
    return this.http.post(`${this.apiUrl}/add`, donation);
  }
}
