import { User, Vehicle } from '@/types';

export const currentUser: User = {
  name: 'Jan Kowalski',
  initials: 'JK',
};

export const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    brand: 'Toyota',
    model: 'Corolla 1.8',
    registrationNumber: 'WA 8823K',
    year: 2021,
    color: 'Srebrny',
    vin: 'SB1K...7834',
    ocStatus: 'Aktywne',
    imageUrl: null,
  },
  {
    id: 'vehicle-2',
    brand: 'Ford',
    model: 'Focus ST',
    registrationNumber: 'KR 1234A',
    year: 2019,
    color: 'Niebieski',
    vin: 'WF0K...9123',
    ocStatus: 'Aktywne',
    imageUrl: null,
  }
];