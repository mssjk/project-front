import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DAFService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.daf}`; // Use environment variables

  constructor(private http: HttpClient) {}

  getDAFAccount(userId: number) {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  getDAFAccountById(daId: number) {
    return this.http.get<any>(`${this.apiUrl}/account/${daId}`);
  }

  getDAFAccountByNumber(daNumber: string) {
    return this.http.get<any>(`${this.apiUrl}/account/${daNumber}`);
  }
}