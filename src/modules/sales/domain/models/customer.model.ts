export interface CustomerData {
  dni: string;
  fullName: string;
}

export interface DniLookupResult {
  success: boolean;
  fullName: string | null;
  error?: string;
}
