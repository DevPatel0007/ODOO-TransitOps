export interface LorryReceipt {
  id: string;
  lrDate: string;
  consignor: {
    name: string;
    city: string;
    gstin: string;
    address: string;
  };
  consignee: {
    name: string;
    city: string;
    gstin: string;
    address: string;
  };
  goodsDescription: string;
  packagingType: string;
  quantity: number;
  actualWeight?: number;
  chargedWeight?: number;
  actualWeightKg?: number;
  chargedWeightKg?: number;
  remarks?: string;
  gstAmount?: number;
  deliveryMethod: 'DOOR_DELIVERY' | 'STATION_DELIVERY';
  freightAmount: number;
  hamaliCharges: number;
  biltyCharges: number;
  otherCharges: number;
  paymentType: 'TO_PAY' | 'PAID' | 'TBB';
  gstPaidBy: 'CONSIGNOR' | 'CONSIGNEE' | 'TRANSPORTER_RCM';
  totalFreightBill: number;
  status: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNo?: string;
  transportAgentName?: string;
}

const defaultLRs: LorryReceipt[] = [
  {
    id: 'LR-GJ-2026-1001',
    lrDate: 'Jul 11, 2026',
    consignor: {
      name: 'Morbi Elegant Ceramics LLP',
      city: 'Morbi, Gujarat',
      gstin: '24AAECM8920C1ZA',
      address: 'Lakhdhirpur Road, National Highway 8-A'
    },
    consignee: {
      name: 'Ahmedabad Pharma Manufacturing Hub',
      city: 'Ahmedabad, Gujarat',
      gstin: '24AAACA2941P2ZN',
      address: 'Changodar Industrial Area, Sanand Bypass'
    },
    goodsDescription: 'Premium Vitrified Ceramic Tiles (Morbi Brand)',
    packagingType: 'Pallets',
    quantity: 20,
    actualWeight: 14000,
    chargedWeight: 14500,
    actualWeightKg: 14000,
    chargedWeightKg: 14500,
    remarks: 'Fragile ceramic shipment. Handle with care.',
    gstAmount: 6120,
    deliveryMethod: 'DOOR_DELIVERY',
    freightAmount: 32000,
    hamaliCharges: 1500,
    biltyCharges: 150,
    otherCharges: 400,
    paymentType: 'TO_PAY',
    gstPaidBy: 'CONSIGNEE',
    totalFreightBill: 34050,
    status: 'IN_TRANSIT',
    driverId: 'd1',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    vehicleNo: 'MH-12-AB-1234',
    transportAgentName: 'Milap Patel'
  }
];

export function getSharedLRs(): LorryReceipt[] {
  const stored = localStorage.getItem('lorry_receipts');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('lorry_receipts', JSON.stringify(defaultLRs));
  return defaultLRs;
}

export function saveSharedLRs(newLRs: LorryReceipt[]): void {
  localStorage.setItem('lorry_receipts', JSON.stringify(newLRs));
  window.dispatchEvent(new Event('storage_lrs_update'));
}
