import { mockDrivers, SharedDriver } from '../data';

export type { SharedDriver };

let drivers = [...mockDrivers];

export function getSharedDrivers(): SharedDriver[] {
  const stored = localStorage.getItem('drivers');
  if (stored) {
    drivers = JSON.parse(stored);
  } else {
    localStorage.setItem('drivers', JSON.stringify(drivers));
  }
  return drivers;
}

export function saveSharedDrivers(newDrivers: SharedDriver[]): void {
  drivers = newDrivers;
  localStorage.setItem('drivers', JSON.stringify(newDrivers));
  window.dispatchEvent(new Event('axisfleet_drivers_update'));
}
