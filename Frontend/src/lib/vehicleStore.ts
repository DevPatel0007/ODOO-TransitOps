import { SharedVehicle } from '../data';
import { getVehicles, createVehicle, assignDriverToVehicle } from './api';

let vehicles: SharedVehicle[] = [];

export type { SharedVehicle };

export async function getSharedVehicles(): Promise<SharedVehicle[]> {
  try {
    const response = await getVehicles();
    vehicles = response.vehicles;
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    window.dispatchEvent(new Event('axisfleet_vehicles_update'));
    return vehicles;
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    // Fallback to localStorage if API fails
    const stored = localStorage.getItem('vehicles');
    if (stored) {
      vehicles = JSON.parse(stored);
    }
    return vehicles;
  }
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
