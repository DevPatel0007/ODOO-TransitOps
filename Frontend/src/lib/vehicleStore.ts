import { mockVehicles, SharedVehicle } from '../data';

export type { SharedVehicle };

let vehicles = [...mockVehicles];

export function getSharedVehicles(): SharedVehicle[] {
  const stored = localStorage.getItem('vehicles');
  if (stored) {
    vehicles = JSON.parse(stored);
  } else {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }
  return vehicles;
}

export function saveSharedVehicles(newVehicles: SharedVehicle[]): void {
  vehicles = newVehicles;
  localStorage.setItem('vehicles', JSON.stringify(newVehicles));
  window.dispatchEvent(new Event('axisfleet_vehicles_update'));
}
