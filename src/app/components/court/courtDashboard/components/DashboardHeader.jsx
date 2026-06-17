import React from 'react';
import { Scale, Building2, Calendar } from 'lucide-react';

const DashboardHeader = ({ userData, today }) => {
  return (
    <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl gap-6">
      {/* زخارف الخلفية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner shrink-0">
          <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>

        <div>
          <p className="text-blue-200 text-xs md:text-sm font-bold mb-1 opacity-90">لوحة تحكم إدارة المحكمة</p>
          <h1 className="text-xl md:text-3xl font-bold mb-2 tracking-wide">{userData.name}</h1>
          <div className="flex items-center gap-3 text-blue-100 text-xs md:text-sm font-bold opacity-90">
            <span className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-800">
              <Building2 className="w-4 h-4" />
              محافظة {userData.governorate}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto bg-white/10 px-6 py-4 md:px-8 md:py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 shadow-sm cursor-default">
        <p className="text-blue-200 text-xs font-bold mb-1 flex items-center justify-center gap-1.5">
          <Calendar className="w-3 h-3"/> تاريخ اليوم
        </p>
        <p className="text-lg md:text-xl font-bold tracking-wide text-white">{today}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;