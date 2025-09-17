import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Service, CreateServiceRequest } from '../models/service.models';

export interface AddEditServiceDialogData {
  mode: 'add' | 'edit';
  service?: Service;
}

@Component({
  selector: 'app-add-edit-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.mode === 'add' ? 'add' : 'edit' }}</mat-icon>
          {{ data.mode === 'add' ? 'Add New Service' : 'Edit Service' }}
        </h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="serviceForm" class="service-form">
          <!-- Basic Service Info -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Service Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Service Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter service name">
                  <mat-error *ngIf="serviceForm.get('name')?.hasError('required')">
                    Service name is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Service Type</mat-label>
                  <input matInput formControlName="type" placeholder="Enter service type (camelCase)">
                  <mat-error *ngIf="serviceForm.get('type')?.hasError('required')">
                    Service type is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Sub Categories -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Sub Categories</mat-card-title>
              <button type="button" mat-icon-button color="primary" (click)="addSubCategory()">
                <mat-icon>add</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content>
              <div formArrayName="subCategories">
                <div *ngFor="let subCategory of subCategoriesArray.controls; let i = index" 
                     [formGroupName]="i" class="subcategory-item">
                  <div class="subcategory-header">
                    <h4>Sub Category {{ i + 1 }}</h4>
                    <button type="button" mat-icon-button color="warn" (click)="removeSubCategory(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Name</mat-label>
                      <input matInput formControlName="name" placeholder="Sub category name">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Type</mat-label>
                      <input matInput formControlName="type" placeholder="Sub category type">
                    </mat-form-field>
                  </div>

                  <!-- Leaf Categories -->
                  <div class="leaf-categories-section">
                    <div class="leaf-categories-header">
                      <span>Leaf Categories</span>
                      <button type="button" mat-icon-button color="primary" (click)="addLeafCategory(i)">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>
                    
                    <div formArrayName="leafCategories">
                      <div *ngFor="let leafCategory of getLeafCategoriesArray(i).controls; let j = index" 
                           [formGroupName]="j" class="leaf-category-item">
                        <mat-form-field appearance="outline" class="leaf-name">
                          <mat-label>Leaf Name</mat-label>
                          <input matInput formControlName="name" placeholder="Leaf category name">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline" class="leaf-type">
                          <mat-label>Leaf Type</mat-label>
                          <input matInput formControlName="type" placeholder="Leaf category type">
                        </mat-form-field>
                        
                        <button type="button" mat-icon-button color="warn" (click)="removeLeafCategory(i, j)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="subCategoriesArray.length === 0" class="no-subcategories">
                <p>No sub categories added yet. Click the + button to add one.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!serviceForm.valid">
          <mat-icon>save</mat-icon>
          {{ data.mode === 'add' ? 'Create Service' : 'Update Service' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 700px;
      max-width: 900px;
      width: 100%;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      margin-top: 20px;
      padding: 0 24px;
      
      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
      }
    }
    
    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px;
    }
    
    .service-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-section {
      margin-bottom: 20px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .half-width {
      flex: 1;
      min-width: 0; /* Prevents flex items from overflowing */
    }
    
    .subcategory-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      background: #fafafa;
    }
    
    .subcategory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        color: #333;
      }
    }
    
    .leaf-categories-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .leaf-categories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      span {
        font-weight: 500;
        color: #666;
      }
    }
    
    .leaf-category-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
      
      .leaf-name, .leaf-type {
        flex: 1;
        min-width: 0; /* Prevents overflow */
      }
      
      button {
        flex-shrink: 0; /* Prevents button from shrinking */
      }
    }
    
    .no-subcategories {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
      background: white;
      position: sticky;
      bottom: 0;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .dialog-container {
        min-width: 90vw;
      }
      
      .form-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .leaf-category-item {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class AddEditServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEditServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddEditServiceDialogData
  ) {
    this.serviceForm = this.createForm();
  }

  ngOnInit() {
    if (this.data.mode === 'edit' && this.data.service) {
      this.populateForm(this.data.service);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      subCategories: this.fb.array([])
    });
  }

  populateForm(service: Service) {
    this.serviceForm.patchValue({
      name: service.name,
      type: service.type
    });

    const subCategoriesArray = this.serviceForm.get('subCategories') as FormArray;
    service.subCategories.forEach(subCategory => {
      const subCategoryGroup = this.fb.group({
        name: [subCategory.name, Validators.required],
        type: [subCategory.type, Validators.required],
        leafCategories: this.fb.array([])
      });

      const leafCategoriesArray = subCategoryGroup.get('leafCategories') as FormArray;
      subCategory.leafCategories.forEach(leafCategory => {
        leafCategoriesArray.push(this.fb.group({
          name: [leafCategory.name, Validators.required],
          type: [leafCategory.type, Validators.required]
        }));
      });

      subCategoriesArray.push(subCategoryGroup);
    });
  }

  get subCategoriesArray(): FormArray {
    return this.serviceForm.get('subCategories') as FormArray;
  }

  getLeafCategoriesArray(subCategoryIndex: number): FormArray {
    return this.subCategoriesArray.at(subCategoryIndex).get('leafCategories') as FormArray;
  }

  addSubCategory() {
    const subCategoryGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      leafCategories: this.fb.array([])
    });
    this.subCategoriesArray.push(subCategoryGroup);
  }

  removeSubCategory(index: number) {
    this.subCategoriesArray.removeAt(index);
  }

  addLeafCategory(subCategoryIndex: number) {
    const leafCategoryGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required]
    });
    this.getLeafCategoriesArray(subCategoryIndex).push(leafCategoryGroup);
  }

  removeLeafCategory(subCategoryIndex: number, leafCategoryIndex: number) {
    this.getLeafCategoriesArray(subCategoryIndex).removeAt(leafCategoryIndex);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
      const serviceData: CreateServiceRequest = {
        name: formValue.name,
        type: formValue.type,
        subCategories: formValue.subCategories
      };
      this.dialogRef.close(serviceData);
    }
  }
}