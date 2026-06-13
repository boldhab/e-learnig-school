import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ParentHeader from './ParentHeader';
import ParentSidebar from './ParentSidebar';

const ParentMainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
