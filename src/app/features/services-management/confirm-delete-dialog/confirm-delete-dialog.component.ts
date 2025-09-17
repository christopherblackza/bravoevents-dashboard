import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
  serviceName: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirm Delete</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="confirmation-message">
          Are you sure you want to delete the service 
          <strong>"{{ data.serviceName }}"</strong>?
        </p>
        
        <div class="warning-note">
          <mat-icon>info</mat-icon>
          <span>This action cannot be undone. All sub-categories and leaf categories will also be deleted.</span>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Delete Service
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 350px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .warning-icon {
      color: #ff9800;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .dialog-content {
      padding: 0 24px;
    }
    
    .confirmation-message {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
      color: #333;
    }
    
    .warning-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      font-size: 14px;
      color: #856404;
    }
    
    .warning-note mat-icon {
      color: #856404;
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-top: 1px;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      margin: 0;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}