import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Service } from './models/service.models';
import { ServicesManagementService } from './services/services-management.service';
import { AddEditServiceDialogComponent } from './add-edit-service-dialog/add-edit-service-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-services-management',
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
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './services-management.component.html',
  styleUrls: ['./services-management.component.scss']
})
export class ServicesManagementComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  displayedColumns = ['name', 'type', 'subCategoriesCount', 'actions'];

  constructor(
    private servicesService: ServicesManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    this.servicesService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error loading services', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addService() {
    const dialogRef = this.dialog.open(AddEditServiceDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.servicesService.createService(result).subscribe({
          next: () => {
            this.snackBar.open('Service created successfully', 'Close', { duration: 3000 });
            this.loadServices();
          },
          error: () => {
            this.snackBar.open('Error creating service', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editService(service: Service) {
    const dialogRef = this.dialog.open(AddEditServiceDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'edit', service: service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.servicesService.updateService({ ...result, _id: service._id }).subscribe({
          next: () => {
            this.snackBar.open('Service updated successfully', 'Close', { duration: 3000 });
            this.loadServices();
          },
          error: () => {
            this.snackBar.open('Error updating service', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteService(service: Service) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { serviceName: service.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.servicesService.deleteService(service._id.$oid).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open('Service deleted successfully', 'Close', { duration: 3000 });
              this.loadServices();
            } else {
              this.snackBar.open('Error deleting service', 'Close', { duration: 3000 });
            }
          },
          error: () => {
            this.snackBar.open('Error deleting service', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getSubCategoriesCount(service: Service): number {
    return service.subCategories.length;
  }

  getSubCategoriesText(service: Service): string {
    const count = this.getSubCategoriesCount(service);
    return count === 1 ? '1 subcategory' : `${count} subcategories`;
  }
}