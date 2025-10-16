import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDocument } from '../models/document.models';
import { User } from '../../../core/models/auth.models';
import { UserManagementService } from '../services/user-management.service';
import { OnboardingDocuments, SupportingDocument, VendorOnboardingData } from '../../../core/models/vendor-onboarding-data.model';
import { ConfirmValidationDialogComponent } from './dialogs/confirm-validation-dialog.component';

@Component({
  selector: 'app-user-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './user-documents.component.html',
  styleUrls: ['./user-documents.component.scss']
})
export class UserDocumentsComponent implements OnInit {
  documents: OnboardingDocuments[] = [];
  userId: string = '';
  userName: string = '';
  
  // displayedColumns = ['title', 'type', 'uploadDate', 'verificationStatus', 'actions'];
  displayedColumns = ['title', 'verificationStatus', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log("HERE")
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.userName = params['userName'] || 'Unknown User';
    });
    
    this.loadDocuments();
  }

    updateVerificationStatus(user: User, status: 'active' | 'suspended' | 'banned') {
    // this.userService.updateUserStatus(user.user_id, status).subscribe({
    //   next: (success: any) => {
    //     if (success) {
    //       user.status = status;
    //       this.snackBar.open(`User ${status}`, 'Close', { duration: 3000 });
    //     }
    //   },
    //   error: () => {
    //     this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
    //   }
    // });
  }


  loadDocuments() {
    // In a real application, this would be an API call
    this.userService.getUserSupportingDocuments(this.userId).subscribe({
      next: (documents: OnboardingDocuments[]) => {
        this.documents = documents || [];
        console.error("DOCUMENTS:", this.documents)
      },
      error: () => {
        this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
      }
    });
    
    // For now, using dummy data
    // this.documents = this.dummyDocuments.filter(doc => doc.userId === this.userId);
  }

  viewDocument(document: SupportingDocument) {
    // Open document in new tab
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank');
    } else {
      this.snackBar.open('Document URL not available', 'Close', { duration: 3000 });
    }
  }

  downloadDocument(userDocument: UserDocument) {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = userDocument.fileUrl;
    link.download = userDocument.name;
    link.click();
    
    this.snackBar.open('Download started', 'Close', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'primary';
      case 'pending': return 'accent';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getTypeDisplayName(type: string): string {
    switch (type) {
      case 'identity': return 'Identity Document';
      case 'proof_of_address': return 'Proof of Address';
      case 'business_license': return 'Business License';
      case 'other': return 'Other';
      default: return type;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateDocument(document: SupportingDocument) {
    const dialogRef = this.dialog.open(ConfirmValidationDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        document: document,
        userName: this.userName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // User confirmed, proceed with validation
        this.performDocumentValidation(document);
      }
      // If result is false or undefined, user cancelled - do nothing
    });
  }

  private performDocumentValidation(document: SupportingDocument) {
    console.log('Validating document:', document);
    this.userService.validateUserDocuments(document._id).subscribe({
      next: (response) => {
        this.snackBar.open('Document validated successfully', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Refresh document list
        this.loadDocuments();
      },
      error: () => {
        this.snackBar.open('Error validating document', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}