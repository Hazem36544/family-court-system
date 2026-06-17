import React from 'react';
import { ChevronRight, Users } from 'lucide-react';

export function StaffHeader({ onBack }) {
  return (
    <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-5 md:p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="flex items-center gap-4 md:gap-5 relative z-10">
        <button onClick={onBack} className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group shrink-0 border-none outline-none cursor-pointer">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">إدارة موظفي المحكمة</h1>
          <p className="text-blue-200 text-xs md:text-sm opacity-90 font-bold tracking-wide">إضافة الموظفين، تحديد الصلاحيات، ومتابعة الأداء</p>
        </div>
      </div>

      <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
         <Users className="w-8 h-8 text-blue-100" />
      </div>
    </div>
  );
}