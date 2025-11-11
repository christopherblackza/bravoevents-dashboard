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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

import { ServiceBid, ServiceBidResponse, BidStats } from './models/bid.models';
import { BidsManagementService } from './services/bids-management.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteConfirmationDialogComponent, DeleteConfirmationData } from './components/delete-confirmation-dialog.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bids-management',
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
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatTooltipModule,
    DeleteConfirmationDialogComponent,
    RouterLink
  ],
  templateUrl: './bids-management.component.html',
  styleUrl: './bids-management.component.scss'
})
export class BidsManagementComponent implements OnInit {
  displayedColumns: string[] = [
    'eventId',
    'vendorId',
    'status',
    'price',
    'rating',
    'bidType',
    'payment_status',
    'createdAt',
    'actions'
  ];

  bids: ServiceBid[] = [];
  totalBids = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = false;
  searchControl = new FormControl('');
  bidStats: BidStats | null = null;

  constructor(
    private bidsService: BidsManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBids();
    this.loadBidStats();
    this.setupSearch();
  }

  loadBids(page: number = 1, limit: number = 10, search?: string) {
    this.isLoading = true;
    this.bidsService.getServiceBids(page, limit, search).subscribe({
      next: (response: ServiceBidResponse) => {
        console.error('RESPONSE', response);
        this.bids = response.data;
        console.error('BIDS', this.bids);
        this.totalBids = response.total;
        this.pageIndex = response.page - 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bids:', error);
        this.snackBar.open('Error loading bids', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadBidStats() {
    this.bidsService.getBidStats().subscribe({
      next: (stats: BidStats) => {
        this.bidStats = stats;
      },
      error: (error) => {
        console.error('Error loading bid stats:', error);
      }
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string | null) => {
        const searchQuery = query?.trim() || '';
        return this.bidsService.searchServiceBids(searchQuery, 1, this.pageSize);
      })
    ).subscribe({
      next: (response: ServiceBidResponse) => {
        this.bids = response.data;
        this.totalBids = response.total;
        this.pageIndex = 0;
      },
      error: (error) => {
        console.error('Error searching bids:', error);
        this.snackBar.open('Error searching bids', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadBids(event.pageIndex + 1, event.pageSize, this.searchControl.value || undefined);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'primary';
      case 'accepted': return 'accent';
      case 'rejected': return 'warn';
      case 'completed': return 'success';
      default: return 'basic';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'paid': return 'success';
      case 'failed': return 'error';
      default: return 'basic';
    }
  }

  getBidTypeColor(type: string): string {
    return type === 'service' ? 'primary' : 'accent';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | null): string {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  updateBidStatus(bid: ServiceBid, status: 'pending' | 'accepted' | 'rejected' | 'completed') {
    this.bidsService.updateBidStatus(bid._id, status).subscribe({
      next: (updatedBid) => {
        const index = this.bids.findIndex(b => b._id === bid._id);
        if (index !== -1) {
          this.bids[index] = updatedBid;
          this.bids = [...this.bids];
        }
        this.snackBar.open(`Bid status updated to ${status}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating bid status:', error);
        this.snackBar.open('Error updating bid status', 'Close', { duration: 3000 });
      }
    });
  }

  updateBidPrice(bid: ServiceBid, price: number) {
    this.bidsService.updateBidPrice(bid._id, price).subscribe({
      next: (updatedBid) => {
        const index = this.bids.findIndex(b => b._id === bid._id);
        if (index !== -1) {
          this.bids[index] = updatedBid;
          this.bids = [...this.bids];
        }
        this.snackBar.open('Bid price updated', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating bid price:', error);
        this.snackBar.open('Error updating bid price', 'Close', { duration: 3000 });
      }
    });
  }

  deleteBid(bid: ServiceBid) {
    const dialogData: DeleteConfirmationData = {
      bidId: bid._id,
      eventId: bid.eventId,
      vendorId: bid.vendorId,
      price: bid.price || 0
    };

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.bidsService.deleteBid(bid._id, result.reason).subscribe({
          next: () => {
            this.bids = this.bids.filter(b => b._id !== bid._id);
            this.totalBids--;
            this.snackBar.open('Bid deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting bid:', error);
            this.snackBar.open('Error deleting bid', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}