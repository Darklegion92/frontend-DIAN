import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Recuperar estado guardado de localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        className="fixed h-full z-30" 
        onToggle={handleSidebarToggle}
      />
      
      {/* Contenido principal */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 