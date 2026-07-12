import { SharedDriver } from '../data';
import { getAllDrivers } from './api';

let drivers: SharedDriver[] = [];

export type { SharedDriver };

export async function getSharedDrivers(): Promise<SharedDriver[]> {
  try {
    const response = await getAllDrivers();
    drivers = response.drivers;
    localStorage.setItem('drivers', JSON.stringify(drivers));
    window.dispatchEvent(new Event('axisfleet_drivers_update'));
    return drivers;
  } catch (error) {
    console.error('Failed to fetch drivers:', error);
    // Fallback to localStorage if API fails
    const stored = localStorage.getItem('drivers');
    if (stored) {
      drivers = JSON.parse(stored);
    }
    return drivers;
  }
}

export async function saveSharedDrivers(newDrivers: SharedDriver[]): Promise<void> {
  drivers = newDrivers;
  localStorage.setItem('drivers', JSON.stringify(newDrivers));
  window.dispatchEvent(new Event('axisfleet_drivers_update'));
}
