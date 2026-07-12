import { SharedVehicle } from '../data';
import { getVehicles, createVehicle, assignDriverToVehicle } from './api';

let vehicles: SharedVehicle[] = [];
let vehiclesLoadPromise: Promise<SharedVehicle[]> | null = null;

export type { SharedVehicle };

export async function getSharedVehicles(): Promise<SharedVehicle[]> {
  if (vehicles.length > 0) return vehicles;
  if (vehiclesLoadPromise) return vehiclesLoadPromise;

  const stored = localStorage.getItem('vehicles');
  if (stored) {
    try {
      vehicles = JSON.parse(stored);
    } catch {
      vehicles = [];
    }
  }

  try {
    vehiclesLoadPromise = getVehicles()
      .then((response) => {
        vehicles = response.vehicles;
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        window.dispatchEvent(new Event('axisfleet_vehicles_update'));
        return vehicles;
      })
      .catch((error) => {
        console.error('Failed to fetch vehicles:', error);
        return vehicles;
      })
      .finally(() => {
        vehiclesLoadPromise = null;
      });

    return vehiclesLoadPromise;
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return vehicles;
  }
}

export function getSharedVehiclesSnapshot(): SharedVehicle[] {
  if (vehicles.length > 0) return vehicles;
  const stored = localStorage.getItem('vehicles');
  if (!stored) return vehicles;
  try {
    vehicles = JSON.parse(stored);
  } catch {
    vehicles = [];
  }
  return vehicles;
}

export async function saveSharedVehicles(newVehicles: SharedVehicle[]): Promise<void> {
  vehicles = newVehicles;
  localStorage.setItem('vehicles', JSON.stringify(newVehicles));
  window.dispatchEvent(new Event('axisfleet_vehicles_update'));
}

export async function addSharedVehicle(vehicleData: {
  numberPlate: string;
  type: string;
  capacity: string;
  insuranceExpiry: string;
  nextServiceDueDate?: string;
}): Promise<SharedVehicle> {
  try {
    const response = await createVehicle(vehicleData);
    await getSharedVehicles(); // Refresh the list
    return response.vehicle;
  } catch (error) {
    console.error('Failed to create vehicle:', error);
    throw error;
  }
}

export async function assignDriver(vehicleId: string, driverId: string): Promise<{ message: string; vehicleId: string; driverId: string }> {
  try {
    const response = await assignDriverToVehicle(vehicleId, driverId);
    await getSharedVehicles(); // Refresh the list
    return response;
  } catch (error) {
    console.error('Failed to assign driver:', error);
    throw error;
  }
}
