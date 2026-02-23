import React, { useState, useEffect } from 'react';
import { ChevronRight, User } from 'lucide-react';

const DashboardHeader = ({ title, subtitle, onBack }) => {
  // استعادة بيانات المستخدم المحفوظة عند الدخول
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('wesal_user_data');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="w-full bg-[#1e3a8a] text-white p-6 shadow-xl rounded-b-[2rem] relative overflow-hidden mb-6" dir="rtl">
      {/* خلفية جمالية خفيفة */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          {/* زر الرجوع المربوط بـ App.jsx */}
          <button 
            onClick={onBack} 
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:scale-105 active:scale-95"
            aria-label="Back"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          
          {/* العنوان والوصف */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-1">
              {title || "لوحة التحكم"}
            </h1>
            <p className="text-sm text-blue-200 opacity-90">
              {subtitle || "أهلاً بك في نظام وصال للمحاكم"}
            </p>
          </div>
        </div>

        {/* عرض اسم الموظف المسجل دخول حالياً */}
        {userData && (
          <div className="hidden sm:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
            <div className="text-right">
              <p className="text-xs text-blue-200">مرحباً بك</p>
              <p className="text-sm font-bold">{userData.name}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;