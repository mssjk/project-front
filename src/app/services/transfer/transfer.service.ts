import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.transfers}`; 
  constructor(private http: HttpClient) { }

  getUserTransfers(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  initiateTransfer(transfer: any) {
    return this.http.post(`${this.apiUrl}/fund-daf`, transfer);
  }
  addTransfer(transfer: any) {
    return this.http.post(`${this.apiUrl}/fund-daf`, transfer);
  }
}
