export interface UserDocument {
  id: string;
  name: string;
  type: 'identity' | 'proof_of_address' | 'business_license' | 'other';
  uploadDate: Date;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
}

export interface DocumentsResponse {
  documents: UserDocument[];
  totalCount: number;
}