export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
export type TripStatus = 'PLANNING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
export type UserRole = 'ADMIN' | 'DRIVER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  rating: number;
  [key: string]: any;
}

export interface Vehicle {
  id: string;
  numberPlate: string;
  type: string;
  capacity: string;
  status: VehicleStatus;
  insuranceExpiry: string;
  [key: string]: any;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  client: string;
  driverId?: string;
  vehicleId?: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  revenue: number;
  expenses: {
    fuel: number;
    toll: number;
    other: number;
  };
  [key: string]: any;
}

export type SharedDriver = Driver;
export type SharedVehicle = Vehicle;
export type SharedTrip = Trip;