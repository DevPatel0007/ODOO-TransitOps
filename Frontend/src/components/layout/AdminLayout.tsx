import React from 'react';
import Sidebar, { adminMenuItems } from './Sidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%),linear-gradient(to_bottom,#f8fbff,#eef4fb)] text-foreground">
      <Sidebar items={adminMenuItems} title="TransitOps" />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
