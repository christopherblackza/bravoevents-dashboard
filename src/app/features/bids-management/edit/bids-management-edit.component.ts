import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ServiceBid } from '../models/bid.models';
import { BidsManagementService } from '../services/bids-management.service';

@Component({
  selector: 'app-bids-management-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './bids-management-edit.component.html',
  styleUrl: './bids-management-edit.component.scss'
})
export class BidsManagementEditComponent implements OnInit {
  bid: ServiceBid | null = null;
  isLoading = false;
  isUpdating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bidsService: BidsManagementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBid();
  }

  loadBid() {
    this.isLoading = true;
    const bidId = this.route.snapshot.paramMap.get('id');
    
    if (!bidId) {
      this.snackBar.open('Invalid bid ID', 'Close', { duration: 3000 });
      this.router.navigate(['/bids-management']);
      return;
    }

    this.bidsService.getBidById(bidId).subscribe({
      next: (bid: ServiceBid) => {
        this.bid = bid;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bid:', error);
        this.snackBar.open('Error loading bid details', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/bids-management']);
      }
    });
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

  updateBidStatus(status: 'pending' | 'accepted' | 'rejected' | 'completed') {
    if (!this.bid) return;

    this.isUpdating = true;
    this.bidsService.updateBidStatus(this.bid._id, status).subscribe({
      next: (updatedBid: ServiceBid) => {
        this.bid = updatedBid;
        this.isUpdating = false;
        this.snackBar.open(`Bid status updated to ${status}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating bid status:', error);
        this.snackBar.open('Error updating bid status', 'Close', { duration: 3000 });
        this.isUpdating = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/bids']);
  }
}