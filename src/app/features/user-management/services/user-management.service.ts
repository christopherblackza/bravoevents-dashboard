import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { UserProfile} from '../models/user.models';
import { UserListResponse } from '../../../core/models/user.models';
import { HttpClient } from '@angular/common/http';
import { VendorOnboardingData } from '../../../core/models/vendor-onboarding-data.model';
import { UserStats } from '../models/user-stats.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

   private readonly API_URL = 'http://localhost:3000/v2/api';

   
  constructor(
    private http: HttpClient,
  ) {}

  getUsers(): Observable<UserListResponse> {
     return this.http.get<UserListResponse>(`${this.API_URL}/user/search`, {})
      .pipe(
        tap(response => {
          // Store token and user data


          
          // Update subjects
          // this.tokenSubject.next(response.access_token);
          // this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  getUserSupportingDocuments(userId: string) : Observable<VendorOnboardingData> {
    return this.http.get<VendorOnboardingData>(`${this.API_URL}/user/supporting-documents/${userId}`, {});
  }

  validateUserDocuments(userId: string, documentId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/user/validate-documents/${userId}/${documentId}`, {});
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/user/stats`);
  }

}