import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { UserListResponse } from '../../../core/models/user.models';
import { HttpClient } from '@angular/common/http';
import { VendorOnboardingData } from '../../../core/models/vendor-onboarding-data.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

   private readonly API_URL = 'http://localhost:3000/v2/api';

   
  constructor(
    private http: HttpClient,
  ) {}


  getDashboardStats(): Observable<{ totalUsers: number; totalEvents: number }> {
    return this.http.get<{ totalUsers: number; totalEvents: number }>(`${this.API_URL}/user/dashboard-stats`);
  }

}