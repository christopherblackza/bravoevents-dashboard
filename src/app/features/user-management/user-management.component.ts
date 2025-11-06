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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  pageSize = 50;
  currentPage = 0;
  searchControl = new FormControl('');
  isSearching = false;

  userStats: UserStats = {
    totalUsers: 0,
    vendor: 0,
    coordinator: 0,
    users: 0
  };
  
  displayedColumns = ['firstName', 'lastName', 'email', 'status', 'role', 'actions'];

  constructor(
    private userService: UserManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.getUserStats();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.trim().length > 0) {
          this.isSearching = true;
          return this.userService.searchUsers(query.trim());
        } else {
          this.isSearching = false;
          this.loadUsers();
          return [];
        }
      })
    ).subscribe({
      next: (users) => {
        if (this.isSearching) {
          this.users = users;
          this.totalUsers = users.length;
        }
      },
      error: (error) => {
        this.snackBar.open('Error searching users', 'Close', { 
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
    this.loadUsers();
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
    if (!this.isSearching) {
      this.userService.getUsers().subscribe({
        next: (result) => {
          this.users = result.items;
          console.error('USERS', this.users)
          this.totalUsers = this.users.length;
        },
        error: (error: any) => {
          this.snackBar.open('Error loading users', 'Close', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
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
        userRole: user.role,
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