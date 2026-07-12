/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail,
  Star,
  MapPin,
  Filter,
  User,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  SlidersHorizontal,
  Trash2,
  Settings,
  PhoneCall,
  Activity,
  Heart,
  ChevronRight,
  ClipboardList,
  Sparkles
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
import { mockDrivers as initialDrivers } from '@/src/data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SimulatedDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
  rating: number;
  
  // High fidelity diagnostics extensions
  experienceYrs: number;
  medicallyCheck?: 'COMPLIANT' | 'EXPIRED';
  bgVerified?: boolean;
  emergencyContact: string;
  tripsLogged: number;
}

import { getSharedDrivers, saveSharedDrivers, SharedDriver } from '@/src/lib/driverStore';
import { getSharedVehicles, saveSharedVehicles, SharedVehicle } from '@/src/lib/vehicleStore';

export default function DriverList() {
  const [drivers, setDrivers] = useState<SharedDriver[]>([]);
  const [vehicles, setVehicles] = useState<SharedVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE'>('ALL');
  
  // Create / Onboard Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLic, setFormLic] = useState('');
  const [formExp, setFormExp] = useState('5');
  const [formEmergency, setFormEmergency] = useState('');
  const [formMedical, setFormMedical] = useState<'COMPLIANT' | 'EXPIRED'>('COMPLIANT');
  const [formAssignedVehicle, setFormAssignedVehicle] = useState('NONE');

  // Rating modal states
  const [selectedDriverForRating, setSelectedDriverForRating] = useState<SharedDriver | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [customRating, setCustomRating] = useState('5.0');

  useEffect(() => {
    setDrivers(getSharedDrivers());
    setVehicles(getSharedVehicles());

    const handleDriversSync = () => {
      setDrivers(getSharedDrivers());
    };
    const handleVehiclesSync = () => {
      setVehicles(getSharedVehicles());
    };

    window.addEventListener('axisfleet_drivers_update', handleDriversSync);
    window.addEventListener('axisfleet_vehicles_update', handleVehiclesSync);

    return () => {
      window.removeEventListener('axisfleet_drivers_update', handleDriversSync);
      window.removeEventListener('axisfleet_vehicles_update', handleVehiclesSync);
    };
  }, []);

  // Bi-directional assign truck handler
  const handleAssignVehicle = (driverId: string, vehicleNo: string) => {
    const currentDrivers = getSharedDrivers();
    const currentVehicles = getSharedVehicles();

    // 1. Update Drivers
    const updatedDrivers = currentDrivers.map(d => {
      if (d.id === driverId) {
        return { ...d, assignedVehicleNo: vehicleNo === 'NONE' ? undefined : vehicleNo };
      }
      // If another driver was assigned to this vehicle, unassign them
      if (vehicleNo !== 'NONE' && d.assignedVehicleNo === vehicleNo) {
        return { ...d, assignedVehicleNo: undefined };
      }
      return d;
    });

    // 2. Update Vehicles
    const updatedVehicles = currentVehicles.map(v => {
      // Clear old vehicle matching: if it was assigned to this driver, clear it
      if (v.assignedDriverId === driverId && v.numberPlate !== vehicleNo) {
        return { ...v, assignedDriverId: undefined };
      }
      // Set new driver for target vehicle
      if (vehicleNo !== 'NONE' && v.numberPlate === vehicleNo) {
        return { ...v, assignedDriverId: driverId };
      }
      return v;
    });

    saveSharedDrivers(updatedDrivers);
    saveSharedVehicles(updatedVehicles);

    toast.success('Assignment Updated Successfully!', {
      description: vehicleNo === 'NONE' 
        ? 'Driver captain released from active vehicle rig.' 
        : `Captain assigned to fleet truck ${vehicleNo} bi-directionally.`
    });
  };

  // Submit handler to add driver
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formLic) {
      toast.error('Please input Captain name, contact phone and DL license.');
      return;
    }

    const currentDrivers = getSharedDrivers();
    const newId = `d${currentDrivers.length + 1}`;
    const newDriver: SharedDriver = {
      id: newId,
      name: formName,
      phone: formPhone,
      licenseNumber: formLic.toUpperCase(),
      status: 'AVAILABLE',
      rating: 5.0,
      experienceYrs: parseInt(formExp) || 3,
      medicallyCheck: formMedical,
      bgVerified: true,
      emergencyContact: formEmergency || 'Primary Next of Kin Office Logged',
      tripsLogged: 0,
      assignedVehicleNo: formAssignedVehicle === 'NONE' ? undefined : formAssignedVehicle
    };

    const updatedDrivers = [...currentDrivers, newDriver];
    saveSharedDrivers(updatedDrivers);

    // If pre-assigned vehicle, link with vehicle
    if (formAssignedVehicle !== 'NONE') {
      const currentVehicles = getSharedVehicles();
      const updatedVehicles = currentVehicles.map(v => {
        if (v.numberPlate === formAssignedVehicle) {
          return { ...v, assignedDriverId: newId };
        }
        return v;
      });
      saveSharedVehicles(updatedVehicles);
    }

    toast.success(`Captain ${formName} Onboarded!`, {
      description: 'Physical records, driver license, and vehicle link synced in real-time.'
    });

    // Reset Form Fields
    setFormName('');
    setFormPhone('');
    setFormLic('');
    setFormExp('5');
    setFormEmergency('');
    setFormAssignedVehicle('NONE');
    setIsAddOpen(false);
  };

  // Change Operational Status directly
  const handleToggleStatus = (id: string, current: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE') => {
    let next: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' = 'AVAILABLE';
    if (current === 'AVAILABLE') next = 'OFFLINE';
    else if (current === 'OFFLINE') next = 'AVAILABLE';
    else if (current === 'ON_TRIP') {
      toast.warning('Driver is currently on active transit corridor!', {
        description: 'Complete his assigned shipment delivery block before changing status.'
      });
      return;
    }

    const currentDrivers = getSharedDrivers();
    const updated = currentDrivers.map(d => {
      if (d.id === id) {
        toast.info(`Status Updated for ${d.name}`, {
          description: `Set to ${next.replace('_', ' ')}`
        });
        return { ...d, status: next };
      }
      return d;
    });
    saveSharedDrivers(updated);
  };

  // Interactive Medical Permit renewer
  const handleRenewMedical = (id: string, name: string) => {
    const currentDrivers = getSharedDrivers();
    const updated = currentDrivers.map(d => {
      if (d.id === id) {
        toast.success(`Medical Fitness Sheet Renewed for ${name}!`, {
          description: 'Verified active certification log added to HR system.'
        });
        return { ...d, medicallyCheck: 'COMPLIANT' as const };
      }
      return d;
    });
    saveSharedDrivers(updated);
  };

  // Save new review scores
  const handleSaveRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverForRating) return;
    
    const currentDrivers = getSharedDrivers();
    const updated = currentDrivers.map(d => {
      if (d.id === selectedDriverForRating.id) {
        return { ...d, rating: parseFloat(customRating) || 5.0 };
      }
      return d;
    });
    saveSharedDrivers(updated);

    toast.success(`Rating logged for Captain ${selectedDriverForRating.name}`, {
      description: `Target score updated to ${customRating} Stars successfully.`
    });
    setIsRatingOpen(false);
    setSelectedDriverForRating(null);
  };

  // Decommission/remove driver
  const handleDecommissionDriver = (id: string, name: string) => {
    const currentDrivers = getSharedDrivers();
    const updated = currentDrivers.filter(d => d.id !== id);
    saveSharedDrivers(updated);

    // Also clear assigned driver ID from vehicles
    const currentVehicles = getSharedVehicles();
    const updatedVehicles = currentVehicles.map(v => {
      if (v.assignedDriverId === id) {
        return { ...v, assignedDriverId: undefined };
      }
      return v;
    });
    saveSharedVehicles(updatedVehicles);

    toast.error(`Captain ${name} Decommissioned`, {
      description: 'The driver profile has been deactivated and archived.'
    });
  };

  // Dial cellular bridge
  const handleCellBridge = (name: string, phone: string) => {
    toast.info(`Bridge cellular setup to Captain ${name}`, {
      description: `Rerouting admin line to standard GSM cell ${phone} safely.`
    });
  };

  // Filter calculations
  const cleanSearch = searchTerm.toLowerCase();
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(cleanSearch) || 
      d.licenseNumber.toLowerCase().includes(cleanSearch) || 
      d.phone.includes(cleanSearch);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && d.status === statusFilter;
  });

  // Highlight Stats calculations
  const availableCaptainsCount = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTransitCount = drivers.filter(d => d.status === 'ON_TRIP').length;
  const compliantMedicalRatio = drivers.filter(d => d.medicallyCheck === 'COMPLIANT').length;
  const avgTrustScore = drivers.length > 0 
    ? (drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length).toFixed(2) 
    : '5.00';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-[#01091a] tracking-tight leading-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600 animate-pulse" /> Fleet Captains Control
          </h2>
          <p className="text-sm text-[#64748B] font-medium leading-relaxed">
            Verify BG check credentials, monitor captain ratings, inspect physical health profiles, and setup emergency cellular links.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-lg text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all active:scale-95 border-none">
              <Plus className="w-5 h-5" />
              Onboard New Captain
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
                 <User className="text-blue-600 w-5 h-5" /> Onboard Fleet Captain
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddDriver} className="space-y-5 py-2 font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Captain Full Name</Label>
                  <Input 
                    placeholder="e.g. Ramesh Patel" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    required 
                    className="h-11 rounded-lg border-slate-200 font-bold focus-visible:ring-blue-600" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Experience (Years)</Label>
                  <Input 
                    type="number" 
                    placeholder="6" 
                    value={formExp} 
                    onChange={e => setFormExp(e.target.value)} 
                    required 
                    className="h-11 rounded-lg border-slate-200 font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-xs font-bold uppercase text-slate-500">Contact GSM Number</Label>
                 <Input 
                   placeholder="e.g. +91 99221 XXXXX" 
                   value={formPhone} 
                   onChange={e => setFormPhone(e.target.value)} 
                   required
                   className="h-11 rounded-lg border-slate-200" 
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-slate-500">Driving Permit DL Code</Label>
                    <Input 
                      placeholder="DL-22XXXXXXXXX" 
                      value={formLic} 
                      onChange={e => setFormLic(e.target.value)} 
                      required
                      className="h-11 rounded-lg border-slate-200 uppercase font-mono" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-slate-500">Medical Fitness Status</Label>
                    <Select value={formMedical} onValueChange={setFormMedical as any}>
                       <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                          <SelectValue placeholder="Medical health" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="COMPLIANT">Compliant / Pass</SelectItem>
                          <SelectItem value="EXPIRED">Awaiting Eye check</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-slate-500">Assign Initial Vehicle</Label>
                    <Select value={formAssignedVehicle} onValueChange={setFormAssignedVehicle}>
                       <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold bg-white text-slate-900">
                          <SelectValue placeholder="No vehicle assigned" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="NONE">Unassigned (No Rig)</SelectItem>
                          {vehicles.map((v) => (
                             <SelectItem key={v.id} value={v.numberPlate}>
                                {v.numberPlate} ({v.type})
                             </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1.5 flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 font-extrabold italic pb-1">Note: Bi-directional link will be set automatically.</span>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-xs font-bold uppercase text-slate-500">Emergency Family Contact Info</Label>
                 <Input 
                   placeholder="e.g. Maya Patel (Wife) • +91 99999 ..." 
                   value={formEmergency} 
                   onChange={e => setFormEmergency(e.target.value)} 
                   className="h-11 rounded-lg border-slate-200" 
                 />
              </div>

              <div className="bg-blue-50 text-blue-900 border border-blue-100 p-3.5 rounded-xl flex items-start gap-2 text-xs leading-relaxed font-semibold">
                 <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <p>By onboarding, you acknowledge that background character verification and standard drug evaluations have been cataloged inside physical lockers.</p>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Publish & Archive</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced performance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Standby Captains', value: `${availableCaptainsCount}`, detail: 'Ready for active assignment', icon: ShieldCheck, color: 'green' },
          { label: 'On Shipment Corridors', value: `${onTransitCount}`, detail: 'Active truck navigation log', icon: Activity, color: 'blue' },
          { label: 'Medical Clearance Pass', value: `${compliantMedicalRatio} / ${drivers.length}`, detail: 'Periodic eye checks compliance', icon: Heart, color: 'yellow' },
          { label: 'Avg Fleet Reputation Score', value: `${avgTrustScore} ★`, detail: 'Out of 5.0 Rating standard', icon: Star, color: 'indigo' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
                <stat.icon className={cn(
                  "w-4 h-4",
                  stat.color === 'green' && "text-emerald-500",
                  stat.color === 'blue' && "text-blue-500",
                  stat.color === 'yellow' && "text-amber-500",
                  stat.color === 'indigo' && "text-indigo-500 animate-spin-slow",
                )} />
             </div>
             <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
             <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Filters pill row */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
         <div className="flex flex-wrap gap-1.5">
           {([
             { id: 'ALL', label: 'All Personnel' },
             { id: 'AVAILABLE', label: '📋 Standby Available' },
             { id: 'ON_TRIP', label: '⚡ active On Road' },
             { id: 'OFFLINE', label: '✕ Offline/On-Leave' },
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
             placeholder="Search name, License, phone..." 
             className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
      </div>

      {/* Grid listing of expanded visual driver profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <AnimatePresence mode="popLayout">
           {filteredDrivers.map((driver) => (
             <motion.div
               key={driver.id}
               layout
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className={cn(
                 "bg-white rounded-2xl border p-5 md:p-6 transition-all shadow-sm flex flex-col justify-between gap-5 hover:shadow-md",
                 driver.medicallyCheck === 'EXPIRED' ? "border-amber-400/80 bg-amber-50/5" : "border-slate-100"
               )}
             >
                {/* Driver Identity Card Body */}
                <div className="space-y-4">
                   
                   {/* Avatar/Badge Row */}
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-100 shadow shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt="" />
                         </div>
                         <div>
                            <h3 className="font-black text-slate-900 text-base leading-tight">{driver.name}</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mt-0.5">Permit ID: {driver.id.toUpperCase()}</p>
                         </div>
                      </div>

                      <Badge 
                        className={cn(
                          "font-extrabold border-none text-[10px] py-0.5 px-2.5 shadow-none tracking-wide",
                          driver.status === 'AVAILABLE' && "bg-[#DCFCE7] text-[#166534]",
                          driver.status === 'ON_TRIP' && "bg-[#EFF6FF] text-[#2563EB]",
                          driver.status === 'OFFLINE' && "bg-slate-100 text-slate-500"
                        )}
                      >
                         {driver.status.replace('_', ' ')}
                      </Badge>
                   </div>

                   {/* Regulatory / Compliance details list */}
                   <div className="space-y-2 py-1">
                      <div className="flex justify-between items-center text-xs">
                         <span className="font-bold text-slate-400">Driving License</span>
                         <code className="text-xs font-mono font-black text-slate-900 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                            {driver.licenseNumber}
                         </code>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                         <span className="font-bold text-slate-400">Experience Age</span>
                         <span className="text-slate-800 font-extrabold">{driver.experienceYrs} Years Duty Log</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                         <span className="font-bold text-slate-400">Medical Check</span>
                         {driver.medicallyCheck === 'COMPLIANT' ? (
                            <span className="text-emerald-700 flex items-center gap-1 font-extrabold text-[11px]">
                               ✓ Compliant Pass
                            </span>
                         ) : (
                            <span className="text-amber-800 flex items-center gap-1 font-extrabold text-[11px] animate-pulse">
                               ⚠️ Cert Expired
                            </span>
                         )}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="font-bold text-slate-400">Total Trips logs</span>
                         <span className="text-blue-600 font-black font-mono">{driver.tripsLogged} completed</span>
                      </div>
                   </div>

                   {/* Background Alert check display info box */}
                   {driver.medicallyCheck === 'EXPIRED' && (
                     <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[11.5px] text-amber-900 font-bold leading-relaxed">
                        ⚠️ Physical fit sheet renewal block. Please click below to renew certificate immediately.
                     </div>
                   )}

                   {/* Dynamic vehicle assignment box */}
                   <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block leading-none">Assigned Fleet Truck</span>
                      <select
                        value={driver.assignedVehicleNo || "NONE"}
                        onChange={(e) => handleAssignVehicle(driver.id, e.target.value)}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 py-1 px-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="NONE">Unassigned (No Rig)</option>
                        {vehicles.map((v) => (
                           <option key={v.id} value={v.numberPlate}>
                              {v.numberPlate} ({v.type})
                           </option>
                        ))}
                      </select>
                   </div>

                   {/* Emergency contact card footer segment */}
                   <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block leading-none">Emergency Kin</span>
                      <p className="text-[11px] text-slate-700 font-extrabold mt-1 truncate">{driver.emergencyContact}</p>
                   </div>

                </div>

                {/* Driver specific interactive button nodes */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2">
                   
                   {/* Left action widgets */}
                   <div className="flex items-center gap-1">
                      <Button 
                        size="xs" 
                        variant="outline"
                        onClick={() => handleCellBridge(driver.name, driver.phone)}
                        className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 font-extrabold text-[11px] h-8 rounded-lg"
                      >
                         <PhoneCall className="w-3.5 h-3.5" /> Call
                      </Button>
                      
                      {driver.medicallyCheck === 'EXPIRED' && (
                         <Button 
                           size="xs" 
                           onClick={() => handleRenewMedical(driver.id, driver.name)}
                           className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] h-8 rounded-lg border-none"
                         >
                            Renew Cert
                         </Button>
                      )}
                      
                      {driver.status !== 'ON_TRIP' && (
                         <Button 
                           size="xs" 
                           variant="ghost"
                           onClick={() => handleToggleStatus(driver.id, driver.status)}
                           className="text-slate-500 hover:text-slate-900 border-none font-extrabold text-[11px] h-8"
                         >
                            Toggle Active
                         </Button>
                      )}
                   </div>

                   {/* Right rating/trust action */}
                   <div className="flex items-center gap-1">
                      <Button 
                        size="xs" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedDriverForRating(driver);
                          setCustomRating(driver.rating.toString());
                          setIsRatingOpen(true);
                        }}
                        className="text-yellow-800 hover:text-yellow-600 hover:bg-yellow-50 font-black text-xs h-8 rounded-lg"
                      >
                         ★ {driver.rating}
                      </Button>
                      
                      <Button 
                        size="xs" 
                        variant="ghost"
                        onClick={() => handleDecommissionDriver(driver.id, driver.name)}
                        className="text-slate-400 hover:text-red-600 font-bold h-8 w-8 px-0 rounded-lg shrink-0"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                   </div>

                </div>

             </motion.div>
           ))}
         </AnimatePresence>

         {filteredDrivers.length === 0 && (
           <div className="md:col-span-3 bg-slate-50 border border-dashed border-slate-200 py-16 text-center rounded-3xl space-y-4">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
              <div className="max-w-xs mx-auto space-y-1">
                 <p className="font-extrabold text-slate-800 text-sm">No matched registered driver captains</p>
                 <p className="text-xs text-slate-400 font-medium">Clear search filters or onboard a custom personnel above to simulate live logistics tracking.</p>
              </div>
              <Button onClick={() => setStatusFilter('ALL')} variant="outline" className="rounded-xl border-slate-200">
                 Show All Personnel
              </Button>
           </div>
         )}
      </div>

      {/* Star Rating Dialog Clearer */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
         <DialogContent className="sm:max-w-[400px] rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-1.5">
                  <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" /> Log Captain Performance Score
               </DialogTitle>
            </DialogHeader>

            {selectedDriverForRating && (
               <form onSubmit={handleSaveRating} className="space-y-5 py-2 font-sans text-sm">
                  <div className="space-y-1 bg-slate-50 p-4 rounded-xl text-center">
                     <p className="text-xs text-slate-400 font-bold">RATE CAPTAIN</p>
                     <p className="font-black text-slate-900 text-lg">{selectedDriverForRating.name}</p>
                     <p className="text-xs text-slate-500 font-medium font-mono">{selectedDriverForRating.licenseNumber}</p>
                  </div>

                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold text-slate-500 uppercase">Specify Rating (1.0 to 5.0 Stars)</Label>
                     <Select value={customRating} onValueChange={setCustomRating}>
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                           <SelectValue placeholder="Rating Score" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="5.0">★★★★★ 5.0 Stars (Gold Standard)</SelectItem>
                           <SelectItem value="4.5">★★★★☆ 4.5 Stars (Excellent Service)</SelectItem>
                           <SelectItem value="4.0">★★★★☆ 4.0 Stars (Reliable Performance)</SelectItem>
                           <SelectItem value="3.5">★★★☆☆ 3.5 Stars (Minor Delays log)</SelectItem>
                           <SelectItem value="2.5">★★☆☆☆ 2.5 Stars (Regulatory flag alert)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                     <Button type="button" variant="outline" onClick={() => setIsRatingOpen(false)} className="rounded-xl h-11">Close</Button>
                     <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold rounded-xl h-11 px-6 border-none">✓ Update Trust Rating</Button>
                  </DialogFooter>
               </form>
            )}
         </DialogContent>
      </Dialog>

    </div>
  );
}
