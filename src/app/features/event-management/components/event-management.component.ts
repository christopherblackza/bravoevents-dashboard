import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Event } from '../models/event.models';
import { EventManagementService } from '../services/event-management.service';
import { DeleteEventDialogComponent } from '../dialogs/delete-event-dialog/delete-event-dialog.component';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  displayedColumns: string[] = ['eventLogo', 'title', 'date', 'startTime', 'endTime', 'isEventVenue', 'requestTickets', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): void {
    this.eventService.getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events.items;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.events = [];
          this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
        }
      });

    // this.eventService.getEvents()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       if (response.success && response.data) {
    //         // Ensure we always have an array for the table
    //         if (Array.isArray(response.data)) {
    //           this.events = response.data;
    //         } else {
    //           this.events = [response.data];
    //         }
    //       } else {
    //         this.events = [];
    //       }
    //     },
    //     error: (error) => {
    //       console.error('Error loading events:', error);
    //       this.events = [];
    //       this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
    //     }
    //   });
  }

  addEvent(): void {
    this.router.navigate(['/events/add']);
  }

  editEvent(event: Event): void {
    this.router.navigate(['/events/edit', event._id]);
  }

  deleteEvent(event: Event): void {

    const dialogRef = this.dialog.open(DeleteEventDialogComponent, {
      width: '400px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(event._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
                this.loadEvents();
              } else {
                this.snackBar.open(response.message || 'Error deleting event', 'Close', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error deleting event:', error);
              this.snackBar.open('Error deleting event', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getEventStatusChip(event: Event): { text: string; color: string } {
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (eventDate < today) {
      return { text: 'Past', color: 'warn' };
    } else if (eventDate.toDateString() === today.toDateString()) {
      return { text: 'Today', color: 'accent' };
    } else {
      return { text: 'Upcoming', color: 'primary' };
    }
  }
}