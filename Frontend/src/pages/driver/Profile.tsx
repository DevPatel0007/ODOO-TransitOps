/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Truck, 
  Award, 
  BadgeCheck, 
  Heart, 
  Eye, 
  Users, 
  Clock, 
  Briefcase,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Sparkles,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function DriverProfile() {
  const [medicalRequestSubmitting, setMedicalRequestSubmitting] = useState(false);
  const [renewalSubmitting, setRenewalSubmitting] = useState(false);

  // Trigger test schedules
  const handleRequestMedical = () => {
    setMedicalRequestSubmitting(true);
    setTimeout(() => {
      setMedicalRequestSubmitting(false);
      toast.success('Medical checkup scheduled!', {
        description: 'You will receive your hub diagnostic pass via SMS coordinates shortly.'
      });
    }, 1200);
  };

  const handleRequestRenewal = () => {
    setRenewalSubmitting(true);
    setTimeout(() => {
      setRenewalSubmitting(false);
      toast.success('RTO Renewal Request Broadcasted!', {
        description: 'Organizational compliance agents have taken up your license (DL-1234567890) renewal file.'
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pb-12 font-sans px-1">
      
      {/* Prime Header Badge Profile card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
         <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
         <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500 rounded-full blur-[70px] opacity-20 pointer-events-none"></div>

         <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-1 border-2 border-white/20 overflow-hidden shrink-0">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh%20Kumar" alt="Rajesh Kumar Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5 truncate">
               <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight leading-none text-white">Rajesh Kumar</h2>
                  <Badge className="bg-emerald-500 text-white font-extrabold uppercase text-[9px] border-none px-2 py-0.5 leading-none">Active</Badge>
               </div>
               <p className="text-xs font-mono font-bold text-slate-300 tracking-wider">LICENSE • DL-1234567890</p>
               <div className="flex items-center gap-1 text-slate-400 font-bold text-[10.5px]">
                  <span>⭐ 4.8 Rating</span>
                  <span>•</span>
                  <span>12 Yrs Exp</span>
               </div>
            </div>
         </div>

         {/* General Summary */}
         <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/10 text-center">
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Halt Wallet</p>
               <p className="text-sm font-black text-[#10B981] mt-0.5 font-mono">₹4,500</p>
            </div>
            <div className="border-x border-white/10">
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">My Trips</p>
               <p className="text-sm font-black text-white mt-0.5 font-mono">142 Done</p>
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Medical</p>
               <p className="text-sm font-black text-blue-400 mt-0.5 font-mono uppercase">FIT</p>
            </div>
         </div>
      </div>

      {/* Compliance / Bio Diagnostics checks card */}
      <div className="space-y-3">
         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Compliance & Health Deck</h3>
         
         <div className="geometric-card p-4 space-y-4 bg-white border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
               <div className="flex gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                     <Eye className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-slate-800">Visual Health: Approved (6/6 Perfect)</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-0.5">Last clinical eye check: May 12, 2026</p>
                  </div>
               </div>
               <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[8.5px] uppercase">Compliant</Badge>
            </div>

            <div className="flex justify-between items-start">
               <div className="flex gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                     <Heart className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-slate-800">Cardio BP Stability: 121/79 (Excellent)</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-0.5">Blood Type Grouping: O-positive</p>
                  </div>
               </div>
               <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8.5px] uppercase">Healthy</Badge>
            </div>
         </div>
      </div>

      {/* Active Commercial Vehicle mapped card */}
      <div className="space-y-3">
         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Assigned Commercial Vehicle</h3>
         
         <div className="geometric-card p-4 bg-white border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between pb-3.5">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                     <Truck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-slate-800">MH-12-AB-1234</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">12 W Heavy Duty Carrier • 20T</p>
                  </div>
               </div>
               <Badge className="bg-[#EFF6FF] text-[#2563EB] border-none font-bold text-[10px] uppercase">Active v1</Badge>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-4 text-xs">
               <div className="space-y-0.5">
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase">Tire Safety score</p>
                  <p className="font-extrabold text-slate-800">85% Wear Balance</p>
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase">Tire Pressures</p>
                  <p className="font-extrabold text-slate-800">110 PSI (Safe range)</p>
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase">Fuel efficiency log</p>
                  <p className="font-extrabold text-emerald-600">3.8 km/l avg</p>
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase">Hub services done</p>
                  <p className="font-extrabold text-indigo-700">June 02, 2026</p>
               </div>
            </div>
         </div>
      </div>

      {/* Emergency 가족 Lines */}
      <div className="space-y-3">
         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Emergency SOS Contacts</h3>
         
         <div className="geometric-card p-4 bg-white border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-black shrink-0 font-mono">Sp</div>
                  <div>
                     <p className="text-xs font-black text-slate-800">Sunita Devi (Spouse)</p>
                     <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">+91 91122 88124</p>
                  </div>
               </div>
               <a href="tel:+919112288124" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
               </a>
            </div>

            <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-black shrink-0 font-mono">Hb</div>
                  <div>
                     <p className="text-xs font-black text-slate-800">Alok Sharma (Hub Manager)</p>
                     <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">+91 98765 00192</p>
                  </div>
               </div>
               <a href="tel:+919876500192" className="w-8 h-8 rounded-full bg-[#EFF6FF] hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
               </a>
            </div>
         </div>
      </div>

      {/* Actions renewal triggers */}
      <div className="space-y-2">
         <Button 
           onClick={handleRequestMedical} 
           disabled={medicalRequestSubmitting}
           className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none"
         >
            {medicalRequestSubmitting ? 'Scheduling hub pass...' : 'Fast-Track Eye diagnostic check Slot'}
         </Button>

         <Button 
           onClick={handleRequestRenewal}
           disabled={renewalSubmitting}
           variant="outline" 
           className="w-full h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
         >
            {renewalSubmitting ? 'Transmitting code...' : 'File Commercial License RTO Renewal'}
         </Button>
      </div>

    </div>
  );
}
