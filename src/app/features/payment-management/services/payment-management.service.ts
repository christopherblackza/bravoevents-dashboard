import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { PaymentTransaction, PaymentResponse, PaymentStats } from '../models/payment.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface TransactionPeriod {
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentManagementService {

  private readonly PAYFAST_API_BASE = `${environment.apiUrl}/payfast/transactions/history`;

  constructor(
    private http: HttpClient,
  ) {}

  getPaymentTransactions(period?: TransactionPeriod, testing: boolean = true): Observable<PaymentResponse> {
    const periodType = period?.type || 'monthly';
    const date = period?.date || '2025-11';
    
    const apiUrl = `${this.PAYFAST_API_BASE}/${periodType}`;
    let params = new HttpParams()
      .set('date', date)
      .set('testing', testing.toString());

    return this.http.get<any>(apiUrl, { params })
      .pipe(
        map(response => ({
          success: true,
          data: response.data || [],
          message: 'Payment transactions retrieved successfully'
        })),
        tap(response => {
          console.log('Payment transactions loaded:', response.data.length);
        })
      );
  }

  getDailyTransactions(date: string = new Date().toISOString().split('T')[0], testing: boolean = true): Observable<PaymentResponse> {
    return this.getPaymentTransactions({ type: 'daily', date }, testing);
  }

  getWeeklyTransactions(date: string = new Date().toISOString().split('T')[0], testing: boolean = true): Observable<PaymentResponse> {
    return this.getPaymentTransactions({ type: 'weekly', date }, testing);
  }

  getMonthlyTransactions(date: string = '2025-11', testing: boolean = true): Observable<PaymentResponse> {
    return this.getPaymentTransactions({ type: 'monthly', date }, testing);
  }

  searchPaymentTransactions(query: string, period?: TransactionPeriod): Observable<PaymentTransaction[]> {
    return this.getPaymentTransactions(period).pipe(
      map(response => {
        if (!query.trim()) {
          return response.data;
        }
        
        const searchTerm = query.toLowerCase();
        return response.data.filter(transaction => 
          transaction.Name?.toLowerCase().includes(searchTerm) ||
          transaction.Party?.toLowerCase().includes(searchTerm) ||
          transaction.Type?.toLowerCase().includes(searchTerm) ||
          transaction.Description?.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  getPaymentStats(): Observable<PaymentStats> {
    return this.getPaymentTransactions().pipe(
      map(response => {
        const transactions = response.data;
        const totalRevenue = transactions.reduce((sum: number, transaction: PaymentTransaction) => sum + transaction.Gross, 0);
        const totalFees = transactions.reduce((sum: number, transaction: PaymentTransaction) => sum + Math.abs(transaction.Fee), 0);
        const totalNet = transactions.reduce((sum: number, transaction: PaymentTransaction) => sum + transaction.Net, 0);

        return {
          totalTransactions: transactions.length,
          totalRevenue,
          totalFees,
          totalNet,
          currency: transactions.length > 0 ? transactions[0].Currency : 'ZAR'
        };
      })
    );
  }

  getTransactionById(transactionId: string): Observable<PaymentTransaction | null> {
    return this.getPaymentTransactions().pipe(
      map(response => {
        return response.data.find((transaction: PaymentTransaction) => 
          transaction["M Payment ID"] === transactionId ||
          transaction["PF Payment ID"]?.toString() === transactionId
        ) || null;
      })
    );
  }
}