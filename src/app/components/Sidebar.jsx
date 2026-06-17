import React, { useState } from 'react';
import {
  Home,
  UserPlus,      // أيقونة الموظفين
  Building2,     // أيقونة مراكز الرؤية
  User,          // أيقونة الحساب
  LogOut
} from 'lucide-react';

// ✅ 1. استقبال props التجاوب للموبايل
export function Sidebar({ currentScreen, onNavigate, onLogout, isOpen, setIsOpen }) {
  
  const [logoError, setLogoError] = useState(false);

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'staff-management', label: 'الموظفين', icon: UserPlus },
    { id: 'visitation-centers', label: 'مراكز الرؤية', icon: Building2 }, 
    { id: 'account', label: 'الحساب', icon: User },
  ];

  return (
    <div
      // ✅ 2. كلاسات التجاوب والانزلاق وتوحيد العرض لـ w-32
      className={`fixed right-0 top-0 h-screen w-32 bg-[#1e3a8a] text-white flex flex-col items-center py-6 shadow-2xl z-50 font-sans rounded-l-[2.5rem] border-l border-white/5 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      dir="rtl"
    >

      {/* --- 1. Logo --- */}
      <div className="mb-6 flex-shrink-0 w-full flex justify-center px-2">
        {!logoError ? (
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Logo"
            className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#1e3a8a] font-extrabold text-xl shadow-lg border-2 border-blue-200">
            وصال
          </div>
        )}
      </div>

      {/* --- 2. Icons and Text --- */}
      <nav className="flex-1 w-full px-3 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          // تحديد الشاشة النشطة
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                // ✅ 3. إغلاق القائمة في الموبايل بعد الاختيار
                if (setIsOpen) setIsOpen(false);
              }}
              className={`
                w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 group outline-none border-none
                ${isActive
                  ? 'bg-white text-[#1e3a8a] shadow-lg scale-105'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {/* ✅ 4. توحيد حجم الأيقونات مع باقي النظام */}
              <Icon className="w-7 h-7 transition-colors duration-300 mb-0.5" strokeWidth={2.5} />

              <span className="text-[11px] font-bold tracking-wide text-center leading-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* --- 3. Logout --- */}
      <div className="mt-auto pt-4 w-full px-3 pb-2">
        <button
          onClick={() => {
            if (setIsOpen) setIsOpen(false);
            onLogout();
          }}
          className="w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 border border-transparent hover:border-red-500/20 outline-none cursor-pointer border-none"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>

    </div>
  );
}