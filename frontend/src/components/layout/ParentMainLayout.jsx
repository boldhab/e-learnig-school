import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ParentHeader from './ParentHeader';
import ParentSidebar from './ParentSidebar';

const ParentMainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[22%] h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />
      </div>

      <ParentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="min-h-screen lg:pl-[288px]">
        <ParentHeader onMenuClick={() => setSidebarOpen((value) => !value)} />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentMainLayout;
