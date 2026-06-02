import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#111113]">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="flex-1 overflow-y-auto relative">
        <Toaster position="top-right" toastOptions={{
          className: '!bg-[#19191b] !text-[#ededef] !border !border-[#2a2a2d] !text-sm',
        }} />
        
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#1e1e20] bg-[#111113] sticky top-0 z-20">
          <div className="font-semibold text-[#ededef]">NexusOMS</div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-[#a0a0a3] p-1">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
