/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Truck, 
  Printer, 
  Download, 
  Calendar, 
  Scale, 
  Layers, 
  Building, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  BadgeCheck, 
  Clock, 
  Coins, 
  HelpCircle, 
  CheckCircle2, 
  Compass, 
  Briefcase, 
  Trash2, 
  FileCheck, 
  Sparkles,
  MapPin,
  Flame,
  FileBox,
  Copy
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getSharedLRs, saveSharedLRs, LorryReceipt } from '@/src/lib/lrStore';
import { addNotification } from '@/src/lib/notificationStore';

// Common industrial presets for Indian-Gujarat transshipment centers
const PRESET_CONSIGNORS = [
  { name: 'Morbi Elegant Ceramics LLP', city: 'Morbi, Gujarat', gstin: '24AAECM8920C1ZA', address: 'Lakhdhirpur Road, National Highway 8-A' },
  { name: 'Surat Mega-Tex Fabric Mills', city: 'Surat, Gujarat', gstin: '24AAACT8090F2ZX', address: 'Bhatar Road Industrial Zone' },
  { name: 'Vapi Organics & Chemicals Ltd', city: 'Vapi, Gujarat', gstin: '24AAACV1294K1ZM', address: 'GIDC Industrial Estate, Phase III' },
  { name: 'Arvind Denim Mills GRP', city: 'Ahmedabad, Gujarat', gstin: '24AAACA1102A1ZH', address: 'Naroda Road Logistics Gate 4' },
  { name: 'Jamnagar Brass Forging Ltd', city: 'Jamnagar, Gujarat', gstin: '24AAACJ9911D1ZQ', address: 'Udhyognagar GIDC Plot #292' },
  { name: 'Ankleshwar Synthetics Corp', city: 'Ankleshwar, Gujarat', gstin: '24AAACS9019J1ZA', address: 'Jalalpore Crossing Bypass Rd' }
];

const PRESET_CONSIGNEES = [
  { name: 'Ahmedabad Pharma Manufacturing Hub', city: 'Ahmedabad, Gujarat', gstin: '24AAACA2941P2ZN', address: 'Changodar Industrial Area, Sanand Bypass' },
  { name: 'Rajkot Garment Weavers Association', city: 'Rajkot, Gujarat', gstin: '24AAACR8820B1ZI', address: 'Aji GIDC Estate phase II' },
  { name: 'Baroda Heavy Machinery Hub LLP', city: 'Vadodara, Gujarat', gstin: '24AAACB1029M1ZF', address: 'Makarpura GIDC Sector 1' },
  { name: 'Mehsana Dairy Processing Hub', city: 'Mehsana, Gujarat', gstin: '24AAACM1209R1ZP', address: 'Mehsana Highway Bypass Junction' },
  { name: 'Surat textile Hub Traders', city: 'Surat, Gujarat', gstin: '24AAACT8012E1ZZ', address: 'Ring Road New Saree Market B-4' }
];

import { getSharedDrivers, getSharedDriversSnapshot, SharedDriver } from '@/src/lib/driverStore';

export default function LorryReceipts() {
  const [lrList, setLrList] = useState<LorryReceipt[]>([]);
  const [driversList, setDriversList] = useState<SharedDriver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New LR Creation Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [consignorIndex, setConsignorIndex] = useState('0');
  const [consigneeIndex, setConsigneeIndex] = useState('0');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [goodsDescription, setGoodsDescription] = useState('Premium Vitrified Ceramic Tiles (Morbi Brand)');
  const [packagingType, setPackagingType] = useState('Pallets');
  const [quantity, setQuantity] = useState('20');
  const [actualWeight, setActualWeight] = useState('14000');
  const [chargedWeight, setChargedWeight] = useState('14500');
  const [deliveryMethod, setDeliveryMethod] = useState<'DOOR_DELIVERY' | 'STATION_DELIVERY'>('DOOR_DELIVERY');

  // Freight Pricing Section
  const [freightAmount, setFreightAmount] = useState('32000');
  const [hamaliCharges, setHamaliCharges] = useState('1500');
  const [biltyCharges, setBiltyCharges] = useState('150');
  const [otherCharges, setOtherCharges] = useState('400');
  const [paymentType, setPaymentType] = useState<'TO_PAY' | 'PAID' | 'TBB'>('TO_PAY');
  const [gstPaidBy, setGstPaidBy] = useState<'CONSIGNOR' | 'CONSIGNEE' | 'TRANSPORTER_RCM'>('CONSIGNEE');

  // Selected LR for Indian carbon digital print modal
  const [selectedLR, setSelectedLR] = useState<LorryReceipt | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeCarbonTab, setActiveCarbonTab] = useState<'CONSIGNOR' | 'CONSIGNEE' | 'DRIVER'>('CONSIGNOR');

  // Load and sync storage
  useEffect(() => {
    setLrList(getSharedLRs());
    setDriversList(getSharedDriversSnapshot());
    void getSharedDrivers().then(setDriversList).catch(console.error);

    const handleSync = () => {
      setLrList(getSharedLRs());
    };
    const handleDriversSync = () => {
      setDriversList(getSharedDriversSnapshot());
    };

    window.addEventListener('storage_lrs_update', handleSync);
    window.addEventListener('axisfleet_drivers_update', handleDriversSync);

    return () => {
      window.removeEventListener('storage_lrs_update', handleSync);
      window.removeEventListener('axisfleet_drivers_update', handleDriversSync);
    };
  }, []);

  // Update default selectedDriverId once drivers list is populated
  useEffect(() => {
    if (driversList.length > 0 && !selectedDriverId) {
      setSelectedDriverId(driversList[0].id);
    }
  }, [driversList, selectedDriverId]);

  // Set default form values dynamically when dropdowns toggle
  const handleConsignorChange = (idx: string) => {
    setConsignorIndex(idx);
    // Suggest packaging/goods based on consignor chosen
    const name = PRESET_CONSIGNORS[parseInt(idx)].name;
    if (name.includes('Ceramics')) {
      setGoodsDescription('Polished Vitrified Glazed Tiles (Size 600x600mm)');
      setPackagingType('Pallets');
    } else if (name.includes('Fabric') || name.includes('Denim')) {
      setGoodsDescription('Denim Fabric Textiles Rolls (Indigo Dye)');
      setPackagingType('Rolls');
    } else if (name.includes('Chemicals') || name.includes('Organics')) {
      setGoodsDescription('Hazardous Organic Synthesis Diluter Raw-Compound');
      setPackagingType('Drums');
    } else if (name.includes('Brass')) {
      setGoodsDescription('Brass Forging Thread Valves & Extruded Screws');
      setPackagingType('Boxes');
    } else if (name.includes('Synthetics')) {
      setGoodsDescription('Texturised Polyester Filament Yarn Bales');
      setPackagingType('Bales');
    }
  };

  const handleCreateLR = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedConsignor = PRESET_CONSIGNORS[parseInt(consignorIndex)];
    const selectedConsigee = PRESET_CONSIGNEES[parseInt(consigneeIndex)];
    
    // Resolve dynamic driver
    const activeDriver = driversList.find(d => d.id === selectedDriverId) || {
       name: 'Unassigned Captain',
       phone: '+91 99999 99999',
       assignedVehicleNo: 'No Plate Assigned'
    };

    const fAmt = parseFloat(freightAmount) || 0;
    const hAmt = parseFloat(hamaliCharges) || 0;
    const bAmt = parseFloat(biltyCharges) || 150;
    const oAmt = parseFloat(otherCharges) || 0;

    // Dynamic calculations
    const ledgerSum = fAmt + hAmt + bAmt + oAmt;
    const isRcm = gstPaidBy === 'TRANSPORTER_RCM';
    const gstAmount = isRcm ? 0 : Math.round(ledgerSum * 0.18);
    const totalFreightBill = ledgerSum + gstAmount;

    const newLR: LorryReceipt = {
      id: `LR-GJ-${2026}-${1000 + lrList.length + Math.floor(Math.random() * 500)}`,
      lrDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      vehicleNo: activeDriver.assignedVehicleNo || 'No Plate Assigned',
      driverName: activeDriver.name,
      driverPhone: activeDriver.phone,
      consignor: selectedConsignor,
      consignee: selectedConsigee,
      goodsDescription,
      packagingType,
      quantity: parseInt(quantity) || 1,
      actualWeightKg: parseFloat(actualWeight) || 0,
      chargedWeightKg: parseFloat(chargedWeight) || 0,
      deliveryMethod: deliveryMethod as any,
      
      freightAmount: fAmt,
      hamaliCharges: hAmt,
      biltyCharges: bAmt,
      otherCharges: oAmt,
      gstPaidBy,
      gstAmount,
      totalFreightBill,
      paymentType,
      status: 'PENDING_DISPATCH',
      transportAgentName: 'Sardar Patel Cargo Roadlines',
      remarks: 'Consignment generated via logiflow central counter billing office.'
    };

    const updated = [newLR, ...lrList];
    setLrList(updated);
    saveSharedLRs(updated);

    // Register active real-time notification
    addNotification({
      title: 'New Lorry Receipt Issued',
      message: `${newLR.id} processed for ${newLR.consignor.name.split(' ')[0]} to ${newLR.consignee.name.split(' ')[0]} carrying ${newLR.goodsDescription || 'General Cargo'}.`,
      category: 'LR',
      type: 'success'
    });

    toast.success('Lorry Receipt Created (Bilty Dispatch Active)!', {
      description: `Transit Code ${newLR.id} issued directly to Captain ${activeDriver.name}.`
    });

    // Reset default form values
    setGoodsDescription('');
    setIsFormOpen(false);
  };

  const handleUpdateStatus = (id: string, nextStatus: LorryReceipt['status']) => {
    const updated = lrList.map(item => {
      if (item.id === id) {
        toast.info(`Bilty ${id} Transformed`, {
          description: `LR Transit state changed to: ${nextStatus.replace(/_/g, ' ')}`
        });
        return { ...item, status: nextStatus };
      }
      return item;
    });
    setLrList(updated);
    saveSharedLRs(updated);
  };

  const handleDeleteLR = (id: string) => {
    const updated = lrList.filter(item => item.id !== id);
    setLrList(updated);
    saveSharedLRs(updated);
    toast.error(`LR ${id} Form Dropped`, {
      description: 'Lorry consignment deleted from ledger.'
    });
  };

  // Indian layout action triggers
  const handlePretendPrint = () => {
    toast.success('Bilty printing job queued!', {
      description: `Spooling ${activeCarbonTab} COPY onto local physical thermal matric card.`
    });
  };

  const handlePretendDownload = () => {
    toast.success('PDF metadata loaded', {
      description: `Lorry Receipt Copy issued in high-res design format.`
    });
  };

  // Derived math
  const totalBiltyProcessed = lrList.length;
  const transitWeightMetricTons = lrList.reduce((sum, item) => sum + item.chargedWeightKg, 0) / 1000;
  const pendingToPayCollection = lrList
    .filter(item => item.paymentType === 'TO_PAY' && item.status !== 'DELIVERED')
    .reduce((sum, item) => sum + item.totalFreightBill, 0);
  const activeDispatchSurcharge = lrList.filter(item => item.status === 'IN_TRANSIT').length;

  // Filter calculations
  const cleanSearch = searchTerm.toLowerCase();
  const filteredLRs = lrList.filter(item => {
    const matchesKeyword = 
      item.id.toLowerCase().includes(cleanSearch) ||
      item.vehicleNo.toLowerCase().includes(cleanSearch) ||
      item.driverName.toLowerCase().includes(cleanSearch) ||
      item.consignor.name.toLowerCase().includes(cleanSearch) ||
      item.consignee.name.toLowerCase().includes(cleanSearch) ||
      item.goodsDescription.toLowerCase().includes(cleanSearch);

    const matchesCity = cityFilter === 'ALL' || 
                        item.consignor.city.includes(cityFilter) || 
                        item.consignee.city.includes(cityFilter);

    const matchesPayment = paymentFilter === 'ALL' || item.paymentType === paymentFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesKeyword && matchesCity && matchesPayment && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Gujarat Heavy Road Transit Branding Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase">
              Gujarat Highway Carrier Council
            </Badge>
            <span className="text-xs text-slate-400 font-bold">• RTO Authorized Bilty Copy (Form-38)</span>
          </div>
          <h2 className="text-3xl font-black text-[#01091a] tracking-tight">Lorry Receipts (LR Hub)</h2>
          <p className="text-sm text-[#64748B] font-medium max-w-3xl leading-relaxed">
            Generate and manage legal transportation <strong>Lorry Receipts (LR / Bilty)</strong>. Perfectly configured for Morbi Ceramics, Surat Textiles, Vapi industrial chemical dispatch routes under Indian GST laws and RCM bylaws.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger render={
            <Button className="bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/10 text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all shrink-0 border-none">
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Issue New Lorry Bilty
            </Button>
          } />
          <DialogContent className="sm:max-w-[650px] rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Sparkles className="text-amber-500 w-5 h-5" /> Issue Legal Transporter Lorry Receipt
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLR} className="space-y-5 py-2 text-sm leading-relaxed">
              
              {/* Origin Consignor and Destination Consignee selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Gujarat Consignor (Sender)</Label>
                  <Select value={consignorIndex} onValueChange={handleConsignorChange}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Consignor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_CONSIGNORS.map((c, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{c.name} ({c.city})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Consignee (Receiver)</Label>
                  <Select value={consigneeIndex} onValueChange={setConsigneeIndex}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Consignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_CONSIGNEES.map((c, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{c.name} ({c.city})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goods details parameters */}
              <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl space-y-3">
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider leading-none">Consignment Commodity Specifications</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-semibold text-slate-500">Describe Goods (Commodity)</Label>
                    <Input 
                      value={goodsDescription} 
                      onChange={e => setGoodsDescription(e.target.value)} 
                      required 
                      className="h-10 border-slate-200 font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-slate-500">Packaging Unit</Label>
                    <Input 
                      placeholder="e.g. Pallets / Rolls" 
                      value={packagingType} 
                      onChange={e => setPackagingType(e.target.value)} 
                      required 
                      className="h-10 border-slate-200 font-bold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-slate-500">Total Pkgs Qty</Label>
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={e => setQuantity(e.target.value)} 
                      required 
                      className="h-10 border-slate-200 font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-slate-500">Actual Wt (Kgs)</Label>
                    <Input 
                      type="number" 
                      value={actualWeight} 
                      onChange={e => setActualWeight(e.target.value)} 
                      required 
                      className="h-10 border-slate-200 font-mono font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-slate-500">Charged Wt (Kgs)</Label>
                    <Input 
                      type="number" 
                      value={chargedWeight} 
                      onChange={e => setChargedWeight(e.target.value)} 
                      required 
                      className="h-10 border-slate-200 font-mono font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-slate-500">Delivery Class</Label>
                    <Select value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
                      <SelectTrigger className="h-10 border-slate-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOOR_DELIVERY">Door Delv</SelectItem>
                        <SelectItem value="STATION_DELIVERY">Station/Hub</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Driver and Vehicle Preset associations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.55">
                  <Label className="text-xs font-bold uppercase text-slate-500">Assigned Driver & Vehicle (GJ RTO Plate)</Label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Select carrier engine" />
                    </SelectTrigger>
                    <SelectContent>
                      {driversList.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.assignedVehicleNo || 'No vehicle'})
                        </SelectItem>
                      ))}
                      {driversList.length === 0 && (
                        <SelectItem value="NONE_EMPTY" disabled>No drivers registered in agency!</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">LR payment terms (Indian standard)</Label>
                  <Select value={paymentType} onValueChange={(val: any) => setPaymentType(val)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-black text-amber-800">
                      <SelectValue placeholder="Billing category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TO_PAY">TO PAY (Cash on Destination Delivery)</SelectItem>
                      <SelectItem value="PAID">PAIDSTAMP (Cleared en-route booking counter)</SelectItem>
                      <SelectItem value="TBB">TBB (To Be Billed - Contract Acc Ledger)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Pricing break up matrix */}
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-none">Freight & Charge Allocations (₹ INR)</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Base Freight</Label>
                    <Input 
                      type="number" 
                      value={freightAmount} 
                      onChange={e => setFreightAmount(e.target.value)} 
                      className="h-10 border-slate-200 font-bold font-mono text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Labor/Hamali</Label>
                    <Input 
                      type="number" 
                      value={hamaliCharges} 
                      onChange={e => setHamaliCharges(e.target.value)} 
                      className="h-10 border-slate-200 font-bold font-mono text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Lorry Receipt Preparation</Label>
                    <Input 
                      type="number" 
                      value={biltyCharges} 
                      disabled
                      className="h-10 border-slate-200 font-bold font-mono text-xs bg-slate-100" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Misc Surcharges</Label>
                    <Input 
                      type="number" 
                      value={otherCharges} 
                      onChange={e => setOtherCharges(e.target.value)} 
                      className="h-10 border-slate-200 font-bold font-mono text-xs" 
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">GST Responsibility under India RTO Laws</Label>
                  <Select value={gstPaidBy} onValueChange={(val: any) => setGstPaidBy(val)}>
                    <SelectTrigger className="h-9 border-slate-200 text-xs font-bold">
                      <SelectValue placeholder="GST Payer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSIGNEE">Paid by Consignee (Receiver handles 18% GST clearance)</SelectItem>
                      <SelectItem value="CONSIGNOR">Paid by Consignor (Sender pays GST directly)</SelectItem>
                      <SelectItem value="TRANSPORTER_RCM">Transporter RCM (Reverse Charge Matrix under section 9(3))</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Publish Legitimate Lorry Receipt</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Localized Gujarat Carrier Stat Grid Map */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active LRs Issued', value: `${totalBiltyProcessed} Bilties`, detail: 'Formal RTO dispatches', color: 'amber', icon: FileText },
          { label: 'Freight Cargo In-Transit', value: `${transitWeightMetricTons.toFixed(1)} MT`, detail: 'Vitrified tiles & denim weight', color: 'indigo', icon: Scale },
          { label: 'Outstanding "To Pay"', value: `₹${pendingToPayCollection.toLocaleString('en-IN')}`, detail: 'Due at Saurashtra/Kutch hubs', color: 'green', icon: Coins },
          { label: 'Active Trucks on Road', value: `${activeDispatchSurcharge} Cargo Rigs`, detail: 'GJ-01/03/05/12 routes active', color: 'purple', icon: Truck },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
              <stat.icon className={cn(
                "w-4 h-4",
                stat.color === 'amber' && "text-amber-500",
                stat.color === 'indigo' && "text-indigo-500",
                stat.color === 'green' && "text-emerald-500 animate-pulse",
                stat.color === 'purple' && "text-purple-500",
              )} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Filtration Desk */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          
          {/* Preset City hub filtration selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 select-none">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select 
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            >
              <option value="ALL">All Gujarat Hubs</option>
              <option value="Morbi">Morbi Tiles Node</option>
              <option value="Surat">Surat Textiles Port</option>
              <option value="Ahmedabad">Ahmedabad Hub</option>
              <option value="Rajkot">Rajkot Engineering Bay</option>
              <option value="Jamnagar">Jamnagar Brass sector</option>
              <option value="Vapi">Vapi Chemicals zone</option>
              <option value="Gandhidham">Gandhidham Port Link</option>
            </select>
          </div>

          {/* Payment category selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 select-none">
            <Coins className="w-3.5 h-3.5 text-slate-400" />
            <select 
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">All Payment Methods</option>
              <option value="TO_PAY">TO PAY (Saurashtra Cash)</option>
              <option value="PAID">PAID Bilty</option>
              <option value="TBB">TBB Contract Account</option>
            </select>
          </div>

          {/* Status Tabs pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-100 rounded-lg select-none">
            {([
              { id: 'ALL', label: 'All Transit' },
              { id: 'PENDING_DISPATCH', label: 'Queued' },
              { id: 'IN_TRANSIT', label: 'Transit' },
              { id: 'ARRIVED_AT_HUB', label: 'Arrived' },
              { id: 'DELIVERED', label: 'Delivered' }
            ] as const).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "text-[10px] font-black uppercase px-2.5 py-1.5 rounded transition-colors border-none",
                  statusFilter === tab.id 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Searching bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search Bilty LR, Driver name, GJ Plate..." 
            className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Primary Lorry Receipt ledger grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400 pl-6">LR Number / Date</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Consignor → Consignee</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Goods Description / Qty</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">RTO Truck No</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Freight Cost</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Billing Stamp</TableHead>
              <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Transit Code</TableHead>
              <TableHead className="h-12 text-right uppercase text-[10px] font-black tracking-wider text-slate-400 pr-6">Controls Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredLRs.map((lr) => (
                <TableRow key={lr.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors h-16">
                  
                  {/* LR ID & Date */}
                  <TableCell className="pl-6 font-sans">
                    <span className="font-mono font-black text-xs text-amber-600 block">{lr.id}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{lr.lrDate}</span>
                  </TableCell>

                  {/* Consignor to Consignee arrow routing */}
                  <TableCell>
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-none">{lr.consignor.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1 uppercase">
                        <span>{lr.consignor.city.split(',')[0]}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-500 font-black">{lr.consignee.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Cargo weights and actual load counts */}
                  <TableCell>
                    <p className="text-xs font-bold text-indigo-950 truncate max-w-[200px]">{lr.goodsDescription}</p>
                    <span className="text-[10px] font-mono font-black text-slate-400 block mt-1">
                      {lr.quantity} {lr.packagingType} • {(lr.chargedWeightKg / 1000).toFixed(1)} MT Charged
                    </span>
                  </TableCell>

                  {/* Truck No & Driver mapping */}
                  <TableCell className="font-sans">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10.5px] font-mono font-black text-slate-700 uppercase">
                      {lr.vehicleNo}
                    </code>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">{lr.driverName.split(' ')[0]}</span>
                  </TableCell>

                  {/* Calculated bill sum */}
                  <TableCell className="font-mono text-xs font-black text-slate-900 text-left">
                    ₹{lr.totalFreightBill.toLocaleString('en-IN')}
                  </TableCell>

                  {/* Payment Type stamp badge */}
                  <TableCell>
                    <Badge 
                      className={cn(
                        "border-none shadow-none font-black text-[9.5px] py-0.5 px-2 uppercase tracking-wide",
                        lr.paymentType === 'PAID' && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        lr.paymentType === 'TO_PAY' && "bg-rose-50 text-rose-700 hover:bg-rose-100",
                        lr.paymentType === 'TBB' && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      )}
                    >
                      {lr.paymentType.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  {/* Lorry Receipt Transit status */}
                  <TableCell>
                    <Badge 
                      className={cn(
                        "border-none shadow-none font-black text-[9px] py-0.5 px-2 uppercase tracking-wide",
                        lr.status === 'DELIVERED' && "bg-slate-100 text-slate-600",
                        lr.status === 'ARRIVED_AT_HUB' && "bg-sky-50 text-sky-700",
                        lr.status === 'IN_TRANSIT' && "bg-blue-50 text-blue-700 animate-pulse",
                        lr.status === 'PENDING_DISPATCH' && "bg-amber-50 text-amber-700"
                      )}
                    >
                      {lr.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>

                  {/* Action Trigger keys */}
                  <TableCell className="text-right pr-6 space-x-1 font-sans">
                    <Button 
                      size="xs" 
                      variant="outline"
                      onClick={() => {
                        setSelectedLR(lr);
                        setIsViewerOpen(true);
                        setActiveCarbonTab('CONSIGNOR'); // reset copy
                      }}
                      className="border-amber-200 text-amber-800 hover:text-amber-950 font-extrabold text-[10px] h-7.5 bg-amber-50/20"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> View/Print Bilty
                    </Button>

                    <Select 
                      value={lr.status} 
                      onValueChange={(val: any) => handleUpdateStatus(lr.id, val)}
                    >
                      <SelectTrigger className="inline-flex w-24 h-7.5 border-slate-200 text-[10px] font-bold rounded-lg bg-white">
                        <SelectValue placeholder="Dispatch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING_DISPATCH">Queued</SelectItem>
                        <SelectItem value="IN_TRANSIT">Transit</SelectItem>
                        <SelectItem value="ARRIVED_AT_HUB">Arrived</SelectItem>
                        <SelectItem value="DELIVERED">✓ Recv</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      size="xs" 
                      variant="ghost"
                      onClick={() => handleDeleteLR(lr.id)}
                      className="text-slate-300 hover:text-red-500 h-8 w-8 px-0 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>

                </TableRow>
              ))}
            </AnimatePresence>

            {filteredLRs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <FileBox className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="font-extrabold text-slate-800 text-sm">No Lorry Receipts Match</p>
                    <p className="text-xs text-slate-400 font-medium">Reset search keywords or expand cities filters parameters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Traditional Indian Lorry Receipt (Bilty) Carbon Copy Digital Viewer Sheet */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-[700px] !rounded-3xl p-0 overflow-hidden bg-slate-50">
          
          {selectedLR && (
            <div className="space-y-0 text-slate-850 font-sans">
              
              {/* Traditional Colored Carbon Copy Selector header */}
              <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block">Indian Transit Clearance</span>
                  <h3 className="text-sm font-black text-white">Three-Copy Bilty Document Desk</h3>
                </div>
                
                {/* Traditional Carbon Sheet simulation buttons */}
                <div className="flex gap-1 bg-slate-850 p-1 rounded-xl border border-slate-800 select-none">
                  {[
                    { id: 'CONSIGNOR', label: 'Consignor Copy', tone: 'bg-amber-500/15 text-amber-300 hover:text-amber-200 border-amber-500/40' },
                    { id: 'CONSIGNEE', label: 'Consignee Copy', tone: 'bg-sky-500/15 text-sky-300 hover:text-sky-200 border-sky-500/40' },
                    { id: 'DRIVER', label: 'Driver Copy', tone: 'bg-emerald-500/15 text-emerald-300 hover:text-emerald-200 border-emerald-500/40' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveCarbonTab(tab.id as any)}
                      className={cn(
                        "text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all",
                        activeCarbonTab === tab.id 
                          ? "bg-white text-slate-950 border-white shadow-sm font-black" 
                          : "text-slate-400 border-transparent hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* simulated Carbon paper border box */}
              <div className="p-6">
                
                <div className={cn(
                  "p-6 rounded-2xl shadow-inner relative border-2 transition-all duration-300 bg-white leading-relaxed",
                  activeCarbonTab === 'CONSIGNOR' && "border-amber-400 bg-amber-50/5 text-amber-950",
                  activeCarbonTab === 'CONSIGNEE' && "border-sky-400 bg-sky-50/5 text-sky-950",
                  activeCarbonTab === 'DRIVER' && "border-emerald-400 bg-emerald-50/5 text-emerald-950",
                )}>
                  
                  {/* Decorative Vintage Indian Transport Header */}
                  <div className="border-b-2 border-dashed border-slate-300 pb-4 text-center relative">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 block pb-1">॥ श्री गणेशाय नमः ॥</span>
                    <div className="absolute top-2 left-2 uppercase text-[7.5px] font-black border border-slate-400 px-1 rounded-sm tracking-tighter">
                      Form No. 38 RTO
                    </div>
                    
                    {/* Bilty watermark or Stamp */}
                    <div className="absolute top-1 right-2 text-right">
                      <span className={cn(
                        "text-[11px] font-mono font-black uppercase border px-2 py-0.5 rounded rotate-12 inline-block shadow-sm",
                        activeCarbonTab === 'CONSIGNOR' && "border-amber-500 text-amber-600 bg-amber-50/80",
                        activeCarbonTab === 'CONSIGNEE' && "border-sky-500 text-sky-600 bg-sky-50/80",
                        activeCarbonTab === 'DRIVER' && "border-emerald-500 text-emerald-600 bg-emerald-50/80"
                      )}>
                        {activeCarbonTab} COPY
                      </span>
                    </div>

                    <h4 className="text-xl font-black tracking-tight text-slate-900 leading-none uppercase">SARDAR PATEL CARGO ROADLINES</h4>
                    <p className="text-[9.5px] font-bold text-slate-500 mt-1 max-w-md mx-auto block leading-relaxed">
                      Morbi-Surat-Gandhidham Direct Express Route Carriers • GIDC Logistics Yard, Block D, Ahmedabad<br />
                      M: +91 94261-00102 • E: dispatch@sardarpatelroadlines.in • GSTIN: 24AAACL1941N1ZY
                    </p>
                  </div>

                  {/* Primary specifications block */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs text-slate-700">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Lorry Receipt Key</p>
                      <p className="font-mono font-black text-slate-900 text-base">{selectedLR.id}</p>
                    </div>
                    <div className="text-right space-y-1 leading-tight">
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">LR Issue Date</p>
                      <p className="font-mono font-black text-slate-900">{selectedLR.lrDate}</p>
                      <p className="text-[9.5px] text-slate-400">Owner&apos;s Risk Insurance Declared</p>
                    </div>
                  </div>

                  {/* Consignor Consignee detail layout */}
                  <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-100 text-xs">
                    <div className="space-y-1">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">CONSIGNOR (SENDER SIGN)</span>
                      <p className="font-black text-slate-800 text-sm leading-none">{selectedLR.consignor.name}</p>
                      <p className="text-slate-500 text-[10.5px] leading-tight font-medium mt-1">
                        {selectedLR.consignor.address}<br />
                        {selectedLR.consignor.city}
                      </p>
                      <p className="text-[10px] font-mono text-[#2563EB] font-bold mt-1">GSTIN: {selectedLR.consignor.gstin}</p>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">CONSIGNEE (RECEIVER SIGN)</span>
                      <p className="font-black text-slate-800 text-sm leading-none">{selectedLR.consignee.name}</p>
                      <p className="text-slate-500 text-[10.5px] leading-tight font-medium mt-1">
                        {selectedLR.consignee.address}<br />
                        {selectedLR.consignee.city}
                      </p>
                      <p className="text-[10px] font-mono text-[#2563EB] font-bold mt-1">GSTIN: {selectedLR.consignee.gstin}</p>
                    </div>
                   </div>

                  {/* Operational Driver & Motor Rig layout */}
                  <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 mt-2">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 block uppercase">MOTOR VEHICLE NO</span>
                      <span className="font-mono font-black text-slate-900 uppercase">{selectedLR.vehicleNo}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 block uppercase">DRIVER NAME</span>
                      <span className="font-bold text-slate-900">{selectedLR.driverName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 block uppercase">DRIVER MOBILE</span>
                      <span className="font-mono text-slate-900 font-bold">{selectedLR.driverPhone}</span>
                    </div>
                  </div>

                  {/* Goods itemized physical specs table */}
                  <div className="py-4">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase pb-1.5">
                          <th className="pb-1.5">No. of Packages & Description of Goods</th>
                          <th className="pb-1.5 text-center">Packing Unit</th>
                          <th className="pb-1.5 text-right">Actual Wt</th>
                          <th className="pb-1.5 text-right">Charged Wt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="font-sans">
                          <td className="py-3 font-black text-slate-800">
                            {selectedLR.quantity} Pkgs of {selectedLR.goodsDescription}
                          </td>
                          <td className="py-3 text-center text-slate-500 font-bold">{selectedLR.packagingType}</td>
                          <td className="py-3 text-right font-mono text-slate-600">{selectedLR.actualWeightKg.toLocaleString()} Kgs</td>
                          <td className="py-3 text-right font-mono text-slate-900 font-black">{selectedLR.chargedWeightKg.toLocaleString()} Kgs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Freight calculations Indian layout */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t-2 border-dashed border-slate-200 mt-3">
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">TERMS AND CONDITIONS</span>
                      <ul className="text-[8.5px] text-slate-400 list-disc pl-3 font-semibold space-y-0.5 leading-normal">
                        <li>Goods are carried at Owner&apos;s Risk only.</li>
                        <li>Subject to AHMEDABAD jurisdiction only.</li>
                        <li>Octroi/State borders permits to be borne by payee.</li>
                        <li>Demurrage of ₹200/day applicable after 3 free days.</li>
                      </ul>
                      <div className="pt-2 text-[10px] font-bold text-slate-600 italic">
                        REMARKS: <span className="font-medium text-slate-500">{selectedLR.remarks}</span>
                      </div>
                    </div>

                    {/* Cost allocation columns ledger mapping */}
                    <div className="space-y-1 text-xs text-slate-700 font-bold">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Base Transport Freight:</span>
                        <span className="font-mono">₹{selectedLR.freightAmount.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Labor (Hamali) Fee:</span>
                        <span className="font-mono">₹{selectedLR.hamaliCharges.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">LR Document (Bilty) Fee:</span>
                        <span className="font-mono">₹{selectedLR.biltyCharges.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Other En-Route Overheads:</span>
                        <span className="font-mono">₹{selectedLR.otherCharges.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1 text-slate-500 font-medium">
                        <span>GST responsibility:</span>
                        <span className="text-[9.5px] uppercase font-black text-indigo-700 font-mono select-all">
                          {selectedLR.gstPaidBy.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium pb-1">
                        <span>Integrated tax (IGST @ 18%):</span>
                        <span className="font-mono">₹{selectedLR.gstAmount.toLocaleString('en-IN')}.00</span>
                      </div>
                      
                      <div className="flex justify-between border-t border-slate-300 pt-2 text-[#0F172A] font-black text-sm">
                        <span>Grand Logistic Bill:</span>
                        <span className="font-mono text-base text-indigo-600">₹{selectedLR.totalFreightBill.toLocaleString('en-IN')}.00</span>
                      </div>

                      <div className="flex justify-between border-t border-double border-slate-400 pt-1 text-[11px] font-black">
                        <span>Lorry Stamp Paid Stage:</span>
                        <span className={cn(
                          "uppercase",
                          selectedLR.paymentType === 'PAID' && "text-emerald-700",
                          selectedLR.paymentType === 'TO_PAY' && "text-rose-700",
                          selectedLR.paymentType === 'TBB' && "text-indigo-700"
                        )}>
                          ★ {selectedLR.paymentType.replace('_', ' ')} STAMP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp Seals signatures replica */}
                  <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center select-none text-[10px]">
                    <div className="text-center space-y-1">
                      <div className="text-slate-400 italic">Consignor Signature</div>
                      <div className="h-6 font-serif underline text-slate-600">Arvind Mills Ltd</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-slate-400 italic">Driver Receipt Sign</div>
                      <div className="h-6 font-semibold font-mono text-xs">{selectedLR.driverName.split(' ')[0]}</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-slate-400 italic">For Sardar Patel Roadlines</div>
                      <div className="h-6 font-serif italic text-emerald-700 font-black uppercase text-[11px] tracking-widest">
                        ★ DISPATCHED ★
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action layout */}
              <div className="p-4 bg-slate-100 flex justify-between items-center gap-2 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsViewerOpen(false)} className="rounded-xl h-10 font-bold text-xs">
                  Dismiss Viewer
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handlePretendPrint} className="rounded-xl h-10 border-slate-350 font-bold text-xs gap-1.5 bg-white select-none">
                    <Printer className="w-4 h-4 text-slate-500" /> Print LR Sheet
                  </Button>
                  <Button type="button" onClick={handlePretendDownload} className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl h-10 px-5 gap-1.5 border-none text-xs">
                    <Download className="w-4 h-4 text-white" /> Download Bilty PDF
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
