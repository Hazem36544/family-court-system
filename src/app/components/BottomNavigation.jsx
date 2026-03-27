import React from 'react';
import { Home, FileText, User, Scale, AlertCircle } from 'lucide-react';

export function BottomNavigation({ currentScreen, onNavigate, userRole }) {

  // Function to determine navigation items based on user role (employee or parent)
  const getNavItems = () => {
    if (userRole === 'employee') {
      return [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'violations', icon: AlertCircle, label: 'Violations' }, // Linked to ViolationsScreen in App.jsx
        { id: 'account', icon: User, label: 'Account' }, // Linked to AccountScreen in App.jsx
      ];
    } else {
      // Parent user
      return [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'school-reports', icon: FileText, label: 'Reports' }, // Linked to SchoolReportsScreen in App.jsx
        { id: 'account', icon: User, label: 'Account' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    /* Shown only on small screens (md:hidden) for mobile responsiveness */
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" dir="ltr">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${isActive
                ? 'text-[#1e3a8a] scale-110'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}