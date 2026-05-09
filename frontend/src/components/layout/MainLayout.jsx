import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { COLORS } from '../../constants/theme';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen" style={{ backgroundColor: COLORS.BACKGROUND }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
