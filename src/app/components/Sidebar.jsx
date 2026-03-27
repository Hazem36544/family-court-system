import React from 'react';
import {
  Home,
  Briefcase,
  Users,
  GraduationCap, // Schools icon
  MapPin,        // Visitation Centers icon
  FileEdit,
  MessageSquare,
  AlertTriangle,
  User,
  LogOut,
  AlertOctagon
} from 'lucide-react';

export function Sidebar({ currentScreen, onNavigate, onLogout }) {

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },

    { id: 'families-management', label: 'العائلات', icon: Users },
    { id: 'schools', label: 'المدارس', icon: GraduationCap }, // New Addition 1
    { id: 'visitation-centers', label: 'مراكز الرؤية', icon: MapPin }, // New Addition 2
    { id: 'data-change-requests', label: 'الطلبات', icon: FileEdit },
    { id: 'complaints-management', label: 'الشكاوى', icon: MessageSquare },
    { id: 'violations', label: 'المخالفات', icon: AlertOctagon },
    { id: 'account', label: 'الحساب', icon: User },
  ];

  return (
    <div
      className="fixed right-0 top-0 h-screen w-28 bg-[#1e3a8a] text-white flex flex-col items-center py-6 shadow-2xl z-50 font-sans rounded-l-[2rem] border-l border-white/5 transition-all duration-300"
      dir="rtl"
    >

      {/* --- 1. Logo --- */}
      <div className="mb-6 flex-shrink-0 w-full flex justify-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Logo"
          className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-xl"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Logo'; }}
        />
      </div>

      {/* --- 2. Icons and Text --- */}
      <nav className="flex-1 w-full px-2 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          // Check active state (including sub-navigations)
          const isActive =
            currentScreen === item.id ||
            (item.id === 'families-management' && (currentScreen === 'new-family' || currentScreen === 'family-details')) ||
            (item.id === 'cases' && currentScreen === 'case-details');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 group
                ${isActive
                  ? 'bg-white text-[#1e3a8a] shadow-lg scale-105'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className="w-6 h-6 transition-colors duration-300 mb-0.5" />

              <span className="text-[11px] font-bold tracking-wide text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* --- 3. Logout --- */}
      <div className="mt-auto pt-4 w-full px-2 pb-2">
        <button
          onClick={onLogout}
          className="w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>

    </div>
  );
}