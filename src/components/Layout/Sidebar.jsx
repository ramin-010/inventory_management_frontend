import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, X } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', name: 'Products', icon: Package },
  { path: '/customers', name: 'Customers', icon: Users },
  { path: '/orders', name: 'Orders', icon: ShoppingCart },
];

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#111113] border-r border-[#1e1e20] flex flex-col shrink-0",
        "transform transition-transform duration-200 ease-in-out",
        "md:relative md:w-56 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#1e1e20]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#ededef] flex items-center justify-center">
              <Package size={14} className="text-[#111113]" />
            </div>
            <span className="text-sm font-semibold text-[#ededef] tracking-tight">NexusOMS</span>
          </div>
          <button 
            className="md:hidden text-[#6e6e73] hover:text-[#ededef]" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] transition-colors duration-100",
                  isActive
                    ? "bg-[#1e1e20] text-[#ededef]"
                    : "text-[#6e6e73] hover:text-[#a0a0a3] hover:bg-[#19191b]"
                )}
              >
                <item.icon size={15} strokeWidth={1.8} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-[#1e1e20]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-[#2a2a2d] flex items-center justify-center text-[11px] font-medium text-[#a0a0a3]">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#a0a0a3] truncate">Admin User</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
