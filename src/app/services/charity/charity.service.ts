import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CharityService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.charities}`; // Use environment variables

  constructor(private http: HttpClient) {}

  getAllCharities() {
    return this.http.get<any[]>(this.apiUrl);
  }
}
