import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import {
  LayoutDashboard, ShoppingBag, Calendar, FileText,
  LogOut, Users, Menu, X, PawPrint, ChevronRight, Heart, Activity, Tag, Bell, Stethoscope, BarChart3, DollarSign
} from 'lucide-react';
import { useNotifications as useToastHistory } from './Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getFileUrl } from '../api';

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30000 // Refetch every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markReadAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/notifications'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const notificationsArr = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsArr.filter(n => !n.isRead).length;

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 text-stone-500 hover:text-lime-700 hover:bg-lime-50 rounded-xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden slide-up">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <button onClick={() => markReadAllMutation.mutate()} className="text-[10px] font-bold text-lime-600 hover:text-lime-700 uppercase tracking-wider">Mark all read</button>
                )}
                {notificationsArr.length > 0 && (
                  <button onClick={() => clearMutation.mutate()} className="text-[10px] font-bold text-stone-400 hover:text-red-500 uppercase tracking-wider">Clear all</button>
                )}
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notificationsArr.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-stone-400">No notifications yet</p>
                </div>
              ) : (
                notificationsArr.map((n, i) => (
                  <div key={n.id} 
                    onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                    className={`px-4 py-3 flex gap-3 hover:bg-stone-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-lime-50/30' : ''} ${i !== notificationsArr.length - 1 ? 'border-b border-stone-50' : ''}`}>
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.isRead ? 'bg-lime-500' : 'bg-stone-200'}`} />
                    <div className="flex-1">
                      <p className={`text-xs leading-tight ${!n.isRead ? 'font-bold text-stone-800' : 'text-stone-500'}`}>{n.title}</p>
                      {n.message && <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{n.message}</p>}
                      <p className="text-[10px] text-stone-300 mt-1 font-medium">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const navLinks = (role) => {
  const all = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'receptionist', 'customer'] },
    { to: '/dashboard/products', icon: ShoppingBag, label: 'Products', roles: ['admin', 'receptionist', 'customer'] },
    { to: '/dashboard/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'receptionist', 'customer'] },
    { to: '/dashboard/services', icon: Heart, label: 'Services', roles: ['admin', 'receptionist', 'customer'] },
    { to: '/dashboard/doctors', icon: Stethoscope, label: 'Doctors', roles: ['admin', 'receptionist', 'customer'] },
    {to: '/dashboard/invoices', icon: FileText, label: 'Invoices', roles: ['admin', 'receptionist'] },
    { to: '/dashboard/my-bills', icon: FileText, label: 'My Bills', roles: ['customer'] },
    { to: '/dashboard/coupons', icon: Tag, label: 'Coupons', roles: ['admin'] },
    { to: '/dashboard/users', icon: Users, label: 'Users', roles: ['admin'] },
    { to: '/dashboard/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'receptionist'] },
    { to: '/dashboard/revenue', icon: DollarSign, label: 'Doctor Revenue', roles: ['admin'] },
    { to: '/dashboard/logs', icon: Activity, label: 'Audit Logs', roles: ['admin'] },
  ];
  return all.filter(l => l.roles.includes(role));
};

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = navLinks(user?.role);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-lime-700 p-1.5 rounded-xl">
            <PawPrint size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-lg leading-none">Pets Mart</h1>
            <p className="text-stone-400 text-xs mt-0.5">Vet & Supplies</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-lime-50 text-lime-800 border border-lime-200'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}
            >
              <Icon size={18} className={isActive ? 'text-lime-700' : 'text-stone-400 group-hover:text-stone-600'} />
              {label}
              {isActive && <ChevronRight size={14} className="ml-auto text-lime-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <Link to="/dashboard/profile" className="px-3 py-4 border-t border-stone-100 block group hover:bg-stone-50 transition-colors">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-sm font-bold shrink-0 overflow-hidden ring-2 ring-white">
            {user?.profileImage ? (
              <img src={getFileUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-lime-700 transition-colors">{user?.name}</p>
            <p className="text-xs text-stone-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-stone-100 flex-col shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-white border-r border-stone-100 flex flex-col shadow-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-stone-600">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <PawPrint size={18} className="text-lime-700 md:hidden" />
              <h2 className="font-bold text-stone-800 text-sm md:text-base capitalize">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-stone-100 hidden sm:block" />
            <Link to="/dashboard/profile" className="hidden sm:flex items-center gap-3 group">
              <div className="text-right">
                <p className="text-xs font-bold text-stone-800 leading-none group-hover:text-lime-700 transition-colors">{user?.name}</p>
                <p className="text-[10px] text-stone-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-xs font-bold ring-2 ring-white overflow-hidden">
                {user?.profileImage ? (
                  <img src={getFileUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
