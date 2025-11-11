

export interface TicketInfo {
  typeOfTickets: string;
  amount: string | number;
  avaibleTickets: string | number;
}

export interface Permissions {
  eventApplication: {
    submitted: boolean;
  };
  trafficApplication: {
    required: boolean;
    submissionIn?: boolean;
  };
  noiseExemption: {
    required: boolean;
  };
  construction: {
    required: boolean;
    hasVendor?: boolean;
  };
}

export interface Infrastructure {
  fencing: {
    vendor: boolean;
  };
  scaffolding: {
    vendor: boolean;
  };
  electricity: {
    generator: {
      vendor: boolean;
    };
    electrician: {
      vendor: boolean;
    };
  };
  seatingAndTables: {
    vendor: boolean;
  };
  stageLightingSoundScreens: {
    stage: {
      vendor: boolean;
    };
    lighting: {
      vendor: boolean;
    };
    sound: {
      vendor: boolean;
    };
    screens: {
      vendor: boolean;
    };
  };
}

export interface Decoration {
  decor: {
    vendor: boolean;
  };
  lighting: {
    vendor: boolean;
  };
  layout: {
    vendor: boolean;
  };
  internet: {
    vendor: boolean;
  };
  entertainment: {
    vendor: boolean;
  };
}

export interface Sanitation {
  toiletsAndShowers: {
    toilets: {
      vendor: boolean;
    };
    showers: {
      vendor: boolean;
    };
  };
  wasteAndCleaning: {
    wasteManagement: {
      vendor: boolean;
    };
    cleaners: {
      vendor: boolean;
    };
  };
}

export interface SafetyService {
  mainCategoryId?: string;
  subCategoryId?: string;
  leafCategoryId?: string;
  vendor: boolean;
  vendorName?: string;
  planFileUrl?: string;
  riskAssessmentRequired?: boolean;
}

export interface Safety {
  security: SafetyService;
  healthAndSafety: SafetyService;
  medicalServices: SafetyService;
  fireFighting: SafetyService;
}

export interface Camping {
  campingGlamping: {
    vendor: boolean;
    vendorName: string;
    campingTents?: number;
    personsPerTent?: number;
    campingDimensions?: string;
    glampingTents?: number;
    glampingPersonsPerTent?: number;
    glampingDimensions?: string;
    additionalEquipment?: string;
  };
}

export interface Stall {
  hasVendor: boolean;
  vendorName?: string;
  amount?: number;
  pricePerStall?: number;
  hasKidsEntertainment?: boolean;
  squareMeters?: number;
  setupDate?: Date;
  setupTime?: string;
  strikeDownDate?: Date;
  strikeDownTime?: string;
}

export interface CateringItem {
  description: string;
  area: string;
}

export interface Catering {
  hasVendor: boolean;
  vendorName?: string;
  items?: CateringItem[];
  setupDate?: Date;
  setupTime?: string;
  strikeDownDate?: Date;
  strikeDownTime?: string;
}

export interface VendorsStalls {
  foodStalls: Stall;
  accessoriesStalls: Stall;
  artsAndCraftsStalls: Stall;
  vapeStalls: Stall;
  catering: Catering;
}

export interface BeveragesBarServices {
  cooldrinksAndAlcoholServices: {
    cooldrinks: {
      vendor: boolean;
    };
    liquorLicense: {
      submitted: boolean;
    };
    bar: {
      vendor: boolean;
      quotesRequested?: boolean;
    };
    cellars: {
      vendor: boolean;
    };
    breweries: {
      vendor: boolean;
    };
  };
}

export interface BrandingPromotion {
  printingAndBranding: {
    vendor: boolean;
  };
  mediaAndSocialMedia: {
    socialMediaInfluencers: {
      influencer: boolean;
      packageIncluded?: boolean;
    };
    radio: {
      vendor: boolean;
      socialMediaRequest?: boolean;
    };
    tv: {
      vendor: boolean;
    };
    printedMedia: {
      vendor: boolean;
    };
  };
}

export interface AccreditationEntry {
  wristBands: {
    vendor: boolean;
  };
  stamps: {
    vendor: boolean;
  };
}

export interface StaffMember {
  type: string;
  amount: number;
}

export interface StaffingSupport {
  staff: {
    vendor: boolean;
    vendorName?: string;
    members?: StaffMember[];
  };
}

export interface SeatingArrangement {
  isSeatedEvent: boolean;
  isOpenAirEvent: boolean;
  plotsForTents: boolean;
}

export interface EventType {
  _id: string;
  label: string;
}

export interface Event {
  _id: string;
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  eventTypeId?: EventType;
  expectedPeople?: number;
  city?: string;
  eventLogo?: string;
  requestTickets: boolean;
  ticketLink?: string;
  isEventVenue: boolean;
  eventVenue?: string;
  eventImageUrls: string[];
  eventDescription: string;
  paymentStatus: string;
  permissions: Permissions;
  infrastructure: Infrastructure;
  decoration: Decoration;
  sanitation?: Sanitation;
  safety?: Safety;
  camping?: Camping;
  vendorsStalls?: VendorsStalls;
  beveragesBarServices?: BeveragesBarServices;
  brandingPromotionDto?: BrandingPromotion;
  accreditationEntryDto?: AccreditationEntry;
  staffingSupportDto?: StaffingSupport;
  seatingArrangement?: SeatingArrangement;
  followers: any[];
  __v?: number;
}

export interface CreateEventRequest {
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  typeOfEvent?: string;
  expectedPeople?: number;
  city?: string;
  eventLogo?: string;
  requestTickets: boolean;
  isEventVenue: boolean;
  eventVenue?: string;
  eventImageUrls: string[];
  eventDescription: string;
  permissions: Permissions;
  infrastructure: Infrastructure;
  decoration: Decoration;
  sanitation: Sanitation;
  safety: Safety;
  camping: Camping;
  vendorsStalls: VendorsStalls;
  beveragesBarServices: BeveragesBarServices;
  brandingPromotionDto: BrandingPromotion;
  accreditationEntryDto: AccreditationEntry;
  staffingSupportDto: StaffingSupport;
  seatingArrangement: SeatingArrangement;
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventResponse {
  success: boolean;
  data: Event | Event[] | null;
  message: string;
}