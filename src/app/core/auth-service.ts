import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Local development API
  // private API = 'http://localhost:3000/api/v1/users';
  
  // Production API (Railway)
  private API = 'https://order-processing-backend-production.up.railway.app/api/v1/users';

  isLoggedIn = signal(false);

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.API}/login`, { username, password });
  }

  register(data: any) {
    return this.http.post<any>(`${this.API}/register`, data);
  }

  setLoginState(state: boolean) {
    this.isLoggedIn.set(state);
  }

  logout() {
    this.isLoggedIn.set(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  setTokens(token: string) {
    console.log('setting token');
    console.log(token);
    localStorage.setItem('token', token);
    // JWT:   hhhhh.pppppp.ssssss
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    console.log(payload.role);
    
    // Only set role if it exists in the token payload
    if (payload.role) {
      localStorage.setItem('role', payload.role);
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }
}
