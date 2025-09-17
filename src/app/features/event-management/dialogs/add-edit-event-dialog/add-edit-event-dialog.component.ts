import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';

import { Event, CreateEventRequest, UpdateEventRequest } from '../../models/event.models';

@Component({
  selector: 'app-add-edit-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatSelectModule
  ],
  templateUrl: './add-edit-event-dialog.component.html',
  styleUrls: ['./add-edit-event-dialog.component.scss']
})
export class AddEditEventDialogComponent implements OnInit {
  eventForm: FormGroup;
  isEdit: boolean;
  eventImageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Event | null; isEdit: boolean }
  ) {
    this.isEdit = data.isEdit;
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.event) {
      this.populateForm(this.data.event);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      eventLogo: [''],
      eventDescription: ['', [Validators.required, Validators.minLength(10)]],
      requestTickets: [false],
      isEventVenue: [false],
      
      // Permissions
      permissions: this.fb.group({
        eventApplication: this.fb.group({
          submitted: [false]
        }),
        trafficApplication: this.fb.group({
          required: [false],
          submissionIn: [false]
        }),
        noiseExemption: this.fb.group({
          required: [false]
        }),
        construction: this.fb.group({
          required: [false],
          hasVendor: [false]
        })
      }),

      // Infrastructure
      infrastructure: this.fb.group({
        fencing: this.fb.group({
          vendor: [false]
        }),
        scaffolding: this.fb.group({
          vendor: [false]
        }),
        electricity: this.fb.group({
          generator: this.fb.group({
            vendor: [false]
          }),
          electrician: this.fb.group({
            vendor: [false]
          })
        }),
        seatingAndTables: this.fb.group({
          vendor: [false]
        }),
        stageLightingSoundScreens: this.fb.group({
          stage: this.fb.group({
            vendor: [false]
          }),
          lighting: this.fb.group({
            vendor: [false]
          }),
          sound: this.fb.group({
            vendor: [false]
          }),
          screens: this.fb.group({
            vendor: [false]
          })
        })
      }),

      // Safety
      safety: this.fb.group({
        security: this.fb.group({
          mainCategoryId: [''],
          subCategoryId: [''],
          vendor: [false],
          vendorName: [''],
          planFileUrl: ['']
        }),
        healthAndSafety: this.fb.group({
          mainCategoryId: [''],
          subCategoryId: [''],
          vendor: [false],
          riskAssessmentRequired: [false]
        }),
        medicalServices: this.fb.group({
          mainCategoryId: [''],
          subCategoryId: [''],
          vendor: [false]
        }),
        fireFighting: this.fb.group({
          mainCategoryId: [''],
          subCategoryId: [''],
          vendor: [false],
          vendorName: [''],
          planFileUrl: ['']
        })
      }),

      // Seating Arrangement
      seatingArrangement: this.fb.group({
        isSeatedEvent: [false],
        isOpenAirEvent: [false],
        plotsForTents: [false]
      }),

      // Tickets
      tickets: this.fb.array([])
    });
  }

  private populateForm(event: Event): void {
    this.eventForm.patchValue({
      title: event.title,
      date: new Date(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      eventLogo: event.eventLogo,
      eventDescription: event.eventDescription,
      requestTickets: event.requestTickets,
      isEventVenue: event.isEventVenue,
      permissions: event.permissions,
      infrastructure: event.infrastructure,
      safety: event.safety,
      seatingArrangement: event.seatingArrangement
    });

    this.eventImageUrls = event.eventImageUrls || [];

    // Populate tickets if they exist
    if (event.vendorsStalls?.ticketingAndSales?.tickets) {
      const ticketsArray = this.eventForm.get('tickets') as FormArray;
      event.vendorsStalls.ticketingAndSales.tickets.forEach(ticket => {
        ticketsArray.push(this.fb.group({
          typeOfTickets: [ticket.typeOfTickets],
          amount: [ticket.amount],
          avaibleTickets: [ticket.avaibleTickets]
        }));
      });
    }
  }

  get ticketsArray(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  addTicket(): void {
    const ticketGroup = this.fb.group({
      typeOfTickets: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      avaibleTickets: ['', [Validators.required, Validators.min(0)]]
    });
    this.ticketsArray.push(ticketGroup);
  }

  removeTicket(index: number): void {
    this.ticketsArray.removeAt(index);
  }

  addImageUrl(): void {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      this.eventImageUrls.push(url.trim());
    }
  }

  removeImageUrl(index: number): void {
    this.eventImageUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      const eventData: CreateEventRequest | UpdateEventRequest = {
        userId: this.data.event?.userId || 'current-user-id', // In real app, get from auth service
        title: formValue.title,
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        eventLogo: formValue.eventLogo,
        requestTickets: formValue.requestTickets,
        isEventVenue: formValue.isEventVenue,
        eventImageUrls: this.eventImageUrls,
        eventDescription: formValue.eventDescription,
        permissions: formValue.permissions,
        infrastructure: formValue.infrastructure,
        decoration: this.data.event?.decoration || {
          decor: { vendor: false },
          lighting: { vendor: false },
          layout: { vendor: false },
          internet: { vendor: false },
          entertainment: { vendor: false }
        },
        sanitation: this.data.event?.sanitation || {
          toiletsAndShowers: {
            toilets: { vendor: false },
            showers: { vendor: false }
          },
          wasteAndCleaning: {
            wasteManagement: { vendor: false },
            cleaners: { vendor: false }
          }
        },
        safety: formValue.safety,
        camping: this.data.event?.camping || {
          campingGlamping: { vendor: false }
        },
        vendorsStalls: {
          ticketingAndSales: {
            mainCategoryId: formValue.safety?.security?.mainCategoryId || '',
            subCategoryId: formValue.safety?.security?.subCategoryId || '',
            vendor: formValue.requestTickets,
            tickets: formValue.tickets
          },
          stalls: this.data.event?.vendorsStalls?.stalls || {
            vendors: {
              mainCategoryId: '',
              subCategoryId: '',
              leafCategoryId: '',
              vendor: false,
              amountFood: '0',
              pricePerStall: '0',
              accessoriesAmount: '0',
              accessoriesPrice: '0',
              artsCraftsAmount: '0',
              artsCraftsPrice: '0',
              vapeAmount: '0',
              vapePrice: '0',
              entertainmentRequired: false,
              required: false
            },
            catering: {
              mainCategoryId: '',
              subCategoryId: '',
              leafCategoryId: '',
              vendor: false,
              vendorName: ''
            }
          }
        },
        beveragesBarServices: this.data.event?.beveragesBarServices || {
          cooldrinksAndAlcoholServices: {
            cooldrinks: { vendor: false },
            liquorLicense: { submitted: false },
            bar: { vendor: false, quotesRequested: false },
            cellars: { vendor: false },
            breweries: { vendor: false }
          }
        },
        brandingPromotionDto: this.data.event?.brandingPromotionDto || {
          printingAndBranding: { vendor: false },
          mediaAndSocialMedia: {
            socialMediaInfluencers: {
              influencer: false,
              packageIncluded: false
            },
            radio: {
              vendor: false,
              socialMediaRequest: false
            },
            tv: { vendor: false },
            printedMedia: { vendor: false }
          }
        },
        accreditationEntryDto: this.data.event?.accreditationEntryDto || {
          wristBands: { vendor: false },
          stamps: { vendor: false }
        },
        staffingSupportDto: this.data.event?.staffingSupportDto || {
          staff: { vendor: false }
        },
        seatingArrangement: formValue.seatingArrangement
      };

      this.dialogRef.close(eventData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}