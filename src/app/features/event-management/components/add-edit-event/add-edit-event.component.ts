import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { Event, CreateEventRequest, UpdateEventRequest, StaffMember } from '../../models/event.models';
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

    this.eventForm.get('staffingSupport.hasVendor')?.valueChanges.subscribe(value => {
      if (value === 'no' && this.staffMembers.length === 0) {
        this.addStaffMember();
      }
    });
  }

  private loadEvent(id: string): void {
    this.isLoading = true;
        this.eventService.getEventById(id).subscribe({
          next: (event) => {
            this.event = event;
            console.error('EVENT', event);
            this.populateForm(event);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading event:', error);
            this.isLoading = false;
          }
        });
  }

  createForm(): FormGroup {
    return this.fb.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      typeOfEvent: ['', Validators.required],
      amountOfPeopleExpected: [0, [Validators.required, Validators.min(1)]],
      city: ['', Validators.required],
      eventDescription: ['', [Validators.required, Validators.minLength(10)]],
      eventLogo: [''],
      eventPhotos: this.fb.array([]),
      hasEventVenue: ['no', Validators.required],
      eventVenue: [''],
      requestTickets: ['no', Validators.required],
      ticketLink: [''],
      eventType: this.fb.group({
        seatedEvent: [false],
        openAirEvent: [false],
        plotForTents: [false],
      }),
      camping: this.createCampingFormGroup(),
      infrastructure: this.createInfrastructureFormGroup(),
      vendorsStalls: this.createVendorsStallsFormGroup(),
      safety: this.createSafetyFormGroup(),
      staffingSupport: this.createStaffingSupportFormGroup(),
    });
  }

  createCampingFormGroup(): FormGroup {
    return this.fb.group({
      hasVendor: ['no'],
      vendorName: [''],
      campingTents: [0],
      campingDimensions: [''],
      personsPerTent: [0],
      glampingTents: [0],
      glampingPersonsPerTent: [0],
      glampingDimensions: [''],
      additionalEquipment: [''],
    });
  }

  createInfrastructureFormGroup(): FormGroup {
    return this.fb.group({
      // Define infrastructure form controls here
    });
  }

  createVendorsStallsFormGroup(): FormGroup {
    return this.fb.group({
      foodStalls: this.createStallFormGroup(),
      accessoriesStalls: this.createStallFormGroup(),
      artsAndCraftsStalls: this.createStallFormGroup(),
      vapeStalls: this.createStallFormGroup(),
      catering: this.createCateringFormGroup(),
    });
  }

  createSafetyFormGroup(): FormGroup {
    return this.fb.group({
      // Define safety form controls here
    });
  }

  createStaffingSupportFormGroup(): FormGroup {
    return this.fb.group({
      hasVendor: ['no'],
      vendorName: [''],
      members: this.fb.array([]),
    });
  }

  populateForm(event: Event) {
    console.error('POPULATE FORM', event);
    this.eventForm.patchValue({
      eventName: event.title,
      eventDate: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      typeOfEvent: event.eventTypeId?.label,
      amountOfPeopleExpected: event.expectedPeople,
      city: event.city,
      eventDescription: event.eventDescription,
      eventLogo: event.eventLogo,
      hasEventVenue: event.isEventVenue ? 'yes' : 'no',
      eventVenue: event.eventVenue,
      requestTickets: event.requestTickets ? 'yes' : 'no',
      ticketLink: event.ticketLink,
      eventType: {
        seatedEvent: event.seatingArrangement?.isSeatedEvent,
        openAirEvent: event.seatingArrangement?.isOpenAirEvent,
        plotForTents: event.seatingArrangement?.plotsForTents,
      },
    });

    if (event.camping) {
      this.eventForm.get('camping')?.patchValue(event.camping);
    }

    if (event.infrastructure) {
      this.eventForm.get('infrastructure')?.patchValue(event.infrastructure);
    }

    if (event.vendorsStalls) {
      this.eventForm.get('vendorsStalls.foodStalls')?.patchValue(event.vendorsStalls.foodStalls);
      this.eventForm.get('vendorsStalls.accessoriesStalls')?.patchValue(event.vendorsStalls.accessoriesStalls);
      this.eventForm.get('vendorsStalls.artsAndCraftsStalls')?.patchValue(event.vendorsStalls.artsAndCraftsStalls);
      this.eventForm.get('vendorsStalls.vapeStalls')?.patchValue(event.vendorsStalls.vapeStalls);
      if (event.vendorsStalls.catering) {
        this.eventForm.get('vendorsStalls.catering')?.patchValue(event.vendorsStalls.catering);
        if (event.vendorsStalls.catering.items) {
          event.vendorsStalls.catering.items.forEach(item => {
            this.addCateringItem(item);
          });
        }
      }
    }

    if (event.safety) {
      this.eventForm.get('safety')?.patchValue(event.safety);
    }

    if (event.staffingSupportDto) {
      this.eventForm.get('staffingSupport')?.patchValue(event.staffingSupportDto.staff);
      if (event.staffingSupportDto.staff.members) {
        event.staffingSupportDto.staff.members.forEach(member => {
          this.addStaffMember(member);
        });
      }
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
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

  private populateFormFromPayload(payload: CreateEventRequest): void {
    console.log("populateFormFromPayload", payload)
    this.eventForm.patchValue({
      eventName: payload.title || '',
      eventDate: payload.date ? new Date(payload.date) : '',
      startTime: payload.startTime || '',
      endTime: payload.endTime || '',
      // typeOfEvent: payload.eventTypes?.[0] || '',
      amountOfPeopleExpected: payload.expectedPeople || '',
      city: payload.city || '',
      eventDescription: payload.eventDescription || '',
      hasEventVenue: payload.isEventVenue ? 'yes' : 'no',
      eventVenue: payload.eventVenue || '',
      requestTickets: payload.requestTickets ? 'yes' : 'no',
      // eventType: {
      //   seatedEvent: payload.seatingArrangement?.isSeatedEvent || false,
      //   openAirEvent: payload.seatingArrangement?.isOpenAirEvent || false,
      //   plotForTents: payload.seatingArrangement?.isPlotTentsEvent || false
      // },
      camping: {
        hasVendor: payload.camping?.campingGlamping?.vendor ? 'yes' : 'no',
        vendorName: payload.camping?.campingGlamping?.vendorName || '',
        campingTents: payload.camping?.campingGlamping?.campingTents || 0,
        personsPerTent: payload.camping?.campingGlamping?.personsPerTent || 0,
        campingDimensions: payload.camping?.campingGlamping?.campingDimensions || '',
        glampingTents: payload.camping?.campingGlamping?.glampingTents || 0,
        glampingPersonsPerTent: payload.camping?.campingGlamping?.glampingPersonsPerTent || 0,
        glampingDimensions: payload.camping?.campingGlamping?.glampingDimensions || '',
        additionalEquipment: payload.camping?.campingGlamping?.additionalEquipment || ''
      },
      staffingSupport: {
        hasVendor: payload.staffingSupportDto?.staff?.vendor ? 'yes' : 'no',
        vendorName: payload.staffingSupportDto?.staff?.vendorName || '',
        members: []
      }
    });

    if (payload.vendorsStalls) {
        this.eventForm.get('vendorsStalls')?.patchValue({
            // foodStalls: {
            //     hasVendor: payload.vendorsStalls.stalls?.vendors?.amountFood ? 'yes' : 'no',
            //     amount: payload.vendorsStalls.stalls?.vendors?.amountFood,
            //     pricePerStall: payload.vendorsStalls.stalls?.vendors?.pricePerStall,
            //     hasKidsEntertainment: payload.vendorsStalls.stalls?.vendors?.entertainmentRequired,
            // },
            // accessoriesStalls: {
            //     hasVendor: payload.vendorsStalls.stalls?.vendors?.accessoriesAmount ? 'yes' : 'no',
            //     amount: payload.vendorsStalls.stalls?.vendors?.accessoriesAmount,
            //     pricePerStall: payload.vendorsStalls.stalls?.vendors?.accessoriesPrice,
            // },
            // artsAndCraftsStalls: {
            //     hasVendor: payload.vendorsStalls.stalls?.vendors?.artsCraftsAmount ? 'yes' : 'no',
            //     amount: payload.vendorsStalls.stalls?.vendors?.artsCraftsAmount,
            //     pricePerStall: payload.vendorsStalls.stalls?.vendors?.artsCraftsPrice,
            // },
            // vapeStalls: {
            //     hasVendor: payload.vendorsStalls.stalls?.vendors?.vapeAmount ? 'yes' : 'no',
            //     amount: payload.vendorsStalls.stalls?.vendors?.vapeAmount,
            //     pricePerStall: payload.vendorsStalls.stalls?.vendors?.vapePrice,
            // },
            // catering: {
            //     hasVendor: payload.vendorsStalls.catering?.vendor ? 'yes' : 'no',
            //     vendorName: payload.vendorsStalls.catering?.vendorName,
            // }
        });

        if (payload.vendorsStalls.catering?.items) {
          const cateringItems = this.eventForm.get('vendorsStalls.catering.items') as FormArray;
          payload.vendorsStalls.catering.items.forEach((item: any) => {
            cateringItems.push(this.createCateringItemFormGroup(item));
          });
        }
    }

    if (payload.staffingSupportDto?.staff?.members) {
      const membersArray = this.eventForm.get('staffingSupport.members') as FormArray;
      membersArray.clear();
      payload.staffingSupportDto.staff.members.forEach((member: any) => {
        membersArray.push(this.createStaffMember(member));
      });
    }
  }

  get staffMembers(): FormArray {
    return this.eventForm.get('staffingSupport.members') as FormArray;
  }

  createStaffMember(member: StaffMember | null = null): FormGroup {
    return this.fb.group({
      type: [member ? member.type : '', Validators.required],
      amount: [member ? member.amount : 0, [Validators.required, Validators.min(1)]]
    });
  }

  addStaffMember(member: StaffMember | null = null): void {
    this.staffMembers.push(this.createStaffMember(member));
  }

  removeStaffMember(index: number): void {
    this.staffMembers.removeAt(index);
  }

  createStallFormGroup(): FormGroup {
    return this.fb.group({
      hasVendor: [''],
      vendorName: [''],
      amount: [0],
      pricePerStall: [0],
      hasKidsEntertainment: [false],
      squareMeters: [0],
      setupDate: [''],
      setupTime: [''],
      strikeDownDate: [''],
      strikeDownTime: ['']
    });
  }

  createCateringFormGroup(): FormGroup {
    return this.fb.group({
      hasVendor: [''],
      vendorName: [''],
      items: this.fb.array([]),
      setupDate: [''],
      setupTime: [''],
      strikeDownDate: [''],
      strikeDownTime: ['']
    });
  }

  createCateringItemFormGroup(item: { description: string, area: string } | null = null): FormGroup {
    return this.fb.group({
      description: [item ? item.description : ''],
      area: [item ? item.area : '']
    });
  }

  get cateringItems(): FormArray {
    return this.eventForm.get('vendorsStalls.catering.items') as FormArray;
  }

  addCateringItem(item: { description: string, area: string } | null = null): void {
    this.cateringItems.push(this.createCateringItemFormGroup(item));
  }

  removeCateringItem(index: number): void {
    this.cateringItems.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.eventForm.value;
    const userId = this.authService.getCurrentUser()?._id;

    if (!userId) {
      console.error('User ID not found');
      this.isLoading = false;
      return;
    }

    if (this.isEdit && this.eventId) {
      const payload: UpdateEventRequest = {
        id: this.eventId,
        userId: userId,
        title: formValue.eventName,
        date: formValue.eventDate,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        eventDescription: formValue.eventDescription,
        city: formValue.city,
        expectedPeople: formValue.amountOfPeopleExpected,
        eventImageUrls: this.eventImageUrls,
        isEventVenue: formValue.hasEventVenue === 'yes',
        eventVenue: formValue.hasEventVenue === 'yes' ? formValue.eventVenue : '',
        requestTickets: formValue.requestTickets === 'yes',
        seatingArrangement: {
          isSeatedEvent: formValue.eventType.seatedEvent,
          isOpenAirEvent: formValue.eventType.openAirEvent,
          plotsForTents: formValue.eventType.plotForTents,
        },
        camping: {
          campingGlamping: {
            vendor: formValue.camping.hasVendor === 'yes',
            vendorName: formValue.camping.vendorName,
            campingTents: formValue.camping.campingTents,
            personsPerTent: formValue.camping.personsPerTent,
            campingDimensions: formValue.camping.campingDimensions,
            glampingTents: formValue.camping.glampingTents,
            glampingPersonsPerTent: formValue.camping.glampingPersonsPerTent,
            glampingDimensions: formValue.camping.glampingDimensions,
            additionalEquipment: formValue.camping.additionalEquipment,
          },
        },
        vendorsStalls: {
          foodStalls: {
            ...formValue.vendorsStalls.foodStalls,
            hasVendor: formValue.vendorsStalls.foodStalls.hasVendor === 'yes',
          },
          accessoriesStalls: {
            ...formValue.vendorsStalls.accessoriesStalls,
            hasVendor:
              formValue.vendorsStalls.accessoriesStalls.hasVendor === 'yes',
          },
          artsAndCraftsStalls: {
            ...formValue.vendorsStalls.artsAndCraftsStalls,
            hasVendor:
              formValue.vendorsStalls.artsAndCraftsStalls.hasVendor === 'yes',
          },
          vapeStalls: {
            ...formValue.vendorsStalls.vapeStalls,
            hasVendor: formValue.vendorsStalls.vapeStalls.hasVendor === 'yes',
          },
          catering: {
            ...formValue.vendorsStalls.catering,
            hasVendor: formValue.vendorsStalls.catering.hasVendor === 'yes',
          },
        },
        staffingSupportDto: {
          staff: {
            vendor: formValue.staffingSupport.hasVendor === 'yes',
            vendorName: formValue.staffingSupport.vendorName,
            members: formValue.staffingSupport.members,
          },
        },
        permissions: {
          eventApplication: { submitted: false },
          trafficApplication: { required: false, submissionIn: false },
          noiseExemption: { required: false },
          construction: { required: false, hasVendor: false },
        },
        infrastructure: {
          fencing: { vendor: false },
          scaffolding: { vendor: false },
          electricity: {
            generator: { vendor: false },
            electrician: { vendor: false },
          },
          seatingAndTables: { vendor: false },
          stageLightingSoundScreens: {
            stage: { vendor: false },
            lighting: { vendor: false },
            sound: { vendor: false },
            screens: { vendor: false },
          },
        },
        decoration: {
          decor: { vendor: false },
          lighting: { vendor: false },
          layout: { vendor: false },
          internet: { vendor: false },
          entertainment: { vendor: false },
        },
        sanitation: {
          toiletsAndShowers: {
            toilets: { vendor: false },
            showers: { vendor: false },
          },
          wasteAndCleaning: {
            wasteManagement: { vendor: false },
            cleaners: { vendor: false },
          },
        },
        safety: {
          security: { vendor: false },
          healthAndSafety: { vendor: false },
          medicalServices: { vendor: false },
          fireFighting: { vendor: false },
        },
        brandingPromotionDto: {
          printingAndBranding: { vendor: false },
          mediaAndSocialMedia: {
            socialMediaInfluencers: { influencer: false },
            radio: { vendor: false },
            tv: { vendor: false },
            printedMedia: { vendor: false },
          },
        },
        accreditationEntryDto: {
          wristBands: { vendor: false },
          stamps: { vendor: false },
        },
        beveragesBarServices: {
          cooldrinksAndAlcoholServices: {
            cooldrinks: { vendor: false },
            liquorLicense: { submitted: false },
            bar: { vendor: false },
            cellars: { vendor: false },
            breweries: { vendor: false },
          },
        },
      };

      this.eventService.updateEvent(this.eventId, payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating event:', error);
        },
      });
    } else {
      const payload: CreateEventRequest = {
        userId: userId,
        title: formValue.eventName,
        date: formValue.eventDate,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        eventDescription: formValue.eventDescription,
        city: formValue.city,
        expectedPeople: formValue.amountOfPeopleExpected,
        eventImageUrls: this.eventImageUrls,
        isEventVenue: formValue.hasEventVenue === 'yes',
        eventVenue: formValue.hasEventVenue === 'yes' ? formValue.eventVenue : '',
        requestTickets: formValue.requestTickets === 'yes',
        seatingArrangement: {
          isSeatedEvent: formValue.eventType.seatedEvent,
          isOpenAirEvent: formValue.eventType.openAirEvent,
          plotsForTents: formValue.eventType.plotForTents,
        },
        camping: {
          campingGlamping: {
            vendor: formValue.camping.hasVendor === 'yes',
            vendorName: formValue.camping.vendorName,
            campingTents: formValue.camping.campingTents,
            personsPerTent: formValue.camping.personsPerTent,
            campingDimensions: formValue.camping.campingDimensions,
            glampingTents: formValue.camping.glampingTents,
            glampingPersonsPerTent: formValue.camping.glampingPersonsPerTent,
            glampingDimensions: formValue.camping.glampingDimensions,
            additionalEquipment: formValue.camping.additionalEquipment,
          },
        },
        vendorsStalls: {
          foodStalls: {
            ...formValue.vendorsStalls.foodStalls,
            hasVendor: formValue.vendorsStalls.foodStalls.hasVendor === 'yes',
          },
          accessoriesStalls: {
            ...formValue.vendorsStalls.accessoriesStalls,
            hasVendor:
              formValue.vendorsStalls.accessoriesStalls.hasVendor === 'yes',
          },
          artsAndCraftsStalls: {
            ...formValue.vendorsStalls.artsAndCraftsStalls,
            hasVendor:
              formValue.vendorsStalls.artsAndCraftsStalls.hasVendor === 'yes',
          },
          vapeStalls: {
            ...formValue.vendorsStalls.vapeStalls,
            hasVendor: formValue.vendorsStalls.vapeStalls.hasVendor === 'yes',
          },
          catering: {
            ...formValue.vendorsStalls.catering,
            hasVendor: formValue.vendorsStalls.catering.hasVendor === 'yes',
          },
        },
        staffingSupportDto: {
          staff: {
            vendor: formValue.staffingSupport.hasVendor === 'yes',
            vendorName: formValue.staffingSupport.vendorName,
            members: formValue.staffingSupport.members,
          },
        },
        permissions: {
          eventApplication: { submitted: false },
          trafficApplication: { required: false, submissionIn: false },
          noiseExemption: { required: false },
          construction: { required: false, hasVendor: false },
        },
        infrastructure: {
          fencing: { vendor: false },
          scaffolding: { vendor: false },
          electricity: {
            generator: { vendor: false },
            electrician: { vendor: false },
          },
          seatingAndTables: { vendor: false },
          stageLightingSoundScreens: {
            stage: { vendor: false },
            lighting: { vendor: false },
            sound: { vendor: false },
            screens: { vendor: false },
          },
        },
        decoration: {
          decor: { vendor: false },
          lighting: { vendor: false },
          layout: { vendor: false },
          internet: { vendor: false },
          entertainment: { vendor: false },
        },
        sanitation: {
          toiletsAndShowers: {
            toilets: { vendor: false },
            showers: { vendor: false },
          },
          wasteAndCleaning: {
            wasteManagement: { vendor: false },
            cleaners: { vendor: false },
          },
        },
        safety: {
          security: { vendor: false },
          healthAndSafety: { vendor: false },
          medicalServices: { vendor: false },
          fireFighting: { vendor: false },
        },
        brandingPromotionDto: {
          printingAndBranding: { vendor: false },
          mediaAndSocialMedia: {
            socialMediaInfluencers: { influencer: false },
            radio: { vendor: false },
            tv: { vendor: false },
            printedMedia: { vendor: false },
          },
        },
        accreditationEntryDto: {
          wristBands: { vendor: false },
          stamps: { vendor: false },
        },
        beveragesBarServices: {
          cooldrinksAndAlcoholServices: {
            cooldrinks: { vendor: false },
            liquorLicense: { submitted: false },
            bar: { vendor: false },
            cellars: { vendor: false },
            breweries: { vendor: false },
          },
        },
      };

      this.eventService.createEvent(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating event:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/events']);
  }

  get pageTitle(): string {
    return this.isEdit ? 'Edit Event' : 'Add New Event';
  }
}