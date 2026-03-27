import React, { useState, useEffect } from 'react';
import { ChevronLeft, User } from 'lucide-react';

const DashboardHeader = ({ title, subtitle, onBack }) => {
  // Restore saved user data upon entry
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('wesal_user_data');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="w-full bg-[#1e3a8a] text-white p-6 shadow-xl rounded-b-[2rem] relative overflow-hidden mb-6" dir="ltr">
      {/* Light aesthetic background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          {/* Back button linked to App.jsx */}
          <button
            onClick={onBack}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:scale-105 active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Title and Subtitle */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-1">
              {title || "Dashboard"}
            </h1>
            <p className="text-sm text-blue-200 opacity-90">
              {subtitle || "Welcome to Wesal Courts System"}
            </p>
          </div>
        </div>

        {/* Display the currently logged-in employee name */}
        {userData && (
          <div className="hidden sm:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
            <div className="text-left">
              <p className="text-xs text-blue-200">Welcome,</p>
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