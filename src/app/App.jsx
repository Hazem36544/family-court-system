import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { Menu, Loader2 } from 'lucide-react'; 

// Component imports (المكونات الأساسية الثابتة لا يتم عمل Lazy Load لها)
import ScrollToTop from './components/ScrollToTop';
import { LoginScreen } from './components/court/loginScreen/LoginScreen';
import { Sidebar } from './components/Sidebar';

// ✅ تطبيق التحميل الديناميكي للشاشات المصرح بها لمدير المحكمة فقط
const AccountScreen = lazy(() => import('./components/court/accountScreen/AccountScreen').then(m => ({ default: m.AccountScreen })));
const CourtDashboard = lazy(() => import('./components/court/courtDashboard/CourtDashboard').then(m => ({ default: m.CourtDashboard })));
const StaffManagement = lazy(() => import('./components/court/staffManagement/StaffManagement').then(m => ({ default: m.StaffManagement })));
const VisitationCentersManagement = lazy(() => import('./components/court/visitationCentersManagement/VisitationCentersManagement').then(m => ({ default: m.VisitationCentersManagement })));

export default function App() {
  // استخدام sessionStorage لمفتاح توكن المحكمة
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem('wesal_court_token'));

  // قراءة الصلاحية والبيانات من مفاتيح المحكمة المعزولة في sessionStorage
  const [userRole, setUserRole] = useState(() => {
    try {
      const explicitRole = sessionStorage.getItem('wesal_court_user_role');
      if (explicitRole) return explicitRole;

      const savedData = sessionStorage.getItem('wesal_court_user_data');
      return savedData ? JSON.parse(savedData).role : null;
    } catch (e) {
      console.error("Error reading data:", e);
      return null;
    }
  });

  // عزل الشاشة الحالية لمنع التداخل واستخدام sessionStorage
  const [currentScreen, setCurrentScreen] = useState(() => sessionStorage.getItem('wesal_court_current_screen') || 'home');
  const [screenData, setScreenData] = useState(null);

  // State التحكم في قائمة الموبايل الجانبية
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Login Handler ---
  const handleLogin = (role) => {
    console.log("Logged in with role:", role);
    setIsLoggedIn(true);
    setUserRole(role);

    // حفظ البيانات في مفتاح المحكمة في sessionStorage
    const existingData = sessionStorage.getItem('wesal_court_user_data');
    let userData = existingData ? JSON.parse(existingData) : {};
    userData.role = role;
    sessionStorage.setItem('wesal_court_user_data', JSON.stringify(userData));

    setCurrentScreen('home');
    sessionStorage.setItem('wesal_court_current_screen', 'home');
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('home');
    setScreenData(null);
    setIsMobileMenuOpen(false); 

    // تنظيف شامل لمفاتيح المحكمة (والمفاتيح العامة احتياطياً) من sessionStorage
    sessionStorage.removeItem('wesal_court_token');
    sessionStorage.removeItem('wesal_court_user_data');
    sessionStorage.removeItem('wesal_court_user_role');
    sessionStorage.removeItem('wesal_court_current_screen');
    sessionStorage.removeItem('force_change_password');
    // إضافة مسح المفاتيح العامة للضمان
    sessionStorage.removeItem('wesal_user_data');
    sessionStorage.removeItem('wesal_token');
  };

  const handleNavigate = (screen, data) => {
    console.log("Navigating to:", screen);
    setCurrentScreen(screen);
    setScreenData(data);
    sessionStorage.setItem('wesal_court_current_screen', screen);
    setIsMobileMenuOpen(false); 
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
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-right" dir="rtl">
          
          {/* 📱 Navbar الموبايل */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e3a8a] text-white z-40 flex items-center px-4 shadow-md justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border-none outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-lg tracking-wide">إدارة المحكمة</span>
            </div>
            <img 
              src={`${import.meta.env.BASE_URL}logo.svg`} 
              alt="شعار وصال" 
              className="w-10 h-10 object-contain drop-shadow-md"
              onError={(e) => { e.target.src = 'https://placehold.co/40x40/png?text=Logo'; }}
            />
          </div>

          {/* 📋 القائمة الجانبية (Sidebar) */}
          <Sidebar 
            currentScreen={currentScreen} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
            isOpen={isMobileMenuOpen} 
            setIsOpen={setIsMobileMenuOpen} 
          />

          {/* 🌑 Overlay الموبايل */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}

          {/* 📄 منطقة المحتوى الرئيسي */}
          {/* ✅ تم إضافة الـ id هنا لاستهدافه في عملية الـ Scroll */}
          <div id="court-main-scroll" className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 md:pr-32 transition-all duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <main className="w-full max-w-7xl mx-auto p-4 md:p-8">
              
              {/* ✅ إضافة Suspense لعرض شاشة تحميل أثناء جلب الكود المنفصل لكل صفحة */}
              <Suspense fallback={
                <div className="w-full flex flex-col items-center justify-center min-h-[60vh] font-sans" dir="rtl">
                  <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
                  <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل الشاشة...</span>
                </div>
              }>
                {currentScreen === 'home' && <CourtDashboard onNavigate={handleNavigate} />}
                {currentScreen === 'staff-management' && <StaffManagement onNavigate={handleNavigate} onBack={handleBack} />}
                {currentScreen === 'visitation-centers' && <VisitationCentersManagement onNavigate={handleNavigate} onBack={handleBack} />}
                {currentScreen === 'account' && <AccountScreen userType="court" onLogout={handleLogout} onBack={handleBack} />}
              </Suspense>

            </main>
          </div>

        </div>
      );
    }

    // 3. Fallback Role
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4 font-sans" dir="rtl">
        <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في الصلاحيات</h1>
        <p className="mb-4 text-gray-700 font-medium">أنت مسجل دخول ولكن ليس لديك صلاحية مدير محكمة.</p>
        <button
          onClick={handleLogout}
          className="bg-[#1e3a8a] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
        >
          تسجيل الخروج والعودة
        </button>
      </div>
    );
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      
      {/* ✅ إضافة Toaster وتخصيصه ليطابق تصميم الكبسولة الفخم */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"Times New Roman", "Traditional Arabic", serif',
            fontWeight: 'bold',
            borderRadius: '9999px', // شكل الكبسولة الناعم
            padding: '12px 24px',
            direction: 'rtl',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          },
          success: {
            style: {
              background: '#ECFDF5', 
              color: '#065F46',      
              border: '1px solid #A7F3D0',
            },
            iconTheme: {
              primary: '#10B981',    
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#FEF2F2', 
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }} 
      />

      {ScrollToTop && <ScrollToTop trigger={currentScreen} />}
      {renderContent()}
    </BrowserRouter>
  );
}