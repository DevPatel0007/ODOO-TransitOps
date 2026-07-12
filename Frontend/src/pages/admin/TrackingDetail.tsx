/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Truck, 
  ShieldCheck,
  ChevronRight,
  RefreshCcw,
  Navigation,
  Activity,
  Fuel,
  Cpu
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTrips } from '@/src/data';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function AdminTracking() {
  const activeTrip = mockTrips[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Operational Tracking</h2>
          <p className="text-sm text-[#64748B]">Real-time logistics feed and vehicle telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl h-12 border-[#E2E8F0] font-bold text-[#1E293B]">
             <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Feed
          </Button>
          <Button className="bg-[#2563EB] hover:bg-blue-700 shadow-md h-12 rounded-xl text-white font-bold">
            Alert All Drivers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Map Representation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="geometric-card h-[500px] bg-slate-100 relative overflow-hidden flex items-center justify-center border-dashed border-2">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563EB 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
             
             {/* Simple Map Visualization */}
             <div className="relative w-full h-full p-12">
                <svg className="w-full h-full opacity-10 stroke-[#2563EB] stroke-1 fill-none">
                   <path d="M100,100 C150,150 250,50 300,200 S450,250 500,100" />
                   <path d="M50,300 C150,250 200,350 300,300 S400,200 550,250" />
                </svg>
                
                {/* Simulated Vehicle Markers */}
                <motion.div 
                  initial={{ x: 100, y: 100 }}
                  animate={{ x: 300, y: 220 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute w-8 h-8 bg-[#2563EB] rounded-lg shadow-xl flex items-center justify-center text-white"
                >
                   <Truck className="w-4 h-4" />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md border text-[10px] font-bold text-[#0F172A]">MH-12-1234</div>
                </motion.div>

                <div className="absolute right-1/4 top-1/3 w-8 h-8 bg-green-500 rounded-lg shadow-xl flex items-center justify-center text-white">
                   <Truck className="w-4 h-4" />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md border text-[10px] font-bold text-[#0F172A]">HR-55-5678</div>
                </div>
             </div>

             <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-[#E2E8F0] space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-[#1E293B]">
                      <div className="w-2 h-2 rounded-full bg-[#2563EB]"></div> IN TRANSIT
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-[#1E293B]">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div> PARKED / IDLE
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="geometric-card p-4">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg"><Activity className="w-4 h-4" /></div>
                   <h4 className="text-[12px] font-bold text-[#64748B] uppercase">Active Fleet</h4>
                </div>
                <p className="text-2xl font-black text-[#0F172A]">18 / 24</p>
             </div>
             <div className="geometric-card p-4">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Navigation className="w-4 h-4" /></div>
                   <h4 className="text-[12px] font-bold text-[#64748B] uppercase">Average ETA</h4>
                   <Badge className="bg-orange-100 text-orange-700 ml-auto">+4m Delay</Badge>
                </div>
                <p className="text-2xl font-black text-[#0F172A]">2.4 hrs</p>
             </div>
             <div className="geometric-card p-4">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Cpu className="w-4 h-4" /></div>
                   <h4 className="text-[12px] font-bold text-[#64748B] uppercase">System Pulse</h4>
                </div>
                <p className="text-2xl font-black text-[#0F172A]">Stable</p>
             </div>
          </div>
        </div>

        {/* Real-time Event Feed */}
        <div className="space-y-6">
           <h3 className="font-bold text-[#0F172A] px-2 flex items-center justify-between">
             Activity Stream
             <Badge variant="outline" className="text-[10px] uppercase font-bold border-[#E2E8F0]">Live</Badge>
           </h3>
           <div className="geometric-card divide-y divide-[#F1F5F9]">
              {[
                { time: '2m ago', event: 'Truck MH-12-1234 arrived at Delhi Hub', type: 'ARRIVAL' },
                { time: '14m ago', event: 'Driver Rajesh Kumar started Trip T1001', type: 'START' },
                { time: '22m ago', event: 'Fuel log uploaded for vehicle HR-55-5678', type: 'DOC' },
                { time: '45m ago', event: 'Delivery completed for Client: Amazon', type: 'DELIVERY' },
                { time: '1h ago', event: 'Route deviance alert: Vehicle DL-01-9012', type: 'ALERT', critical: true },
                { time: '2h ago', event: 'New maintenance request for Pickup Van', type: 'MAINT' }
              ].map((item, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-default group">
                   <div className="flex justify-between items-start gap-3">
                      <p className={cn(
                        "text-[13px] font-medium leading-tight",
                        item.critical ? "text-red-600 font-bold" : "text-[#1E293B]"
                      )}>
                        {item.event}
                      </p>
                      <span className="text-[10px] font-bold text-[#94A3B8] whitespace-nowrap">{item.time}</span>
                   </div>
                   <div className="mt-2 flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         item.critical ? "bg-red-500 animate-pulse" : "bg-[#2563EB]"
                       )}></div>
                       <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{item.type}</span>
                       <ChevronRight className="w-3 h-3 text-[#E2E8F0] ml-auto group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              ))}
           </div>

           <Card className="geometric-card bg-[#1E293B] border-none text-white">
              <CardContent className="p-6">
                 <div className="flex items-center gap-3 mb-4">
                    <Fuel className="text-orange-400 w-6 h-6" />
                    <div>
                       <p className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Fleet Fuel Pulse</p>
                       <p className="text-xl font-bold">1,240 L Remaining</p>
                    </div>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-[68%]"></div>
                 </div>
                 <p className="text-xs text-white/40 mt-3 italic">Calculated across 24 units in current cycle</p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
