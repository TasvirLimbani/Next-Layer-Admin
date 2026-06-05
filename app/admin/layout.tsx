'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Filament',
    href: '/admin/filament',
    icon: Settings,
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'
        } border-r border-slate-200 bg-white transition-all duration-300 flex flex-col shadow-sm`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-900">Admin</h1>
                      <p className="text-xs text-slate-500">Dashboard</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.name : ''}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-slate-200 px-3 py-4 space-y-2">
            <button
              title="Settings"
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button
              title="Logout"
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>

          {/* Footer */}
          {sidebarOpen && (
            <div className="border-t border-slate-200 px-6 py-3">
              <p className="text-xs text-slate-500">© 2024 Admin Panel v1.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {navItems.find((item) => pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href)))?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow">
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
