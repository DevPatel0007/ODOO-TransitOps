/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Bell, 
  Shield, 
  Database,
  Smartphone,
  Globe,
  Truck,
  CreditCard,
  Sparkles,
  Save,
  CheckCircle,
  DatabaseZap,
  RefreshCw,
  Sliders,
  BellRing
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getSystemSettings, saveSystemSettings, SystemSettings } from '@/src/lib/settingsStore';
import { addNotification } from '@/src/lib/notificationStore';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>(() => getSystemSettings());
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');

  // Load latest settings
  useEffect(() => {
    setSettings(getSystemSettings());

    const handleUpdate = () => {
      setSettings(getSystemSettings());
    };
    window.addEventListener('logiflow_settings_update', handleUpdate);
    return () => {
      window.removeEventListener('logiflow_settings_update', handleUpdate);
    };
  }, []);

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSystemSettings(settings);
    // Add real-time log event into live notifications deck
    addNotification({
      title: 'Console Preferences Updated',
      message: `Settings compiled state saved for ${settings.companyName}. Dispatch parameters updated.`,
      category: 'SYSTEM',
      type: 'info'
    });

    toast.success('B2B System Settings Saved!', {
      description: 'Preferences and transporter schemas updated on local client device cache.'
    });
  };

  const handleTriggerSync = () => {
    setSyncStatus('syncing');
    toast.message('Contacting Gandhidham Server Hub...', {
      description: 'Aligning vehicle tracking telemetry buffers.'
    });

    setTimeout(() => {
      setSyncStatus('completed');
      toast.success('Offline DB Sync Complete', {
        description: 'Synchronized General Ledge + 5 dispatch manifests directly with regional office.'
      });
      // Add notification!
      addNotification({
        title: 'Full Database Synced',
        message: 'Synchronized 100% of local truck dispatches and billing parameters with central storage.',
        category: 'SYSTEM',
        type: 'success'
      });
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto font-sans pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              System Admin Console
            </span>
            <span className="text-xs text-slate-400 font-bold">• V2.6 Gujarat Engine ready</span>
          </div>
          <h2 className="text-3xl font-black text-[#01091a] tracking-tight">System Controls & Settings</h2>
          <p className="text-sm text-[#64748B] font-medium leading-relaxed">
            Configure GIDC fleet parameters, adjust GSTIN numbers, toggle automated billing pipelines, and synchronize tracking database.
          </p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#2563EB] hover:bg-blue-700 shadow-md h-12 px-6 rounded-xl text-white font-extrabold transition-all border-none gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation panel */}
        <div className="md:col-span-1 space-y-4">
          <nav className="flex flex-col gap-1.5 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            {[
              { id: 'profile', icon: Building, label: 'Profile' },
              { id: 'notifications', icon: Bell, label: 'Alert Toggles' },
              { id: 'security', icon: Shield, label: 'Security & Auth' },
              { id: 'datasync', icon: Database, label: 'Ledger Data Sync' },
              { id: 'driverapp', icon: Smartphone, label: 'Driver App Hook' },
              { id: 'portal', icon: Globe, label: 'RTO Portal Prefs' }
            ].map((item) => (
              <button 
                key={item.id} 
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  toast.info(`Switched to ${item.label} preferences`);
                }}
                className={cn(
                  "w-full flex items-center gap-3 h-11 px-4 rounded-xl font-black text-xs transition-all border-none text-left",
                  activeTab === item.id 
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10" 
                    : "text-[#64748B] hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-slate-400")} />
                {item.label}
              </button>
            ))}
          </nav>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100 rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <p className="text-[10px] font-black text-[#1E40AF] uppercase tracking-widest leading-none">Plan Status: Premium Enterprise</p>
              <p className="text-xs text-[#1E3A8A] font-semibold leading-relaxed">
                TransitOps license registered for <strong>50 dual-axle vehicles</strong>. High payload GPS alerts active.
              </p>
              <div className="flex items-center gap-1 text-[11px] font-black text-[#2563EB] hover:underline cursor-pointer">
                Request Expansion Tier →
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content panel based on activeTab */}
        <div className="md:col-span-2">
          
          {activeTab === 'profile' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Organization Profile</h3>
                <p className="text-xs text-[#64748B] font-medium">Headquarters legal and taxation parameters</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-xs font-bold text-[#64748B] uppercase">Legal Name</Label>
                    <Input 
                      id="companyName" 
                      value={settings.companyName} 
                      onChange={e => handleInputChange('companyName', e.target.value)}
                      className="h-11 rounded-xl border-[#E2E8F0] font-bold text-slate-950 focus-visible:ring-blue-600" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gstin" className="text-xs font-bold text-[#64748B] uppercase">GSTIN (Enterprise Registered)</Label>
                    <Input 
                      id="gstin" 
                      value={settings.gstin} 
                      onChange={e => handleInputChange('gstin', e.target.value)}
                      className="h-11 rounded-xl border-[#E2E8F0] font-mono font-bold text-slate-950 uppercase" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-[#64748B] uppercase">Headquarters Address</Label>
                  <Input 
                    id="address" 
                    value={settings.address} 
                    onChange={e => handleInputChange('address', e.target.value)}
                    className="h-11 rounded-xl border-[#E2E8F0] font-semibold text-slate-800" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#64748B] uppercase">Primary Contact Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={settings.email} 
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="h-11 rounded-xl border-[#E2E8F0] font-bold text-slate-850" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager" className="text-xs font-bold text-[#64748B] uppercase">Chief Transshipment Officer</Label>
                    <Input 
                      id="manager" 
                      value={settings.manager} 
                      onChange={e => handleInputChange('manager', e.target.value)}
                      className="h-11 rounded-xl border-[#E2E8F0] font-bold text-slate-850" 
                    />
                  </div>
                </div>
              </div>

              <div className="border border-dashed border-blue-200 bg-blue-50/20 p-4 rounded-xl space-y-1 select-none">
                <span className="text-[9px] font-black text-blue-700 tracking-wider uppercase block">RTO Rule Form-38 Integration</span>
                <p className="text-[11px] text-[#1E3A8A] font-medium leading-relaxed">
                  Modifying your company name, GSTIN, and legal address propagates directly onto all freshly created <strong>Lorry Receipts (LR/Bilty)</strong> and Tax Invoices compiled on our platform.
                </p>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">System Alerts & Notifications</h3>
                <p className="text-xs text-[#64748B] font-medium">Control what events register in the Live Header Deck</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Live GPS Tracking Alerts</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Register console logs as soon as truck crosses GJ border line.</p>
                  </div>
                  <Switch 
                    checked={settings.liveGpsEnabled} 
                    onCheckedChange={checked => handleInputChange('liveGpsEnabled', checked)} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Immediate Driver SOS trigger</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Sound visual alarm on monitor if driver activates mobile app panic toggle.</p>
                  </div>
                  <Switch 
                    checked={settings.sosAlertsEnabled} 
                    onCheckedChange={checked => handleInputChange('sosAlertsEnabled', checked)} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Auto-Invoicing on Delivery Completion</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Instantly generate and email a PDF tax invoice once delivery is verified.</p>
                  </div>
                  <Switch 
                    checked={settings.autoInvoicable} 
                    onCheckedChange={checked => handleInputChange('autoInvoicable', checked)} 
                  />
                </div>

                <div className="space-y-1.5 p-4 bg-amber-50/20 border border-amber-100 rounded-xl">
                  <Label className="text-xs font-black text-amber-800 uppercase">Critical Low-Fuel Warning Limit (%)</Label>
                  <p className="text-[10.5px] text-amber-700/85 mb-2 font-medium">Triggers high-priority alerts into dashboard logistics checklist.</p>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      value={settings.lowFuelAlertPercentage} 
                      onChange={e => handleInputChange('lowFuelAlertPercentage', parseInt(e.target.value) || 10)}
                      className="w-24 h-10 border-amber-200 font-bold focus-visible:ring-amber-500 bg-white" 
                    />
                    <span className="text-xs font-bold text-slate-500">Percent remaining fuel buffer</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Administrative Authentication</h3>
                <p className="text-xs text-[#64748B] font-medium">Prevent unauthorized billing modifications or payload overrides</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Access Authority</Label>
                    <Input type="text" readOnly value="Central Management Role" className="h-11 rounded-xl bg-slate-100 border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase">IP Address Authorization</Label>
                    <Input type="text" readOnly value="192.168.1.135 (Gujarat Hub Dedicated)" className="h-11 rounded-xl bg-slate-100 border-slate-200 font-mono font-bold" />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-800">REQUIRE PASSWORD RE-ENTRY FOR INCOMING CREDIT CLAIMS</p>
                    <p className="text-[10.5px] text-slate-400 font-medium">B2B client bank details require secret PIN authorization before saving.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      toast.success('Access keys rotated!', {
                        description: 'Enterprise API transport keys safely updated.'
                      });
                    }}
                    className="border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black h-10"
                  >
                    Rotate Secret Tokens
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'datasync' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Ledger Database Sync</h3>
                <p className="text-xs text-[#64748B] font-medium">Synchronize local cache storage parameters with offline registers</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-1">
                    <p className="text-lg font-mono font-black text-[#1E293B]">₹10.3 Lakhs</p>
                    <p className="text-[10px] uppercase font-black text-indigo-700 tracking-wider">Unsaved offline transactions ledger</p>
                  </div>
                  <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-1">
                    <p className="text-lg font-mono font-black text-slate-800">GJ-03-AX-8904</p>
                    <p className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">Last tracking synchronization engine</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-xs font-black text-slate-800 uppercase block">AUTOMATIC 10-MIN BACKUPS</strong>
                    <span className="text-[11px] text-[#64748B] font-medium block">Safeguards lorry manifests data from poor signal connection routes.</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    onClick={handleTriggerSync}
                    disabled={syncStatus === 'syncing'}
                    className={cn(
                      "flex-1 font-extrabold text-xs h-11 rounded-xl border-none text-white",
                      syncStatus === 'syncing' ? "bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
                    )}
                  >
                    {syncStatus === 'syncing' ? (
                      <span className="flex items-center justify-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing manifest matrices...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <DatabaseZap className="w-4 h-4" /> Trigger Manual DB Sync with Central Gujarat HQ
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'driverapp' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Driver Android App Hook</h3>
                <p className="text-xs text-[#64748B] font-medium">Coordinate dynamic instructions push alerts to driver terminals</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Dynamic Route Rerouting Push</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Automatically push alert notifications to mobile app in case of construction delays.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Mandatory Digital Proof of Delivery (POD)</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Require driver to upload high-res snapshot of customer-signed LR stamp.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[#1E293B] uppercase">Automated Toll FASTag Reimbursements</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Instantly payout toll plaza expenses registered from vehicle onboard scanners.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'portal' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">State RTO & Portal Preferences</h3>
                <p className="text-xs text-[#64748B] font-medium">Match transporter default schemas to your region of operations</p>
              </div>
              <Separator className="bg-[#F1F5F9]" />

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Default Transporter RTO Jurisdiction</Label>
                  <select 
                    value={settings.defaultRtoState} 
                    onChange={e => handleInputChange('defaultRtoState', e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl font-bold bg-white text-slate-800 px-3 outline-none focus:border-blue-500"
                  >
                    <option value="GJ">GJ - Gujarat (Morbi/Surat hub controls)</option>
                    <option value="MH">MH - Maharashtra (Mumbai-Pune heavy traffic links)</option>
                    <option value="DL">DL - Delhi Outer Ring Gateways</option>
                    <option value="KA">KA - Karnataka (Bangalore Tech Hub)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Interactive System Branding Accent</Label>
                  <div className="flex gap-2">
                    {[
                      { id: 'indigo', label: 'Indigo Heavy Duty', bg: 'bg-[#2563EB]' },
                      { id: 'light', label: 'Vintage Gold Roadways', bg: 'bg-amber-600' },
                      { id: 'slate', label: 'Classic Slate Logistics', bg: 'bg-slate-800' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          handleInputChange('preferredTheme', theme.id);
                          toast.info(`Theme changed to ${theme.label}`);
                        }}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-black transition-all",
                          settings.preferredTheme === theme.id 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span className={cn("w-3 h-3 rounded-full shrink-0", theme.bg)}></span>
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>

      </div>
    </div>
  );
}
