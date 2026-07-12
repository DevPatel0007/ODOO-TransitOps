import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-blue-500 p-2 rounded-lg">📦</span>
          {title}
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            )}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 w-full transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export { adminMenuItems, driverMenuItems };
