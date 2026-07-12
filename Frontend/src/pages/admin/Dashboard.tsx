/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Truck, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  FileCheck2,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockTrips, mockDrivers, mockVehicles } from '@/src/data';
import { getSharedDrivers } from '@/src/lib/driverStore';
import { getSharedVehicles } from '@/src/lib/vehicleStore';
import { getSharedTrips } from '@/src/lib/tripStore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

// High precision financial telemetry data
const revenueOverTime = [
  { day: 'Mon', Revenue: 45000, Expenses: 15000, Trips: 3 },
  { day: 'Tue', Revenue: 82000, Expenses: 28000, Trips: 5 },
  { day: 'Wed', Revenue: 61000, Expenses: 22000, Trips: 4 },
  { day: 'Thu', Revenue: 95000, Expenses: 31000, Trips: 6 },
  { day: 'Fri', Revenue: 132000, Expenses: 44000, Trips: 8 },
  { day: 'Sat', Revenue: 110000, Expenses: 36000, Trips: 5 },
  { day: 'Sun', Revenue: 75000, Expenses: 19000, Trips: 3 },
];

const customerRevenueData = [
  { name: 'Reliance Retail', value: 85000, color: '#3B82F6' },
  { name: 'Amazon India', value: 65000, color: '#10B981' },
  { name: 'Tata Motors', value: 48000, color: '#F59E0B' },
  { name: 'Other Freight', value: 24000, color: '#6366F1' },
];

const initialTelemetryLogs = [
  { id: 1, type: 'CRITICAL', title: 'Speed Violation Detected', desc: 'Vehicle MH-12-AB-1234 exceeding 85km/h on Surat corridor.', time: '02 mins ago', read: false },
  { id: 2, type: 'SUCCESS', title: 'Shipment T1003 Delivered', desc: 'Proof of Delivery (POD) verified and signed at Mumbai Depot.', time: '14 mins ago', read: true },
  { id: 3, type: 'INFO', title: 'Route Recalculated', desc: 'T1001 adjusted to avoid heavy bottleneck on Vapi bypass.', time: '45 mins ago', read: true },
  { id: 4, type: 'ALERT', title: 'RC Renewal Warning', desc: 'Vehicle DL-01-PQ-9012 certificate expires in 12 days.', time: '2 hours ago', read: false },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'financial' | 'trips' | 'fleet'>('financial');
  const [telemetryLogs, setTelemetryLogs] = useState(initialTelemetryLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  // Monitor live dashboard updates of registered Captains, plates, and trips
  useEffect(() => {
    setDrivers(getSharedDrivers());
    setVehicles(getSharedVehicles());
    setTrips(getSharedTrips());

    const handleSyncDrivers = () => setDrivers(getSharedDrivers());
    const handleSyncVehicles = () => setVehicles(getSharedVehicles());
    const handleSyncTrips = () => setTrips(getSharedTrips());

    window.addEventListener('axisfleet_drivers_update', handleSyncDrivers);
    window.addEventListener('axisfleet_vehicles_update', handleSyncVehicles);
    window.addEventListener('axisfleet_trips_update', handleSyncTrips);

    return () => {
      window.removeEventListener('axisfleet_drivers_update', handleSyncDrivers);
      window.removeEventListener('axisfleet_vehicles_update', handleSyncVehicles);
      window.removeEventListener('axisfleet_trips_update', handleSyncTrips);
    };
  }, []);

  // Dynamic state selectors
  const totalFleetTripsCount = trips.length;
  const inTransitTripsCount = trips.filter(t => t.status === 'IN_TRANSIT').length;
  const totalRawRevenue = trips.reduce((acc, trip) => acc + (trip.revenue || 0), 0);
  
  const totalExpensesComputed = trips.reduce((acc, trip) => {
    const expensesObj = trip.expenses || { fuel: 0, toll: 0, other: 0 };
    return acc + (expensesObj.fuel || 0) + (expensesObj.toll || 0) + (expensesObj.other || 0);
  }, 0);

  const netOperationsProfit = totalRawRevenue - totalExpensesComputed;

  const refreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live Fleet Streams Refreshed', {
        description: 'Updated with latest GPS coordinate logs & driver statuses.',
      });
    }, 800);
  };

  const handleMarkAllRead = () => {
    setTelemetryLogs(prev => prev.map(log => ({ ...log, read: true })));
    toast.info('All logs marked as read');
  };

  const clearCriticalAlert = (id: number) => {
    setTelemetryLogs(prev => prev.filter(log => log.id !== id));
    toast.success('Alert ticket resolved and dismissed.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Dynamic Header Overview Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[10px] tracking-wider px-2.5 py-0.5">
               <Activity className="w-3.5 h-3.5 mr-1 text-emerald-500 animate-pulse inline" /> LIVE OPERATIONS ACTIVE
            </Badge>
            <span className="text-xs text-slate-400">• Updated 1 min ago</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#01091a] tracking-tight leading-none">Command Intelligence Dashboard</h2>
          <p className="text-sm text-[#64748B] font-medium">Global fleet logs, financial parameters, and live tracking diagnostics.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden xl:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Operational Node</span>
            <span className="text-sm font-black text-slate-900">Delhi-NCR Command Center</span>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshTelemetry} 
            disabled={isRefreshing}
            className="rounded-xl h-[44px] px-4 font-bold border-slate-200 hover:bg-slate-50 gap-2 shrink-0 transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-500", isRefreshing && "animate-spin")} />
            Sync Telemetry
          </Button>
        </div>
      </div>

      {/* Expanded Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: 'Total Trips Active', 
            value: `${inTransitTripsCount} / ${totalFleetTripsCount}`, 
            desc: 'Real-time shipments on highways', 
            trend: 'up', 
            change: '+29% vs Prev Week', 
            icon: Truck, 
            gradient: 'from-blue-600 to-indigo-600',
            bgGlow: 'shadow-blue-100/50' 
          },
          { 
            label: 'Net Profits Realized', 
            value: `₹${(netOperationsProfit / 1000).toFixed(1)}k`, 
            desc: `Computed from ₹${(totalRawRevenue / 1000).toFixed(1)}k gross`, 
            trend: 'up', 
            change: '18.4% Operating Margin', 
            icon: TrendingUp, 
            gradient: 'from-emerald-600 to-teal-600',
            bgGlow: 'shadow-emerald-100/50' 
          },
          { 
            label: 'Fleet Utilization', 
            value: '84%', 
            desc: '14/19 Operational Units active', 
            trend: 'neutral', 
            change: 'Optimal load distribution', 
            icon: Activity, 
            gradient: 'from-indigo-600 to-violet-600',
            bgGlow: 'shadow-indigo-100/50' 
          },
          { 
            label: 'Critical Flagged Incidents', 
            value: '02 alerts', 
            desc: 'Immediate dispatch resolution needed', 
            trend: 'down', 
            change: '1 unresolved speed trigger', 
            icon: AlertCircle, 
            gradient: 'from-red-600 to-orange-600',
            bgGlow: 'shadow-red-100/50' 
          }
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative select-none"
          >
            {/* Elegant high-fidelity card container */}
            <div className={`geometric-card p-6 bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-100/65 hover:border-slate-200 transition-all duration-300 relative overflow-hidden group`}>
              
              {/* Sleek subtle top border bar mapping to gradient color */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", metric.gradient)}></div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  {metric.label}
                </span>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 group-hover:scale-110 transition-transform duration-300")}>
                  <metric.icon className="w-4 h-4 text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge 
                    variant="neutral" 
                    className={cn(
                      "text-[10px] font-black border-none py-0 px-2 tracking-wide",
                      metric.trend === 'up' && "bg-emerald-50 text-emerald-700",
                      metric.trend === 'down' && "bg-red-50 text-red-700",
                      metric.trend === 'neutral' && "bg-slate-100 text-slate-600"
                    )}
                  >
                    {metric.change}
                  </Badge>
                  <span className="text-[10.5px] font-medium text-slate-400 line-clamp-1">{metric.desc}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Tabbed Analytics Workspace & Dynamic Area Chart */}
      <Card className="border-none shadow-xl shadow-slate-100/40 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg font-extrabold text-slate-900 tracking-tight">Interactive Analytical Workspace</CardTitle>
            </div>
            <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
               Simulated Revenue and Financial forecasting model
            </CardDescription>
          </div>
          
          {/* Quick Tab Selectors */}
          <div className="bg-slate-100 p-1 rounded-xl flex self-start">
            {[
              { id: 'financial', label: 'Financial Matrix' },
              { id: 'trips', label: 'Route Workloads' },
              { id: 'fleet', label: 'Utilization Ratios' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "rounded-lg px-4 h-9 font-bold text-xs transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-blue-600 shadow-sm border-none" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
           <AnimatePresence mode="wait">
             {activeTab === 'financial' && (
               <motion.div 
                 key="financial"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">₹</div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase">Est. Monthly Output</p>
                          <p className="text-xl font-black text-slate-900">₹12.4 Lakhs</p>
                       </div>
                    </div>
                    <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-xl flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">↑</div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase">Daily Margin Average</p>
                          <p className="text-xl font-black text-slate-900">32.4% Gross</p>
                       </div>
                    </div>
                    <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-xl flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">%</div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase">Billed Contracts Rate</p>
                          <p className="text-xl font-black text-slate-900">₹27.2k / Truck</p>
                       </div>
                    </div>
                 </div>

                 {/* Financial area graph display */}
                 <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueOverTime} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip 
                          formatter={(value) => [`₹${(value as number).toLocaleString()}`, '']}
                          contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Inflow (₹)" />
                        <Area type="monotone" dataKey="Expenses" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Operating Costs (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>
             )}

             {activeTab === 'trips' && (
               <motion.div 
                 key="trips"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
                 <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between mb-4">
                    <div className="max-w-md space-y-2">
                       <h4 className="text-sm font-bold text-slate-800">Dispatch Workloads by Weekday</h4>
                       <p className="text-xs text-slate-400">Weekly analytics indicating count of high-duty cargo movements booked, processed and cleared successfully via automatic toll RFID scanning.</p>
                    </div>
                    <div className="flex gap-4 items-center self-end">
                       <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-bold font-mono">Top Carrier: 12-Wheeler Truck</span>
                    </div>
                 </div>

                 <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueOverTime} barSize={36}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                        <Bar dataKey="Trips" fill="#6366F1" radius={[6, 6, 0, 0]} name="Completed Shipments">
                           {revenueOverTime.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 4 ? '#3730A3' : '#6366F1'} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>
             )}

             {activeTab === 'fleet' && (
               <motion.div 
                 key="fleet"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-8"
               >
                 <div className="space-y-5">
                    <h4 className="text-sm font-bold text-slate-800">Operational Distribution Share</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                       This visual chart represents the aggregate volume share split across major industrial clients onboarded in logistics database schedules.
                    </p>
                    <div className="space-y-3.5">
                       {customerRevenueData.map((client) => (
                         <div key={client.name} className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2">
                               <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: client.color }}></span>
                               <span>{client.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">₹{client.value.toLocaleString('en-IN')}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="h-[260px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerRevenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {customerRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </CardContent>
      </Card>

      {/* Main Grid: Telemetry Alerts Desk & Fleet Updates */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Incident Log Desk - HIGHLY INTERACTIVE */}
        <div className="geometric-card flex flex-col p-6 overflow-hidden bg-white">
          <div className="mb-4 flex items-center justify-between">
             <div className="space-y-1">
                <h3 className="font-bold text-[16px] text-slate-900 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-red-500 animate-swing" /> Operations Telemetry Alerts
                </h3>
                <p className="text-xs text-slate-400">Security triggers from active transit coordinates</p>
             </div>
             {telemetryLogs.some(l => !l.read) && (
               <Button variant="ghost" onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 p-0 font-bold">
                  Mark all read
               </Button>
             )}
          </div>

          <div className="flex-1 space-y-4 max-h-[460px] overflow-y-auto pr-1">
             <AnimatePresence initial={false}>
               {telemetryLogs.map((log) => (
                 <motion.div
                   key={log.id}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, x: -10 }}
                   className={cn(
                     "border border-slate-100 p-4 rounded-xl space-y-2 relative group hover:border-slate-200 transition-colors",
                     !log.read && "bg-slate-50/50"
                   )}
                 >
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                           log.type === 'CRITICAL' && "bg-red-100 text-red-800",
                           log.type === 'SUCCESS' && "bg-emerald-100 text-emerald-800",
                           log.type === 'INFO' && "bg-slate-100 text-slate-600",
                           log.type === 'ALERT' && "bg-orange-100 text-orange-800",
                         )}>
                            {log.type}
                         </span>
                         {!log.read && (
                           <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                         )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                   </div>

                   <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900 leading-tight">{log.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{log.desc}</p>
                   </div>

                   <div className="pt-2 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        onClick={() => clearCriticalAlert(log.id)}
                        className="text-xs text-slate-500 hover:text-slate-900 h-7 px-2.5 rounded-lg border-slate-200"
                      >
                         Dismiss Tick
                      </Button>
                      {log.type === 'CRITICAL' && (
                        <Button 
                          size="xs" 
                          onClick={() => toast.success('Dialing priority satellite link with driver Rajesh Kumar')}
                          className="bg-blue-600 text-white font-bold h-7 px-3 rounded-lg text-xs"
                        >
                           Bridge Call
                        </Button>
                      )}
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
             {telemetryLogs.length === 0 && (
               <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-bold">Excellent: Zero critical active alerts pending.</p>
               </div>
             )}
          </div>
        </div>

        {/* Dynamic Fleet Updates Table List */}
        <div className="lg:col-span-2 geometric-card flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
            <div className="space-y-0.5">
              <h3 className="font-bold text-[16px] text-[#0F172A]">Real-Time Fleet Trackings</h3>
              <p className="text-xs text-slate-400">Dynamic operational status registry from data node</p>
            </div>
            <Badge variant="secondary" className="font-mono font-bold text-xs bg-slate-100 text-slate-700">
               {trips.length} Current Trips On Hand
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-left text-[11px] uppercase font-extrabold text-[#64748B] tracking-wider">Transit ID</th>
                  <th className="px-6 py-4 text-left text-[11px] uppercase font-extrabold text-[#64748B] tracking-wider">Source → Dest</th>
                  <th className="px-6 py-4 text-left text-[11px] uppercase font-extrabold text-[#64748B] tracking-wider">Driver assigned</th>
                  <th className="px-6 py-4 text-left text-[11px] uppercase font-extrabold text-[#64748B] tracking-wider">Status Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {trips.map((trip) => {
                  const correlatedDriver = drivers.find(d => d.id === trip.driverId) || mockDrivers.find(d => d.id === trip.driverId) || { name: 'Unassigned', rating: '5.0' };
                  const correlatedVehicle = vehicles.find(v => v.id === trip.vehicleId) || mockVehicles.find(v => v.id === trip.vehicleId) || { numberPlate: 'PLATE-N/A' };
                  
                  return (
                    <tr key={trip.id} className="last:border-0 hover:bg-slate-50/50 transition-colors h-16">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <span className="font-mono font-black text-xs text-[#2563EB]">{trip.id}</span>
                           <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold uppercase">{trip.client.split(' ')[0]}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 font-bold text-[#1E293B] text-sm">
                          <span>{trip.source}</span>
                          <span className="text-[#94A3B8] font-normal text-xs">→</span>
                          <span>{trip.destination}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-medium font-mono mt-0.5">Plate: {correlatedVehicle.numberPlate}</p>
                      </td>
                      <td className="px-6 py-4">
                         <p className="font-bold text-slate-900 text-sm">{correlatedDriver.name}</p>
                         <p className="text-[10.5px] text-yellow-800 font-medium mt-0.5">★ {correlatedDriver.rating} Class Rating</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={cn(
                            "font-black border-none text-[10px] py-0 px-2.5 shadow-none tracking-wide",
                            trip.status === 'IN_TRANSIT' && "bg-[#DCFCE7] text-[#166534]",
                            trip.status === 'DELIVERED' && "bg-blue-50 text-blue-700",
                            trip.status === 'PLANNING' && "bg-amber-50 text-amber-900"
                          )}
                        >
                          {trip.status === 'IN_TRANSIT' ? 'In Transit' : trip.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
