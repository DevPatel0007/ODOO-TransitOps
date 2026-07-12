export interface SharedExpense {
  id: string;
  driverId: string;
  driverName?: string;
  vehiclePlate?: string;
  type: 'FUEL' | 'TOLL' | 'ADVANCE' | 'MAINTENANCE' | 'OTHER';
  amount: number;
  tripId: string;
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISPUTED';
  date: string;
}

const defaultExpenses: SharedExpense[] = [
  {
    id: 'exp1',
    driverId: 'd1',
    driverName: 'Rajesh Kumar',
    vehiclePlate: 'MH-12-AB-1234',
    type: 'FUEL',
    amount: 12000,
    tripId: 't1',
    description: 'Diesel refuel at Highway HP Pump',
    attachmentUrl: 'refuel_slip_123.pdf',
    attachmentName: 'refuel_slip_123.pdf',
    status: 'APPROVED',
    date: '2026-07-11'
  },
  {
    id: 'exp2',
    driverId: 'd2',
    driverName: 'Amit Singh',
    vehiclePlate: 'HR-55-XY-5678',
    type: 'TOLL',
    amount: 3500,
    tripId: 't2',
    description: 'Fastag automatic recharge for NH48 tolls',
    attachmentUrl: 'toll_receipt_456.pdf',
    attachmentName: 'toll_receipt_456.pdf',
    status: 'APPROVED',
    date: '2026-07-12'
  },
  {
    id: 'exp3',
    driverId: 'd1',
    driverName: 'Rajesh Kumar',
    vehiclePlate: 'MH-12-AB-1234',
    type: 'MAINTENANCE',
    amount: 4500,
    tripId: 't1',
    description: 'Minor engine coolant refill and checks',
    attachmentUrl: 'coolant_slip.pdf',
    attachmentName: 'coolant_slip.pdf',
    status: 'PENDING',
    date: '2026-07-12'
  }
];

export function getSharedExpenses(): SharedExpense[] {
  const stored = localStorage.getItem('expenses');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('expenses', JSON.stringify(defaultExpenses));
  return defaultExpenses;
}

export function saveSharedExpenses(newExpenses: SharedExpense[]): void {
  localStorage.setItem('expenses', JSON.stringify(newExpenses));
  window.dispatchEvent(new Event('storage_expenses_update'));
}
