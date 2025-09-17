export interface ServiceId {
  $oid: string;
}

export interface LeafCategory {
  name: string;
  type: string;
  _id: ServiceId;
}

export interface SubCategory {
  name: string;
  type: string;
  leafCategories: LeafCategory[];
  _id: ServiceId;
}

export interface Service {
  _id: ServiceId;
  name: string;
  type: string;
  subCategories: SubCategory[];
  __v?: number;
}

export interface CreateServiceRequest {
  name: string;
  type: string;
  subCategories: Omit<SubCategory, '_id'>[];
}

export interface UpdateServiceRequest {
  _id: ServiceId;
  name: string;
  type: string;
  subCategories: SubCategory[]; // Keep full SubCategory with _id for updates
}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
}