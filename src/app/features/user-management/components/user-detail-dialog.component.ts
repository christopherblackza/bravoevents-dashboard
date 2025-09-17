import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './user-detail-dialog.component.html',
  styleUrl: './user-detail-dialog.component.scss'
})
export class UserDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  close() {
    this.dialogRef.close();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'suspended': return 'warn';
      case 'banned': return 'warn';
      default: return 'basic';
    }
  }

  getVerificationColor(status: string): string {
    switch (status) {
      case 'verified': return 'primary';
      case 'pending': return 'accent';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'warn';
      case 'moderator': return 'accent';
      default: return 'basic';
    }
  }

  getTrustScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
}