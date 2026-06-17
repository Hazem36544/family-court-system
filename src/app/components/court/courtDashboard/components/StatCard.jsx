import React from 'react';

const StatCard = ({ stat, onNavigate }) => {
  return (
    <div
      onClick={() => onNavigate(stat.screen)}
      className="group p-6 md:p-8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 rounded-[2rem] overflow-hidden relative transition-all duration-500 ease-out transform transform-gpu hover:-translate-y-1.5 h-full w-full outline-none cursor-pointer"
    >
      <div className="relative z-10 flex flex-col items-center text-center justify-center h-full w-full">
        <div className={`w-16 h-16 mx-auto ${stat.color} rounded-[1.25rem] flex items-center justify-center mb-5 shadow-sm transition-all duration-500 ease-out transform transform-gpu group-hover:scale-110 group-hover:-translate-y-1 shrink-0 will-change-transform`}>
          <stat.icon className="w-8 h-8 text-white transition-transform duration-500 ease-out group-hover:scale-110" />
        </div>
        <div className="w-full text-4xl font-black mb-2 text-gray-800 font-mono flex items-center justify-center min-h-[40px]">
          {stat.value}
        </div>
        <p className="w-full text-sm md:text-base text-gray-500 font-bold mt-auto pt-1">{stat.title}</p>
      </div>
      
      {/* تأثير الإضاءة الخلفية */}
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${stat.color} opacity-[0.03] rounded-full blur-2xl transition-all duration-500 ease-out transform-gpu group-hover:opacity-15 group-hover:scale-150 pointer-events-none will-change-transform`}></div>
    </div>
  );
};

export default StatCard;