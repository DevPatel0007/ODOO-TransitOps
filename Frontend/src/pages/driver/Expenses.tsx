/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Fuel, 
  Receipt, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  ChevronRight,
  TrendingUp,
  Upload,
  User,
  Coffee,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { motion, AnimatePresence } from 'motion/react';
import { getSharedExpenses, saveSharedExpenses, SharedExpense } from '@/src/lib/expenseStore';

export default function DriverExpenses() {
  const currentDriverId = 'd1'; // Rajesh Kumar
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [claimCategory, setClaimCategory] = useState<'FUEL' | 'TOLL' | 'ADVANCE' | 'MAINTENANCE' | 'OTHER'>('FUEL');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimTrip, setClaimTrip] = useState('T1001');
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Sync state
  useEffect(() => {
    setExpenses(getSharedExpenses());

    const handleSync = () => {
      setExpenses(getSharedExpenses());
    };
    window.addEventListener('storage_expenses_update', handleSync);
    return () => {
      window.removeEventListener('storage_expenses_update', handleSync);
    };
  }, []);

  // Filter ONLY current driver's expenses
  const myExpenses = expenses.filter(e => e.driverId === currentDriverId);

  // Totals calculations
  const myTotalPending = myExpenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
  const myTotalApproved = myExpenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || parseFloat(claimAmount) <= 0) {
      toast.error('Please specify a positive claim amount.');
      return;
    }

    const newClaim: SharedExpense = {
      id: `EXP-${9000 + Math.floor(Math.random() * 950)}`,
      driverId: currentDriverId,
      driverName: 'Rajesh Kumar',
      vehiclePlate: 'MH-12-AB-1234',
      tripId: claimTrip.toUpperCase() || 'T1001',
      type: claimCategory,
      amount: parseFloat(claimAmount),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: claimDesc || `${claimCategory} bill submitted en-route by Captain Rajesh.`,
      status: 'PENDING',
      attachmentName: selectedFile || `${claimCategory.toLowerCase()}_slip_uploaded.png`
    };

    const updated = [newClaim, ...expenses];
    setExpenses(updated);
    saveSharedExpenses(updated);

    toast.success('Expense Claim Filed!', {
      description: `Reference ${newClaim.id} has been submitted to the control tower for quick audit clearance.`
    });

    // Reset values
    setClaimAmount('');
    setClaimDesc('');
    setSelectedFile('');
    setIsAddOpen(false);
  };

  const selectMockFile = (fileName: string) => {
    setSelectedFile(fileName);
    toast.info('Slip scanned successfully!', {
      description: `Attached ${fileName} to this expense claim.`
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pb-12 font-sans px-1">
      
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase text-[#10B981] tracking-widest leading-none">Self Service Claims</p>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Pocket Expenses</h2>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-[#2563EB] hover:bg-blue-700 h-11 text-xs font-black uppercase tracking-wider rounded-xl text-white border-none gap-1.5 px-4">
              <Plus className="w-4 h-4" /> File Claim
            </Button>
          } />
          <DialogContent className="max-w-[420px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black tracking-tight text-slate-900">File New Reimbursement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitClaim} className="space-y-4 pt-3 text-sm">
              
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Expense Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'FUEL', label: 'Diesel', icon: Fuel },
                    { id: 'TOLL', label: 'Toll slip', icon: Receipt },
                    { id: 'OTHER', label: 'Food/Rest', icon: Coffee }
                  ] as const).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setClaimCategory(cat.id)}
                      className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        claimCategory === cat.id 
                          ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB]' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <cat.icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Amount (₹)</Label>
                   <Input 
                     type="number" 
                     placeholder="e.g. 1500" 
                     value={claimAmount}
                     onChange={e => setClaimAmount(e.target.value)}
                     required
                     className="h-11 rounded-xl border-slate-200 font-extrabold focus-visible:ring-[#2563EB]"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Active Trip Code</Label>
                   <Input 
                     placeholder="e.g. T1001" 
                     value={claimTrip}
                     onChange={e => setClaimTrip(e.target.value)}
                     required
                     className="h-11 rounded-xl border-slate-200 font-bold uppercase font-mono"
                   />
                 </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Explain the Expense</Label>
                <Input 
                  placeholder="e.g. Toll taxes paid at NH-48 plaza in cash" 
                  value={claimDesc}
                  onChange={e => setClaimDesc(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Upload Slip / Receipt</Label>
                {selectedFile ? (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-emerald-800">
                     <span className="truncate">{selectedFile}</span>
                     <button type="button" onClick={() => setSelectedFile('')} className="text-red-500 font-black ml-2 uppercase text-[10px]">Remove</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       type="button" 
                       onClick={() => selectMockFile('diesel_slip_plaza_3.jpg')}
                       className="h-14 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                     >
                        <Upload className="w-3.5 h-3.5 mb-1 text-slate-400" /> Diesel Slip
                     </button>
                     <button 
                       type="button" 
                       onClick={() => selectMockFile('toll_receipt_99_nh48.pdf')}
                       className="h-14 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                     >
                        <Upload className="w-3.5 h-3.5 mb-1 text-slate-400" /> Toll Receipt
                     </button>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11">Back</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase tracking-wider rounded-xl h-11 px-6 border-none">File Claim</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="geometric-card p-4 bg-white border border-slate-100 flex flex-col justify-center">
           <span className="text-[10px] font-extrabold uppercase text-[#94A3B8] tracking-widest leading-none">PENDING AUDIT</span>
           <p className="text-2xl font-black text-[#0F172A] mt-2 font-mono">₹{myTotalPending.toLocaleString('en-IN')}</p>
           <span className="text-[9px] text-[#64748B] font-bold block mt-1">Awaiting control tower clearance</span>
        </div>
        <div className="geometric-card p-4 bg-[#EFF6FF] border border-blue-50 flex flex-col justify-center">
           <span className="text-[10px] font-extrabold uppercase text-[#2563EB] tracking-widest leading-none">CLEARED BACK</span>
           <p className="text-2xl font-black text-[#2563EB] mt-2 font-mono">₹{myTotalApproved.toLocaleString('en-IN')}</p>
           <span className="text-[9px] text-blue-600/70 font-bold block mt-1">Credited directly to wallet bank</span>
        </div>
      </div>

      {/* Claims list */}
      <div className="space-y-3.5">
         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Claims Filing History</h3>

         <AnimatePresence mode="popLayout">
           {myExpenses.map((exp, i) => (
             <motion.div
               key={exp.id}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden"
             >
                <div className="flex items-center gap-3">
                   {/* Categorical Emblem */}
                   <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      exp.type === 'FUEL' ? 'bg-amber-50 text-amber-600' :
                      exp.type === 'TOLL' ? 'bg-blue-50 text-blue-600' :
                      'bg-emerald-50 text-emerald-600'
                   }`}>
                      {exp.type === 'FUEL' ? <Fuel className="w-5 h-5" /> :
                       exp.type === 'TOLL' ? <Receipt className="w-5 h-5" /> :
                       <Coffee className="w-5 h-5" />}
                   </div>

                   {/* Item descriptions */}
                   <div className="space-y-0.5 truncate max-w-[160px] md:max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                         <span className="text-xs font-extrabold text-slate-800 truncate">{exp.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <span className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-tight">{exp.id} • {exp.date}</span>
                      </div>
                   </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-sm font-black text-slate-900 font-mono">₹{exp.amount.toLocaleString('en-IN')}</span>
                  <Badge 
                    className={`border-none shadow-none font-black text-[9px] px-1.5 py-0.5 uppercase tracking-wide rounded-md ${
                       exp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                       exp.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                       'bg-red-50 text-red-700'
                    }`}
                  >
                     {exp.status}
                  </Badge>
                </div>
             </motion.div>
           ))}
         </AnimatePresence>

         {myExpenses.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
               <span className="text-2xl mb-1 block">💸</span>
               <p className="text-xs font-black text-slate-700">No pockets claims recorded yet</p>
               <p className="text-[10px] text-slate-400 mt-1">Tap "File Claim" up top to add fuel or toll payments.</p>
            </div>
         )}
      </div>

    </div>
  );
}
