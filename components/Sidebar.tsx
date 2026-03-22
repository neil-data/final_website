'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Route, BarChart3, Menu } from 'lucide-react';
import { useUIStore } from '@/store';
import { clsx } from 'clsx';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Routes', href: '/routes', icon: Route },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className={clsx("flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-sm z-10", sidebarOpen ? "w-64" : "w-16")}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200 h-16">
        {sidebarOpen && (
          <Link
            href="/"
            className="font-mono font-bold text-slate-900 tracking-wider text-sm hover:text-cyan-600 transition-colors"
          >
            NYC.COPILOT
          </Link>
        )}
        <button onClick={toggleSidebar} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors">
          <Menu size={20} />
        </button>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-mono text-sm font-medium",
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={clsx(isActive ? "text-cyan-600" : "")} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}