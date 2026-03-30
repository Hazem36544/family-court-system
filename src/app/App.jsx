import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Component imports (تم التعديل لتتناسب مع وجودهم في مجلد components مباشرة)
import ScrollToTop from './components/ScrollToTop';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { AccountScreen } from './components/AccountScreen';

// Court Screens 
import { CourtDashboard } from './components/court/CourtDashboard';
import { StaffManagement } from './components/court/StaffManagement';
import { SchoolsManagement } from './components/court/SchoolsManagement';
import { VisitationCentersManagement } from './components/court/VisitationCentersManagement';
import { FamiliesManagement } from './components/court/FamiliesManagement';
import { ComplaintsManagement } from './components/court/ComplaintsManagement';
import { ViolationsScreen } from './components/court/ViolationsScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('wesal_token'));

  // Role reading with error protection
  const [userRole, setUserRole] = useState(() => {
    try {
      const explicitRole = localStorage.getItem('wesal_user_role');
      if (explicitRole) return explicitRole;

      const savedData = localStorage.getItem('wesal_user_data');
      return savedData ? JSON.parse(savedData).role : null;
    } catch (e) {
      console.error("Error reading data:", e);
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState(() => localStorage.getItem('current_screen') || 'home');
  const [screenData, setScreenData] = useState(null);

  // --- Login Handler ---
  const handleLogin = (role) => {
    console.log("Logged in with role:", role);
    setIsLoggedIn(true);
    setUserRole(role);

    const existingData = localStorage.getItem('wesal_user_data');
    let userData = existingData ? JSON.parse(existingData) : {};
    userData.role = role;
    localStorage.setItem('wesal_user_data', JSON.stringify(userData));

    setCurrentScreen('home');
    localStorage.setItem('current_screen', 'home');
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('home');
    setScreenData(null);

    localStorage.removeItem('wesal_token');
    localStorage.removeItem('wesal_user_data');
    localStorage.removeItem('wesal_user_role');
    localStorage.removeItem('current_screen');
    localStorage.removeItem('force_change_password');
  };

  const handleNavigate = (screen, data) => {
    console.log("Navigating to:", screen);
    setCurrentScreen(screen);
    setScreenData(data);
    localStorage.setItem('current_screen', screen);
  };

  const handleBack = () => {
    handleNavigate('home', null);
  };

  // --- Main Render Function ---
  const renderContent = () => {
    // 1. Not logged in state
    if (!isLoggedIn) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    // 2. Court Role
    if (userRole === 'court') {
      return (
        <div className="bg-[#F5F5F5] min-h-screen flex" style={{ fontFamily: 'Inter, Cairo, sans-serif' }} dir="rtl">
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} />
          
          <div className="flex-1 mr-0 md:mr-28 transition-all duration-300 p-4">
            {currentScreen === 'home' && <CourtDashboard onNavigate={handleNavigate} />}
            {currentScreen === 'staff-management' && <StaffManagement onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'schools' && <SchoolsManagement onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'visitation-centers' && <VisitationCentersManagement onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'families-management' && <FamiliesManagement onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'complaints-management' && <ComplaintsManagement onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'violations' && <ViolationsScreen onBack={handleBack} />}
            {currentScreen === 'account' && <AccountScreen userType="court" onLogout={handleLogout} onBack={handleBack} />}
          </div>
        </div>
      );
    }

    // 3. Fallback Role
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في الصلاحيات</h1>
        <p className="mb-4 text-gray-700">أنت مسجل دخول ولكن ليس لديك صلاحية مدير محكمة.</p>
        <button
          onClick={handleLogout}
          className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-all shadow-md"
        >
          تسجيل الخروج والعودة
        </button>
      </div>
    );
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {ScrollToTop && <ScrollToTop trigger={currentScreen} />}
      {renderContent()}
    </BrowserRouter>
  );
}