import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Receipt,
  FileText,
  FileCheck2,
  IndianRupee,
  BarChart3,
  Settings as SettingsIcon,
  MapPin,
  Menu,
  X
} from 'lucide-react'

// Import all admin pages
import AdminDashboard from "./pages/admin/Dashboard"
import DriverList from "./pages/admin/DriverList"
import ExpenseList from "./pages/admin/ExpenseList"
import InvoiceList from "./pages/admin/InvoiceList"
import LorryReceipts from "./pages/admin/LorryReceipts"
import QuotationList from "./pages/admin/QuotationList"
import Reports from "./pages/admin/Reports"
import AdminSettings from "./pages/admin/Settings"
import AdminTracking from "./pages/admin/TrackingDetail"
import TripList from "./pages/admin/TripList"
import VehicleList from "./pages/admin/VehicleList"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Fleet Vehicles', path: '/admin/vehicles', icon: Truck },
    { name: 'Captains / Drivers', path: '/admin/drivers', icon: Users },
    { name: 'Trip Manager', path: '/admin/trips', icon: RouteIcon },
    { name: 'Live Tracking', path: '/admin/tracking', icon: MapPin },
    { name: 'Lorry Receipts', path: '/admin/lorry-receipts', icon: Receipt },
    { name: 'Quotations', path: '/admin/quotations', icon: FileText },
    { name: 'Invoices', path: '/admin/invoices', icon: FileCheck2 },
    { name: 'Expenses', path: '/admin/expenses', icon: IndianRupee },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ]

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-50 overflow-hidden">
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                TransitOps
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* User profile footer info */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-indigo-200 dark:bg-indigo-950 flex items-center justify-center font-semibold text-indigo-700 dark:text-indigo-300">
                MP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  Milap Patel
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  Operations Director
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <header className="flex items-center justify-between lg:justify-end h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 animate-pulse">
                System Live
              </span>
            </div>
          </header>

          {/* Page Routing Contents */}
          <main className="flex-1 p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* Redirect base / to dashboard */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/vehicles" element={<VehicleList />} />
                <Route path="/admin/drivers" element={<DriverList />} />
                <Route path="/admin/trips" element={<TripList />} />
                <Route path="/admin/tracking" element={<AdminTracking />} />
                <Route path="/admin/lorry-receipts" element={<LorryReceipts />} />
                <Route path="/admin/quotations" element={<QuotationList />} />
                <Route path="/admin/invoices" element={<InvoiceList />} />
                <Route path="/admin/expenses" element={<ExpenseList />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
