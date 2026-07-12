/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  FileCheck, 
  Clock, 
  CreditCard,
  Filter,
  MoreVertical,
  IndianRupee,
  Building2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  Eye,
  Printer,
  ChevronRight,
  FileText,
  Briefcase
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
import { getSharedInvoices, saveSharedInvoices, Invoice, InvoiceItem } from '@/src/lib/invoiceStore';
import { mockTrips } from '@/src/data';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

  // Generator form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formTripId, setFormTripId] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formBaseFreight, setFormBaseFreight] = useState('35000');
  const [formFuelSurcharge, setFormFuelSurcharge] = useState('12000');
  const [formTollReimburse, setFormTollReimburse] = useState('2500');
  const [formTaxRate, setFormTaxRate] = useState('18');
  const [formPaymentTerms, setFormPaymentTerms] = useState('NET 30');
  const [formNotes, setFormNotes] = useState('');

  // Enterprise invoice viewer modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Load and sync invoices
  useEffect(() => {
    setInvoices(getSharedInvoices());

    const handleSync = () => {
      setInvoices(getSharedInvoices());
    };
    window.addEventListener('storage_invoices_update', handleSync);
    return () => {
      window.removeEventListener('storage_invoices_update', handleSync);
    };
  }, []);

  // Autofill fields when choosing an exist trip in generator
  const handleTripChange = (value: string) => {
    setFormTripId(value);
    const existingTrip = mockTrips.find(t => t.id === value);
    if (existingTrip) {
      setFormClient(existingTrip.client);
      setFormSource(existingTrip.source);
      setFormDestination(existingTrip.destination);
      // Allocate proportional base freight and expenses
      const baseFee = existingTrip.revenue || 35000;
      setFormBaseFreight(baseFee.toString());
      setFormFuelSurcharge((existingTrip.expenses?.fuel || 10000).toString());
      setFormTollReimburse((existingTrip.expenses?.toll || 1500).toString());
    }
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    const baseFreightVal = parseFloat(formBaseFreight) || 0;
    const fuelVal = parseFloat(formFuelSurcharge) || 0;
    const tollVal = parseFloat(formTollReimburse) || 0;
    const taxRatePercent = parseFloat(formTaxRate) || 18;

    const subtotal = baseFreightVal + fuelVal + tollVal;
    const taxAmount = (subtotal * taxRatePercent) / 100;
    const totalAmount = subtotal + taxAmount;

    // Hardcode some mock client company addresses for aesthetic invoices
    const sampleAddresses: Record<string, { company: string; gstin: string; address: string; city: string; email: string }> = {
      'Reliance Retail': {
        company: 'Reliance Retail Ltd (Logistics Div)',
        gstin: '27AAACR1209M1ZX',
        address: 'Reliance Corporate Park, Thane-Belapur Road',
        city: 'Navi Mumbai, MH - 400701',
        email: 'logistics.billing@reliance.com'
      },
      'Amazon India': {
        company: 'Amazon Seller Services Private Ltd',
        gstin: '29AAACA1294F1ZA',
        address: 'Brigade Gateway, 8th Floor, Dr. Rajkumar Road',
        city: 'Bangalore, KA - 560055',
        email: 'in-fin-billing@amazon.com'
      },
      'Tata Motors': {
        company: 'Tata Motors Limited (Pimpri Hub)',
        gstin: '27AAACT0291K2ZA',
        address: 'Pimpri Industrial Hub, Pune Bypass Road',
        city: 'Pune, MH - 411018',
        email: 'vendor.finance@tatamotors.com'
      }
    };

    const clientMeta = sampleAddresses[formClient] || {
      company: `${formClient} Corporate Hub`,
      gstin: '09AAACA9012F1ZP',
      address: 'Industrial Development Zone, Sector 4',
      city: `${formDestination || 'Srinagar'}, IN`,
      email: `finance@${formClient.toLowerCase().replace(/\s+/g, '') || 'client'}.com`
    };

    const items: InvoiceItem[] = [
      { description: `F-01: Base Freight Charges (${formSource} to ${formDestination})`, quantity: 1, rate: baseFreightVal, amount: baseFreightVal }
    ];
    if (fuelVal > 0) {
      items.push({ description: 'F-02: Diesel Fuel Surcharge Allocation', quantity: 1, rate: fuelVal, amount: fuelVal });
    }
    if (tollVal > 0) {
      items.push({ description: 'F-03: Express Expressway toll plaza reimbursement', quantity: 1, rate: tollVal, amount: tollVal });
    }

    const newInvoice: Invoice = {
      id: `INV-2026-${1001 + invoices.length + Math.floor(Math.random() * 50)}`,
      tripId: formTripId || `EX-${1000 + Math.floor(Math.random() * 9000)}`,
      clientName: formClient || 'Miscellaneous Client',
      clientBilling: clientMeta,
      route: {
        source: formSource || 'Hub Station',
        destination: formDestination || 'Delivery Hub'
      },
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      subtotal,
      taxRate: taxRatePercent,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      status: 'PENDING',
      paymentTerms: formPaymentTerms,
      notes: formNotes || 'Automated logistical clearance invoice generated upon delivery verification.',
      items
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    saveSharedInvoices(updated);

    toast.success('B2B Invoice Generated!', {
      description: `Sent Invoice Reference ${newInvoice.id} to ${formClient}'s billing system.`
    });

    // Reset generator fields
    setFormTripId('');
    setFormClient('');
    setFormSource('');
    setFormDestination('');
    setFormNotes('');
    setIsAddOpen(false);
  };

  const updateInvoiceStatus = (id: string, newStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL') => {
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        let paidAmount = inv.amountPaid;
        if (newStatus === 'PAID') paidAmount = inv.totalAmount;
        if (newStatus === 'PENDING') paidAmount = 0;
        return { ...inv, status: newStatus, amountPaid: paidAmount };
      }
      return inv;
    });
    setInvoices(updated);
    saveSharedInvoices(updated);
    toast.success(`Invoice ${id} updated to ${newStatus}`);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    saveSharedInvoices(updated);
    toast.error(`Invoice ${id} dropped from general ledger`);
  };

  const printStub = () => {
    toast.success('Spooling printer job...', {
      description: 'Document mapped and pushed directly to hub physical desk.'
    });
  };

  const downloadStub = (id: string) => {
    toast.success('PDF Generated successfully', {
      description: `Invoice ${id} clearance ledger acquired.`
    });
  };

  // Computations
  const totalBilled = invoices.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalReceived = invoices.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING' || i.status === 'PARTIAL').reduce((sum, item) => sum + (item.totalAmount - item.amountPaid), 0);
  const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, item) => sum + item.totalAmount, 0);

  // Filter list
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.route.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesClient = clientFilter === 'ALL' || inv.clientName === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  // Unique clients for filtering dropdown
  const uniqueClients = [...new Set(invoices.map(inv => inv.clientName))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Top Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase">
              B2B Accounting Control
            </Badge>
            <span className="text-xs text-slate-400 font-semibold">• GSTIN billing automated</span>
          </div>
          <h2 className="text-3xl font-black text-[#01091a] tracking-tight">Enterprise Clearance Invoices</h2>
          <p className="text-sm text-[#64748B] font-medium max-w-2xl leading-relaxed">
            Formulate itemized billing contracts, authorize corporate payments clearance, verify CGST/IGST tax rates, and download printable B2B consignments ledger sheets.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all border-none">
              <Plus className="w-5 h-5" />
              Generate B2B Invoice
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Sparkles className="text-indigo-600 w-5 h-5" /> Generate Customer Contract Invoice
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerateInvoice} className="space-y-4 py-2 text-sm leading-relaxed">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Completed Trip Reference</Label>
                  <Select onValueChange={handleTripChange}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Match database trip" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTrips.filter(t => t.status === 'DELIVERED' || t.status === 'IN_TRANSIT').map(trip => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.id} - {trip.client} ({trip.source} → {trip.destination})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Corporate Client Name</Label>
                  <Input 
                    placeholder="e.g. Reliance Retail" 
                    value={formClient} 
                    onChange={e => setFormClient(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 font-bold focus-visible:ring-indigo-600" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Origin / Source</Label>
                  <Input 
                    placeholder="e.g. Mumbai Hub" 
                    value={formSource} 
                    onChange={e => setFormSource(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 font-semibold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Delivery Destination</Label>
                  <Input 
                    placeholder="e.g. Delhi Depot" 
                    value={formDestination} 
                    onChange={e => setFormDestination(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 font-semibold" 
                  />
                </div>
              </div>

              {/* Advanced Ledger Pricing Matrix */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Itemized Cost Structure (₹)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Base Freight</Label>
                    <Input 
                      type="number" 
                      value={formBaseFreight} 
                      onChange={e => setFormBaseFreight(e.target.value)} 
                      required
                      className="h-9 rounded-lg border-slate-200 font-mono font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Fuel Surcharge</Label>
                    <Input 
                      type="number" 
                      value={formFuelSurcharge} 
                      onChange={e => setFormFuelSurcharge(e.target.value)} 
                      required
                      className="h-9 rounded-lg border-slate-200 font-mono font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500">Tolls/Misc Fee</Label>
                    <Input 
                      type="number" 
                      value={formTollReimburse} 
                      onChange={e => setFormTollReimburse(e.target.value)} 
                      required
                      className="h-9 rounded-lg border-slate-200 font-mono font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Service Tax Rate (%)</Label>
                  <Select value={formTaxRate} onValueChange={setFormTaxRate}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="GST Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">18% Integrated Commerce GST (Standard)</SelectItem>
                      <SelectItem value="12">12% Secondary Carrier GST</SelectItem>
                      <SelectItem value="5">5% Essential Freight Sched</SelectItem>
                      <SelectItem value="0">0% Exempt Corporate Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Agreement Payment Term</Label>
                  <Select value={formPaymentTerms} onValueChange={setFormPaymentTerms}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NET 30">NET 30 (Due in 30 Days)</SelectItem>
                      <SelectItem value="NET 15">NET 15 (Due in 15 Days)</SelectItem>
                      <SelectItem value="DUE ON RECEIPT">DUR (Due immediately)</SelectItem>
                      <SelectItem value="NET 60">NET 60 (Bulk industrial terms)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500">Regulatory Seal Remarks</Label>
                <Input 
                  placeholder="e.g. Standard terms Net 30. High Value safe cargo checklist complete." 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 font-medium" 
                />
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-6 border-none">Publish Ledger Invoice</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Corporate Audit Billing Statistics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed Ledger', value: `₹${totalBilled.toLocaleString('en-IN')}`, detail: 'Total service invoice assets', color: 'indigo', icon: FileText },
          { label: 'Corporate Cash-In', value: `₹${totalReceived.toLocaleString('en-IN')}`, detail: 'Cleared B2B bank credits', color: 'green', icon: CheckCircle },
          { label: 'Outstanding Balance', value: `₹${totalPending.toLocaleString('en-IN')}`, detail: 'Pending clearance pipelines', color: 'yellow', icon: Clock },
          { label: 'Overdue Claims Penalties', value: `₹${totalOverdue.toLocaleString('en-IN')}`, detail: 'Passed Net 30 threshold', color: 'red', icon: AlertTriangle }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
              <stat.icon className={cn(
                "w-4 h-4",
                stat.color === 'indigo' && "text-indigo-500",
                stat.color === 'green' && "text-emerald-500",
                stat.color === 'yellow' && "text-amber-500 animate-pulse",
                stat.color === 'red' && "text-rose-500",
              )} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Filter & Advanced Search Deck */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          
          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 select-none">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select 
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
            >
              <option value="ALL">All B2B Corporates</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Tabs Pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-100 rounded-lg select-none">
            {([
              { id: 'ALL', label: 'All Bills' },
              { id: 'PAID', label: 'Paid' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'OVERDUE', label: 'Overdue' },
              { id: 'PARTIAL', label: 'Partial' }
            ] as const).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "text-[10px] font-black uppercase px-3 py-1.5 rounded transition-colors border-none",
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

        {/* Live inputs search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search invoice number, client routing, trip..." 
            className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Corporate Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table className="table-fixed">
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 w-[15%] uppercase text-[10px] font-black tracking-wider text-slate-400 pl-6">Invoice ID / Issue</TableHead>
              <TableHead className="h-12 w-[20%] uppercase text-[10px] font-black tracking-wider text-slate-400">B2B client</TableHead>
              <TableHead className="h-12 w-[27%] uppercase text-[10px] font-black tracking-wider text-slate-400">Logistics Route</TableHead>
              <TableHead className="h-12 w-[13%] uppercase text-[10px] font-black tracking-wider text-slate-400">Total Billed</TableHead>
              <TableHead className="h-12 w-[10%] uppercase text-[10px] font-black tracking-wider text-slate-400">State Clearance</TableHead>
              <TableHead className="h-12 w-[15%] text-right uppercase text-[10px] font-black tracking-wider text-slate-400 pr-6">Clearing Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors h-16">
                  
                  {/* Reference ID and issue timing */}
                  <TableCell className="pl-6 font-sans">
                    <span className="font-mono font-black text-xs text-indigo-600 block">{inv.id}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Issue: {inv.issueDate}</span>
                  </TableCell>

                  {/* Client Identification description */}
                  <TableCell className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs select-none">
                        {inv.clientName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 leading-none truncate">{inv.clientName}</p>
                        <code className="text-[9.5px] font-mono font-bold text-slate-400 block mt-1 uppercase">{inv.clientBilling.gstin || 'GST NOT FILED'}</code>
                      </div>
                    </div>
                  </TableCell>

                  {/* Route & Trip ID mapping */}
                  <TableCell className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] min-w-0">
                      <span className="truncate max-w-[45%]">{inv.route.source}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[45%]">{inv.route.destination}</span>
                    </div>
                    <span className="text-[9.5px] font-mono font-black text-slate-400 mt-1 block">CONVEYANCE: {inv.tripId}</span>
                  </TableCell>

                  {/* Pricing and Due dates */}
                  <TableCell>
                    <p className="text-xs font-black text-slate-900 font-mono">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                    <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">Due: {inv.dueDate}</span>
                  </TableCell>

                  {/* Status pills Badge */}
                  <TableCell>
                    <Badge 
                      className={cn(
                        "border-none shadow-none font-black text-[9.5px] py-0.5 px-2 uppercase tracking-wide",
                        inv.status === 'PAID' && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        inv.status === 'PENDING' && "bg-amber-50 text-amber-800 hover:bg-amber-100",
                        inv.status === 'OVERDUE' && "bg-rose-50 text-rose-700 hover:bg-rose-100",
                        inv.status === 'PARTIAL' && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>

                  {/* Clearing Actions Controllers */}
                  <TableCell className="text-right pr-6 font-sans">
                    <div className="flex flex-wrap justify-end gap-1.5">
                    <Button 
                      size="xs" 
                      variant="outline"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsViewOpen(true);
                      }}
                      className="border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] h-7.5 px-2"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>

                    <Select 
                      value={inv.status} 
                      onValueChange={(val: any) => updateInvoiceStatus(inv.id, val)}
                    >
                      <SelectTrigger className="inline-flex w-20 h-7.5 border-slate-200 text-[10px] font-bold rounded-lg bg-white px-2">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">✓ Cleared</SelectItem>
                        <SelectItem value="PENDING">⏱ Hold/Pending</SelectItem>
                        <SelectItem value="PARTIAL">✍ Partial</SelectItem>
                        <SelectItem value="OVERDUE">✕ Overdue</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      size="xs" 
                      variant="ghost"
                      onClick={() => deleteInvoice(inv.id)}
                      className="text-slate-300 hover:text-red-500 h-8 w-8 px-0 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </AnimatePresence>

            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="font-extrabold text-slate-800 text-sm">No match on corporate invoices</p>
                    <p className="text-xs text-slate-400 font-medium">Reset search parameter values or build a fresh customer contract up top.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Corporate PDF design previewer sheets modals */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[650px] !rounded-3xl p-0 overflow-hidden bg-[#fafafa]">
          {selectedInvoice && (
            <div className="space-y-0 text-slate-850 font-sans">
              
              {/* Premium Header Branding & Address meta */}
              <div className="bg-[#0F172A] p-6 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-2 rounded-lg bg-indigo-600 font-black text-xs text-white">LF</div>
                    <span className="font-sans font-black tracking-tight text-lg text-white">LOGIFLOW LTD</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Corporate Logistics Division, Level 14, Tower B<br />
                    Outer Ring bypass, Sector 62, Noida - 201301<br />
                    GSTIN: 09AAACL1941N1ZY • support@logiflow.com
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <Badge className="bg-emerald-500 text-white font-extrabold uppercase text-[10px] border-none">
                    TAX INVOICE
                  </Badge>
                  <p className="text-base font-black font-mono mt-2 text-indigo-400 leading-none">{selectedInvoice.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold block">Trip Ref: {selectedInvoice.tripId}</p>
                </div>
              </div>

              {/* Bill To & Routing metadata segment */}
              <div className="p-6 grid grid-cols-2 gap-6 bg-white border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">BILL TO CUSTOMER</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{selectedInvoice.clientBilling.company}</p>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    {selectedInvoice.clientBilling.address}<br />
                    {selectedInvoice.clientBilling.city}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 font-mono mt-1">Client GSTIN: {selectedInvoice.clientBilling.gstin || 'NA'}</p>
                  <p className="text-[10.5px] text-slate-400 font-bold">{selectedInvoice.clientBilling.email}</p>
                </div>

                <div className="space-y-2 text-right">
                  <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">CONSIGNMENT DETAILS</p>
                  <div className="inline-flex items-center gap-2 text-xs font-black bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-800 leading-none mt-1">
                    <span>{selectedInvoice.route.source}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{selectedInvoice.route.destination}</span>
                  </div>
                  
                  <div className="space-y-1 text-slate-700 text-xs mt-2 font-bold leading-tight">
                    <p>Issue Date: <span className="font-mono text-slate-900 font-black">{selectedInvoice.issueDate}</span></p>
                    <p>Due Date: <span className="font-mono text-slate-900 font-black">{selectedInvoice.dueDate}</span></p>
                    <p>Payment Terms: <span className="text-indigo-600 font-black">{selectedInvoice.paymentTerms}</span></p>
                  </div>
                </div>
              </div>

              {/* Itemized list sheet */}
              <div className="p-6 bg-white">
                <table className="w-full text-left text-xs font-medium text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 pb-2">
                      <th className="pb-2">SERVICE ITEM / DESCRIPTION</th>
                      <th className="pb-2 text-center w-12">QTY</th>
                      <th className="pb-2 text-right w-28">RATE (₹)</th>
                      <th className="pb-2 text-right w-28">AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 font-sans font-black text-slate-800">{item.description}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-500">{item.quantity}</td>
                        <td className="py-3 text-right font-mono text-slate-700">{item.rate.toLocaleString('en-IN')}.00</td>
                        <td className="py-3 text-right font-mono font-black text-slate-900">{item.amount.toLocaleString('en-IN')}.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals arithmetic breakdown Section */}
              <div className="p-6 bg-[#fafafa] border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SIGNATORY & VALIDATION SEAL</p>
                  <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-white/50 text-center select-none relative space-y-1">
                    <span className="text-[8px] font-bold text-indigo-700 absolute top-1 right-2 uppercase font-mono tracking-widest">LOGIFLOW LOCK</span>
                    <FileCheck className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="text-[12px] font-serif italic font-semibold text-slate-800">Alok Sharma</p>
                    <p className="text-[9px] text-slate-400 font-bold leading-tight">Hub Operations Desk Executive</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic leading-normal max-w-xs block mt-1.5">{selectedInvoice.notes}</p>
                </div>

                <div className="space-y-2 font-bold text-xs text-slate-700">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Integrated GST (IGST @ {selectedInvoice.taxRate}%):</span>
                    <span className="font-mono">₹{selectedInvoice.taxAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-[#0F172A] font-black">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono text-base">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Total Amount Settled:</span>
                      <span className="font-mono">₹{selectedInvoice.amountPaid.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-indigo-950 font-black">
                    <span>Net Balance Due:</span>
                    <span className="font-mono text-sm underline text-indigo-600">
                      ₹{(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Action layout */}
              <div className="p-4 bg-[#EDF2F7] flex justify-between items-center gap-2 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-xl h-10 font-bold text-xs">
                  Close Window
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={printStub} className="rounded-xl h-10 border-slate-300 font-bold text-xs gap-1.5">
                    <Printer className="w-4 h-4" /> Print stub
                  </Button>
                  <Button type="button" onClick={() => downloadStub(selectedInvoice.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl h-10 px-5 gap-1.5 border-none text-xs">
                    <Download className="w-4 h-4" /> Download PDF Bill
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
