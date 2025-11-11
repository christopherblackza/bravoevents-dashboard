import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

import { PaymentTransaction, PaymentStats } from './models/payment.models';
import { PaymentManagementService, TransactionPeriod } from './services/payment-management.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit {
  transactions: PaymentTransaction[] = [];
  filteredTransactions: PaymentTransaction[] = [];
  totalTransactions = 0;
  pageSize = 10;
  currentPage = 0;
  searchControl = new FormControl('');
  periodControl = new FormControl('monthly');
  dateControl = new FormControl('2025-11');
  isSearching = false;
  isLoading = false;

  paymentStats: PaymentStats = {
    totalTransactions: 0,
    totalRevenue: 0,
    totalFees: 0,
    totalNet: 0,
    currency: 'ZAR'
  };

  periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];
  
  displayedColumns = ['Date', 'Type', 'Party', 'Name', 'Gross', 'Fee', 'Net', 'Currency', 'actions'];

  constructor(
    private paymentService: PaymentManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPaymentTransactions();
    this.getPaymentStats();
    this.setupSearch();
    this.setupPeriodFilter();
  }

  setupPeriodFilter() {
    this.periodControl.valueChanges.subscribe(period => {
      this.updateDateControlPlaceholder(period);
      this.loadPaymentTransactions();
      this.getPaymentStats();
    });

    this.dateControl.valueChanges.subscribe(() => {
      this.loadPaymentTransactions();
      this.getPaymentStats();
    });
  }

  updateDateControlPlaceholder(period: string | null) {
    switch (period) {
      case 'daily':
        this.dateControl.setValue(new Date().toISOString().split('T')[0]);
        break;
      case 'weekly':
        this.dateControl.setValue(new Date().toISOString().split('T')[0]);
        break;
      case 'monthly':
        this.dateControl.setValue('2025-11');
        break;
    }
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.trim().length > 0) {
          this.isSearching = true;
          return this.paymentService.searchPaymentTransactions(query.trim());
        } else {
          this.isSearching = false;
          this.filteredTransactions = this.transactions;
          this.totalTransactions = this.transactions.length;
          return [];
        }
      })
    ).subscribe({
      next: (transactions) => {
        if (this.isSearching) {
          this.filteredTransactions = transactions;
          this.totalTransactions = transactions.length;
        }
      },
      error: (error) => {
        this.snackBar.open('Error searching transactions', 'Close', { 
          duration: 3000, 
          horizontalPosition: 'right', 
          verticalPosition: 'top' 
        });
        this.isSearching = false;
      }
    });
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.isSearching = false;
    this.filteredTransactions = this.transactions;
    this.totalTransactions = this.transactions.length;
  }

  getPaymentStats() {
    this.paymentService.getPaymentStats().subscribe({
      next: (stats) => {
        this.paymentStats = stats;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading payment stats', 'Close', { 
          duration: 3000, 
          horizontalPosition: 'right', 
          verticalPosition: 'top' 
        });
      }
    });
  }

  loadPaymentTransactions() {
    this.isLoading = true;
    const period: TransactionPeriod = {
      type: this.periodControl.value as 'daily' | 'weekly' | 'monthly',
      date: this.dateControl.value || '2025-11'
    };

    this.paymentService.getPaymentTransactions(period).subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions = response.data;
          this.filteredTransactions = response.data;
          this.totalTransactions = response.data.length;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading payment transactions', 'Close', { 
          duration: 3000, 
          horizontalPosition: 'right', 
          verticalPosition: 'top' 
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedTransactions(): PaymentTransaction[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredTransactions.slice(startIndex, startIndex + this.pageSize);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'FUNDS_RECEIVED': return 'primary';
      case 'PAYMENT': return 'accent';
      case 'REFUND': return 'warn';
      default: return 'basic';
    }
  }

  getSignColor(sign: string): string {
    return sign === 'CREDIT' ? 'primary' : 'warn';
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDatePlaceholder(): string {
    switch (this.periodControl.value) {
      case 'daily':
        return 'YYYY-MM-DD';
      case 'weekly':
        return 'YYYY-MM-DD (start of week)';
      case 'monthly':
        return 'YYYY-MM';
      default:
        return 'YYYY-MM';
    }
  }

  viewTransactionDetails(transaction: PaymentTransaction) {
    // Implement transaction details dialog
    console.log('View transaction details:', transaction);
  }

  exportTransactions() {
    // Implement export functionality
    this.snackBar.open('Export functionality coming soon', 'Close', { 
      duration: 3000, 
      horizontalPosition: 'right', 
      verticalPosition: 'top' 
    });
  }
}