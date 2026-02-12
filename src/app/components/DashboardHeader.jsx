import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ title = "الحساب الشخصي", subtitle = "إدارة بياناتك الشخصية", onBack }) => {
  // If onBack prop is provided, use it. Otherwise, try to use router navigation if available.
  // Note: The user prompt suggested useNavigate, but if the app doesn't use react-router-dom explicitly or if the parent controls navigation
  // (like App.jsx does with currentScreen state), we should prioritize the passed onBack prop.
  // However, I will include useNavigate as requested in the snippet structure.
  
  // const navigate = useNavigate(); 
  // Commenting out useNavigate usage because the App currently uses state-based navigation (onBack prop).
  // I will keep the import as requested but rely on props for the existing architecture.

  return (
    <div className="w-full bg-[#2563eb] text-white p-6 shadow-md" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Back"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        
        {/* Title and Subtitle */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-blue-100 opacity-90">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
