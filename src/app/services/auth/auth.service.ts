import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt'; 
import { environment } from '../../../environments/environment'; // Import environment
import { TokenApiModel } from '../../model/token-api.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
  
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Base API URL
  private usersEndpoint = environment.endpoints.users; // Specific endpoint for users
  private userPayload: any; 

  constructor(private http: HttpClient,private translate: TranslateService) {
    this.userPayload = this.decodeToken(); 
  }

  login(credentials: { email: string; password: string }) {
    const url = `${this.apiUrl}${this.usersEndpoint}/login`; // Use private variable for endpoint
    return this.http.post<any>(url, credentials).pipe(
      tap(response => {
        console.log("hello", response);
        localStorage.setItem('token', response.tokenApi.accessToken);
        localStorage.setItem('refreshToken', response.tokenApi.refreshToken);
      })
    );
  }

  renewToken(tokenApi: TokenApiModel) {
    console.log("helloabcd", tokenApi);
    return this.http.post<any>(`${this.apiUrl}${this.usersEndpoint}/refresh`, tokenApi).pipe(
      tap((response: any) => {
        console.log("hello", response);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }
  
  getToken() {
    return localStorage.getItem('token'); 
  }

  registerUser(userData: any) {
    const url = `${this.apiUrl}${this.usersEndpoint}/register`; // Use private variable for endpoint
    return this.http.post<any>(url, userData);
  }

  getUsers() {
    const url = `${this.apiUrl}${this.usersEndpoint}`; // Use private variable for endpoint
    return this.http.get<any>(url);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); 
  }

  decodeToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;

    return jwtHelper.decodeToken(token);
  }

  getFullNameFromToken() {
    if (this.userPayload) {
      return this.userPayload.unique_name; 
    } 
  }
}