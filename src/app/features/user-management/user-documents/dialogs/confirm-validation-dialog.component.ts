import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupportingDocument } from '../../../../core/models/vendor-onboarding-data.model';

export interface ConfirmValidationDialogData {
  document: SupportingDocument;
  userName: string;
}

@Component({
  selector: 'app-confirm-validation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-validation-dialog.component.html',
  styleUrl: './confirm-validation-dialog.component.scss'
})
export class ConfirmValidationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmValidationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}