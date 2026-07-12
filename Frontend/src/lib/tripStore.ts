import { SharedTrip, Trip } from '../data';
import { getAllTrips, createTrip, updateTripStatus } from './api';

let trips: SharedTrip[] = [];
let tripsLoadPromise: Promise<SharedTrip[]> | null = null;

export type { SharedTrip };

export async function getSharedTrips(): Promise<SharedTrip[]> {
  if (trips.length > 0) return trips;
  if (tripsLoadPromise) return tripsLoadPromise;

  const stored = localStorage.getItem('trips');
  if (stored) {
    try {
      trips = JSON.parse(stored);
    } catch {
      trips = [];
    }
  }

  try {
    tripsLoadPromise = getAllTrips()
      .then((response) => {
        trips = response.trips;
        localStorage.setItem('trips', JSON.stringify(trips));
        window.dispatchEvent(new Event('axisfleet_trips_update'));
        return trips;
      })
      .catch((error) => {
        console.error('Failed to fetch trips:', error);
        return trips;
      })
      .finally(() => {
        tripsLoadPromise = null;
      });

    return tripsLoadPromise;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return trips;
  }
}

export function getSharedTripsSnapshot(): SharedTrip[] {
  if (trips.length > 0) return trips;
  const stored = localStorage.getItem('trips');
  if (!stored) return trips;
  try {
    trips = JSON.parse(stored);
  } catch {
    trips = [];
  }
  return trips;
}

export async function saveSharedTrips(newTrips: SharedTrip[]): Promise<void> {
  trips = newTrips;
  localStorage.setItem('trips', JSON.stringify(newTrips));
  window.dispatchEvent(new Event('axisfleet_trips_update'));
}

export async function addSharedTrip(tripData: {
  source: string;
  destination: string;
  client: string;
  revenue: string;
  driverId?: string;
  vehicleId?: string;
}): Promise<SharedTrip> {
  try {
    const response = await createTrip(tripData);
    await getSharedTrips(); // Refresh the list
    return response.trip;
  } catch (error) {
    console.error('Failed to create trip:', error);
    throw error;
  }
}

export async function updateSharedTripStatus(tripId: string, status: Trip['status']): Promise<{ message: string }> {
  try {
    const response = await updateTripStatus(tripId, status);
    await getSharedTrips(); // Refresh the list
    return response;
  } catch (error) {
    console.error('Failed to update trip status:', error);
    throw error;
  }
}
