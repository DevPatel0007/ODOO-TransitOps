/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Play, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  AlertTriangle,
  Upload,
  Receipt,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTrips, mockDrivers } from '@/src/data';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function DriverHome() {
  const currentTrip = mockTrips.find(t => t.id === 'T1001');
  const driver = mockDrivers[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Current Trip Card */}
      {currentTrip && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="geometric-card p-4 overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Active Trip</p>
                  <p className="text-[18px] font-extrabold text-[#0F172A] leading-tight mt-1">{currentTrip.destination} Warehouse</p>
                </div>
                <Badge className="bg-[#EFF6FF] text-[#2563EB] border-none font-bold">In Transit</Badge>
             </div>
             
             <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#F1F5F9]">
                <div>
                   <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Vehicle</p>
                   <p className="font-bold text-[#1E293B] text-[13px]">KA-05-AB-4421</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-[#94A3B8] uppercase">ETA</p>
                   <p className="font-bold text-[#1E293B] text-[13px]">4:30 PM</p>
                </div>
             </div>

             <Button nativeButton={false} render={<Link to="/driver/current-trip" />} className="w-full bg-[#2563EB] hover:bg-blue-700 h-[56px] text-lg font-bold rounded-xl shadow-lg shadow-blue-100 mt-6 border-none">
                <span className="flex items-center justify-center gap-2">
                   START TRIP
                </span>
             </Button>

             <div className="grid grid-cols-2 gap-3 mt-3">
                <button className="flex-1 h-12 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#1E293B] active:bg-slate-50 transition-colors">
                  Upload POD
                </button>
                <button className="flex-1 h-12 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#1E293B] active:bg-slate-50 transition-colors">
                  Fuel Bill
                </button>
             </div>

             <button className="w-full h-12 bg-[#EF4444] text-white font-bold text-sm rounded-xl mt-3 shadow-lg shadow-red-100 uppercase tracking-widest">
                SOS - EMERGENCY
             </button>
          </div>
        </motion.div>
      )}

      {/* Driver Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="geometric-card p-4 flex flex-col items-center justify-center text-center">
           <div className="text-[24px] mb-1">🏁</div>
           <p className="text-xl font-bold text-[#0F172A]">24</p>
           <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Trips Done</p>
        </div>
        <div className="geometric-card p-4 flex flex-col items-center justify-center text-center">
           <div className="text-[24px] mb-1">⭐️</div>
           <p className="text-xl font-bold text-[#0F172A]">{driver.rating}</p>
           <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Rating</p>
        </div>
      </div>
    </div>
  );
}
