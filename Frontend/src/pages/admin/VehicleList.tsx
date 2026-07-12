/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Truck, 
  AlertCircle,
  FileText,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Gauge,
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  Settings,
  Flame,
  LifeBuoy,
  PlusCircle,
  Wrench,
  GaugeCircle,
  Check,
  Zap,
  SlidersHorizontal,
  Trash2
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
import { mockVehicles as initialVehicles } from '@/src/data';
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

interface SimulatedVehicle {
  id: string;
  numberPlate: string;
  type: string;
  capacity: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  insuranceExpiry: string;
  
  // Custom interactive diagnostics
  frontLeftTireWear: number; // %
  frontRightTireWear: number; // %
  rearLeftTireWear: number; // %
  rearRightTireWear: number; // %
  lastTireChangeDate: string;
  tirePressurePsi: number; // PSI
  lastServiceDate: string;
  nextServiceDueDate: string;
  serviceCompletedTasks: string[];
}

const extendedVehicles: SimulatedVehicle[] = [
  { 
    id: 'v1', 
    numberPlate: 'MH-12-AB-1234', 
    type: '12-Wheeler Heavy Duty Truck', 
    capacity: '20 Tons', 
    status: 'ON_TRIP', 
    insuranceExpiry: '2026-12-31',
    frontLeftTireWear: 82,
    frontRightTireWear: 85,
    rearLeftTireWear: 71,
    rearRightTireWear: 75,
    lastTireChangeDate: 'Jan 12, 2026',
    tirePressurePsi: 110,
    lastServiceDate: 'Apr 10, 2026',
    nextServiceDueDate: 'Oct 15, 2026',
    serviceCompletedTasks: ['Mobil Engine Oil Flush', 'Brake pad recalibrated', 'Inbound coolant refresh']
  },
  { 
    id: 'v2', 
    numberPlate: 'HR-55-XY-5678', 
    type: 'Interstate Cargo Container', 
    capacity: '15 Tons', 
    status: 'AVAILABLE', 
    insuranceExpiry: '2026-08-15',
    frontLeftTireWear: 94,
    frontRightTireWear: 95,
    rearLeftTireWear: 91,
    rearRightTireWear: 91,
    lastTireChangeDate: 'Apr 02, 2026',
    tirePressurePsi: 115,
    lastServiceDate: 'May 16, 2026',
    nextServiceDueDate: 'Nov 16, 2026',
    serviceCompletedTasks: ['Automatic Gearbox alignment', 'Air cabin filter swap']
  },
  { 
    id: 'v3', 
    numberPlate: 'DL-01-PQ-9012', 
    type: 'Logistics Courier Pickup', 
    capacity: '3 Tons', 
    status: 'MAINTENANCE', 
    insuranceExpiry: '2026-05-20',
    frontLeftTireWear: 42,
    frontRightTireWear: 45,
    rearLeftTireWear: 38,
    rearRightTireWear: 39,
    lastTireChangeDate: 'Jun 14, 2025',
    tirePressurePsi: 95,
    lastServiceDate: 'Nov 10, 2025',
    nextServiceDueDate: 'May 10, 2026',
    serviceCompletedTasks: ['Rear leaf spring recalibrated', 'Tachometer calibration']
  }
];

import { getSharedVehicles, saveSharedVehicles, SharedVehicle } from '@/src/lib/vehicleStore';
import { getSharedDrivers, saveSharedDrivers, SharedDriver } from '@/src/lib/driverStore';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<SharedVehicle[]>([]);
  const [drivers, setDrivers] = useState<SharedDriver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE'>('ALL');

  // Onboard asset form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formPlate, setFormPlate] = useState('');
  const [formType, setFormType] = useState('TRUCK');
  const [formCapacity, setFormCapacity] = useState('12 Tons');
  const [formInsurance, setFormInsurance] = useState('2026-12-31');
  const [formLastService, setFormLastService] = useState('2026-04-10');
  const [formAssignedDriver, setFormAssignedDriver] = useState('NONE');

  // Diagnostics viewing sheet
  const [selectedVehicle, setSelectedVehicle] = useState<SharedVehicle | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  useEffect(() => {
    setVehicles(getSharedVehicles());
    setDrivers(getSharedDrivers());

    const handleVehiclesSync = () => {
      setVehicles(getSharedVehicles());
    };
    const handleDriversSync = () => {
      setDrivers(getSharedDrivers());
    };

    window.addEventListener('axisfleet_vehicles_update', handleVehiclesSync);
    window.addEventListener('axisfleet_drivers_update', handleDriversSync);

    return () => {
      window.removeEventListener('axisfleet_vehicles_update', handleVehiclesSync);
      window.removeEventListener('axisfleet_drivers_update', handleDriversSync);
    };
  }, []);

  // Bi-directional assign driver handler
  const handleAssignDriver = (vehicleId: string, driverId: string) => {
    const currentVehicles = getSharedVehicles();
    const currentDrivers = getSharedDrivers();

    const targetVehicle = currentVehicles.find(v => v.id === vehicleId);
    if (!targetVehicle) return;

    // 1. Update Vehicles
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === vehicleId) {
        return { ...v, assignedDriverId: driverId === 'NONE' ? undefined : driverId };
      }
      // If another vehicle was assigned to this driver, clear it
      if (driverId !== 'NONE' && v.assignedDriverId === driverId) {
        return { ...v, assignedDriverId: undefined };
      }
      return v;
    });

    // 2. Update Drivers
    const updatedDrivers = currentDrivers.map(d => {
      // Clear old driver mapping: if it had this vehicle plate, unassign
      if (d.assignedVehicleNo === targetVehicle.numberPlate && d.id !== driverId) {
        return { ...d, assignedVehicleNo: undefined };
      }
      // Set new vehicle for target driver
      if (driverId !== 'NONE' && d.id === driverId) {
        return { ...d, assignedVehicleNo: targetVehicle.numberPlate };
      }
      return d;
    });

    saveSharedVehicles(updatedVehicles);
    saveSharedDrivers(updatedDrivers);

    toast.success('Driver Assignment Updated!', {
      description: driverId === 'NONE'
        ? 'No driver is currently bound to this truck.'
        : `Driver captain is now bi-directionally linked to fleet truck ${targetVehicle.numberPlate}.`
    });
  };

  // Handle onboarding new truck directly to state
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlate || !formCapacity) {
      toast.error('Please specify active number plate license & cargo capacities.');
      return;
    }

    // Category mapping
    const typeLabels: Record<string, string> = {
      'TRUCK': 'Heavy Duty Truck',
      'VAN': 'Delivery Van',
      'PICKUP': 'Pickup Truck',
      'REFRIGERATED': 'Refrigerated Unit'
    };

    const currentVehicles = getSharedVehicles();
    const newId = `v${currentVehicles.length + 1}`;
    const newVehicle: SharedVehicle = {
      id: newId,
      numberPlate: formPlate.toUpperCase(),
      type: typeLabels[formType] || formType,
      capacity: formCapacity,
      status: 'AVAILABLE',
      insuranceExpiry: formInsurance,
      frontLeftTireWear: 98,
      frontRightTireWear: 98,
      rearLeftTireWear: 95,
      rearRightTireWear: 95,
      lastTireChangeDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tirePressurePsi: 115,
      lastServiceDate: formLastService ? new Date(formLastService).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
      nextServiceDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      serviceCompletedTasks: ['Pre-delivery inspection passed', 'GPS receiver lock validated'],
      assignedDriverId: formAssignedDriver === 'NONE' ? undefined : formAssignedDriver
    };

    const updatedVehicles = [...currentVehicles, newVehicle];
    saveSharedVehicles(updatedVehicles);

    // If pre-assigned a driver, link with driver
    if (formAssignedDriver !== 'NONE') {
      const currentDrivers = getSharedDrivers();
      const updatedDrivers = currentDrivers.map(d => {
        if (d.id === formAssignedDriver) {
          return { ...d, assignedVehicleNo: formPlate.toUpperCase() };
        }
        return d;
      });
      saveSharedDrivers(updatedDrivers);
    }

    toast.success(`Logistics Asset ${formPlate.toUpperCase()} Registered!`, {
      description: 'Standard maintenance tracking set and driver synchronized en-route.'
    });

    setFormPlate('');
    setFormCapacity('12 Tons');
    setFormAssignedDriver('NONE');
    setIsAddOpen(false);
  };

  // Interactive Action 1: Replace tires
  const handleSwapTires = (id: string, numberPlate: string) => {
    const currentVehicles = getSharedVehicles();
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === id) {
        toast.success(`MRF Heavy Grip Tires Swapped for ${numberPlate}!`, {
          description: 'Wear ratios reset as 100% Optimal. Swapped logged successfully.'
        });
        
        const updated = {
          ...v,
          frontLeftTireWear: 100,
          frontRightTireWear: 100,
          rearLeftTireWear: 100,
          rearRightTireWear: 100,
          lastTireChangeDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        // Also update selected modal detail in real-time
        if (selectedVehicle?.id === id) {
          setSelectedVehicle(updated);
        }
        return updated;
      }
      return v;
    });
    saveSharedVehicles(updatedVehicles);
  };

  // Interactive Action 2: Perform Mobil engine servicing
  const handlePerformServicing = (id: string, numberPlate: string) => {
    const currentVehicles = getSharedVehicles();
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === id) {
        toast.success(`Full Mechanical Service Protocol Checked for ${numberPlate}`, {
          description: 'Flushed motor fuel injectors, top-up break oil block, next service set in 6 months.'
        });

        const nextSvcDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const lastSvcDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const updated = {
          ...v,
          status: 'AVAILABLE' as const, // Automatically release from maintenance!
          lastServiceDate: lastSvcDate,
          nextServiceDueDate: nextSvcDate,
          serviceCompletedTasks: ['Mobil Engine Oil Flush', 'Coolant block flush', 'Transmission gear synchronizer Check-pass', 'Brake pad reset']
        };

        if (selectedVehicle?.id === id) {
          setSelectedVehicle(updated);
        }
        return updated;
      }
      return v;
    });
    saveSharedVehicles(updatedVehicles);
  };

  // Interactive Action 3: Seal/Topup tire pressure PSI
  const handleSealPSI = (id: string, numberPlate: string) => {
    const currentVehicles = getSharedVehicles();
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === id) {
        toast.info(`Axles Compressed Nitrogen Inflated for ${numberPlate}`, {
          description: 'Standardized balance set as optimal (115 PSI) under cargo load bounds.'
        });

        const updated = {
          ...v,
          tirePressurePsi: 115
        };

        if (selectedVehicle?.id === id) {
          setSelectedVehicle(updated);
        }
        return updated;
      }
      return v;
    });
    saveSharedVehicles(updatedVehicles);
  };

  // Decline/Remove vehicle
  const handleDeleteVehicle = (id: string, plate: string) => {
    const currentVehicles = getSharedVehicles();
    const updated = currentVehicles.filter(v => v.id !== id);
    saveSharedVehicles(updated);

    // Also clear assigned vehicle name from drivers list
    const currentDrivers = getSharedDrivers();
    const updatedDrivers = currentDrivers.map(d => {
      if (d.assignedVehicleNo === plate) {
        return { ...d, assignedVehicleNo: undefined };
      }
      return d;
    });
    saveSharedDrivers(updatedDrivers);

    toast.error(`Removed asset ${plate}`);
  };

  // Quick state overrides
  const handleToggleStateManual = (id: string, current: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE') => {
    let targetState: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' = 'AVAILABLE';
    if (current === 'AVAILABLE') targetState = 'MAINTENANCE';
    else if (current === 'MAINTENANCE') targetState = 'AVAILABLE';
    else {
      toast.warning('Vehicle is on high-duty road transit!', {
         description: 'Wait for this dispatch container to check in at target consignee en-route before maintenance.'
      });
      return;
    }

    const currentVehicles = getSharedVehicles();
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === id) {
        toast.info(`Maintenance state logged: ${targetState}`, {
          description: `Asset details synced.`
        });
        return { ...v, status: targetState };
      }
      return v;
    });
    saveSharedVehicles(updatedVehicles);
  };

  // Filter calculations
  const cleanSearch = searchTerm.toLowerCase();
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.numberPlate.toLowerCase().includes(cleanSearch) || 
      v.type.toLowerCase().includes(cleanSearch) || 
      v.capacity.toLowerCase().includes(cleanSearch);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  // Calculate live stats widgets from state
  const totalTonnageCount = vehicles.reduce((acc, v) => acc + parseInt(v.capacity) || 0, 0);
  const activeRoadWev = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const maintenanceSchedulesCount = vehicles.filter(v => v.status === 'MAINTENANCE' || v.frontLeftTireWear < 50).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header sections */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-[#01091a] tracking-tight leading-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600 animate-spin-slow" /> Hardware Assets Board
          </h2>
          <p className="text-sm text-[#64748B] font-medium leading-relaxed">
            Monitor real-time MRF tire tread wear parameters, adjust nitrogen PSI pressures, and log diesel-servicing intervals instantly.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-lg text-white font-extrabold h-12 rounded-xl px-5 gap-2 transition-all active:scale-95 border-none">
              <Plus className="w-5 h-5" />
              Onboard Vehicle Plate
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
                 <Truck className="text-blue-600 w-5 h-5" /> Register Fleet Asset
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddVehicle} className="space-y-5 py-2 font-sans text-sm">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold uppercase text-slate-500">Government Number Plate</Label>
                     <Input 
                       placeholder="e.g. MH-12-PQ-9988" 
                       value={formPlate} 
                       onChange={e => setFormPlate(e.target.value)} 
                       required
                       className="h-11 rounded-lg border-slate-200 uppercase font-mono font-bold focus-visible:ring-blue-600" 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold uppercase text-slate-500">Vehicle Category Class</Label>
                     <Select value={formType} onValueChange={setFormType}>
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                           <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="TRUCK">Heavy Duty Truck</SelectItem>
                           <SelectItem value="VAN">Delivery Van</SelectItem>
                           <SelectItem value="PICKUP">Pickup Truck</SelectItem>
                           <SelectItem value="REFRIGERATED">Refrigerated Unit</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold uppercase text-slate-500">Tonnage Cargo capacity</Label>
                     <Input 
                       placeholder="e.g. 15 Tons" 
                       value={formCapacity} 
                       onChange={e => setFormCapacity(e.target.value)} 
                       required
                       className="h-11 rounded-lg border-slate-200 font-bold" 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold uppercase text-slate-500">Insurance Register Expiry</Label>
                     <Input 
                       type="date" 
                       value={formInsurance} 
                       onChange={e => setFormInsurance(e.target.value)} 
                       required
                       className="h-11 rounded-lg border-slate-200" 
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">Date of Last Mobil-1 Engine Checkup</Label>
                  <Input 
                    type="date" 
                    value={formLastService} 
                    onChange={e => setFormLastService(e.target.value)} 
                    className="h-11 rounded-lg border-slate-200" 
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-xs font-bold uppercase text-slate-500">Assign Initial Driver</Label>
                     <Select value={formAssignedDriver} onValueChange={setFormAssignedDriver}>
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold bg-white text-slate-900">
                           <SelectValue placeholder="No driver assigned" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="NONE">Unassigned (No Captain)</SelectItem>
                           {drivers.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                 {d.name} ({d.licenseNumber})
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                     <span className="text-[10px] text-slate-400 font-extrabold italic pb-1">Note: Bi-directional link will be set automatically.</span>
                  </div>
               </div>

               <div className="bg-yellow-50 text-amber-900 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2 text-xs leading-relaxed font-semibold">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p>All newly registered assets must pass regional RTO pollution standard emissions parameters prior to carrying cargo load blocks.</p>
               </div>

               <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                 <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11 font-bold">Dismiss</Button>
                 <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Onboard Unit</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Registered Units', value: `${vehicles.length}`, detail: 'Heavy-ton containers registered', color: 'blue', icon: Truck },
          { label: 'On Shipment Corridors', value: `${activeRoadWev}`, detail: 'Cruising live highway channels', color: 'indigo', icon: Activity },
          { label: 'Maintenance Flag Tickets', value: `${maintenanceSchedulesCount}`, detail: 'Under repair or <50% tire wear', color: 'red', icon: AlertCircle },
          { label: 'Asset Carrying Potential', value: `${totalTonnageCount} Tons`, detail: 'Combined tonnage capability', color: 'green', icon: TrendingUp }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider leading-none">{stat.label}</span>
                <stat.icon className={cn(
                  "w-4 h-4",
                  stat.color === 'blue' && "text-blue-500",
                  stat.color === 'indigo' && "text-indigo-500",
                  stat.color === 'red' && "text-red-500 animate-pulse",
                  stat.color === 'green' && "text-emerald-500",
                )} />
             </div>
             <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
             <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
         <div className="flex flex-wrap gap-1.5">
           {([
             { id: 'ALL', label: 'All Fleet Assets' },
             { id: 'AVAILABLE', label: '📋 Available Units' },
             { id: 'ON_TRIP', label: '⚡ Active On Road' },
             { id: 'MAINTENANCE', label: '⚙ Maintenance Bays' },
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
             placeholder="Search plate license, categories..." 
             className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
      </div>

      {/* Advanced Vehicles interactive directory grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <AnimatePresence mode="popLayout">
           {filteredVehicles.map((vehicle) => {
              // Axle safety averages to draw diagnostic summaries
              const tireHealthAvg = Math.round((vehicle.frontLeftTireWear + vehicle.frontRightTireWear + vehicle.rearLeftTireWear + vehicle.rearRightTireWear) / 4);
              const hasCriticalTire = vehicle.frontLeftTireWear < 50 || vehicle.rearLeftTireWear < 50;

              return (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "bg-white rounded-2xl border p-5 md:p-6 transition-all shadow-sm flex flex-col justify-between gap-5 hover:shadow-md",
                    vehicle.status === 'MAINTENANCE' || hasCriticalTire ? "border-red-200 bg-red-50/5" : "border-slate-100"
                  )}
                >
                   {/* Hardware identity */}
                   <div className="space-y-4">
                      
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center font-bold border border-slate-100 shrink-0">
                               <Truck className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                               <h3 className="font-mono font-black text-slate-900 text-base leading-none uppercase tracking-wide">{vehicle.numberPlate}</h3>
                               <p className="text-xs text-slate-400 font-bold mt-1.5">{vehicle.type}</p>
                            </div>
                         </div>

                         <div className="flex gap-1.5 items-center">
                            {hasCriticalTire && (
                               <Badge className="bg-red-100 hover:bg-red-200 text-red-800 border-none text-[9px] font-black tracking-wider py-0.5 px-2 animate-pulse">
                                  TREAD ALERT
                               </Badge>
                            )}
                            <Badge 
                              className={cn(
                                "font-extrabold border-none text-[10px] py-0.5 px-2.5 shadow-none uppercase tracking-wide",
                                vehicle.status === 'AVAILABLE' && "bg-[#DCFCE7] text-[#166534]",
                                vehicle.status === 'ON_TRIP' && "bg-[#EFF6FF] text-[#2563EB]",
                                vehicle.status === 'MAINTENANCE' && "bg-[#FEF2F2] text-[#B91C1C]"
                              )}
                            >
                               {vehicle.status.replace('_', ' ')}
                            </Badge>
                         </div>
                      </div>

                      {/* Technical wear and diagnostics gauges */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                         <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Cargo Payload</span>
                            <span className="text-xs font-extrabold text-slate-800 font-mono block mt-1 underline decoration-slate-200 underline-offset-4">{vehicle.capacity}</span>
                         </div>
                         <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Tread Health Avg</span>
                            <span className={cn(
                              "text-xs font-black block mt-1",
                              tireHealthAvg < 50 ? "text-red-600" : "text-emerald-700 font-mono"
                            )}>
                               {tireHealthAvg}% Wear Health
                            </span>
                         </div>
                         <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Nitrogen PSI</span>
                            <span className="text-xs font-extrabold text-slate-800 font-mono block mt-1">{vehicle.tirePressurePsi} PSI calibrated</span>
                         </div>
                      </div>

                      {/* Explicit Tire wear diagnostics lists */}
                      <div className="space-y-1.5">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <LifeBuoy className="w-3 text-blue-500" /> Tire Thread Conditions Details
                         </span>
                         <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono font-bold text-slate-700 bg-slate-50/40 p-2 rounded-lg">
                            <div className="border-r border-slate-100/50">
                               <p className="text-[9px] text-slate-400 font-bold uppercase">FL Axle</p>
                               <span className={cn(vehicle.frontLeftTireWear < 55 ? "text-red-600" : "text-slate-800")}>{vehicle.frontLeftTireWear}%</span>
                            </div>
                            <div className="border-r border-slate-100/50">
                               <p className="text-[9px] text-slate-400 font-bold uppercase">FR Axle</p>
                               <span className={cn(vehicle.frontRightTireWear < 55 ? "text-red-600" : "text-slate-800")}>{vehicle.frontRightTireWear}%</span>
                            </div>
                            <div className="border-r border-slate-100/50">
                               <p className="text-[9px] text-slate-400 font-bold uppercase">RL Axle</p>
                               <span className={cn(vehicle.rearLeftTireWear < 55 ? "text-red-600" : "text-slate-800")}>{vehicle.rearLeftTireWear}%</span>
                            </div>
                            <div>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">RR Axle</p>
                               <span className={cn(vehicle.rearRightTireWear < 55 ? "text-red-600" : "text-slate-800")}>{vehicle.rearRightTireWear}%</span>
                            </div>
                         </div>
                         <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-bold italic pt-0.5">
                            <span>Last Complete Tire change log:</span>
                            <span className="font-mono text-slate-600 font-black not-italic">{vehicle.lastTireChangeDate}</span>
                         </div>
                      </div>

                      {/* Servicing checklist milestones */}
                      <div className="space-y-1.5 pt-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Wrench className="w-3 text-indigo-500" /> Diesel Engine Servicing Logs
                         </span>
                         <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">Previous service milestone:</span>
                            <span className="text-slate-800 font-extrabold">{vehicle.lastServiceDate}</span>
                         </div>
                         <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">Next due diagnostic run:</span>
                            <span className="text-indigo-600 font-black">{vehicle.nextServiceDueDate}</span>
                          </div>
                       </div>

                       {/* Dynamic driver assignment box */}
                       <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block leading-none">Assigned Driver Captain</span>
                          <select
                            value={vehicle.assignedDriverId || "NONE"}
                            onChange={(e) => handleAssignDriver(vehicle.id, e.target.value)}
                            className="w-full mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 py-1 px-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="NONE">Unassigned (No Captain)</option>
                            {drivers.map((d) => (
                               <option key={d.id} value={d.id}>
                                  {d.name} ({d.licenseNumber})
                               </option>
                            ))}
                          </select>
                       </div>

                    </div>

                    {/* Maintenance actions & release protocols */}
                   <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-50 gap-2">
                      <div className="flex items-center gap-1.5">
                         <Button 
                           size="xs" 
                           onClick={() => {
                             setSelectedVehicle(vehicle);
                             setIsDiagnosticsOpen(true);
                           }}
                           className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-[11px] h-8 rounded-lg border-none"
                         >
                            <Settings className="w-3.5 h-3.5 mr-1" /> View Diagnostics
                         </Button>

                         {vehicle.status !== 'ON_TRIP' && (
                            <Button 
                              size="xs" 
                              variant="outline"
                              onClick={() => handleToggleStateManual(vehicle.id, vehicle.status)}
                              className="border-slate-200 text-slate-600 hover:text-slate-900 font-extrabold text-[11px] h-8 rounded-lg"
                            >
                               {vehicle.status === 'MAINTENANCE' ? 'Release Bay' : 'Inject to repair'}
                            </Button>
                         )}
                      </div>

                      <div className="flex items-center gap-1.5">
                         <Button 
                           size="xs" 
                           variant="ghost" 
                           onClick={() => handleSealPSI(vehicle.id, vehicle.numberPlate)}
                           className="text-emerald-700 hover:text-emerald-600 font-extrabold text-[11px] h-8"
                         >
                            Check PSI
                         </Button>

                         <Button 
                           size="xs" 
                           variant="ghost" 
                           onClick={() => handleDeleteVehicle(vehicle.id, vehicle.numberPlate)}
                           className="text-slate-300 hover:text-red-600 h-8 w-8 px-0 rounded-lg shrink-0"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                   </div>

                </motion.div>
              );
           })}
         </AnimatePresence>

         {filteredVehicles.length === 0 && (
           <div className="md:col-span-2 bg-slate-50 border border-dashed border-slate-200 py-16 text-center rounded-3xl space-y-4">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
              <div className="max-w-xs mx-auto space-y-1">
                 <p className="font-extrabold text-slate-800 text-sm">No matched matched trucks found</p>
                 <p className="text-xs text-slate-400 font-medium">Clear search filters or onboard a custom vehicle to simulate hardware load logs.</p>
              </div>
              <Button onClick={() => setStatusFilter('ALL')} variant="outline" className="rounded-xl border-slate-200">
                 Show All Fleet Assets
              </Button>
           </div>
         )}
      </div>

      {/* Advanced diagnostics modal displaying full details */}
      <Dialog open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen}>
         <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-xl font-extrabold text-slate-950 flex items-center justify-between pr-4">
                  <span className="flex items-center gap-2">
                     <Wrench className="text-indigo-600 w-5 h-5 animate-spin-slow" /> Rig Hardware Diagnostics
                  </span>
                  <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                     {selectedVehicle?.numberPlate}
                  </span>
               </DialogTitle>
            </DialogHeader>

            {selectedVehicle && (
               <div className="space-y-6 py-2 pb-4 font-sans text-sm text-slate-800">
                  
                  {/* Category Summary */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-3.5 select-none text-xs">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 font-bold border border-indigo-100/30">
                        <Truck className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{selectedVehicle.numberPlate}</p>
                        <p className="text-slate-500 font-bold">{selectedVehicle.type} • Tonnage {selectedVehicle.capacity}</p>
                     </div>
                  </div>

                  {/* Tires status overview graphic */}
                  <div className="space-y-3">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                        1. Interactive Tire swap system
                     </h4>
                     
                     <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 font-mono text-[11px] font-bold text-slate-700">
                        <div className="flex justify-between">
                           <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 uppercase">FRONT LEFT AXLE</p>
                              <span className={cn(selectedVehicle.frontLeftTireWear < 50 ? "text-red-600 animate-pulse font-black" : "text-slate-800")}>
                                 {selectedVehicle.frontLeftTireWear}% Wear Health
                              </span>
                           </div>
                           <div className="space-y-1 text-right">
                              <p className="text-[9px] text-slate-400 uppercase">FRONT RIGHT AXLE</p>
                              <span className={cn(selectedVehicle.frontRightTireWear < 50 ? "text-red-600 animate-pulse font-black" : "text-slate-800")}>
                                 {selectedVehicle.frontRightTireWear}% Wear Health
                              </span>
                           </div>
                        </div>

                        <div className="border-t border-slate-200/50 my-1"></div>

                        <div className="flex justify-between">
                           <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 uppercase">REAR LEFT AXLE</p>
                              <span className={cn(selectedVehicle.rearLeftTireWear < 50 ? "text-red-600 animate-pulse font-black" : "text-slate-800")}>
                                 {selectedVehicle.rearLeftTireWear}% Wear Health
                              </span>
                           </div>
                           <div className="space-y-1 text-right">
                              <p className="text-[9px] text-slate-400 uppercase">REAR RIGHT AXLE</p>
                              <span className={cn(selectedVehicle.rearRightTireWear < 50 ? "text-red-600 animate-pulse font-black" : "text-slate-800")}>
                                 {selectedVehicle.rearRightTireWear}% Wear Health
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between text-xs font-bold bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/20">
                        <div>
                           <p className="text-indigo-900 font-extrabold">Last Tire Change Date:</p>
                           <p className="text-[11px] text-slate-500 font-medium font-sans mt-0.5">Tread rotation & complete swap</p>
                        </div>
                        <span className="font-mono font-black text-indigo-700">{selectedVehicle.lastTireChangeDate}</span>
                     </div>
                  </div>

                  {/* Servicing action logs and status indicators */}
                  <div className="space-y-3">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                        2. Certified servicing logs checklist completed
                     </h4>
                     
                     <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-2">
                        {selectedVehicle.serviceCompletedTasks.map((task, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{task}</span>
                           </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-1">
                        <div className="bg-slate-50/70 p-3 rounded-lg flex flex-col justify-center">
                           <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Service Run:</span>
                           <span className="text-slate-800 font-extrabold block mt-1">{selectedVehicle.lastServiceDate}</span>
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-lg flex flex-col justify-center">
                           <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Due milestone Date:</span>
                           <span className="text-indigo-600 font-black block mt-1">{selectedVehicle.nextServiceDueDate}</span>
                        </div>
                     </div>
                  </div>

                  {/* Simulated Core Diagnostic Actions */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Interactive maintenance actions:</p>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <Button 
                          type="button" 
                          onClick={() => handleSwapTires(selectedVehicle.id, selectedVehicle.numberPlate)}
                          className="bg-slate-900 border-none hover:bg-slate-800 text-white font-extrabold text-[11px] h-10 rounded-lg flex items-center justify-center gap-1.5"
                        >
                           <LifeBuoy className="w-4 h-4 text-blue-400" /> Complete Axle Tire Swap
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => handlePerformServicing(selectedVehicle.id, selectedVehicle.numberPlate)}
                          className="bg-[#2563EB] border-none hover:bg-blue-700 text-white font-extrabold text-[11px] h-10 rounded-lg flex items-center justify-center gap-1.5"
                        >
                           <Wrench className="w-4 h-4" /> Mobil-1 Engine Service
                        </Button>
                     </div>
                  </div>

                  <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                     <Button type="button" variant="outline" onClick={() => setIsDiagnosticsOpen(false)} className="rounded-xl h-11 w-full font-bold">
                        Dismiss Diagnostics Panel
                     </Button>
                  </DialogFooter>

               </div>
            )}
         </DialogContent>
      </Dialog>

    </div>
  );
}
