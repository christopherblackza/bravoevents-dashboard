import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../models/event.models';
import { EventManagementService } from '../../services/event-management.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-add-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatRadioModule,
    MatCardModule,
    MatToolbarModule
  ],
  templateUrl: './add-edit-event.component.html',
  styleUrls: ['./add-edit-event.component.scss']
})
export class AddEditEventComponent implements OnInit {
  eventForm: FormGroup;
  isEdit: boolean = false;
  eventId: string | null = null;
  event: Event | null = null;
  eventImageUrls: string[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventManagementService,
    private authService: AuthService
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      this.isEdit = !!this.eventId;
      
      if (this.isEdit && this.eventId) {
        this.loadEvent(this.eventId);
      } else {
        // Auto-fill form with sample payload for new events
        this.loadSamplePayload();
      }
    });
  }

  private loadEvent(id: string): void {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        if (event) {
          this.event = event;
          this.populateForm(event);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.isLoading = false;
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      typeOfEvent: ['', Validators.required],
      amountOfPeopleExpected: ['', [Validators.required, Validators.min(1)]],
      city: ['', Validators.required],
      eventDescription: ['', [Validators.required, Validators.minLength(10)]],
      hasEventVenue: ['', Validators.required],
      eventVenue: [''],
      requestTickets: ['', Validators.required],
      eventType: this.fb.group({
        seatedEvent: [false],
        openAirEvent: [false],
        plotForTents: [false]
      }),
      // Optional sections
      camping: this.fb.group({
        hasVendor: [''],
        vendorName: ['']
      }),
      infrastructure: this.fb.group({
        // Infrastructure form controls will be added here
      }),
      vendorsStalls: this.fb.group({
        // Vendors and stalls form controls will be added here
      }),
      safety: this.fb.group({
        // Safety form controls will be added here
      })
    });
  }

  private populateForm(event: Event): void {
    this.eventForm.patchValue({
      eventName: event.title || '',
      eventDate: event.date ? new Date(event.date) : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      typeOfEvent: event.typeOfEvent || '',
      amountOfPeopleExpected: event.amountOfPeopleExpected || '',
      city: event.city || '',
      eventDescription: event.eventDescription || '',
      hasEventVenue: event.eventVenue ? 'yes' : 'no',
      eventVenue: event.eventVenue || '',
      requestTickets: event.requestTickets ? 'yes' : 'no',
      eventType: {
        seatedEvent: event.seatingArrangement?.isSeatedEvent || false,
        openAirEvent: event.seatingArrangement?.isOpenAirEvent || false,
        plotForTents: event.seatingArrangement?.plotsForTents || false
      },
      camping: {
        hasVendor: event.camping?.campingGlamping?.vendor ? 'yes' : 'no',
        vendorName: ''
      },
      infrastructure: {},
      vendorsStalls: {},
      safety: {}
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private loadSamplePayload(): void {
    this.isLoading = true;
    this.eventService.getSamplePayload().subscribe({
      next: (payload) => {
        this.populateFormFromPayload(payload);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sample payload:', error);
        this.isLoading = false;
      }
    });
  }

  private populateFormFromPayload(payload: any): void {
    this.eventForm.patchValue({
      eventName: payload.title || '',
      eventDate: payload.date ? new Date(payload.date) : '',
      startTime: payload.startTime || '',
      endTime: payload.endTime || '',
      typeOfEvent: payload.eventTypes?.[0] || '',
      amountOfPeopleExpected: payload.expectedPeople || '',
      city: payload.city || '',
      eventDescription: payload.eventDescription || '',
      hasEventVenue: payload.isEventVenue ? 'yes' : 'no',
      eventVenue: payload.eventVenue || '',
      requestTickets: payload.requestTickets ? 'yes' : 'no',
      eventType: {
        seatedEvent: payload.seatingArrangement?.isSeatedEvent || false,
        openAirEvent: payload.seatingArrangement?.isOpenAirEvent || false,
        plotForTents: payload.seatingArrangement?.isPlotTentsEvent || false
      },
      camping: {
        hasVendor: payload.camping?.campingGlamping?.vendor ? 'yes' : 'no',
        vendorName: payload.camping?.campingGlamping?.vendorName || ''
      }
    });

    // Set additional fields that might not be in the main form structure
    if (payload.vendorsStalls?.catering?.vendorName) {
      this.eventForm.get('vendorsStalls')?.patchValue({
        catering: {
          vendorName: payload.vendorsStalls.catering.vendorName
        }
      });
    }
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;

      const currentUserId = this.authService.getCurrentUser()?._id;
      console.error('currentUserId', currentUserId);
      
      const eventData: CreateEventRequest = {
        userId: currentUserId ?? '',
        title: formValue.eventName,
        date: formValue.eventDate,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        typeOfEvent: formValue.typeOfEvent,
        amountOfPeopleExpected: formValue.amountOfPeopleExpected,
        city: formValue.city,
        eventDescription: formValue.eventDescription,
        isEventVenue: formValue.hasEventVenue === 'yes',
        eventVenue: formValue.hasEventVenue === 'yes' ? formValue.eventVenue : '',
        requestTickets: formValue.requestTickets === 'yes',
        eventLogo: '',
        eventImageUrls: [],
        permissions: this.event?.permissions || {
          eventApplication: { submitted: false },
          trafficApplication: { required: false },
          noiseExemption: { required: false },
          construction: { required: false }
        },
        infrastructure: this.event?.infrastructure || {
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
        decoration: this.event?.decoration || {
          decor: { vendor: false },
          lighting: { vendor: false },
          layout: { vendor: false },
          internet: { vendor: false },
          entertainment: { vendor: false }
        },
        sanitation: this.event?.sanitation || {
          toiletsAndShowers: {
            toilets: { vendor: false },
            showers: { vendor: false }
          },
          wasteAndCleaning: {
            wasteManagement: { vendor: false },
            cleaners: { vendor: false }
          }
        },
        safety: this.event?.safety || {
          security: { vendor: false },
          healthAndSafety: { vendor: false },
          medicalServices: { vendor: false },
          fireFighting: { vendor: false }
        },
        camping: this.event?.camping || {
          campingGlamping: { vendor: formValue.camping.hasVendor === 'yes' }
        },
        vendorsStalls: this.event?.vendorsStalls || {
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
        beveragesBarServices: this.event?.beveragesBarServices || {
          cooldrinksAndAlcoholServices: {
            cooldrinks: { vendor: false },
            liquorLicense: { submitted: false },
            bar: { vendor: false, quotesRequested: false },
            cellars: { vendor: false },
            breweries: { vendor: false }
          }
        },
        brandingPromotionDto: this.event?.brandingPromotionDto || {
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
        accreditationEntryDto: this.event?.accreditationEntryDto || {
          wristBands: { vendor: false },
          stamps: { vendor: false }
        },
        staffingSupportDto: this.event?.staffingSupportDto || {
          staff: { vendor: false }
        },
        seatingArrangement: {
          isSeatedEvent: formValue.eventType.seatedEvent,
          isOpenAirEvent: formValue.eventType.openAirEvent,
          plotsForTents: formValue.eventType.plotForTents
        }
      };

      this.isLoading = true;

      if (this.isEdit && this.eventId) {
        const updateData: UpdateEventRequest = { ...eventData, id: this.eventId };
        this.eventService.updateEvent(this.eventId, updateData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error updating event:', error);
            this.isLoading = false;
          }
        });
      } else {
        // Build payload similar to payload.json using form values
        const payloadOverrides: any = {
          userId: this.event?.userId || this.authService.getCurrentUser()?._id || 'current-user-id',
          title: formValue.eventName,
          date: formValue.eventDate,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          typeOfEvent: formValue.typeOfEvent,
          expectedPeople: formValue.amountOfPeopleExpected,
          city: formValue.city,
          eventDescription: formValue.eventDescription,
          isEventVenue: formValue.hasEventVenue === 'yes',
          eventVenue: formValue.hasEventVenue === 'yes' ? formValue.eventVenue : '',
          requestTickets: formValue.requestTickets === 'yes',
          seatingArrangement: {
            isSeatedEvent: formValue.eventType.seatedEvent,
            isOpenAirEvent: formValue.eventType.openAirEvent,
            isPlotTentsEvent: formValue.eventType.plotForTents
          }
        };

        // Use the API method that posts to the real endpoint
        this.eventService.createEventWithPayload(payloadOverrides).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error creating event via API:', error);
            this.isLoading = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.eventForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/events']);
  }

  get pageTitle(): string {
    return this.isEdit ? 'Edit Event' : 'Add New Event';
  }
}