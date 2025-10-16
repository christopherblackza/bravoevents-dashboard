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
    MatSelectModule,
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
      // Basic Information matching screenshot
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      typeOfEvent: ['', Validators.required],
      amountOfPeopleExpected: ['', [Validators.required, Validators.min(1)]],
      city: ['', Validators.required],
      eventDescription: ['', [Validators.required, Validators.minLength(10)]],
      eventLogo: [''],
      advertisingPhotos: [[]],
      hasEventVenue: ['', Validators.required],
      eventVenue: [''],
      requestTickets: ['', Validators.required],
      
      // Type of Event section
      eventType: this.fb.group({
        seatedEvent: [false],
        openAirEvent: [false],
        plotForTents: [false]
      })
    });
  }

  private populateForm(event: Event): void {
    this.eventForm.patchValue({
      eventName: event.title,
      eventDate: new Date(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      typeOfEvent: event.typeOfEvent || '',
      amountOfPeopleExpected: event.amountOfPeopleExpected || '',
      city: event.city || '',
      eventDescription: event.eventDescription,
      eventLogo: event.eventLogo,
      advertisingPhotos: event.eventImageUrls || [],
      hasEventVenue: event.isEventVenue ? 'yes' : 'no',
      eventVenue: event.eventVenue || '',
      requestTickets: event.requestTickets ? 'yes' : 'no',
      eventType: {
        seatedEvent: event.seatingArrangement?.isSeatedEvent || false,
        openAirEvent: event.seatingArrangement?.isOpenAirEvent || false,
        plotForTents: event.seatingArrangement?.plotsForTents || false
      }
    });

    this.eventImageUrls = event.eventImageUrls || [];
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
        userId: this.data.event?.userId || 'current-user-id',
        title: formValue.eventName,
        date: formValue.eventDate,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        typeOfEvent: formValue.typeOfEvent,
        amountOfPeopleExpected: formValue.amountOfPeopleExpected,
        city: formValue.city,
        eventLogo: formValue.eventLogo,
        requestTickets: formValue.requestTickets === 'yes',
        isEventVenue: formValue.hasEventVenue === 'yes',
        eventVenue: formValue.eventVenue,
        eventImageUrls: formValue.advertisingPhotos,
        eventDescription: formValue.eventDescription,
        permissions: this.data.event?.permissions || {
          eventApplication: { submitted: false },
          trafficApplication: { required: false },
          noiseExemption: { required: false },
          construction: { required: false }
        },
        infrastructure: this.data.event?.infrastructure || {
          fencing: { vendor: false },
          scaffolding: { vendor: false },
          electricity: { generator: { vendor: false }, electrician: { vendor: false } },
          seatingAndTables: { vendor: false },
          stageLightingSoundScreens: {
            stage: { vendor: false },
            lighting: { vendor: false },
            sound: { vendor: false },
            screens: { vendor: false }
          }
        },
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
        safety: this.data.event?.safety || {
          security: { vendor: false },
          healthAndSafety: { vendor: false },
          medicalServices: { vendor: false },
          fireFighting: { vendor: false }
        },
        camping: this.data.event?.camping || {
          campingGlamping: { vendor: false }
        },
        vendorsStalls: this.data.event?.vendorsStalls || {
          ticketingAndSales: {
            vendor: formValue.requestTickets === 'yes',
            tickets: []
          },
          stalls: {
            vendors: {
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
        seatingArrangement: {
          isSeatedEvent: formValue.eventType.seatedEvent,
          isOpenAirEvent: formValue.eventType.openAirEvent,
          plotsForTents: formValue.eventType.plotForTents
        }
      };

      this.dialogRef.close(eventData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}