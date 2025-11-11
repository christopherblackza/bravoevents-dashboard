import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ServiceBid, ServiceBidResponse, BidStats } from '../models/bid.models';

@Injectable({
  providedIn: 'root'
})
export class BidsManagementService {
  private readonly API_BASE_URL = 'http://localhost:4000';
    private readonly API_ADMIN_URL = 'http://localhost:4000/superadmin';

  constructor(private http: HttpClient) {}

  getServiceBids(page: number = 1, limit: number = 10, search?: string): Observable<ServiceBidResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.API_BASE_URL}/service-bids`, { params }).pipe(
      map(response => {
        // Handle both response formats: array of bids or paginated response
        if (Array.isArray(response)) {
          // Convert array response to paginated format
          return {
            data: response,
            total: response.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(response.length / limit)
          };
        } else {
          // Already in paginated format
          return response;
        }
      })
    );
  }

  searchServiceBids(query: string, page: number = 1, limit: number = 10): Observable<ServiceBidResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ServiceBidResponse>(`${this.API_BASE_URL}/service-bids/search`, { params });
  }

  getBidStats(): Observable<BidStats> {
    return this.http.get<BidStats>(`${this.API_BASE_URL}/service-bids/stats`);
  }

  getBidById(id: string): Observable<ServiceBid> {
    return this.http.get<ServiceBid>(`${this.API_BASE_URL}/service-bids/${id}`);
  }

  updateBidStatus(id: string, status: 'pending' | 'accepted' | 'rejected' | 'completed'): Observable<ServiceBid> {
    return this.http.patch<ServiceBid>(`${this.API_ADMIN_URL}/bids/${id}/status`, { status });
  }

  updateBidPrice(id: string, price: number): Observable<ServiceBid> {
    return this.http.patch<ServiceBid>(`${this.API_BASE_URL}/service-bids/${id}/price`, { price });
  }

  updateBidRating(id: string, rating: number): Observable<ServiceBid> {
    return this.http.patch<ServiceBid>(`${this.API_BASE_URL}/service-bids/${id}/rating`, { rating });
  }

  deleteBid(id: string, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.delete<void>(`${this.API_BASE_URL}/service-bids/${id}`, { params });
  }
}