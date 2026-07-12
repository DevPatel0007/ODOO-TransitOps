import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '@/hooks/useLogout';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Package, 
  Receipt, 
  DollarSign, 
  FileText, 
  Settings, 
  Map,
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const adminMenuItems: SidebarItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
  { icon: <Truck size={20} />, label: 'Trips', path: '/admin/trips' },
  { icon: <Users size={20} />, label: 'Drivers', path: '/admin/drivers' },
  { icon: <Package size={20} />, label: 'Vehicles', path: '/admin/vehicles' },
  { icon: <FileText size={20} />, label: 'Quotations', path: '/admin/quotations' },
  { icon: <Receipt size={20} />, label: 'Lorry Receipts', path: '/admin/lr' },
  { icon: <DollarSign size={20} />, label: 'Expenses', path: '/admin/expenses' },
  { icon: <Receipt size={20} />, label: 'Invoices', path: '/admin/invoices' },
  { icon: <FileText size={20} />, label: 'Reports', path: '/admin/reports' },
  { icon: <Map size={20} />, label: 'Tracking', path: '/admin/tracking' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
];

const driverMenuItems: SidebarItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Home', path: '/driver' },
  { icon: <Truck size={20} />, label: 'Current Trip', path: '/driver/current-trip' },
  { icon: <DollarSign size={20} />, label: 'Expenses', path: '/driver/expenses' },
  { icon: <Users size={20} />, label: 'Profile', path: '/driver/profile' },
];

interface SidebarProps {
  items?: SidebarItem[];
  title?: string;
}

export default function Sidebar({ items = adminMenuItems, title = 'TransitOps' }: SidebarProps) {
  const location = useLocation();
  const handleLogout = useLogout();

  return (
    <div className="w-64 min-h-screen flex flex-col border-r border-border bg-slate-950 text-white shadow-[10px_0_40px_rgba(15,23,42,0.2)]">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-black flex items-center gap-3 tracking-tight">
          <span className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">📦</span>
          <span className="leading-none">{title}</span>
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Fleet operations console</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 border border-transparent',
              location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                ? 'bg-white text-slate-950 shadow-lg shadow-black/10'
                : 'text-slate-300 hover:bg-white/6 hover:text-white'
            )}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/6 hover:text-white w-full transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}

export { adminMenuItems, driverMenuItems };
