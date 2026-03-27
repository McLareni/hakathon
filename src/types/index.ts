// src/types/index.ts

export interface User {
  name: string;
  initials: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registrationNumber: string;
  year: number;
  color: string;
  vin: string;
  ocStatus: 'Aktywne' | 'Nieaktywne';
  imageUrl: string | null;
}