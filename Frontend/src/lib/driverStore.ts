import { SharedDriver } from '../data';
import { getAllDrivers } from './api';

let drivers: SharedDriver[] = [];
let driversLoadPromise: Promise<SharedDriver[]> | null = null;

export type { SharedDriver };

export async function getSharedDrivers(): Promise<SharedDriver[]> {
  if (drivers.length > 0) return drivers;
  if (driversLoadPromise) return driversLoadPromise;

  const stored = localStorage.getItem('drivers');
  if (stored) {
    try {
      drivers = JSON.parse(stored);
    } catch {
      drivers = [];
    }
  }

  try {
    driversLoadPromise = getAllDrivers()
      .then((response) => {
        drivers = response.drivers;
        localStorage.setItem('drivers', JSON.stringify(drivers));
        window.dispatchEvent(new Event('axisfleet_drivers_update'));
        return drivers;
      })
      .catch((error) => {
        console.error('Failed to fetch drivers:', error);
        return drivers;
      })
      .finally(() => {
        driversLoadPromise = null;
      });

    return driversLoadPromise;
  } catch (error) {
    console.error('Failed to fetch drivers:', error);
    return drivers;
  }
}

export function getSharedDriversSnapshot(): SharedDriver[] {
  if (drivers.length > 0) return drivers;
  const stored = localStorage.getItem('drivers');
  if (!stored) return drivers;
  try {
    drivers = JSON.parse(stored);
  } catch {
    drivers = [];
  }
  return drivers;
}

export async function saveSharedDrivers(newDrivers: SharedDriver[]): Promise<void> {
  drivers = newDrivers;
  localStorage.setItem('drivers', JSON.stringify(newDrivers));
  window.dispatchEvent(new Event('axisfleet_drivers_update'));
}
