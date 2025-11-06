import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../models/auth.models';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { TokenResponse } from '../../auth/interfaces/auth.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/v2/api`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private tokenStorageService: TokenStorageService
  ) {
    // Check for existing token in localStorage on service initialization
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token) {
      this.tokenSubject.next(token);
    }
    
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Store token and user data
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));

          const tokenResponse: TokenResponse = {
            access_token: response.access_token,
            refresh_token: ''
          };
        
          //   Save Token
          this.tokenStorageService.saveTokens(tokenResponse);
          
          // Update subjects
          this.tokenSubject.next(response.access_token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Clear subjects
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}