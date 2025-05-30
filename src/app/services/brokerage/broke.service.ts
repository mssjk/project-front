import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class BrokeService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.brokerage}`; // Use environment variables

  constructor(private http: HttpClient) { }

  getBrokerAccount(userId: number) {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }
}