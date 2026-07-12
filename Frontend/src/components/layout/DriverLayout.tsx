import React from 'react';
import Sidebar, { driverMenuItems } from './Sidebar';

interface DriverLayoutProps {
  children?: React.ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_30%),linear-gradient(to_bottom,#f8fbff,#eef4fb)] text-foreground">
      <Sidebar items={driverMenuItems} title="Driver Portal" />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
