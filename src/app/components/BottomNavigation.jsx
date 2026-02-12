import React from 'react';
import { Home, Calendar, Bell, User, FileText } from 'lucide-react';

export function BottomNavigation({ currentScreen, onNavigate, userRole }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: userRole === 'parent' ? 'parent-visits' : 'visits', icon: Calendar, label: 'الزيارات' },
    { id: userRole === 'parent' ? 'school-reports' : 'schools', icon: FileText, label: 'التقارير' },
    { id: 'account', icon: User, label: 'الحساب' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg" dir="rtl">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}