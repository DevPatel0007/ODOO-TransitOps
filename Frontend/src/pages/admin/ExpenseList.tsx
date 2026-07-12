/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Fuel, 
  Receipt,
  AlertTriangle,
  Filter,
  IndianRupee,
  Briefcase,
  User,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingDown,
  Percent,
  Sparkles,
  Layers,
  Clock,
  Download,
  AlertOctagon,
  Activity,
  FileSpreadsheet
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
import { getSharedExpenses, saveSharedExpenses, SharedExpense } from '@/src/lib/expenseStore';

// Driver Personas list mapped directly to IDs
const driverPersonas = [
  { id: 'd1', name: 'Rajesh Kumar', defaultPlate: 'MH-12-AB-1234' },
  { id: 'd2', name: 'Suresh Pal', defaultPlate: 'HR-55-XY-5678' },
  { id: 'd3', name: 'Vikram Singh', defaultPlate: 'DL-01-PQ-9012' }
];

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Create state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formDriverId, setFormDriverId] = useState('d1');
  const [formType, setFormType] = useState<'FUEL' | 'TOLL' | 'ADVANCE' | 'MAINTENANCE' | 'OTHER'>('FUEL');
  const [formAmount, setFormAmount] = useState('4500');
  const [formTrip, setFormTrip] = useState('T1001');
  const [formDesc, setFormDesc] = useState('');
  const [formAttachment, setFormAttachment] = useState<string>('refuel_slip_manual.pdf');

  // Slip receipt viewer state
  const [selectedExpense, setSelectedExpense] = useState<SharedExpense | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Sync with expenseStore
  useEffect(() => {
    setExpenses(getSharedExpenses());
    
    // Sync triggers from other panels
    const handleSync = () => {
      setExpenses(getSharedExpenses());
    };
    window.addEventListener('storage_expenses_update', handleSync);
    return () => {
      window.removeEventListener('storage_expenses_update', handleSync);
    };
  }, []);

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) {
      toast.error('Specify a positive expense amount.');
      return;
    }

    const selectedDriverObj = driverPersonas.find(d => d.id === formDriverId);
    if (!selectedDriverObj) return;

    const newExp: SharedExpense = {
      id: `EXP-${9041 + expenses.length + Math.floor(Math.random() * 100)}`,
      driverId: formDriverId,
      driverName: selectedDriverObj.name,
      vehiclePlate: selectedDriverObj.defaultPlate,
      tripId: formTrip.toUpperCase(),
      type: formType,
      amount: parseFloat(formAmount),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: formDesc || `${formType.replace('_', ' ')} claims filed under B2B authorization.`,
      status: 'PENDING',
      attachmentName: formAttachment || 'digital_receipt.pdf'
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveSharedExpenses(updated);
    
    toast.success(`Expense ${newExp.id} Logged!`, {
      description: `Operational costs allocated directly to Captain ${selectedDriverObj.name}.`
    });

    // Reset fields
    setFormAmount('4500');
    setFormDesc('');
    setIsAddOpen(false);
  };

  // Change Verification parameters
  const updateStatus = (id: string, newStatus: 'APPROVED' | 'PENDING' | 'DISPUTED') => {
    const updated = expenses.map(exp => {
      if (exp.id === id) {
        toast.info(`Claim Reference ${id} Updated`, {
          description: `Audit clearance status adjusted to ${newStatus}.`
        });
        return { ...exp, status: newStatus };
      }
      return exp;
    });
    setExpenses(updated);
    saveSharedExpenses(updated);
  };

  // Delete expense claim
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    saveSharedExpenses(updated);
    toast.error(`Expense ${id} Deleted`, {
      description: 'Transaction entry wiped from logistics ledger.'
    });
  };

  // Receipt simulated downloads
  const handleDownloadReceipt = () => {
    toast.success('Document Fetch Complete', {
      description: `Receipt PDF downloaded successfully into your regional system lock.`
    });
    setIsReceiptOpen(false);
  };

  // Mapped calculations
  const cleanSearch = searchTerm.toLowerCase();
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.id.toLowerCase().includes(cleanSearch) || 
      exp.driverName.toLowerCase().includes(cleanSearch) || 
      exp.vehiclePlate.toLowerCase().includes(cleanSearch) || 
      exp.description.toLowerCase().includes(cleanSearch);

    const matchesDriver = driverFilter === 'ALL' || exp.driverId === driverFilter;
    const matchesCategory = categoryFilter === 'ALL' || exp.type === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || exp.status === statusFilter;

    return matchesSearch && matchesDriver && matchesCategory && matchesStatus;
  });

  // Derived mathematical stats
  const totalFuelSum = expenses.filter(e => e.type === 'FUEL' && e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
  const totalAdvancesSum = expenses.filter(e => e.type === 'ADVANCE' && e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
  const grandTotalCost = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
  const pendingRequestsCount = expenses.filter(e => e.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header element */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
               <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase">
                  B2B Financial Clearance
               </Badge>
               <span className="text-xs text-slate-400">• Anti-leakage fuel audit</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#01091a] tracking-tight leading-tight">Financial Claims Deck</h2>
            <p className="text-xs md:text-sm text-[#64748B] font-medium leading-relaxed">
               Audit captain refuel slips, release cash halts, review maintenance workshop receipts and authorize expense clearances.
            </p>
         </div>

         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
           <DialogTrigger render={
             <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-lg text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all active:scale-95 border-none">
               <Plus className="w-5 h-5" />
               Log Manual Expense
             </Button>
           } />
           <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
             <DialogHeader>
                <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
                   <Sparkles className="text-blue-600 w-5 h-5" /> Log Fleets Expense Entry
                </DialogTitle>
             </DialogHeader>

             <form onSubmit={handleLogExpense} className="space-y-5 py-2 font-sans text-sm">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-500">Target Driver Persona</Label>
                      <Select value={formDriverId} onValueChange={setFormDriverId}>
                         <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                            <SelectValue placeholder="Select persona" />
                         </SelectTrigger>
                         <SelectContent>
                            {driverPersonas.map(p => (
                               <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-500">Operational Category</Label>
                      <Select value={formType} onValueChange={setFormType as any}>
                         <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                            <SelectValue placeholder="Expense type" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="FUEL">FUEL - Refuel Diesel</SelectItem>
                            <SelectItem value="TOLL">TOLL - FastTag charges</SelectItem>
                            <SelectItem value="ADVANCE">ADVANCE - Cash halt releases</SelectItem>
                            <SelectItem value="MAINTENANCE">MAINTENANCE - Mechanical bay</SelectItem>
                            <SelectItem value="OTHER">OTHER - Miscellaneous logs</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-500">Claim Amount (₹)</Label>
                      <Input 
                        type="number" 
                        value={formAmount} 
                        onChange={e => setFormAmount(e.target.value)}
                        required
                        className="h-11 rounded-lg border-slate-200 font-bold focus-visible:ring-blue-600" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-500">Associated Trip Reference</Label>
                      <Input 
                        placeholder="e.g. T1001" 
                        value={formTrip} 
                        onChange={e => setFormTrip(e.target.value)}
                        required
                        className="h-11 rounded-lg border-slate-200 uppercase font-mono" 
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <Label className="text-xs font-bold uppercase text-slate-500">Expense Detailed Description</Label>
                   <Input 
                     placeholder="e.g. Diesel refilling 50L at Highway HP outlet" 
                     value={formDesc} 
                     onChange={e => setFormDesc(e.target.value)}
                     className="h-11 rounded-lg border-slate-200 font-medium" 
                   />
                </div>

                <div className="space-y-1.5">
                   <Label className="text-xs font-bold uppercase text-slate-500">Interactive Bill slip receipt file name</Label>
                   <Input 
                     placeholder="e.g. refuel_receipt_6112.jpg" 
                     value={formAttachment} 
                     onChange={e => setFormAttachment(e.target.value)}
                     className="h-11 rounded-lg border-slate-200 font-mono text-xs" 
                   />
                </div>

                <div className="bg-amber-50 text-amber-900 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2 text-xs leading-relaxed font-semibold">
                   <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                   <p>Manual expenses logged directly by Admin will require review but generate instant digital records. Keep receipt images secure.</p>
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Publish Ledger Entry</Button>
                </DialogFooter>
             </form>
           </DialogContent>
         </Dialog>
      </div>

      {/* Advanced Statistical panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Authorized Fuel Total', value: `₹${totalFuelSum.toLocaleString('en-IN')}`, detail: 'Cleared Diesel slips', color: 'orange', icon: Fuel },
          { label: 'Released Cash Halts', value: `₹${totalAdvancesSum.toLocaleString('en-IN')}`, detail: 'Active driver food allowances', color: 'blue', icon: Briefcase },
          { label: 'Audited Operational Costs', value: `₹${grandTotalCost.toLocaleString('en-IN')}`, detail: 'Sum of all Approved entries', color: 'green', icon: IndianRupee },
          { label: 'Pending Compliance Slips', value: `${pendingRequestsCount}`, detail: 'Awaiting fast audit approval', color: 'yellow', icon: Clock }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
                <stat.icon className={cn(
                  "w-4 h-4",
                  stat.color === 'orange' && "text-amber-500",
                  stat.color === 'blue' && "text-blue-500",
                  stat.color === 'green' && "text-emerald-500",
                  stat.color === 'yellow' && "text-yellow-600 animate-pulse",
                )} />
             </div>
             <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
             <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Controls / Filter Hub */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
         <div className="flex flex-wrap gap-2.5 items-center">
            
            {/* Driver filter dropdown to implement Drivers Personas selection */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 select-none">
               <User className="w-3.5 h-3.5 text-slate-400" />
               <select 
                 className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                 value={driverFilter}
                 onChange={e => setDriverFilter(e.target.value)}
               >
                  <option value="ALL">All Captain Personas</option>
                  {driverPersonas.map(d => (
                     <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
               </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 select-none">
               <Layers className="w-3.5 h-3.5 text-slate-400" />
               <select 
                 className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                 value={categoryFilter}
                 onChange={e => setCategoryFilter(e.target.value)}
               >
                  <option value="ALL">All Categories</option>
                  <option value="FUEL">FUEL</option>
                  <option value="TOLL">TOLL</option>
                  <option value="ADVANCE">ADVANCES</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="OTHER">OTHER</option>
               </select>
            </div>

            {/* Status pills Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-100 rounded-lg select-none">
               {([
                  { id: 'ALL', label: 'All Audit' },
                  { id: 'APPROVED', label: 'Approved' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'DISPUTED', label: 'Disputed' }
               ] as const).map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                       "text-[10px] font-extrabold uppercase px-2 py-1 rounded transition-colors border-none",
                       statusFilter === tab.id 
                         ? "bg-slate-900 text-white" 
                         : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

         </div>

         <div className="relative w-full md:max-w-xs">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <Input 
             placeholder="Search ledger receipts, drivers, plates..." 
             className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
      </div>

      {/* Expense ledger listing table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] overflow-hidden">
         <Table className="min-w-[1200px]">
            <TableHeader className="bg-slate-50/90 border-b border-slate-100">
               <TableRow className="hover:bg-transparent">
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400 pl-6">Receipt ID / Date</TableHead>
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Driver Persona</TableHead>
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Category Class</TableHead>
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Allocation Context</TableHead>
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Claim Amount</TableHead>
                  <TableHead className="h-12 uppercase text-[10px] font-black tracking-wider text-slate-400">Audit Status</TableHead>
                  <TableHead className="h-12 text-right uppercase text-[10px] font-black tracking-wider text-slate-400 pr-6">Clearing Controls</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               <AnimatePresence mode="popLayout">
                  {filteredExpenses.map((exp) => (
                     <TableRow key={exp.id} className="border-b border-slate-50/80 transition-colors duration-200 h-16 hover:bg-blue-50/70 hover:shadow-[inset_3px_0_0_0_rgba(37,99,235,0.9)]">
                        
                        {/* Reference and Date */}
                        <TableCell className="pl-6 font-sans">
                           <span className="font-mono font-black text-xs text-blue-600 block">{exp.id}</span>
                           <span className="text-[10.5px] text-slate-400 font-bold block mt-0.5">{exp.date}</span>
                        </TableCell>

                        {/* Driver & Truck Plate alignment */}
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 select-none">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${exp.driverName}`} alt="" />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-800 leading-none">{exp.driverName}</p>
                                 <code className="text-[10px] font-mono font-bold text-slate-400 block mt-1 uppercase">{exp.vehiclePlate}</code>
                              </div>
                           </div>
                        </TableCell>

                        {/* Category Symbol and Name */}
                        <TableCell>
                           <div className="flex items-center gap-1.5">
                              {exp.type === 'FUEL' && <Fuel className="w-3.5 h-3.5 text-amber-500 fill-amber-50/20" />}
                              {exp.type === 'TOLL' && <Receipt className="w-3.5 h-3.5 text-blue-500" />}
                              {exp.type === 'ADVANCE' && <Briefcase className="w-3.5 h-3.5 text-emerald-600" />}
                              {exp.type === 'MAINTENANCE' && <Activity className="w-3.5 h-3.5 text-indigo-500" />}
                              {exp.type === 'OTHER' && <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />}
                              <span className="text-xs font-extrabold text-slate-700 font-mono tracking-wide mt-0.5 uppercase">{exp.type}</span>
                           </div>
                        </TableCell>

                        {/* Associated Trip Context */}
                        <TableCell>
                           <p className="text-xs font-bold text-[#1E293B] truncate max-w-xs">{exp.description}</p>
                           <span className="text-[9.5px] uppercase font-mono font-black text-slate-400 mt-1 block">Trip ref: {exp.tripId}</span>
                        </TableCell>

                        {/* Financial Allocation Value */}
                        <TableCell className="font-mono text-xs font-black text-slate-900 text-left">
                           ₹{exp.amount.toLocaleString('en-IN')}.00
                        </TableCell>

                        {/* Clear Status levels badge */}
                        <TableCell>
                           <Badge 
                             className={cn(
                                "border-none shadow-none font-black text-[10px] py-0.5 px-2 uppercase tracking-wide",
                                exp.status === 'APPROVED' && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                                exp.status === 'PENDING' && "bg-amber-50 text-amber-800 hover:bg-amber-100",
                                exp.status === 'DISPUTED' && "bg-red-50 text-red-800 hover:bg-red-100"
                             )}
                           >
                              {exp.status}
                           </Badge>
                        </TableCell>

                        {/* Clearance action handlers */}
                        <TableCell className="text-right pr-6 space-x-1 font-sans">
                           <Button 
                             size="xs" 
                             variant="outline"
                             onClick={() => {
                               setSelectedExpense(exp);
                               setIsReceiptOpen(true);
                             }}
                             className="border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] h-7.5"
                           >
                              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> View Ticket
                           </Button>

                           <Select 
                             value={exp.status} 
                             onValueChange={(val: any) => updateStatus(exp.id, val)}
                           >
                              <SelectTrigger className="inline-flex w-24 h-7.5 border-slate-200 text-[10.5px] font-extrabold rounded-lg">
                                 <SelectValue placeholder="Action" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="APPROVED">✓ Approve</SelectItem>
                                 <SelectItem value="PENDING">⏱ Hold</SelectItem>
                                 <SelectItem value="DISPUTED">✕ Dispute</SelectItem>
                              </SelectContent>
                           </Select>

                           <Button 
                             size="xs" 
                             variant="ghost"
                             onClick={() => handleDeleteExpense(exp.id)}
                             className="text-slate-300 hover:text-red-500 h-8 w-8 px-0 rounded-lg"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </Button>
                        </TableCell>

                     </TableRow>
                  ))}
               </AnimatePresence>

               {filteredExpenses.length === 0 && (
                  <TableRow>
                     <TableCell colSpan={7} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                           <AlertOctagon className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                           <p className="font-extrabold text-slate-800 text-sm">No matched matched expense entries</p>
                           <p className="text-xs text-slate-400 font-medium">Reset search keywords or filter values to view B2B logistical clearings.</p>
                        </div>
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>

      {/* Receipt detailed sheet viewer modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
         <DialogContent className="sm:max-w-[480px] rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-lg font-black text-slate-950 flex items-center justify-between">
                  <span>Ledger Clearing Slip Receipt</span>
                  <span className="text-[11px] font-mono font-black text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                     {selectedExpense?.id}
                  </span>
               </DialogTitle>
            </DialogHeader>

            {selectedExpense && (
               <div className="space-y-4 py-1 text-slate-800 text-xs md:text-sm font-bold font-sans">
                  
                  {/* Driver Header identity summary */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedExpense.driverName}`} alt="" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{selectedExpense.driverName}</p>
                        <p className="text-slate-400 font-bold block mt-1">Plate Number: {selectedExpense.vehiclePlate} • Track Ref: {selectedExpense.tripId}</p>
                     </div>
                  </div>

                  {/* Receipt breakdown contents list */}
                  <div className="border border-slate-150 p-4 rounded-xl space-y-3 bg-slate-50/30">
                     <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100 pb-2">
                        <span>LEDGER KEY METRIC</span>
                        <span>VALUE RECORDED</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Expense Category Type:</span>
                        <span className="text-slate-800 font-black uppercase text-xs">{selectedExpense.type} refilling info</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Claimant Submission Date:</span>
                        <span className="text-slate-800 font-black font-mono">{selectedExpense.date}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Claims validation Audit:</span>
                        <span className={cn(
                           "font-black text-[11px] uppercase",
                           selectedExpense.status === 'APPROVED' && "text-emerald-700",
                           selectedExpense.status === 'PENDING' && "text-amber-800 animate-pulse",
                           selectedExpense.status === 'DISPUTED' && "text-red-700"
                        )}>
                           {selectedExpense.status} State
                        </span>
                     </div>
                     <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 text-indigo-950 font-black">
                        <span>Total Claim Value:</span>
                        <span className="text-base font-black font-mono">₹{selectedExpense.amount.toLocaleString('en-IN')}.00</span>
                     </div>
                  </div>

                  {/* Simulated Receipt paper bill */}
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl space-y-2 bg-yellow-50/20 text-center relative select-none">
                     <span className="text-[10px] font-black text-indigo-700 absolute top-2 right-3 uppercase font-mono tracking-widest">{selectedExpense.type} LOG</span>
                     <Receipt className="w-8 h-8 text-slate-400/80 mx-auto" />
                     <p className="text-xs font-black text-slate-700 mt-1.5 font-mono">{selectedExpense.attachmentName || 'scanned_payload_receipt.pdf'}</p>
                     <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto italic">{selectedExpense.description}</p>
                  </div>

                  {/* Action row */}
                  <DialogFooter className="pt-2 border-t border-slate-100 gap-2">
                     <Button type="button" variant="outline" onClick={() => setIsReceiptOpen(false)} className="rounded-xl h-10 w-full font-bold">
                        Dismiss Receipt Dialog
                     </Button>
                     <Button type="button" onClick={handleDownloadReceipt} className="bg-indigo-600 border-none hover:bg-indigo-700 text-white font-extrabold rounded-xl h-10 w-full">
                        <Download className="w-4 h-4 mr-1.5" /> Download Bill Slip PDF
                     </Button>
                  </DialogFooter>

               </div>
            )}
         </DialogContent>
      </Dialog>

    </div>
  );
}
