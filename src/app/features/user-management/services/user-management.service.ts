import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { UserProfile} from '../models/user.models';
import { UserListResponse } from '../../../core/models/user.models';
import { HttpClient } from '@angular/common/http';
import { OnboardingDocuments, VendorOnboardingData } from '../../../core/models/vendor-onboarding-data.model';
import { UserStats } from '../models/user-stats.model';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

   private readonly API_URL = environment.apiUrl;
   private readonly API_ADMIN_URL = `${this.API_URL}/superadmin`;

   
  constructor(
    private http: HttpClient,
  ) {}

  getUsers(): Observable<UserListResponse> {
     return this.http.get<UserListResponse>(`${this.API_ADMIN_URL}/users`, {})
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

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_ADMIN_URL}/users/search`, {
      params: { query }
    });
  }

  getUserSupportingDocuments(userId: string) : Observable<OnboardingDocuments[]> {
    return this.http.get<OnboardingDocuments[]>(`${this.API_ADMIN_URL}/user-onboarding/${userId}`, {});
  }

  validateUserDocuments(documentId: string): Observable<any> {
    return this.http.get(`${this.API_ADMIN_URL}/validate-documents/${documentId}`, {});
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/superadmin/reports`);
  }

}