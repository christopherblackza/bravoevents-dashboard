import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface DeleteConfirmationData {
  bidId: string;
  eventId: string;
  vendorId: string;
  price: number;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Confirm Bid Deletion</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this bid?</p>
      <div class="bid-details">
        <p><strong>Event ID:</strong> {{ data.eventId }}</p>
        <p><strong>Vendor ID:</strong> {{ data.vendorId }}</p>
        <p><strong>Price:</strong> {{ data.price | currency:'USD' }}</p>
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Reason for deletion</mat-label>
        <textarea
          matInput
          [(ngModel)]="reason"
          placeholder="Please provide a reason for deleting this bid"
          required
          rows="3"
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="warn" 
        (click)="onConfirm()"
        [disabled]="!reason.trim()"
      >
        Delete Bid
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    .bid-details {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .bid-details p {
      margin: 4px 0;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
    `
  ]
})
export class DeleteConfirmationDialogComponent {
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      confirmed: true,
      reason: this.reason.trim()
    });
  }
}