import { mockTrips, SharedTrip } from '../data';

export type { SharedTrip };

let trips = [...mockTrips];

export function getSharedTrips(): any[] {
  const stored = localStorage.getItem('trips');
  if (stored) {
    trips = JSON.parse(stored);
  } else {
    localStorage.setItem('trips', JSON.stringify(trips));
  }
  return trips;
}

export function saveSharedTrips(newTrips: any[]): void {
  trips = newTrips;
  localStorage.setItem('trips', JSON.stringify(newTrips));
  window.dispatchEvent(new Event('axisfleet_trips_update'));
}
