/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DriverLayout from './components/layout/DriverLayout';

import { Toaster } from 'sonner';

// Mock Pages (Implementation below or separate files)
import AdminDashboard from './pages/admin/Dashboard';
import DriverHome from './pages/driver/Home';
import LoginPage from './pages/auth/Login';
import TripList from './pages/admin/TripList';
import DriverList from './pages/admin/DriverList';
import VehicleList from './pages/admin/VehicleList';
import ExpenseList from './pages/admin/ExpenseList';
import InvoiceList from './pages/admin/InvoiceList';
import LorryReceipts from './pages/admin/LorryReceipts';
import AdminSettings from './pages/admin/Settings';
import AdminTracking from './pages/admin/TrackingDetail';
import QuotationList from './pages/admin/QuotationList';
import Reports from './pages/admin/Reports';
import DriverCurrentTrip from './pages/driver/CurrentTrip';
import DriverExpenses from './pages/driver/Expenses';
import DriverProfile from './pages/driver/Profile';
import TrackingPortal from './pages/tracking/Tracking';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout children={<AdminDashboard />} />} />
        <Route path="/admin/trips" element={<AdminLayout children={<TripList />} />} />
        <Route path="/admin/reports" element={<AdminLayout children={<Reports />} />} />
        <Route path="/admin/drivers" element={<AdminLayout children={<DriverList />} />} />
        <Route path="/admin/vehicles" element={<AdminLayout children={<VehicleList />} />} />
        <Route path="/admin/quotations" element={<AdminLayout children={<QuotationList />} />} />
        <Route path="/admin/expenses" element={<AdminLayout children={<ExpenseList />} />} />
        <Route path="/admin/invoices" element={<AdminLayout children={<InvoiceList />} />} />
        <Route path="/admin/lr" element={<AdminLayout children={<LorryReceipts />} />} />
        <Route path="/admin/settings" element={<AdminLayout children={<AdminSettings />} />} />
        <Route path="/admin/tracking" element={<AdminLayout children={<AdminTracking />} />} />

        {/* Driver Routes */}
        <Route path="/driver" element={<DriverLayout children={<DriverHome />} />} />
        <Route path="/driver/current-trip" element={<DriverLayout children={<DriverCurrentTrip />} />} />
        <Route path="/driver/expenses" element={<DriverLayout children={<DriverExpenses />} />} />
        <Route path="/driver/profile" element={<DriverLayout children={<DriverProfile />} />} />
        
        {/* Public Tracking Route */}
        <Route path="/track" element={<TrackingPortal />} />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
