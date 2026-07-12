/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Truck, 
  PlusCircle, 
  User, 
  HelpCircle,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/driver' },
  { icon: Truck, label: 'My Trip', path: '/driver/current-trip' },
  { icon: User, label: 'Profile', path: '/driver/profile' },
  { icon: HelpCircle, label: 'Support', path: '/driver/help' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="h-[80px] bg-[#2563EB] flex flex-col justify-center px-6 shrink-0 shadow-lg shadow-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-white/80 uppercase tracking-widest">Hello, Rajesh!</p>
            <h1 className="text-[20px] font-bold text-white tracking-tight">Current Overview</h1>
          </div>
          <button className="text-white relative p-1">
            <Bell className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-[#2563EB]"></span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-[76px] bg-white border-t border-[#E2E8F0] flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {[
          { icon: '🏠', label: 'Home', path: '/driver' },
          { icon: '🚚', label: 'Trips', path: '/driver/current-trip' },
          { icon: '💰', label: 'Expenses', path: '/driver/expenses' },
          { icon: '👤', label: 'Profile', path: '/driver/profile' },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[64px] transition-all",
              location.pathname === item.path
                ? "text-[#2563EB] scale-110"
                : "text-[#64748B] hover:text-[#1E293B]"
            )}
          >
            <span className="text-[20px] leading-none mb-1">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
