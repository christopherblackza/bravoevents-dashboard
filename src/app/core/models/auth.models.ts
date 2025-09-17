export interface User {
  createdAt: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  availableRoles: string[];
  emailVerified: boolean;
  onboardingStep: number;
  __v: number;
  status: string;
  isOnboardingComplete: boolean;
  otp: string | null;
  imageUrl: string;
  businessEmail: string;
  businessName: string;
  businessPhoneNumber: number;
  location: string;
  logoUrl: string;
  ownerName: string;
  socialMediaUrl: string;
  verificationStatus: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}