export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'vendor';
  availableRoles: string[];
  emailVerified: boolean;
  onboardingStep: number;
  status: 'active' | 'suspended' | 'banned';
  isOnboardingComplete: boolean;
  otp?: string | null;
  imageUrl?: string;
  businessEmail?: string;
  businessName?: string;
  businessPhoneNumber?: number;
  location?: string;
  logoUrl?: string;
  ownerName?: string;
  socialMediaUrl?: string;
  categories?: {
    id: string;
    name: string;
    subCategories: string[];
    _id: string;
  }[];
  __v?: number;
}
