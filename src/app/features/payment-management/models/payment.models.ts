export interface PaymentTransaction {
  Date: string;
  Type: string;
  Sign: string;
  Party: string;
  Name: string;
  Description: string | null;
  Currency: string;
  "Funding Type": string;
  Gross: number;
  Fee: number;
  Net: number;
  Balance: number | null;
  "M Payment ID": string;
  "PF Payment ID": number;
  custom_str1: string | null;
  custom_int1: number | null;
  custom_str2: string | null;
  custom_int2: number | null;
  custom_str3: string | null;
  custom_str4: string | null;
  custom_str5: string | null;
  custom_int3: number | null;
  custom_int4: number | null;
  custom_int5: number | null;
}

export interface PaymentResponse {
  success: boolean;
  data: PaymentTransaction[];
  message?: string;
}

export interface PaymentStats {
  totalTransactions: number;
  totalRevenue: number;
  totalFees: number;
  totalNet: number;
  currency: string;
}