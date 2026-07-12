export type UserRole = 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  licenseNumber: string
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE'
  rating: number | string
  assignedVehicleId?: string | null
  userId?: string | null
  createdAt?: string
}

export interface Vehicle {
  id: string
  numberPlate: string
  type: string
  capacity: string
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE'
  insuranceExpiry: string
  nextServiceDueDate?: string | null
  assignedDriverId?: string | null
  createdAt?: string
}

export interface Trip {
  id: string
  source: string
  destination: string
  client: string
  driverId?: string | null
  vehicleId?: string | null
  status: 'PLANNING' | 'ASSIGNED' | 'STARTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  startTime?: string | null
  endTime?: string | null
  distanceKm?: number | null
  revenue: number | string
  fuelBudget?: number | string | null
  tollBudget?: number | string | null
  otherBudget?: number | string | null
  createdAt?: string
  expenses?: {
    fuel?: number
    toll?: number
    other?: number
  }
}
