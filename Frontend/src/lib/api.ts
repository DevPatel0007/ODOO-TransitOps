import { Driver, Vehicle, Trip, User } from './types';

// Base URL for backend API, configurable via Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const AUTH_TOKEN_KEY = 'transitops_access_token';
const AUTH_USER_KEY = 'transitops_user';

// Ensure cookies (e.g., refresh token) are sent with requests
const FETCH_OPTIONS = { credentials: 'include' as RequestCredentials };

export function getStoredAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: { user: User; accessToken: string }) {
  localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function buildHeaders(additionalHeaders?: HeadersInit) {
  const headers = new Headers(additionalHeaders);
  const token = getStoredAccessToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// Auth API functions
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CLIENT';
}): Promise<{ user: User; accessToken: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function loginUser(email: string, password: string): Promise<{ user: User; accessToken: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  await handleResponse(response);
}

// Vehicles API functions
export async function getVehicles(): Promise<{ vehicles: Vehicle[] }> {
  const response = await fetch(`${API_BASE_URL}/fleet/vehicles`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function createVehicle(vehicleData: {
  numberPlate: string;
  type: string;
  capacity: string;
  insuranceExpiry: string;
  nextServiceDueDate?: string;
}): Promise<{ vehicle: Vehicle }> {
  const response = await fetch(`${API_BASE_URL}/fleet/vehicles`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(vehicleData),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function assignDriverToVehicle(vehicleId: string, driverId: string): Promise<{ message: string; vehicleId: string; driverId: string }> {
  const response = await fetch(`${API_BASE_URL}/fleet/vehicles/${vehicleId}/assign-driver`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ driverId }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function getAvailableDrivers(): Promise<{ drivers: Driver[] }> {
  const response = await fetch(`${API_BASE_URL}/fleet/drivers/available`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function getAllDrivers(): Promise<{ drivers: Driver[] }> {
  const response = await fetch(`${API_BASE_URL}/fleet/drivers`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

// Trips API functions
export async function createTrip(tripData: {
  source: string;
  destination: string;
  client: string;
  revenue: string;
  driverId?: string;
  vehicleId?: string;
}): Promise<{ trip: Trip }> {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(tripData),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function updateTripStatus(tripId: string, status: Trip['status']): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/status`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function getAllTrips(): Promise<{ trips: Trip[] }> {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

// Receipts API functions
export async function getAllReceipts(): Promise<{ receipts: any[] }> {
  const response = await fetch(`${API_BASE_URL}/receipts`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function createReceipt(receiptData: any): Promise<{ receipt: any }> {
  const response = await fetch(`${API_BASE_URL}/receipts`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(receiptData),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

export async function getReceiptPdf(receiptId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/pdf`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }
  return response.blob();
}

// Telemetry API functions
export async function getTelemetry(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/telemetry`, {
    method: 'GET',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    ...FETCH_OPTIONS,
  });
  return handleResponse(response);
}

// Health check
export async function healthCheck(): Promise<any> {
  const response = await fetch('http://localhost:4000/health', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
}
