export interface VendorOnboardingData {
  _id: string;
  userId: string;
  __v: number;
  createdAt: Date;
  isOnboardingComplete: boolean;
  onboardingStep: number;
  service: Service[];
  supportingDoc: SupportingDocument[];
  updatedAt: Date;
  showCase: ShowCase;
}

interface Service {
  mainCategoryId: string;
  subCategories: SubCategory[];
  imageUrls: string[];
}

interface SubCategory {
  subCategoryId: string;
  isActive: boolean;
}

export interface SupportingDocument {
    _id: string;
  title: string;
  documentUrl: string;
  verificationStatus: string;
}

interface ShowCase {
  imageUrl: string;
  videoUrl: string;
}
