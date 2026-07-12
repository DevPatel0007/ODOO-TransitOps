/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map,
  Compass, 
  Banknote, 
  FileText, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  FileSpreadsheet,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Check,
  Plus,
  Zap,
  Volume2,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getSystemSettings, SystemSettings } from '@/src/lib/settingsStore';
import { getSharedNotifications, saveSharedNotifications, addNotification, SystemNotification } from '@/src/lib/notificationStore';
import { toast } from 'sonner';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Truck, label: 'Fleet Trips', path: '/admin/trips' },
  { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
  { icon: Compass, label: 'Tracking', path: '/admin/tracking' },
  { icon: FileSpreadsheet, label: 'Quotations', path: '/admin/quotations' },
  { icon: Users, label: 'Drivers', path: '/admin/drivers' },
  { icon: Map, label: 'Vehicles', path: '/admin/vehicles' },
  { icon: Banknote, label: 'Expenses', path: '/admin/expenses' },
  { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
  { icon: FileCheck, label: 'Lorry Receipts (LR)', path: '/admin/lr' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Load live reactive settings & notifications
  const [sysSettings, setSysSettings] = useState<SystemSettings>(() => getSystemSettings());
  const [notifs, setNotifs] = useState<SystemNotification[]>(() => getSharedNotifications());
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for setting updates
    const handleSettingsUpdate = () => {
      setSysSettings(getSystemSettings());
    };
    // Listen for notification updates
    const handleNotificationsUpdate = () => {
      setNotifs(getSharedNotifications());
    };

    window.addEventListener('logiflow_settings_update', handleSettingsUpdate);
    window.addEventListener('logiflow_notifications_update', handleNotificationsUpdate);

    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('logiflow_settings_update', handleSettingsUpdate);
      window.removeEventListener('logiflow_notifications_update', handleNotificationsUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    saveSharedNotifications(updated);
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    saveSharedNotifications([]);
    toast.message('Alert log cleared');
  };

  const handleToggleRead = (id: string) => {
    const updated = notifs.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    });
    saveSharedNotifications(updated);
  };

  // Fun simulation triggers inside notification panel
  const triggerSimulation = (type: 'SOS' | 'LR_GEN' | 'FUEL_LOW') => {
    if (type === 'SOS') {
      addNotification({
        title: 'Emergency SOS Broadcast',
        message: `Panic switch activated on ${sysSettings.defaultRtoState}-38-AX-9938 near Surat GIDC route. Heavy priority response required.`,
        category: 'TRIP',
        type: 'critical'
      });
      toast.error('Emergency SOS alert simulation triggered!', {
        description: 'Check active notifications dashboard feed.'
      });
    } else if (type === 'LR_GEN') {
      addNotification({
        title: 'New Lorry Receipt Paid',
        message: `Gujarat Transports cleared e-bilty for ₹64,300, signed by ${sysSettings.manager}. Ready to invoice.`,
        category: 'LR',
        type: 'success'
      });
      toast.success('LR creation simulated successfully', {
        description: 'System synced billing pipeline.'
      });
    } else if (type === 'FUEL_LOW') {
      addNotification({
        title: 'Alert: Low FASTag / Fuel limit',
        message: `GJ-01-ZZ-5501 fuel level hit critical limit (${sysSettings.lowFuelAlertPercentage}%). Local pump payment assigned.`,
        category: 'SYSTEM',
        type: 'warning'
      });
      toast.warning('FASTag Fuel Limit simulated!');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] py-6 px-4">
      <div className="mb-10 flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-lg shadow-blue-50">
          <Truck className="text-white w-5 h-5 stroke-[3]" />
        </div>
        <span className="font-extrabold text-[20px] tracking-tight text-[#2563EB]">TransitOps</span>
      </div>
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-[14px]",
              location.pathname === item.path
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]"
            )}
          >
            <item.icon className={cn("w-[18px] h-[18px]", location.pathname === item.path ? "stroke-[2.5]" : "stroke-[2]")} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="pt-4 mt-auto border-t border-slate-100">
        <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-red-500 hover:bg-red-50 gap-2 font-medium">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar - Fixed 220px */}
      <aside className="hidden md:block w-[220px] shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[80px] flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="md:hidden text-[#64748B]">
                  <Menu className="w-5 h-5" />
                </Button>
              } />
              <SheetContent side="left" className="p-0 w-[220px]">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {sidebarItems.find(item => item.path === location.pathname)?.label || 'Overview'}
              </h1>
              {location.pathname === '/admin' && (
                <p className="text-sm text-[#64748B] font-medium">Welcome back, {sysSettings.manager}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className={cn(
                "relative text-[#64748B] hover:bg-slate-100 rounded-xl w-10 h-10 transition-colors",
                isNotifDropdownOpen && "bg-slate-100 text-[#2563EB]"
              )}
            >
              <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-bounce")} />
              {unreadCount > 0 && (
                <span className="absolute top-[8px] right-[8px] flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white text-[7px] font-black items-center justify-center text-white">
                    {unreadCount}
                  </span>
                </span>
              )}
            </Button>

            {/* Notification Dropdown Container */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 top-[60px] w-96 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-200 select-none">
                {/* Panel Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Alert Center</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{unreadCount} unread payloads</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-black uppercase">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead} 
                        className="text-blue-400 hover:text-blue-300 font-black flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> All
                      </button>
                    )}
                    <button 
                      onClick={handleClearAll} 
                      className="text-red-400 hover:text-red-300 font-black flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                </div>

                {/* Notifications list or empty state */}
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                  {notifs.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">Operational Log Clear</p>
                        <p className="text-[10.5px] font-medium text-slate-400">All transshipment trucks reporting stable. Smooth roads ahead.</p>
                      </div>
                    </div>
                  ) : (
                    notifs.map((n) => {
                      const isCritical = n.type === 'critical';
                      const isWarning = n.type === 'warning';
                      const isSuccess = n.type === 'success';

                      return (
                        <div 
                          key={n.id} 
                          onClick={() => handleToggleRead(n.id)}
                          className={cn(
                            "p-3.5 flex gap-3 cursor-pointer transition-colors text-left",
                            !n.read ? "bg-blue-50/30 hover:bg-blue-50/50" : "bg-white hover:bg-slate-50"
                          )}
                        >
                          <div className="shrink-0 pt-0.5">
                            {isCritical && (
                              <div className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 animate-pulse">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                            )}
                            {isWarning && (
                              <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                            {isSuccess && (
                              <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                            {n.type === 'info' && (
                              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                                <Info className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className={cn(
                                "text-xs font-black text-slate-950 truncate",
                                !n.read ? "underline decoration-blue-500 decoration-2" : ""
                              )}>
                                {n.title}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 shrink-0 font-bold">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-[#64748B] font-medium leading-relaxed break-words line-clamp-2">
                              {n.message}
                            </p>
                            <span className="inline-block bg-slate-100 text-slate-600 font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                              {n.category}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Simulation Playground Panel */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Dispatch Simulator
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-slate-400">Click to push dynamic log</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      type="button"
                      onClick={() => triggerSimulation('SOS')}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 text-[9px] font-black text-center border-none transition-all flex items-center justify-center gap-0.5"
                    >
                      🆘 SOS
                    </button>
                    <button 
                      type="button"
                      onClick={() => triggerSimulation('LR_GEN')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-1.5 text-[9px] font-black text-center border-none transition-all flex items-center justify-center gap-0.5"
                    >
                      📄 e-Bilty
                    </button>
                    <button 
                      type="button"
                      onClick={() => triggerSimulation('FUEL_LOW')}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg p-1.5 text-[9px] font-black text-center border-none transition-all flex items-center justify-center gap-0.5"
                    >
                      ⛽ Fuel Limit
                    </button>
                  </div>
                </div>

              </div>
            )}

            <div className="h-10 w-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xs shadow-md border-2 border-white select-none">
              {sysSettings.manager.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
