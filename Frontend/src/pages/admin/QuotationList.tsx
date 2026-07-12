/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  Filter,
  MoreVertical,
  Download,
  IndianRupee,
  Calendar,
  AlertCircle,
  TrendingUp,
  Percent,
  Sparkles,
  MapPin,
  Trash2,
  Check,
  ChevronRight,
  FileCheck2,
  Printer
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

interface SimulatedQuotation {
  id: string;
  client: string;
  date: string;
  amount: number;
  status: 'SENT' | 'APPROVED' | 'DRAFT' | 'EXPIRED';
  route: string;
  vehicleClass: string;
  tollCharges: number;
  miscCharges: number;
  validityDays: number;
  contactPerson?: string;
  contactPhone?: string;
}

const initialQuotations: SimulatedQuotation[] = [
  { id: 'QTN-4021', client: 'Reliance Industries', date: 'May 30, 2026', amount: 84000, status: 'SENT', route: 'Mumbai → Pune', vehicleClass: '32ft MXL (Heavy)', tollCharges: 2400, miscCharges: 1500, validityDays: 7, contactPerson: 'Hiten Shah', contactPhone: '+91 91223 88472' },
  { id: 'QTN-3988', client: 'Tata Steel', date: 'May 28, 2026', amount: 125000, status: 'APPROVED', route: 'Jamshedpur → Kolkata', vehicleClass: 'Platform Trailer', tollCharges: 5800, miscCharges: 2000, validityDays: 14, contactPerson: 'Arunav Sengupta', contactPhone: '+91 94331 00213' },
  { id: 'QTN-3950', client: 'Adani Logistics', date: 'May 26, 2026', amount: 45000, status: 'DRAFT', route: 'Mundra → Ahmedabad', vehicleClass: '20ft Truck (LCV)', tollCharges: 1100, miscCharges: 800, validityDays: 5, contactPerson: 'Pankaj Vaghani', contactPhone: '+91 98224 55190' },
  { id: 'QTN-3912', client: 'Mahindra Logistics', date: 'May 24, 2026', amount: 62000, status: 'EXPIRED', route: 'Nashik → Mumbai', vehicleClass: '10ft Pickup (Container)', tollCharges: 800, miscCharges: 500, validityDays: 7, contactPerson: 'Karan Deol', contactPhone: '+91 88827 33419' },
];

export default function QuotationList() {
  const [quotations, setQuotations] = useState<SimulatedQuotation[]>(initialQuotations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'APPROVED' | 'DRAFT' | 'EXPIRED'>('ALL');
  
  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formClient, setFormClient] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formDest, setFormDest] = useState('');
  const [formVehicleClass, setFormVehicleClass] = useState('20FT');
  const [formBaseRate, setFormBaseRate] = useState('45000');
  const [formToll, setFormToll] = useState('1200');
  const [formMisc, setFormMisc] = useState('500');
  const [formValidity, setFormValidity] = useState('7');
  const [formContactName, setFormContactName] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');

  // Invoice viewer modal state
  const [selectedQuote, setSelectedQuote] = useState<SimulatedQuotation | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Form submission handler
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient || !formOrigin || !formDest || !formBaseRate) {
      toast.error('Please input client, origin, destination and base rate');
      return;
    }

    const baseAmount = parseFloat(formBaseRate) || 0;
    const tollVal = parseFloat(formToll) || 0;
    const miscVal = parseFloat(formMisc) || 0;
    const computedTotal = baseAmount + tollVal + miscVal;
    
    // Auto-map class labels
    const classLabels: Record<string, string> = {
      '10FT': '10ft Pickup (Container)',
      '20FT': '20ft Truck (LCV)',
      '32FT': '32ft MXL (Heavy)',
      'TRAILER': 'Platform Trailer'
    };

    const newId = `QTN-${4022 + quotations.length}`;
    const newQuote: SimulatedQuotation = {
      id: newId,
      client: formClient,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: computedTotal,
      status: 'DRAFT',
      route: `${formOrigin} → ${formDest}`,
      vehicleClass: classLabels[formVehicleClass] || formVehicleClass,
      tollCharges: tollVal,
      miscCharges: miscVal,
      validityDays: parseInt(formValidity) || 7,
      contactPerson: formContactName || 'Consignee Admin',
      contactPhone: formContactPhone || '+91 99999 88888'
    };

    setQuotations([newQuote, ...quotations]);
    toast.success(`Quotation ${newId} Draft Registered!`, {
      description: 'You can now dispatch, edit or approve it from your central deck.'
    });

    // Reset Form fields
    setFormClient('');
    setFormOrigin('');
    setFormDest('');
    setFormBaseRate('45000');
    setFormToll('1200');
    setFormMisc('500');
    setFormContactName('');
    setFormContactPhone('');
    setIsCreateOpen(false);
  };

  // Approval handler
  const handleApproveQuote = (id: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        toast.success(`Quotation ${id} Approved by Client!`, {
          description: 'This has been converted into a contracted schedule reservation and can be assigned a vehicle.'
        });
        return { ...q, status: 'APPROVED' };
      }
      return q;
    }));
  };

  // Send WhatsApp/Email trigger handler
  const handleSendClient = (id: string, clientName: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        toast.info(`Quotation Dispatch Initiated`, {
          description: `PDF draft securely compiled and broadcasted to ${clientName}'s registered point of contact via WhatsApp and Email API.`
        });
        return { ...q, status: q.status === 'DRAFT' ? 'SENT' : q.status };
      }
      return q;
    }));
  };

  // Expire handler
  const handleExpireQuote = (id: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        toast.warning(`Quotation ${id} marked as EXPIRED.`);
        return { ...q, status: 'EXPIRED' };
      }
      return q;
    }));
  };

  // Delete quote
  const handleDeleteQuote = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    toast.error(`Deleted quotation ${id}`);
  };

  // Export PDF preview simulation
  const handleExportPDF = () => {
    toast.success('Document Generation Pipeline Active', {
      description: 'Successfully downloaded high-fidelity PDF Quotation Sheet into your device.'
    });
    setIsInvoiceOpen(false);
  };

  // Filter calculations
  const cleanSearch = searchTerm.toLowerCase();
  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = 
      q.id.toLowerCase().includes(cleanSearch) || 
      q.client.toLowerCase().includes(cleanSearch) || 
      q.route.toLowerCase().includes(cleanSearch);
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && q.status === statusFilter;
  });

  // Highlight Stats widgets from reactive state
  const activeQuotesCount = quotations.filter(q => q.status === 'SENT' || q.status === 'APPROVED').length;
  const draftQuotesCount = quotations.filter(q => q.status === 'DRAFT').length;
  const approvalRate = quotations.length > 0 
    ? Math.round((quotations.filter(q => q.status === 'APPROVED').length / quotations.length) * 100) 
    : 0;
  const totalVolumePotential = quotations.reduce((sum, q) => q.status !== 'EXPIRED' ? sum + q.amount : sum, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header section with Create Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase">
              B2B Logistical Contracts
            </Badge>
            <span className="text-xs text-slate-400">• Dynamic pricing engine</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#01091a] tracking-tight leading-tight">Service Quotations Deck</h2>
          <p className="text-xs md:text-sm text-[#64748B] font-medium">Create itemized cargo bids, dispatch SMS alerts, design custom bills and transition to authorized dispatch statuses.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-lg text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all active:scale-95 border-none">
              <Plus className="w-5 h-5" />
              Generate New Quote
            </Button>
          } />
          <DialogContent className="sm:max-w-[620px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> Create B2B Logistics Quote
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateQuotation} className="space-y-5 py-2 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-700">Corporate Client Name</Label>
                  <Input 
                    placeholder="e.g. Reliance Industrial Hub" 
                    value={formClient} 
                    onChange={e => setFormClient(e.target.value)} 
                    required 
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-700">Scheduled Transport Car Class</Label>
                  <Select value={formVehicleClass} onValueChange={setFormVehicleClass}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold text-slate-900">
                      <SelectValue placeholder="Select Fleet Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10FT">10ft Pickup (Container)</SelectItem>
                      <SelectItem value="20FT">20ft Truck (LCV)</SelectItem>
                      <SelectItem value="32FT">32ft MXL (Heavy)</SelectItem>
                      <SelectItem value="TRAILER">Platform Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-700">Origin Loading City</Label>
                  <Input 
                    placeholder="e.g. Surat, GJ" 
                    value={formOrigin} 
                    onChange={e => setFormOrigin(e.target.value)} 
                    required 
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-900 placeholder:text-slate-400" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-700">Destination Unloading City</Label>
                  <Input 
                    placeholder="e.g. Pune, MH" 
                    value={formDest} 
                    onChange={e => setFormDest(e.target.value)} 
                    required 
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-900 placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-700">Base Freight (₹)</Label>
                    <Input 
                      type="number" 
                      value={formBaseRate} 
                      onChange={e => setFormBaseRate(e.target.value)} 
                      required 
                      className="h-10 rounded-lg text-sm font-bold bg-white text-slate-900 placeholder:text-slate-400" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-700">Est. Toll Way (₹)</Label>
                    <Input 
                      type="number" 
                      value={formToll} 
                      onChange={e => setFormToll(e.target.value)} 
                      className="h-10 rounded-lg text-sm font-bold bg-white text-slate-900 placeholder:text-slate-400" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-700">Unload/Loader (₹)</Label>
                    <Input 
                      type="number" 
                      value={formMisc} 
                      onChange={e => setFormMisc(e.target.value)} 
                      className="h-10 rounded-lg text-sm font-bold bg-white text-slate-900 placeholder:text-slate-400" 
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                   <Label className="text-xs font-bold uppercase text-slate-700">Client Contact Person Name</Label>
                   <Input 
                     placeholder="e.g. Narendra Jha" 
                     value={formContactName} 
                     onChange={e => setFormContactName(e.target.value)} 
                     className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400" 
                   />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-xs font-bold uppercase text-slate-700">Quote Validity</Label>
                   <Select value={formValidity} onValueChange={setFormValidity}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold text-slate-900">
                         <SelectValue placeholder="Validity days" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="5">05 Days</SelectItem>
                         <SelectItem value="7">07 Days</SelectItem>
                         <SelectItem value="14">14 Days</SelectItem>
                         <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-xs font-bold uppercase text-slate-700">Contact Registered Cellphone Number</Label>
                 <Input 
                   placeholder="+91 XXXXX XXXXX" 
                   value={formContactPhone} 
                   onChange={e => setFormContactPhone(e.target.value)} 
                   className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400" 
                 />
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Save Draft & Publish</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Statistical overview grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Quotations', value: `${activeQuotesCount}`, detail: 'Awaiting client approval', icon: FileCheck2, color: 'blue' },
          { label: 'New Drafts Under Preparation', value: `${draftQuotesCount}`, detail: 'Operational checklists', icon: Clock, color: 'yellow' },
          { label: 'Gross Margin Conversion', value: `${approvalRate}%`, detail: 'Approved bids ratio', icon: Percent, color: 'green' },
          { label: 'Pending Pipe Revenue', value: `₹${(totalVolumePotential / 1000).toFixed(0)}k`, detail: 'Consolidated freight volume', icon: TrendingUp, color: 'indigo' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
                <stat.icon className={cn(
                  "w-4 h-4",
                  stat.color === 'blue' && "text-blue-500",
                  stat.color === 'yellow' && "text-amber-500",
                  stat.color === 'green' && "text-emerald-500",
                  stat.color === 'indigo' && "text-indigo-500",
                )} />
             </div>
             <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
             <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Filter and control deck */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
         <div className="flex flex-wrap gap-1.5">
           {([
             { id: 'ALL', label: 'All Quotations' },
             { id: 'SENT', label: '⚡ Sent Active' },
             { id: 'APPROVED', label: '✓ Approved Schedules' },
             { id: 'DRAFT', label: '📋 Draft Bids' },
             { id: 'EXPIRED', label: '✕ Expired/Declined' },
           ] as const).map(tab => (
             <Button
               key={tab.id}
               variant="ghost"
               onClick={() => setStatusFilter(tab.id)}
               className={cn(
                 "rounded-xl h-9 px-4 font-extrabold text-xs transition-all border-none select-none",
                 statusFilter === tab.id 
                   ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
               )}
             >
               {tab.label}
             </Button>
           ))}
         </div>

         <div className="relative w-full md:max-w-xs">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <Input 
             placeholder="Search quote code, client..." 
             className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
      </div>

      {/* High impact grid listing of quotations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredQuotes.map((qtn) => (
            <motion.div
              key={qtn.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "bg-white rounded-2xl border p-5 md:p-6 transition-all shadow-sm flex flex-col justify-between gap-6 hover:shadow-md relative overflow-hidden",
                qtn.status === 'APPROVED' && "border-emerald-100 hover:border-emerald-200",
                qtn.status === 'EXPIRED' && "border-red-100"
              )}
            >
              
              {/* Card top banner mapping */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-slate-100",
                qtn.status === 'SENT' && "bg-blue-500",
                qtn.status === 'APPROVED' && "bg-emerald-500",
                qtn.status === 'EXPIRED' && "bg-red-400"
              )}></div>

              <div className="space-y-4">
                 
                 {/* ID and Status badge */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-slate-400" />
                       <span className="font-mono font-black text-xs text-blue-600 tracking-wider font-semibold">{qtn.id}</span>
                       <span className="text-slate-300">•</span>
                       <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">{qtn.vehicleClass.split(' ')[0]}</span>
                    </div>

                    <Badge 
                      className={cn(
                        "font-extrabold border-none text-[10px] py-0.5 px-2.5 shadow-none uppercase tracking-wide",
                        qtn.status === 'APPROVED' && "bg-[#DCFCE7] text-[#166534]",
                        qtn.status === 'SENT' && "bg-[#EFF6FF] text-[#2563EB]",
                        qtn.status === 'DRAFT' && "bg-slate-100 text-slate-500",
                        qtn.status === 'EXPIRED' && "bg-red-50 text-red-700"
                      )}
                    >
                      {qtn.status}
                    </Badge>
                 </div>

                 {/* Client Name & Route path */}
                 <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{qtn.client}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                       <MapPin className="w-3.5 h-3.5 text-slate-400" />
                       <span>{qtn.route}</span>
                    </div>
                 </div>

                 {/* Financial breakdown overview */}
                 <div className="grid grid-cols-3 gap-2 bg-slate-50/70 py-3 px-4 rounded-xl border border-slate-100/50">
                    <div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Cargo class</span>
                       <p className="text-[11px] font-extrabold text-slate-800 truncate leading-relaxed">{qtn.vehicleClass}</p>
                    </div>
                    <div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Toll/Misc</span>
                       <p className="text-[11px] font-extrabold text-slate-800 font-mono leading-relaxed">₹{(qtn.tollCharges + qtn.miscCharges).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Expiry Lock</span>
                       <p className="text-[11px] font-extrabold text-slate-800 leading-relaxed">{qtn.validityDays} Days Validity</p>
                    </div>
                 </div>

                 {/* Quote potential amount */}
                 <div className="flex items-center justify-between pt-1">
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consolidated Bid Net</span>
                       <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">₹{qtn.amount.toLocaleString('en-IN')}</p>
                    </div>
                    {qtn.contactPerson && (
                       <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Contact Person</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-1">{qtn.contactPerson}</span>
                          <span className="text-[10.5px] font-mono text-slate-400 block mt-0.5">{qtn.contactPhone}</span>
                       </div>
                    )}
                 </div>

              </div>

              {/* Action Buttons deck */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-3">
                 <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedQuote(qtn);
                        setIsInvoiceOpen(true);
                      }}
                      className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-[11px] h-9 rounded-lg border-none"
                    >
                       <FileText className="w-3.5 h-3.5 mr-1" /> View Quote Summary
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendClient(qtn.id, qtn.client)}
                      className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-extrabold text-[11px] h-9 rounded-lg"
                    >
                       <Send className="w-3.5 h-3.5 mr-1 text-blue-500" /> Dispatch SMS/WA
                    </Button>
                 </div>

                 <div className="flex items-center gap-1.5">
                    {qtn.status === 'SENT' && (
                       <Button 
                         size="sm" 
                         onClick={() => handleApproveQuote(qtn.id)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] h-9 rounded-lg border-none"
                       >
                          ✓ Accept Bid
                       </Button>
                    )}
                    {qtn.status === 'DRAFT' && (
                       <Button 
                         size="sm" 
                         onClick={() => handleApproveQuote(qtn.id)}
                         className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] h-9 rounded-lg border-none"
                       >
                          ✓ Confirm Approved
                       </Button>
                    )}
                    {qtn.status !== 'EXPIRED' && qtn.status !== 'APPROVED' && (
                       <Button 
                         size="sm"
                         variant="ghost"
                         onClick={() => handleExpireQuote(qtn.id)}
                         className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-[11px] h-9 w-9 p-0 rounded-lg shrink-0"
                       >
                          ✕
                       </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteQuote(qtn.id)}
                      className="text-slate-400 hover:text-red-600 font-bold text-[11px] h-9 w-9 p-0 rounded-lg shrink-0"
                    >
                       <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                 </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuotes.length === 0 && (
          <div className="md:col-span-2 bg-slate-50 border border-dashed border-slate-200 py-16 text-center rounded-3xl space-y-4">
             <AlertCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
             <div className="max-w-xs mx-auto space-y-1">
                <p className="font-extrabold text-slate-800 text-sm">No matched quotations located</p>
                <p className="text-xs text-slate-400 font-medium">Clear search filters or draft a custom dispatch bid above to simulate real-time operations.</p>
             </div>
             <Button onClick={() => setStatusFilter('ALL')} variant="outline" className="rounded-xl border-slate-200">
                Show All Bids
             </Button>
          </div>
        )}
      </div>

      {/* Advanced Quote breakdown preview Sheet/Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
         <DialogContent className="sm:max-w-[550px] rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-xl font-extrabold text-slate-950 flex items-center justify-between pr-4">
                  <span className="flex items-center gap-2">
                     <FileCheck2 className="text-blue-600 w-5 h-5 animate-pulse" /> Official Freight Quotation
                  </span>
                  <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                     {selectedQuote?.id || 'REF N/A'}
                  </span>
               </DialogTitle>
            </DialogHeader>

            {selectedQuote && (
               <div className="space-y-6 py-2 pb-4 font-sans text-sm">
                  
                  {/* Company credentials header */}
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                     <div>
                        <h4 className="font-black text-[#01091a] text-sm">Command Logistics India</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Delhi-NCR Logistical Node</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-slate-500">Date Issued: {selectedQuote.date}</p>
                        <p className="text-xs font-extrabold text-emerald-600 mt-0.5">Validity Lock: {selectedQuote.validityDays} days</p>
                     </div>
                  </div>

                  {/* Consignee target mapping */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Quote Prepared For:</span>
                        <p className="text-slate-800 font-black text-sm">{selectedQuote.client}</p>
                        <p className="text-slate-500">{selectedQuote.contactPerson}</p>
                        <p className="text-slate-400 font-mono mt-0.5">{selectedQuote.contactPhone}</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Cargo Route Transit:</span>
                        <p className="text-slate-800 font-black text-sm">{selectedQuote.route}</p>
                        <p className="text-slate-500">Fleet Class: {selectedQuote.vehicleClass}</p>
                     </div>
                  </div>

                  {/* Itemized breakdown table */}
                  <div className="space-y-3 pb-2">
                     <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2 uppercase text-slate-400">
                        <span>Fee Description</span>
                        <span>Amount Details</span>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                           <span>1. Base Highway Freight Rate ({selectedQuote.vehicleClass})</span>
                           <span className="font-mono">₹{(selectedQuote.amount - selectedQuote.tollCharges - selectedQuote.miscCharges).toLocaleString('en-IN')}.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                           <span>2. Highway FastTag Tollway Transit</span>
                           <span className="font-mono">₹{selectedQuote.tollCharges.toLocaleString('en-IN')}.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                           <span>3. Depot Unloading & Loader Clearance</span>
                           <span className="font-mono">₹{selectedQuote.miscCharges.toLocaleString('en-IN')}.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 italic">
                           <span>4. CGST + SGST (Integrated inside base billing rate)</span>
                           <span className="font-mono">Included (0%)</span>
                        </div>
                     </div>

                     {/* Grand Total */}
                     <div className="flex justify-between items-center bg-blue-50/60 p-3 rounded-lg border border-blue-100/30 text-blue-900 font-bold mt-4">
                        <span>Consolidated Bid Estimate Payable</span>
                        <span className="font-mono text-lg font-black">₹{selectedQuote.amount.toLocaleString('en-IN')}.00</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 bg-yellow-50 text-amber-800 p-3 rounded-lg text-xs leading-relaxed font-semibold">
                     <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                     <p>This quote constitutes a formal carrier tariff estimate. Any demurrage beyond 4 hours at unloading hub generates extra slab charges of ₹800/hr.</p>
                  </div>

                  <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                     <Button type="button" variant="outline" onClick={() => setIsInvoiceOpen(false)} className="rounded-xl h-11">Close</Button>
                     <Button type="button" onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-6 border-none">
                        <Printer className="w-4 h-4 mr-1.5" /> Confirm Print / Download PDF
                     </Button>
                  </DialogFooter>

               </div>
            )}
         </DialogContent>
      </Dialog>

    </div>
  );
}
