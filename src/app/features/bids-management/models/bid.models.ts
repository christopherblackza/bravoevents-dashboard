export interface ServiceBid {
  _id: string;
  eventId: string;
  mainCategoryId: string;
  subCategoryId: string;
  vendorId: string;
  eventCoordinatorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  price: number | null;
  rating: number | null;
  imageUrl: string[];
  bidType: 'service' | 'product';
  payment_status: 'pending' | 'paid' | 'failed';
  paymentReference: string;
  paidBy: 'coordinator' | 'vendor';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ServiceBidResponse {
  data: ServiceBid[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BidStats {
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
  completedBids: number;
  averageRating: number;
  totalRevenue: number;
}