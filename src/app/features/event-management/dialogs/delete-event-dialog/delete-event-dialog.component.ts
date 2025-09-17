import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Event } from '../../models/event.models';

@Component({
  selector: 'app-delete-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './delete-event-dialog.component.html',
  styleUrls: ['./delete-event-dialog.component.scss']
})
export class DeleteEventDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Event }
  ) {}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}