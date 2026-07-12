/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  Search,
  CheckCircle2,
  Calendar,
  Download,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Disc,
  Wifi,
  Phone,
  Shield,
  FileCheck,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockTrips, mockDrivers, mockVehicles } from '@/src/data';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// High-fidelity tracking list simulation
interface SimulatedLog {
  time: string;
  msg: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
}

export default function TrackingPortal() {
  const [trackingId, setTrackingId] = useState('T1001');
  const [activeTrip, setActiveTrip] = useState<any>(mockTrips[0]);
  const [showResult, setShowResult] = useState(true);

  // Simulation parameters (Stateful)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(58); // Progress percentage
  const [simSpeed, setSimSpeed] = useState(62); // km/h
  const [simLocation, setSimLocation] = useState('Surat Highway Bypass, Gujarat');
  const [simEta, setSimEta] = useState('Tomorrow, 03:40 PM');
  const [simStatus, setSimStatus] = useState<'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'PLANNING'>('IN_TRANSIT');
  const [simLogs, setSimLogs] = useState<SimulatedLog[]>([
    { time: '04:32 PM', msg: 'Passed Surat Toll Plaza, Lane 4 Automatic RFID tag processed.', type: 'INFO' },
    { time: '02:15 PM', msg: 'Brief driver rest stop at Navsari Food Court completed.', type: 'INFO' },
    { time: '10:00 AM', msg: 'Consignment successfully dispatched from Mumbai Hub.', type: 'SUCCESS' },
  ]);

  // Simulation loop trigger
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            setSimStatus('DELIVERED');
            setSimSpeed(0);
            toast.success('Simulation Completed!', {
              description: 'The shipment has safely arrived at Delhi Regional Hub.',
            });
            setSimLogs(prevLogs => [
              { time: 'Now', msg: 'DELIVERY COMPLETE: Consignment successfully received at Delhi Regional Hub.', type: 'SUCCESS' },
              ...prevLogs
            ]);
            return 100;
          }
          
          // Randomly fluctuate speed slightly during run
          setSimSpeed(Math.floor(58 + Math.random() * 15));
          
          // Advance coordinates/locations depending on progress
          const nextVal = prev + 1;
          if (nextVal > 80 && nextVal < 85) {
            setSimLocation('Udaipur Bypass, Rajasthan');
          } else if (nextVal >= 85 && nextVal < 92) {
            setSimLocation('Jaipur Express Corridor, Rajasthan');
          } else if (nextVal >= 92 && nextVal < 98) {
            setSimLocation('Gurugram Toll Gateway, NCR');
          } else if (nextVal >= 98) {
            setSimLocation('Delhi Okhla Hub, Delhi');
          }
          
          return nextVal;
        });
      }, 1400);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();
    const matched = mockTrips.find(t => t.id === cleanId);
    if (matched) {
      setActiveTrip(matched);
      setShowResult(true);
      // Synchronize simulator parameter states
      if (matched.id === 'T1001') {
        setSimProgress(58);
        setSimLocation('Surat Highway Bypass, Gujarat');
        setSimStatus('IN_TRANSIT');
        setSimEta('Tomorrow, 03:40 PM');
      } else if (matched.status === 'DELIVERED') {
        setSimProgress(100);
        setSimLocation(matched.destination + ' Hub Depot');
        setSimStatus('DELIVERED');
        setSimSpeed(0);
      } else if (matched.status === 'PLANNING') {
        setSimProgress(0);
        setSimLocation(matched.source + ' Hub Depot');
        setSimStatus('PLANNING');
        setSimSpeed(0);
      }
      toast.success(`Tracking data loaded for ${cleanId}`);
    } else {
      toast.error('Tracking ID Not Found', {
        description: 'Please look up T1001, T1002, or T1003 for direct demo testing.',
      });
    }
  };

  const handleSelectQuickDemo = (id: string) => {
    setTrackingId(id);
    const matched = mockTrips.find(t => t.id === id);
    if (matched) {
      setActiveTrip(matched);
      setShowResult(true);
      if (id === 'T1001') {
        setSimProgress(58);
        setSimLocation('Surat Highway Bypass, Gujarat');
        setSimStatus('IN_TRANSIT');
        setSimEta('Tomorrow, 03:40 PM');
      } else if (id === 'T1003') {
        setSimProgress(100);
        setSimLocation('Mumbai Terminal 2');
        setSimStatus('DELIVERED');
        setSimSpeed(0);
      } else {
        setSimProgress(0);
        setSimLocation('Bangalore Sorting Hub');
        setSimStatus('PLANNING');
        setSimSpeed(0);
      }
    }
  };

  const triggerAlertSim = () => {
    setIsSimulating(false);
    setSimStatus('DELAYED');
    setSimSpeed(0);
    setSimEta('Delayed by 2.5 hours');
    setSimLogs(prevLogs => [
      { time: 'Now', msg: 'ALERT: Temporary route blockade near Gujarat-Rajasthan border. Speed reduced to 0 km/h.', type: 'ALERT' },
      ...prevLogs
    ]);
    toast.error('Alert Simulated!', {
      description: 'Route delayed due to critical local highway bottleneck check.',
    });
  };

  const resetSim = () => {
    setIsSimulating(false);
    setSimProgress(30);
    setSimSpeed(55);
    setSimStatus('IN_TRANSIT');
    setSimLocation('Vapi Border Terminal, Gujarat');
    setSimLogs([
      { time: '12:10 PM', msg: 'Passed Vapi border post security checkpoint clearance.', type: 'INFO' },
      { time: '10:00 AM', msg: 'Consignment successfully dispatched from Mumbai Hub.', type: 'SUCCESS' },
    ]);
    toast.info('Simulator reset to mid-transit stage.');
  };

  const triggerInstantDeliver = () => {
    setIsSimulating(false);
    setSimProgress(100);
    setSimStatus('DELIVERED');
    setSimSpeed(0);
    setSimLocation('Delhi Okhla Hub, Delhi');
    setSimLogs(prevLogs => [
      { time: 'Now', msg: 'DELIVERY COMPLETED: Proof of Delivery (POD) signed and submitted by driver Rajesh Kumar.', type: 'SUCCESS' },
      ...prevLogs
    ]);
    toast.success('POD Confirmed!', {
      description: 'Consignment marked as delivered instantly.',
    });
  };

  // Safe fetch driver
  const driverObj = mockDrivers.find(d => d.id === activeTrip.driverId) || {
    name: 'Unassigned Personnel',
    phone: 'No contact number',
    rating: '5.0'
  };

  // Safe fetch vehicle
  const vehicleObj = mockVehicles.find(v => v.id === activeTrip.vehicleId) || {
    numberPlate: 'ASS-N/A',
    type: 'Regular Class Cargo Carrier',
    capacity: 'N/A'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                <Truck className="w-5 h-5 animate-pulse" />
             </div>
             <div>
                <span className="font-extrabold text-[#0F172A] tracking-tight">TransitOps</span>
                <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">Tracker</span>
             </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
             <Link to="/admin" className="text-slate-600 hover:text-blue-600 font-bold transition-all px-3 py-2 rounded-lg hover:bg-slate-50">
                Admin Console
             </Link>
             <Link to="/login" className="bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-xl px-4 py-2 font-bold transition-all text-xs">
                Log Out
             </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 w-full flex flex-col gap-8">
        
        {/* Intro Control Block */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-blue-50 to-indigo-50/20 rounded-full blur-3xl pointer-events-none -z-0"></div>
          
          <div className="max-w-3xl space-y-4 relative z-10">
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500 animate-bounce" />
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Interactive Live Simulation Sandbox</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
               Track Freight Shipments Instantly
             </h2>
             <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
               Try searching real pre-loaded mock IDs below or press the quick select cards to inspect the hyper-realistic simulation dashboard. Update parameters in real-time to simulate fleet logistics.
             </p>
          </div>

          {/* Quick Selector Row */}
          <div className="mt-8 flex flex-wrap gap-3">
             <div className="text-xs font-bold uppercase text-slate-400 tracking-wider w-full mb-1">
               Select Shipment Scenario to Simulator:
             </div>
             <Button 
               variant={trackingId === 'T1001' ? 'default' : 'outline'}
               onClick={() => handleSelectQuickDemo('T1001')}
               className={`rounded-xl h-11 px-4 gap-2 font-bold transition-all ${trackingId === 'T1001' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'}`}
             >
                <Truck className="w-4 h-4" />
                Reliance Retail T1001 (In Transit)
             </Button>
             <Button 
               variant={trackingId === 'T1003' ? 'default' : 'outline'}
               onClick={() => handleSelectQuickDemo('T1003')}
               className={`rounded-xl h-11 px-4 gap-2 font-bold transition-all ${trackingId === 'T1003' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'}`}
             >
                <CheckCircle2 className="w-4 h-4" />
                Tata Motors T1003 (Delivered POD)
             </Button>
             <Button 
               variant={trackingId === 'T1002' ? 'default' : 'outline'}
               onClick={() => handleSelectQuickDemo('T1002')}
               className={`rounded-xl h-11 px-4 gap-2 font-bold transition-all ${trackingId === 'T1002' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'}`}
             >
                <Package className="w-4 h-4" />
                Amazon India T1002 (Planning Stage)
             </Button>
          </div>

          {/* Input Form Search */}
          <form onSubmit={handleSearch} className="mt-6 max-w-xl flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
                <Input 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter custom ID (e.g. T1001)" 
                  className="pl-12 h-12 bg-slate-50/50 focus-visible:bg-white border-[#E2E8F0] focus-visible:ring-blue-500 rounded-xl font-bold font-mono text-slate-800 uppercase tracking-wider"
                />
             </div>
             <Button type="submit" className="bg-slate-900 text-white px-6 rounded-xl hover:bg-black font-extrabold h-12 gap-2">
                <span>Find Route</span>
                <ArrowRight className="w-4 h-4" />
             </Button>
          </form>
        </div>

        {showResult && activeTrip && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLUMNS: Telemetry and Visual Map */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Simulation Control Bar Widget (Floating appearance) */}
               <Card className="border-none shadow-lg shadow-slate-100/50 bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden rounded-2xl">
                 <CardContent className="p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                          <span className="text-[10px] font-black text-green-400 tracking-wider uppercase">LOGISIMPLE LIVE EMULATOR ACTIVE</span>
                       </div>
                       <p className="text-sm font-semibold text-slate-300">Interact with the real-time movement simulator below</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                       {/* Simulate Start / Pause */}
                       {isSimulating ? (
                          <Button 
                            onClick={() => setIsSimulating(false)} 
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl h-10 px-4 gap-2 border-none"
                          >
                             <Pause className="w-4 h-4" />
                             Pause Auto-Drive
                          </Button>
                       ) : (
                          <Button 
                            onClick={() => {
                              if (simProgress >= 100) setSimProgress(30);
                              setIsSimulating(true);
                              setSimStatus('IN_TRANSIT');
                              toast.info('Automatic driving simulation initialized!');
                            }} 
                            disabled={simStatus === 'PLANNING'}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-10 px-4 gap-2 border-none disabled:opacity-50"
                          >
                             <Play className="w-4 h-4 group-hover:scale-110" />
                             {simProgress >= 100 ? 'Restart Drive Loop' : 'Start Auto-Drive'}
                          </Button>
                       )}

                       <Button 
                         variant="outline" 
                         onClick={triggerAlertSim} 
                         disabled={simStatus === 'PLANNING' || simProgress >= 100}
                         className="border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-3 gap-2 text-xs"
                       >
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                          Simulate Delay
                       </Button>

                       <Button 
                         variant="outline" 
                         onClick={triggerInstantDeliver} 
                         disabled={simStatus === 'PLANNING' || simProgress >= 100}
                         className="border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-3 gap-2 text-xs"
                       >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Instantly Deliver
                       </Button>

                       <Button 
                         variant="ghost" 
                         onClick={resetSim}
                         className="text-slate-400 hover:text-white rounded-xl h-10 w-10 p-0 flex items-center justify-center hover:bg-slate-800"
                        title="Reset state"
                       >
                          <RotateCcw className="w-4 h-4" />
                       </Button>
                    </div>
                 </CardContent>
               </Card>

               {/* Large High-Fidelity SVG Map Visualization */}
               <Card className="border-none shadow-xl shadow-slate-100/50 overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl relative">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Navigation className="text-blue-600 w-5 h-5 animate-spin-slow" />
                        <CardTitle className="text-base font-extrabold text-slate-800 uppercase tracking-widest text-[12px]">Real-Time GPS Grid Stream</CardTitle>
                     </div>
                     <Badge className="bg-blue-50 text-blue-700 font-bold px-3 py-1 text-xs border-none flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-blue-600 inline cursor-none" /> Connected (99% Signal Strength)
                     </Badge>
                  </div>

                  <div className="p-0 h-[380px] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                     {/* Modern Dark Grid Lines */}
                     <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(37,99,235,0.15) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
                     
                     {/* Dynamic Ambient Glow Radar Ring */}
                     <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-500/5 animate-pulse flex items-center justify-center">
                        <div className="w-[200px] h-[200px] rounded-full border border-blue-500/10 flex items-center justify-center">
                           <div className="w-[100px] h-[100px] rounded-full border border-blue-500/20"></div>
                        </div>
                     </div>

                     {/* Custom India/Route Vector representation */}
                     <svg className="absolute w-[80%] h-[75%] stroke-blue-500/20 stroke-2 fill-none stroke-dasharray-[6,6]">
                        {/* Simulated route road path */}
                        <path id="routePath" d="M150,280 C180,180 220,120 300,80" className="stroke-slate-700/60 stroke-2" />
                        <path d="M150,280 C180,180 220,120 300,80" className="stroke-blue-500 stroke-2 stroke-dasharray-[8,4]" />
                     </svg>

                     {/* Start Depot Point Indicator */}
                     <div className="absolute left-[20%] bottom-[25%] flex flex-col items-center">
                        <div className="w-4 h-4 bg-emerald-500 ring-4 ring-emerald-500/25 rounded-full flex items-center justify-center">
                           <span className="w-2 h-2 bg-white rounded-full"></span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activeTrip.source} Depot</span>
                     </div>

                     {/* Intermediate check-markers */}
                     <div className="absolute left-[34%] top-[45%] w-2 h-2 bg-slate-600 rounded-full" title="Checkpoint Border Terminal"></div>
                     <div className="absolute left-[45%] top-[30%] w-2 h-2 bg-slate-600 rounded-full" title="Intermediate toll plaza"></div>

                     {/* Destination Depot Identifier */}
                     <div className="absolute right-[28%] top-[14%] flex flex-col items-center">
                        <div className="w-5 h-5 bg-blue-600 ring-4 ring-blue-500/25 rounded-full flex items-center justify-center">
                           <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-black text-blue-400 mt-1.5 uppercase tracking-wider">{activeTrip.destination} Sorting Yard</span>
                     </div>

                     {/* Dynamic moving truck along coordinates based on simulated progress */}
                     <motion.div 
                       style={{
                         position: 'absolute',
                         left: `${20 + (simProgress * 0.52)}%`,
                         bottom: `${25 + (simProgress * 0.61)}%`
                       }}
                       transition={{ type: "spring", stiffness: 100 }}
                       className="w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-blue-500/30 z-10"
                     >
                        <Truck className="w-5 h-5 animate-bounce" />
                        
                        {/* Dynamic Floating Telemetry Speed Label */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-800 text-white px-2.5 py-1 rounded-xl shadow-lg text-[9px] font-black tracking-widest uppercase">
                           {simSpeed > 0 ? `⚡ ${simSpeed} KM/H` : "STATUS: IDLE"}
                        </div>
                     </motion.div>

                     {/* Overlay Navigation Instruction Indicator */}
                     <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white/90 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <Disc className="w-5 h-5 text-blue-400 animate-spin" />
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Coordinate Pointer</p>
                              <p className="text-white text-xs font-bold leading-tight font-mono">{simLocation}</p>
                           </div>
                        </div>
                        <div>
                           <Badge 
                             className={cn(
                               "font-black border-none px-3.5 text-[10px]",
                               simStatus === 'IN_TRANSIT' && "bg-[#10B981] text-white",
                               simStatus === 'DELAYED' && "bg-[#EF4444] text-white",
                               simStatus === 'DELIVERED' && "bg-[#3B82F6] text-white",
                             )}
                           >
                             {simStatus.replace('_', ' ')}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  {/* Telemetry Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/70">
                     <div className="p-5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulated Speed</span>
                        <span className="text-lg font-black text-slate-900 mt-1">{simSpeed} km/h</span>
                     </div>
                     <div className="p-5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress Path</span>
                        <span className="text-lg font-black text-blue-600 mt-1">{simProgress}% Complete</span>
                     </div>
                     <div className="p-5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vessel License</span>
                        <span className="text-sm font-mono font-bold text-slate-900 mt-1">{vehicleObj.numberPlate}</span>
                     </div>
                     <div className="p-5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine Pulse</span>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                           <span className="text-sm font-bold text-slate-950">Normal</span>
                        </div>
                     </div>
                  </div>
               </Card>

               {/* Log Stream & Simulation output console */}
               <Card className="border-none shadow-xl shadow-slate-100/50 overflow-hidden bg-white rounded-2xl">
                 <CardHeader className="border-b border-slate-50 py-4">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>Simulated Tracking Logs</span>
                      <span className="text-[10.5px] text-slate-400 font-medium">Auto-updated Real Time Events</span>
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 divide-y divide-slate-50 max-h-[280px] overflow-y-auto">
                    {simLogs.map((log, i) => (
                      <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                         <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mt-0.5">{log.time}</span>
                         <div className="space-y-1">
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">{log.msg}</p>
                            <span className={cn(
                              "text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded",
                              log.type === 'SUCCESS' && "bg-[#DCFCE7] text-[#166534]",
                              log.type === 'INFO' && "bg-slate-100 text-slate-600",
                              log.type === 'ALERT' && "bg-orange-50 text-orange-700"
                            )}>
                              {log.type}
                            </span>
                         </div>
                      </div>
                    ))}
                 </CardContent>
               </Card>

            </div>

            {/* RIGHT COLUMN: Milestones side section & Driver Profile Card */}
            <div className="space-y-8">
               
               {/* Quick Info summary */}
               <Card className="border-none shadow-xl shadow-slate-100/50 overflow-hidden bg-white rounded-2xl">
                 <div className="bg-slate-900 p-6 text-white text-center space-y-1 relative">
                    <div className="absolute right-3 top-3">
                       <Badge className="bg-white/10 text-white hover:bg-white/20 border-none font-bold text-[10px]">ROUTE KEY</Badge>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Consignment</p>
                    <h3 className="text-2xl font-black">{activeTrip.source} → {activeTrip.destination}</h3>
                    <p className="text-xs text-slate-400">{activeTrip.client} • Tracking {activeTrip.id}</p>
                 </div>
                 <CardContent className="p-6 space-y-6">
                    {/* Status badges */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expected In</p>
                          <p className="font-extrabold text-slate-800 text-sm mt-1">{simEta}</p>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Class</p>
                          <p className="font-extrabold text-slate-800 text-sm mt-1">Heavy Cargo</p>
                       </div>
                    </div>

                    {/* Driver specifications */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                       <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Logistics Personnel Assigned</h4>
                       
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driverObj.name}`} alt="" className="w-10 h-10 rounded-xl" />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-sm leading-none">{driverObj.name}</p>
                             <p className="text-xs text-slate-400 font-medium mt-1">Driving Permit License Holder</p>
                             <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                   ★ {driverObj.rating || '4.8'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-500 font-medium">{driverObj.phone}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-2">
                          <a href={`tel:${driverObj.phone}`} className="flex-1">
                             <Button variant="outline" className="w-full h-11 rounded-xl text-slate-700 font-bold border-slate-200">
                                <Phone className="w-4 h-4 mr-2 text-slate-400" /> Dial Driver
                             </Button>
                          </a>
                          <Button 
                            variant="outline" 
                            className="h-11 rounded-xl px-4 border-slate-200"
                            onClick={() => toast.success('Encrypted messaging tunnel opened with driver.')}
                          >
                             Message
                          </Button>
                       </div>
                    </div>
                 </CardContent>
               </Card>

               {/* Milestone checkpoint card */}
               <Card className="border-none shadow-xl shadow-slate-100/50 overflow-hidden bg-white rounded-2xl">
                 <CardHeader className="bg-slate-50 border-b border-slate-100/60 p-4">
                    <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Shield className="w-4 h-4 text-blue-600" /> Milestone Audit Trail
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 relative">
                    <div className="space-y-6 relative border-l-2 border-slate-100/80 ml-3.5 pl-6 my-2">
                       {[
                         { 
                           label: 'Booking Created', 
                           sub: 'System generated reference code.', 
                           done: true 
                         },
                         { 
                           label: 'Consignment Onboarded', 
                           sub: `Loaded on plate: ${vehicleObj.numberPlate}`, 
                           done: simProgress >= 10 
                         },
                         { 
                           label: 'Dispatched from Yard', 
                           sub: `Departed ${activeTrip.source}`, 
                           done: simProgress >= 30 
                         },
                         { 
                           label: 'Live Highway Route Transit', 
                           sub: 'GPS active on state corridors.', 
                           done: simProgress >= 50,
                           active: simProgress > 50 && simProgress < 100 
                         },
                         { 
                           label: 'Unloading & Signature verification', 
                           sub: `Delivered to client yard`, 
                           done: simProgress >= 100 
                         }
                       ].map((step, i) => (
                         <div key={i} className="relative group">
                            {/* Bullet Circle Indicator */}
                            <div className={cn(
                              "absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                              step.done ? (step.active ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-100 animate-pulse" : "bg-green-500 text-white") : "bg-slate-100 text-slate-300"
                            )}>
                               {step.done ? (
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                               ) : (
                                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                               )}
                            </div>
                            <div>
                               <p className={cn(
                                 "text-xs font-black",
                                 step.done ? "text-slate-900" : "text-slate-400"
                               )}>
                                 {step.label}
                               </p>
                               <p className="text-[11px] text-slate-400/90 font-medium leading-relaxed">{step.sub}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* POD Download area unlocked only when Progress >= 100 */}
                    <div className="mt-8 pt-4 border-t border-slate-100">
                       {simProgress >= 100 ? (
                         <div className="space-y-2">
                            <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">✓ DELIVERED SUMMARY POD READY</Badge>
                            <Button 
                              onClick={() => {
                                toast.success('Downloading verified PDF Proof of Delivery...', {
                                  description: `Ref ID: ${activeTrip.id}-POD`
                                });
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-white font-bold gap-2 shadow-lg shadow-blue-200"
                            >
                               <Download className="w-4 h-4" />
                               Download Signature POD Receipt
                            </Button>
                         </div>
                       ) : (
                         <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                            <Clock className="w-5 h-5 mx-auto mb-2 text-slate-300" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">Proof of Delivery (POD)</p>
                            <p className="text-[10px] italic">Will be auto-generated upon vehicle arrival at depot.</p>
                         </div>
                       )}
                    </div>
                 </CardContent>
               </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
