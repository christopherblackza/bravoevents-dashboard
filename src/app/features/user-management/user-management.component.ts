import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Observable } from 'rxjs';
import { UserProfile } from './models/user.models';
import { UserManagementService } from './services/user-management.service';
import { UserDetailDialogComponent } from './components/user-detail-dialog.component';
import { User } from '../../core/models/auth.models';
import { UserStats } from './models/user-stats.model';

@Component({
  selector: 'app-user-management',
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
    MatCardModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  pageSize = 50;
  currentPage = 0;

  userStats: UserStats = {
    totalUsers: 0,
    totalUsersWithRoleVendor: 0,
    totalUsersWithRoleCoordinator: 0,
    totalUsersWithRoleUser: 0
  };
  
  displayedColumns = ['firstName', 'lastName', 'email', 'status', 'role', 'actions'];

  constructor(
    private userService: UserManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // this.stats$ = this.userService.getUserStats();
  }

  ngOnInit() {
    this.loadUsers();

    this.getUserStats();

  //    this.snackBar.open('Message sent successfully!', 'Close', {
  //   duration: 3000, // duration in milliseconds
  //   horizontalPosition: 'right', // 'start' | 'center' | 'end' | 'left' | 'right'
  //   verticalPosition: 'top',     // 'top' | 'bottom'
  // });
  }

  getUserStats() {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
        console.error('USER STATS', this.userStats)
      },
      error: (error: any) => {
        this.snackBar.open('Error loading user stats', 'Close', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
      }
    });
  }

  updateVerification(user: UserProfile, status: 'verified' | 'rejected') {
    // this.userService.updateVerificationStatus(user.user_id, status).subscribe({
    //   next: (success: any) => {
    //     if (success) {
    //       user.verification_status = status;
    //       user.is_verified = status === 'verified';
    //       this.snackBar.open(`User verification ${status}`, 'Close', { duration: 3000 });
    //     }
    //   },
    //   error: () => {
    //     this.snackBar.open('Error updating verification', 'Close', { duration: 3000 });
    //   }
    // });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'primary';
      case 'moderator': return 'accent';
      case 'user': return 'basic';
      default: return 'basic';
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (result) => {
        this.users = result.userData;
        console.error('USERS', this.users)
        this.totalUsers = this.users.length;
      },
      error: (error: any) => {
        
        this.snackBar.open('Error loading users', 'Close', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }


  viewVerificationDocuments(user: User) {
    this.router.navigate(['/users/documents'], {
      queryParams: {
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`
      }
    });
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
}