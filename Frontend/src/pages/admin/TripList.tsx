/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Plus, 
  MoreVertical, 
  MapPin,
  Clock,
  User,
  Truck,
  Zap,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Activity,
  ArrowRight,
  Gauge,
  Phone,
  ShieldAlert,
  FileCheck2,
  FileSignature,
  SlidersHorizontal,
  DollarSign,
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
import { mockTrips as initialTrips, mockDrivers, mockVehicles } from '@/src/data';
import { getSharedDrivers, getSharedDriversSnapshot } from '@/src/lib/driverStore';
import { getSharedVehicles, getSharedVehiclesSnapshot } from '@/src/lib/vehicleStore';
import { getSharedTrips, getSharedTripsSnapshot, saveSharedTrips } from '@/src/lib/tripStore';
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

// Custom rich trip definition extending initial trip
interface SimulatedTrip {
  id: string;
  source: string;
  destination: string;
  client: string;
  driverId?: string;
  vehicleId?: string;
  status: 'IN_TRANSIT' | 'PLANNING' | 'DELIVERED';
  startTime?: string;
  endTime?: string;
  revenue?: number;
  expenses?: { fuel: number; toll: number; other: number };
  
  // Custom simulator extension states
  telemetrySpeed?: number; // km/h
  hazardFlagged?: boolean;
  hazardReason?: string;
  cargoValue?: string;
  loadType?: string;
}

export default function TripList() {
  // Initialize from source data with interactive simulator extensions
  const [trips, setTrips] = useState<SimulatedTrip[]>(() => 
    getSharedTripsSnapshot().map((t, idx) => ({
      ...t,
      telemetrySpeed: t.status === 'IN_TRANSIT' ? 62 : 0,
      hazardFlagged: false,
      cargoValue: (t as any).cargoValue || (idx === 0 ? '₹85 Lakhs' : idx === 1 ? '₹45 Lakhs' : '₹12 Lakhs'),
      loadType: (t as any).loadType || (idx === 0 ? 'FMCG Goods' : idx === 1 ? 'Industrial Spares' : 'Automotive Aggregates')
    }))
  );

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Auto-save trips to store whenever modified locally
  useEffect(() => {
    saveSharedTrips(trips);
  }, [trips]);

  // Synchronizers of physical drivers & hardware plates
  useEffect(() => {
    setDrivers(getSharedDriversSnapshot());
    setVehicles(getSharedVehiclesSnapshot());
    void getSharedDrivers().then(setDrivers).catch(console.error);
    void getSharedVehicles().then(setVehicles).catch(console.error);

    const handleSyncDrivers = () => setDrivers(getSharedDriversSnapshot());
    const handleSyncVehicles = () => setVehicles(getSharedVehiclesSnapshot());

    window.addEventListener('axisfleet_drivers_update', handleSyncDrivers);
    window.addEventListener('axisfleet_vehicles_update', handleSyncVehicles);

    return () => {
      window.removeEventListener('axisfleet_drivers_update', handleSyncDrivers);
      window.removeEventListener('axisfleet_vehicles_update', handleSyncVehicles);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TRANSIT' | 'PLANNING' | 'DELIVERED'>('ALL');
  
  // Create Trip form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formCargoValue, setFormCargoValue] = useState('₹25 Lakhs');
  const [formLoadType, setFormLoadType] = useState('Electronics');
  const [formRevenue, setFormRevenue] = useState('24000');

  // Digital POD signature view state
  const [selectedPodTrip, setSelectedPodTrip] = useState<SimulatedTrip | null>(null);
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [podSignatureHex, setPodSignatureHex] = useState('');
  const [consigneeName, setConsigneeName] = useState('Sanjay Advani (Store Manager)');

  // Form submission handler to append a real working item to state!
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSource || !formDestination || !formClient) {
      toast.error('Please fill in source, destination and client info.');
      return;
    }

    const newId = `T${1000 + trips.length + 1}`;
    const newTrip: SimulatedTrip = {
      id: newId,
      source: formSource,
      destination: formDestination,
      client: formClient,
      driverId: formDriver || undefined,
      vehicleId: formVehicle || undefined,
      status: 'PLANNING',
      revenue: parseFloat(formRevenue) || 18000,
      expenses: { fuel: 0, toll: 0, other: 0 },
      telemetrySpeed: 0,
      hazardFlagged: false,
      cargoValue: formCargoValue,
      loadType: formLoadType
    };

    setTrips([newTrip, ...trips]);
    toast.success(`Trip ${newId} Created & Registered!`, {
      description: `Dispatched checklist sent to assigned vehicle node immediately.`,
    });
    
    // Reset Form fields
    setFormSource('');
    setFormDestination('');
    setFormClient('');
    setFormDriver('');
    setFormVehicle('');
    setIsCreateOpen(false);
  };

  // Live action button 1: Speed Acceleration simulator
  const handleModifySpeed = (tripId: string, direction: 'UP' | 'DOWN') => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId && t.status === 'IN_TRANSIT') {
        const currentSpeed = t.telemetrySpeed || 60;
        const speedDelta = direction === 'UP' ? 10 : -10;
        const finalSpeed = Math.max(0, Math.min(110, currentSpeed + speedDelta));
        
        let hazard = t.hazardFlagged;
        let reason = t.hazardReason;
        if (finalSpeed >= 85) {
          hazard = true;
          reason = 'SPEEDING CRITICAL: Over speed safety alarm triggered! (>85 km/h)';
        } else if (finalSpeed < 85 && hazard && t.hazardReason?.includes('SPEEDING')) {
          hazard = false;
          reason = undefined;
        }

        toast.info(`Engine Telemetry Adjusted for ${t.id}`, {
          description: `Cruising velocity set to ${finalSpeed} km/h.`,
        });

        return { ...t, telemetrySpeed: finalSpeed, hazardFlagged: hazard, hazardReason: reason };
      }
      return t;
    }));
  };

  // Live action button 2: Highlight hazard on route directly
  const handleToggleRouteHazard = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const isCurrentlyHazard = t.hazardFlagged;
        toast.warning(isCurrentlyHazard ? `Hazard ticket resolved for ${t.id}` : `Critical route alert logged on ${t.id}`, {
          description: isCurrentlyHazard ? `Highway node clearance verified.` : `Road hazard simulated on current GPS coordinates.`,
        });
        return {
          ...t,
          hazardFlagged: !isCurrentlyHazard,
          hazardReason: !isCurrentlyHazard ? 'ROUTE HAZARD: Signal warning or roadblock checkpoint bypassed.' : undefined
        };
      }
      return t;
    }));
  };

  // Live action button 3: Dispatch PLANNING trip to IN_TRANSIT
  const handleStartTransit = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        toast.success(`Engine Ignited for ${t.id}!`, {
          description: `Dispatched from depot. Standard highway coordinates now tracking.`,
        });
        return {
          ...t,
          status: 'IN_TRANSIT',
          startTime: new Date().toISOString(),
          telemetrySpeed: 65
        };
      }
      return t;
    }));
  };

  // Live action button 4: Deliver trip
  const handleCompleteDelivery = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        toast.success(`Shipment Ref ${t.id} Checked Into Destination!`, {
          description: `Please inspect the digital POD checklist to sign and clear cargo.`,
        });
        return {
          ...t,
          status: 'DELIVERED',
          endTime: new Date().toISOString(),
          telemetrySpeed: 0,
          hazardFlagged: false
        };
      }
      return t;
    }));
  };

  // Live action button 5: Cancel / Delete entire trip
  const handleCancelTrip = (tripId: string) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    toast.error(`Trip ${tripId} Decommissioned`, {
      description: 'The freight reservation has been removed from live dispatch screens.',
    });
  };

  // POD Signature Submission
  const handleSavePodSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podSignatureHex) {
      toast.error('Please enter a mock signature/initials to sign off.');
      return;
    }
    toast.success('POD Logged Successfully!', {
      description: `Delivery authorization cleared for ${selectedPodTrip?.id} signed by ${consigneeName}.`,
    });
    setPodSignatureHex('');
    setIsPodOpen(false);
    setSelectedPodTrip(null);
  };

  // Filter calculations
  const filteredTrips = trips.filter(trip => {
    const cleanSearch = searchTerm.toLowerCase();
    const matchesSearch = 
      trip.id.toLowerCase().includes(cleanSearch) || 
      trip.source.toLowerCase().includes(cleanSearch) || 
      trip.destination.toLowerCase().includes(cleanSearch) || 
      trip.client.toLowerCase().includes(cleanSearch);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && trip.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Top Section Header with Create Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600 animate-bounce" /> Fleet Operations Control
          </h2>
          <p className="text-sm text-[#64748B] font-medium leading-relaxed">
            Configure live telemetry vectors, adjust cruises, declare roadside hazards, and sign digital signatures instantly.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-lg text-white font-black h-12 rounded-xl px-5 gap-2 transition-all active:scale-95 border-none">
              <Plus className="w-5 h-5" />
              Book New Dispatch
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900">Book Shipment & Driver Dispatch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTrip} className="space-y-5 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Departing Hub (Origin)</Label>
                  <Input 
                    placeholder="e.g. Surat, Gujarat" 
                    value={formSource} 
                    onChange={e => setFormSource(e.target.value)} 
                    required 
                    className="h-11 rounded-lg border-slate-200 font-bold focus-visible:ring-blue-600" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Destination Hub</Label>
                  <Input 
                    placeholder="e.g. Noida, NCR" 
                    value={formDestination} 
                    onChange={e => setFormDestination(e.target.value)} 
                    required 
                    className="h-11 rounded-lg border-slate-200 font-bold focus-visible:ring-blue-600" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-400">Corporate Shipper (Client)</Label>
                <Input 
                  placeholder="e.g. Amazon India Logistics" 
                  value={formClient} 
                  onChange={e => setFormClient(e.target.value)} 
                  required 
                  className="h-11 rounded-lg border-slate-200 font-bold focus-visible:ring-blue-600" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Cargo Load Type</Label>
                  <Input 
                    placeholder="e.g. Heavy Steel Rolls" 
                    value={formLoadType} 
                    onChange={e => setFormLoadType(e.target.value)} 
                    className="h-11 rounded-lg border-slate-200 font-bold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Estimated Cargo Value</Label>
                  <Input 
                    placeholder="e.g. ₹95 Lakhs" 
                    value={formCargoValue} 
                    onChange={e => setFormCargoValue(e.target.value)} 
                    className="h-11 rounded-lg border-slate-200 font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Assigned Driver</Label>
                  <Select value={formDriver} onValueChange={setFormDriver}>
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 font-bold">
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} (License: {driver.licenseNumber}) - Dynamic Captain
                        </SelectItem>
                      ))}
                      {mockDrivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} (★{driver.rating}) - Preset Group
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-400">Fleet Class Plate</Label>
                  <Select value={formVehicle} onValueChange={setFormVehicle}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Select Plate" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.numberPlate} ({vehicle.type}) - Dynamic Asset
                        </SelectItem>
                      ))}
                      {mockVehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.numberPlate} ({vehicle.type}) - Preset Group
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-400">Consignment Contract Invoice Billing (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="24000" 
                  value={formRevenue} 
                  onChange={e => setFormRevenue(e.target.value)} 
                  className="h-11 rounded-lg border-slate-200 font-bold" 
                />
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11 font-bold">Dismiss Booking</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-8 border-none">Publish & Dispatch</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Telemetry Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'On-Time Performance', value: '98.2%', detail: 'Within +/- 15 mins ETA deviation', color: 'blue', icon: Activity },
          { label: 'Avg Fleet Velocity', value: '62 km/h', detail: 'Consolidated highways stream', color: 'indigo', icon: Gauge },
          { label: 'Hazards Flagged', value: `${trips.filter(t => t.hazardFlagged).length} Active`, detail: 'Requires traffic rerouting', color: 'red', icon: AlertTriangle },
          { label: 'Digital Sign-offs Pending', value: `${trips.filter(t => t.status === 'DELIVERED').length} Ready`, detail: 'Awaiting consignee client lock', color: 'green', icon: FileSignature }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
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

      {/* Filters pill row */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* State Selection tabs */}
        <div className="flex flex-wrap gap-1.5">
           {([
             { id: 'ALL', label: 'All Operations' },
             { id: 'IN_TRANSIT', label: '⚡ LIVE Highway' },
             { id: 'PLANNING', label: '📋 Dispatch Planning' },
             { id: 'DELIVERED', label: '✓ Closed / POD' }
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

        {/* Live Search bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search code, city or client..." 
            className="pl-10 h-10 border-slate-200 rounded-xl text-xs font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* Immersive Grid layout of advanced trips panels */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTrips.map((trip) => {
            const driver = drivers.find(d => d.id === trip.driverId) || mockDrivers.find(d => d.id === trip.driverId) || { name: 'Unassigned', phone: '+91 00000 00000', rating: 5.0, licenseNumber: 'N/A' };
            const vehicle = vehicles.find(v => v.id === trip.vehicleId) || mockVehicles.find(v => v.id === trip.vehicleId) || { numberPlate: 'PLATE-N/A', type: 'Container Truck' };

            return (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white rounded-2xl border p-5 md:p-6 transition-all shadow-sm flex flex-col justify-between gap-6 hover:shadow-md",
                  trip.hazardFlagged ? "border-red-400/80 bg-red-50/5" : "border-slate-100",
                )}
              >
                
                {/* Header Row: ID, Cargo details & Badges */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#2563EB] tracking-widest text-[13px]">{trip.id}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">{trip.loadType}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-bold tracking-tight">Invoice: ₹{trip.revenue?.toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex items-baseline gap-2 pt-0.5">
                        <p className="text-lg font-black text-slate-900">{trip.source}</p>
                        <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
                        <p className="text-lg font-black text-slate-900">{trip.destination}</p>
                        <span className="text-xs text-slate-400/90 font-semibold">({trip.client})</span>
                     </div>
                  </div>

                  {/* Operational Status badge indicator */}
                  <div className="flex flex-wrap items-center gap-2">
                     {trip.hazardFlagged && (
                       <Badge className="bg-red-100 hover:bg-red-200 text-red-800 border-none px-3 font-extrabold text-[10px] tracking-wide animate-pulse">
                          ⚠️ HIGHWAY ALERT ACTIVE
                       </Badge>
                     )}
                     <Badge 
                       className={cn(
                         "font-extrabold border-none text-[10px] py-1 px-3 shadow-none uppercase tracking-wide",
                         trip.status === 'IN_TRANSIT' && "bg-[#DCFCE7] text-[#166534]",
                         trip.status === 'DELIVERED' && "bg-blue-50 text-blue-700",
                         trip.status === 'PLANNING' && "bg-zinc-100 text-zinc-500"
                       )}
                     >
                       {trip.status === 'IN_TRANSIT' ? 'Cruising on Hwy' : trip.status.replace('_', ' ')}
                     </Badge>
                  </div>
                </div>

                {/* Simulated Telemetry Alert if alert present */}
                {trip.hazardFlagged && trip.hazardReason && (
                  <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-900 font-bold font-sans">
                     <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                     <p className="leading-relaxed">{trip.hazardReason}</p>
                  </div>
                )}

                {/* Telemetry diagnostics + Driver Vehicle mapping */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                  
                  {/* Personnel node */}
                  <div className="space-y-1 select-none">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Captain</span>
                     <div className="flex items-center gap-2.5">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} 
                          alt="" 
                          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shrink-0" 
                        />
                        <div>
                           <p className="font-extrabold text-slate-900 text-[13px] leading-tight">{driver.name}</p>
                           <p className="text-[11px] text-slate-400 font-medium">Permit Standard Rating ★{driver.rating}</p>
                        </div>
                     </div>
                  </div>

                  {/* Vessel plate node */}
                  <div className="space-y-1 font-sans">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Operational Vessel</span>
                     <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                           <Truck className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="font-mono font-black text-slate-900 text-sm leading-tight uppercase">{vehicle.numberPlate}</p>
                           <p className="text-[11px] text-slate-400 font-medium">{vehicle.type}</p>
                        </div>
                     </div>
                  </div>

                  {/* Live Simulation Progress Dial */}
                  <div className="space-y-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cruising speed</span>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                           <Gauge className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="font-mono font-black text-slate-900 text-sm leading-none">
                              {trip.status === 'IN_TRANSIT' ? `${trip.telemetrySpeed} km/h` : '0 km/h (Standby)'}
                           </p>
                           <div className="flex items-center gap-1.5 mt-1">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full inline-block",
                                trip.status === 'IN_TRANSIT' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                              )}></span>
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                                 {trip.status === 'IN_TRANSIT' ? 'Motor On' : 'Stationary'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Live Contract Margin */}
                  <div className="space-y-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cargo Insurance Lock</span>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                           <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="font-extrabold text-slate-900 text-xs leading-none">Security Active</p>
                           <p className="text-[11px] text-slate-400 font-medium mt-1">Insured Value: {trip.cargoValue}</p>
                        </div>
                     </div>
                  </div>

                </div>

                {/* ADVANCED LIVE SIMULATOR ACTIONS GRID AT BOTTOM */}
                <div className="bg-slate-50/70 border-t border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  
                  {/* Left Label indicator */}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Live Telemetry Modifiers:
                  </div>

                  {/* Action group buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                     
                     {/* Dynamic Transition Controls */}
                     {trip.status === 'PLANNING' && (
                       <Button 
                         onClick={() => handleStartTransit(trip.id)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] h-9 rounded-lg px-3.5 border-none shadow"
                       >
                          🚀 Start Transit Engine
                       </Button>
                     )}

                     {trip.status === 'IN_TRANSIT' && (
                       <>
                         <Button 
                           onClick={() => handleModifySpeed(trip.id, 'UP')}
                           variant="outline"
                           className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-extrabold text-[11px] h-9 rounded-lg px-3"
                         >
                            ⚡ Cruising ++ (Accelerate)
                         </Button>
                         <Button 
                           onClick={() => handleModifySpeed(trip.id, 'DOWN')}
                           variant="outline"
                           disabled={(trip.telemetrySpeed || 0) <= 10}
                           className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-extrabold text-[11px] h-9 rounded-lg px-3 disabled:opacity-40"
                         >
                            🐌 Cruise -- (Slow Down)
                         </Button>
                         <Button 
                           onClick={() => handleToggleRouteHazard(trip.id)}
                           variant="outline"
                           className={cn(
                             "font-extrabold text-[11px] h-9 rounded-lg px-3",
                             trip.hazardFlagged 
                               ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                               : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                           )}
                         >
                            {trip.hazardFlagged ? 'Clear Roadblock Alert' : 'Simulate Route roadblock'}
                         </Button>
                         <Button 
                           onClick={() => handleCompleteDelivery(trip.id)}
                           className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] h-9 rounded-lg px-3.5 border-none"
                         >
                            ✓ Deliver Shipment
                         </Button>
                       </>
                     )}

                     {trip.status === 'DELIVERED' && (
                       <Button 
                         onClick={() => {
                           setSelectedPodTrip(trip);
                           setIsPodOpen(true);
                         }}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] h-9 rounded-lg px-3.5 border-none"
                       >
                          ✍ Sign & Lock Digital POD
                       </Button>
                     )}

                     {/* Bridge Call to Active Driver simulation */}
                     <Button 
                       variant="ghost" 
                       onClick={() => {
                         toast.success(`Encrypted Bridge Tunnel Setup`, {
                           description: `Connecting admin panel to Captain ${driver.name}'s secure cellular node.`
                         });
                       }}
                       className="text-slate-500 hover:text-slate-900 border-none font-bold text-xs h-9"
                     >
                        <Phone className="w-3.5 h-3.5 mr-1" /> Bridge Call
                     </Button>

                     {/* Cancel Reservation */}
                     <Button 
                       variant="ghost" 
                       onClick={() => handleCancelTrip(trip.id)}
                       className="text-red-500 hover:text-red-700 hover:bg-red-50 border-none font-bold text-xs h-9"
                     >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Decommission
                     </Button>

                  </div>

                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTrips.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-200 py-16 text-center rounded-3xl space-y-4">
             <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
             <div className="max-w-xs mx-auto space-y-1">
                <p className="font-extrabold text-slate-800 text-sm">No matched registered shipments</p>
                <p className="text-xs text-slate-400 font-medium">Clear search filters or book a custom dispatch container above to preview live telemetry charts.</p>
             </div>
             <Button onClick={() => setStatusFilter('ALL')} variant="outline" className="rounded-xl border-slate-200">
                Show All Dispatches
             </Button>
          </div>
        )}
      </div>

      {/* Proof of Delivery Digital Sign-off Modal */}
      <Dialog open={isPodOpen} onOpenChange={setIsPodOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
               <FileSignature className="text-indigo-600 w-5 h-5" /> Secured Signature POD Clearance
            </DialogTitle>
          </DialogHeader>

          {selectedPodTrip && (
            <form onSubmit={handleSavePodSignature} className="space-y-5 py-2 font-sans">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/30 space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">TRACKING NO</span>
                    <span className="font-mono font-black text-indigo-700">{selectedPodTrip.id}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">CORPORATE SHIPPER</span>
                    <span className="font-black text-slate-800">{selectedPodTrip.client}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">ROUTE PATHWAY</span>
                    <span className="font-black text-slate-800">{selectedPodTrip.source} ➔ {selectedPodTrip.destination}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">CARGO CLASS TYPE</span>
                    <span className="font-black text-slate-800">{selectedPodTrip.loadType}</span>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-xs font-bold text-slate-500 uppercase">1. Consignee Authorized Person</Label>
                 <Input 
                   value={consigneeName} 
                   onChange={e => setConsigneeName(e.target.value)} 
                   required
                   className="h-11 rounded-lg border-slate-200 font-bold" 
                 />
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase block">2. Sign / Draw Initials Authorization</Label>
                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 text-center relative select-none">
                    <Input 
                      placeholder="Type initials or name e.g. /SANJAY/" 
                      value={podSignatureHex}
                      onChange={e => setPodSignatureHex(e.target.value)}
                      required
                      className="text-center font-serif text-lg py-2 h-11 border-b-2 border-t-0 border-l-0 border-r-0 border-slate-400 bg-transparent rounded-none focus-visible:ring-0 uppercase tracking-widest font-black text-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-2">Type simulated initials standard input to endorse digital POD receipt</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs leading-relaxed font-semibold">
                 <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                 <p>By endorsing, I confirm that all cargo units have been counted, visual defects evaluated, and unloaded to warehouse site.</p>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                 <Button type="button" variant="outline" onClick={() => setIsPodOpen(false)} className="rounded-xl h-11">Dismiss</Button>
                 <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl h-11 px-6 border-none">端 Secure POD Sign-off</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
