/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  Smartphone,
  LockKeyhole,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight,
  Gauge,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('axis-manager');
  const [accessCode, setAccessCode] = useState('••••••••');
  const [loadingRole, setLoadingRole] = useState<'admin' | 'driver' | null>(null);

  const handleAdminLogin = () => {
    setLoadingRole('admin');
    toast.loading('Authenticating Admin credentials...', { id: 'login-toast' });
    
    setTimeout(() => {
      toast.success('Access Granted!', {
        id: 'login-toast',
        description: 'Welcome back to TransitOps Command Tower'
      });
      navigate('/admin');
    }, 800);
  };

  const handleDriverLogin = () => {
    setLoadingRole('driver');
    toast.loading('Loading Driver Dispatch Hub...', { id: 'login-toast' });
    
    setTimeout(() => {
      toast.success('Logged in successfully!', {
        id: 'login-toast',
        description: 'Check active lorry receipt delivery manifests'
      });
      navigate('/driver');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Visual Left Sidebar (Swiss/Modern Minimal Grid) */}
      <div className="hidden md:flex w-[45%] bg-[#0B0F19] p-12 flex-col justify-between text-white relative overflow-hidden border-r border-slate-900 select-none">
        {/* Futuristic Grid & Ambient Spotlights */}
        <div className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none bg-[linear-gradient(to_right,#3b82f6_1.5px,transparent_1.5px),linear-gradient(to_bottom,#3b82f6_1.5px,transparent_1.5px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_40%,#000_60%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-blue-500 rounded-full blur-[140px] opacity-[0.25] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[140px] opacity-[0.22] pointer-events-none"></div>

        {/* Global Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Truck className="text-white w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tight leading-none">
              TransitOps
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5"> गुजरात लॉजिस्टिक्स</span>
          </div>
        </div>

        {/* Feature Focus Block */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1 text-[11px] font-black uppercase text-blue-400 tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin" /> High-Capacity Telemetry Enabled
          </div>
          <h2 className="text-5xl font-black leading-[1.12] tracking-tight max-w-md">
            The intelligent route to <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">frictionless</span> fleet control.
          </h2>
          <p className="text-sm text-slate-300 font-medium max-w-sm leading-relaxed opacity-90">
            A precise logistics command bridge engineered for regional e-Bilties (Lorry Receipts), real-time fuel tracking, instant GST accounting, and driver coordination.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-800/80 max-w-sm select-none">
            <div className="space-y-0.5">
              <p className="text-xl font-mono font-black text-white">0.00s</p>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Local Cache Lag</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl font-mono font-black text-white">100%</p>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Form-38 Compliant</p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <span>Active Hub: Ahmedabad</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 
            System Online
          </span>
        </div>
      </div>

      {/* Auth Side (Right) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-14 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Header element for smaller viewports or clean welcome state */}
          <div className="space-y-2 mt-2">
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/10">
                <Truck className="text-white w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                TransitOps
              </span>
            </div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Enterprise Sign In</p>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Operational Command</h1>
            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              Authenticate via system authority tokens or look up dynamic shipments on the open transit portal.
            </p>
          </div>

          <Tabs defaultValue="employee" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-[52px] p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 mb-6">
              <TabsTrigger 
                value="employee" 
                className="rounded-lg font-black text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
              >
                Logistics Console
              </TabsTrigger>
              <TabsTrigger 
                value="client" 
                className="rounded-lg font-black text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
              >
                Public Tracking
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="employee" className="space-y-5 mt-0">
               <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sign-In Protocol ID</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input 
                        type="text" 
                        placeholder="Operator Name / Code" 
                        className="pl-11 h-13 border-[#cbd5e1] focus:border-blue-500 bg-white rounded-xl font-bold text-slate-900 focus-visible:ring-blue-500/20 shadow-sm"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input 
                        type="password" 
                        placeholder="Passkey" 
                        className="pl-11 h-13 border-[#cbd5e1] focus:border-blue-500 bg-white rounded-xl font-bold text-slate-900 focus-visible:ring-blue-500/20 shadow-sm" 
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                      />
                    </div>
                  </div>
               </div>

               <div className="border border-dashed border-blue-200 bg-blue-50/40 p-3.5 rounded-xl flex items-center gap-3">
                 <Zap className="w-5 h-5 text-blue-600 shrink-0 fill-blue-100" />
                 <p className="text-[11px] text-[#1E3A8A] font-semibold leading-relaxed">
                   Enter credentials or click below for instant authorized demo bypass.
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <button 
                    type="button"
                    onClick={handleAdminLogin} 
                    disabled={loadingRole !== null}
                    className="h-13 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black shadow-lg shadow-slate-950/10 gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center border-none"
                  >
                    <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
                    Console Admin
                  </button>
                  <button 
                    type="button"
                    onClick={handleDriverLogin} 
                    disabled={loadingRole !== null}
                    className="h-13 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-600/10 gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center border-none"
                  >
                    <Gauge className="w-4.5 h-4.5 text-blue-200" />
                    Driver Screen
                  </button>
               </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-5 mt-0 animate-in fade-in duration-300">
               <div className="space-y-4">
                  <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 border-dashed text-center">
                    <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
                      Lorry Receipt dispatch clients and consignor corporations can track real-time container pathways safely without dynamic credentials keys.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/track')} 
                    className="w-full h-13 border border-slate-300 hover:bg-slate-50 text-slate-800 hover:text-slate-900 rounded-xl font-black uppercase text-xs tracking-wider gap-2 flex items-center justify-center group"
                  >
                    Access Public Tracking Portal
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
               </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 text-center text-slate-400 text-[11px] font-bold border-t border-slate-200/50">
            <p>© 2026 TransitOps Roadways Technologies. All rights reserved.</p>
            <p className="text-slate-300 mt-1 uppercase tracking-widest text-[9px]">GIDC Transshipment Infrastructure Network</p>
          </div>
        </div>
      </div>
    </div>
  );
}
