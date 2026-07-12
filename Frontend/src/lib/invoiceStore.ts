export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  tripId: string;
  clientName: string;
  clientBilling: {
    company: string;
    gstin: string;
    address: string;
    city: string;
    email: string;
  };
  route: {
    source: string;
    destination: string;
  };
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paymentTerms: string;
  notes?: string;
  items: InvoiceItem[];
}

const defaultInvoices: Invoice[] = [
  {
    id: 'INV-2026-1001',
    tripId: 't1',
    clientName: 'Reliance Retail',
    clientBilling: {
      company: 'Reliance Retail Ltd (Logistics Div)',
      gstin: '27AAACR1209M1ZX',
      address: 'Reliance Corporate Park, Thane-Belapur Road',
      city: 'Navi Mumbai, MH - 400701',
      email: 'logistics.billing@reliance.com'
    },
    route: {
      source: 'Delhi Hub',
      destination: 'Mumbai Depot'
    },
    issueDate: 'Jul 11, 2026',
    dueDate: 'Aug 10, 2026',
    subtotal: 30500,
    taxRate: 18,
    taxAmount: 5490,
    totalAmount: 35990,
    amountPaid: 35990,
    status: 'PAID',
    paymentTerms: 'NET 30',
    notes: 'Automated logistical clearance invoice generated upon delivery verification.',
    items: [
      { description: 'F-01: Base Freight Charges (Delhi Hub to Mumbai Depot)', quantity: 1, rate: 25000, amount: 25000 },
      { description: 'F-02: Diesel Fuel Surcharge Allocation', quantity: 1, rate: 4500, amount: 4500 },
      { description: 'F-03: Express Expressway toll plaza reimbursement', quantity: 1, rate: 1000, amount: 1000 }
    ]
  },
  {
    id: 'INV-2026-1002',
    tripId: 't2',
    clientName: 'Amazon India',
    clientBilling: {
      company: 'Amazon Seller Services Private Ltd',
      gstin: '29AAACA1294F1ZA',
      address: 'Brigade Gateway, 8th Floor, Dr. Rajkumar Road',
      city: 'Bangalore, KA - 560055',
      email: 'in-fin-billing@amazon.com'
    },
    route: {
      source: 'Gurugram Warehouse',
      destination: 'Bengaluru Facility'
    },
    issueDate: 'Jul 12, 2026',
    dueDate: 'Aug 11, 2026',
    subtotal: 52000,
    taxRate: 18,
    taxAmount: 9360,
    totalAmount: 61360,
    amountPaid: 0,
    status: 'PENDING',
    paymentTerms: 'NET 30',
    notes: 'Freight manifest contract under review by vendor finance team.',
    items: [
      { description: 'F-01: Base Freight Charges (Gurugram Warehouse to Bengaluru Facility)', quantity: 1, rate: 40000, amount: 40000 },
      { description: 'F-02: Diesel Fuel Surcharge Allocation', quantity: 1, rate: 10000, amount: 10000 },
      { description: 'F-03: Express Expressway toll plaza reimbursement', quantity: 1, rate: 2000, amount: 2000 }
    ]
  }
];

export function getSharedInvoices(): Invoice[] {
  const stored = localStorage.getItem('invoices');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('invoices', JSON.stringify(defaultInvoices));
  return defaultInvoices;
}

export function saveSharedInvoices(newInvoices: Invoice[]): void {
  localStorage.setItem('invoices', JSON.stringify(newInvoices));
  window.dispatchEvent(new Event('storage_invoices_update'));
}
