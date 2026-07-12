import React from 'react';
import Sidebar, { driverMenuItems } from './Sidebar';

interface DriverLayoutProps {
  children?: React.ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={driverMenuItems} title="Driver Portal" />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
