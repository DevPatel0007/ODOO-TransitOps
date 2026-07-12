export interface SharedDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
  rating: number;
  experienceYrs: number;
  medicallyCheck?: 'COMPLIANT' | 'EXPIRED';
  bgVerified?: boolean;
  emergencyContact: string;
  tripsLogged: number;
  assignedVehicleNo?: string;
}

export interface SharedVehicle {
  id: string;
  numberPlate: string;
  type: string;
  capacity: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  insuranceExpiry: string;
  frontLeftTireWear: number;
  frontRightTireWear: number;
  rearLeftTireWear: number;
  rearRightTireWear: number;
  lastTireChangeDate: string;
  tirePressurePsi: number;
  lastServiceDate: string;
  nextServiceDueDate: string;
  serviceCompletedTasks: string[];
  assignedDriverId?: string;
}

export interface SharedTrip {
  id: string;
  source: string;
  destination: string;
  client: string;
  driverId?: string;
  vehicleId?: string;
  status: 'IN_TRANSIT' | 'PLANNING' | 'DELIVERED';
  startTime?: string;
  endTime?: string;
  revenue?: number;
  expenses?: { fuel: number; toll: number; other: number };
  cargoValue?: string;
  loadType?: string;
}

export const mockDrivers: SharedDriver[] = [
  {
    id: 'd1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    licenseNumber: 'DL-1420180099223',
    status: 'ON_TRIP',
    rating: 4.8,
    experienceYrs: 8,
    medicallyCheck: 'COMPLIANT',
    bgVerified: true,
    emergencyContact: '+91 98765 43219 (Wife)',
    tripsLogged: 142,
    assignedVehicleNo: 'MH-12-AB-1234'
  },
  {
    id: 'd2',
    name: 'Amit Singh',
    phone: '+91 87654 32109',
    licenseNumber: 'MH-1220150088334',
    status: 'AVAILABLE',
    rating: 4.9,
    experienceYrs: 5,
    medicallyCheck: 'COMPLIANT',
    bgVerified: true,
    emergencyContact: '+91 87654 32100 (Brother)',
    tripsLogged: 95,
    assignedVehicleNo: 'HR-55-XY-5678'
  },
  {
    id: 'd3',
    name: 'Vijay Yadav',
    phone: '+91 76543 21098',
    licenseNumber: 'HR-5520190077445',
    status: 'OFFLINE',
    rating: 4.5,
    experienceYrs: 3,
    medicallyCheck: 'EXPIRED',
    bgVerified: true,
    emergencyContact: '+91 76543 21000 (Father)',
    tripsLogged: 48,
    assignedVehicleNo: undefined
  }
];

export const mockVehicles: SharedVehicle[] = [
  { 
    id: 'v1', 
    numberPlate: 'MH-12-AB-1234', 
    type: '12-Wheeler Heavy Duty Truck', 
    capacity: '20 Tons', 
    status: 'ON_TRIP', 
    insuranceExpiry: '2026-12-31',
    frontLeftTireWear: 82,
    frontRightTireWear: 85,
    rearLeftTireWear: 71,
    rearRightTireWear: 75,
    lastTireChangeDate: 'Jan 12, 2026',
    tirePressurePsi: 110,
    lastServiceDate: 'Apr 10, 2026',
    nextServiceDueDate: 'Oct 15, 2026',
    serviceCompletedTasks: ['Mobil Engine Oil Flush', 'Brake pad recalibrated', 'Inbound coolant refresh'],
    assignedDriverId: 'd1'
  },
  { 
    id: 'v2', 
    numberPlate: 'HR-55-XY-5678', 
    type: 'Interstate Cargo Container', 
    capacity: '15 Tons', 
    status: 'AVAILABLE', 
    insuranceExpiry: '2026-08-15',
    frontLeftTireWear: 94,
    frontRightTireWear: 95,
    rearLeftTireWear: 91,
    rearRightTireWear: 91,
    lastTireChangeDate: 'Apr 02, 2026',
    tirePressurePsi: 115,
    lastServiceDate: 'May 16, 2026',
    nextServiceDueDate: 'Nov 16, 2026',
    serviceCompletedTasks: ['Automatic Gearbox alignment', 'Air cabin filter swap'],
    assignedDriverId: 'd2'
  },
  { 
    id: 'v3', 
    numberPlate: 'DL-01-PQ-9012', 
    type: 'Logistics Courier Pickup', 
    capacity: '3 Tons', 
    status: 'MAINTENANCE', 
    insuranceExpiry: '2026-05-20',
    frontLeftTireWear: 42,
    frontRightTireWear: 45,
    rearLeftTireWear: 38,
    rearRightTireWear: 39,
    lastTireChangeDate: 'Jun 14, 2025',
    tirePressurePsi: 95,
    lastServiceDate: 'Nov 10, 2025',
    nextServiceDueDate: 'May 10, 2026',
    serviceCompletedTasks: ['Rear leaf spring recalibrated', 'Tachometer calibration'],
    assignedDriverId: undefined
  }
];

export const mockTrips: SharedTrip[] = [
  {
    id: 't1',
    source: 'Delhi Hub',
    destination: 'Mumbai Depot',
    client: 'Reliance Retail',
    driverId: 'd1',
    vehicleId: 'v1',
    status: 'IN_TRANSIT',
    startTime: '2026-07-11T08:00:00Z',
    revenue: 45000,
    expenses: { fuel: 15000, toll: 3500, other: 1500 },
    cargoValue: '₹85 Lakhs',
    loadType: 'FMCG Goods'
  },
  {
    id: 't2',
    source: 'Gurugram Warehouse',
    destination: 'Bengaluru Facility',
    client: 'Amazon India',
    driverId: 'd2',
    vehicleId: 'v2',
    status: 'PLANNING',
    startTime: '2026-07-13T10:00:00Z',
    revenue: 65000,
    expenses: { fuel: 20000, toll: 5000, other: 2000 },
    cargoValue: '₹45 Lakhs',
    loadType: 'Industrial Spares'
  },
  {
    id: 't3',
    source: 'Pune Plant',
    destination: 'Chennai Port',
    client: 'Tata Motors',
    status: 'DELIVERED',
    startTime: '2026-07-09T06:00:00Z',
    endTime: '2026-07-10T18:00:00Z',
    revenue: 48000,
    expenses: { fuel: 12000, toll: 4000, other: 1000 },
    cargoValue: '₹12 Lakhs',
    loadType: 'Automotive Aggregates'
  }
];
