import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { UserListResponse } from '../../../core/models/user.models';
import { HttpClient } from '@angular/common/http';
import { VendorOnboardingData } from '../../../core/models/vendor-onboarding-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

   private readonly ADMIN_API_URL = environment.apiUrl + '/superadmin';

   
  constructor(
    private http: HttpClient,
  ) {}


  getDashboardStats(): Observable<{ totalUsers: number; totalEvents: number }> {
    return this.http.get<{ totalUsers: number; totalEvents: number }>(`${this.ADMIN_API_URL}/dashboard-stats`);
  }

}