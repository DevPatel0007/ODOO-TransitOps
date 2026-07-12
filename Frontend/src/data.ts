import { Driver, Vehicle, Trip, User } from './types';
export type { Driver, Vehicle, Trip, User, SharedDriver, SharedVehicle, SharedTrip } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alok Sharma', email: 'alok@tms.com', role: 'ADMIN' },
  { id: '2', name: 'Rajesh Kumar', email: 'rajesh@tms.com', role: 'DRIVER' },
  { id: '3', name: 'Amit Singh', email: 'amit@client.com', role: 'CLIENT' },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Rajesh Kumar', phone: '+91 98765 43210', licenseNumber: 'DL-1234567890', status: 'ON_TRIP', rating: 4.8 },
  { id: 'd2', name: 'Suresh Pal', phone: '+91 98765 43211', licenseNumber: 'DL-0987654321', status: 'AVAILABLE', rating: 4.5 },
  { id: 'd3', name: 'Vikram Singh', phone: '+91 98765 43212', licenseNumber: 'DL-5555555555', status: 'OFFLINE', rating: 4.2 },
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', numberPlate: 'MH-12-AB-1234', type: '12 Wheeler Truck', capacity: '20 Tons', status: 'ON_TRIP', insuranceExpiry: '2026-12-31' },
  { id: 'v2', numberPlate: 'HR-55-XY-5678', type: 'Container', capacity: '15 Tons', status: 'AVAILABLE', insuranceExpiry: '2026-08-15' },
  { id: 'v3', numberPlate: 'DL-01-PQ-9012', type: 'Pickup Van', capacity: '3 Tons', status: 'MAINTENANCE', insuranceExpiry: '2026-05-20' },
];

export const mockTrips: Trip[] = [
  {
    id: 'T1001',
    source: 'Mumbai',
    destination: 'Delhi',
    client: 'Reliance Retail',
    driverId: 'd1',
    vehicleId: 'v1',
    status: 'IN_TRANSIT',
    startTime: '2026-05-26T10:00:00Z',
    revenue: 45000,
    expenses: { fuel: 12000, toll: 2500, other: 500 }
  },
  {
    id: 'T1002',
    source: 'Bangalore',
    destination: 'Chennai',
    client: 'Amazon India',
    status: 'PLANNING',
    revenue: 15000,
    expenses: { fuel: 0, toll: 0, other: 0 }
  },
  {
    id: 'T1003',
    source: 'Pune',
    destination: 'Mumbai',
    client: 'Tata Motors',
    driverId: 'd2',
    vehicleId: 'v2',
    status: 'DELIVERED',
    startTime: '2026-05-25T08:00:00Z',
    endTime: '2026-05-25T14:00:00Z',
    revenue: 8000,
    expenses: { fuel: 2000, toll: 400, other: 100 }
  }
];
