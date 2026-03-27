import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Component imports
import ScrollToTop from './components/ScrollToTop';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { AccountScreen } from './components/AccountScreen';

// Employee Screens
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { NewFamilyScreen } from './components/employee/NewFamilyScreen';

import { CaseDetailsScreen } from './components/employee/CaseDetailsScreen';
import { ViolationsScreen } from './components/employee/ViolationsScreen';
import { DataChangeRequestsScreen } from './components/employee/DataChangeRequestsScreen';
import { ComplaintsManagement } from './components/employee/ComplaintsManagement';
import { SchoolsManagement } from './components/employee/SchoolsManagement';
import { VisitationCentersManagement } from './components/employee/VisitationCentersManagement';
import { FamiliesManagement } from './components/employee/FamiliesManagement';
// Family details screen import
import { FamilyDetailsScreen } from './components/employee/FamilyDetailsScreen';

// Parent Screens
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ComplaintScreen } from './components/parent/ComplaintScreen';
import { SchoolReportsScreen } from './components/parent/SchoolReportsScreen';
import { ParentCaseDetailsScreen } from './components/parent/ParentCaseDetailsScreen';
import { StudentsSearchScreen } from './components/parent/StudentsSearchScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('wesal_token'));

  // Role reading with error protection
  const [userRole, setUserRole] = useState(() => {
    try {
      const savedData = localStorage.getItem('wesal_user_data');
      return savedData ? JSON.parse(savedData).role : null;
    } catch (e) {
      console.error("Error reading data:", e);
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState(() => localStorage.getItem('current_screen') || 'home');
  const [screenData, setScreenData] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // --- Login Handler ---
  const handleLogin = (role) => {
    console.log("Logged in with role:", role);
    setIsLoggedIn(true);
    setUserRole(role);

    const existingData = localStorage.getItem('wesal_user_data');
    let userData = existingData ? JSON.parse(existingData) : {};
    userData.role = role;
    localStorage.setItem('wesal_user_data', JSON.stringify(userData));

    if (role === 'employee') {
      setNeedsVerification(false);
    }

    setCurrentScreen('home');
    localStorage.setItem('current_screen', 'home');
  };

  const handleVerificationSuccess = () => {
    setNeedsVerification(false);
    setIsLoggedIn(true);
  };

  const handleVerificationBack = () => {
    setNeedsVerification(false);
    handleLogout();
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('home');
    setScreenData(null);
    setNeedsVerification(false);

    localStorage.removeItem('wesal_token');
    localStorage.removeItem('wesal_user_data');
    localStorage.removeItem('current_screen');
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
      if (needsVerification && userRole === 'employee') {
        return <VerificationCodeScreen onVerify={handleVerificationSuccess} onBack={handleVerificationBack} />;
      }
      return <LoginScreen onLogin={handleLogin} />;
    }

    // 2. Employee Role
    if (userRole === 'employee') {
      return (
        <div className="bg-background min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }} dir="rtl">
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} userRole="employee" onLogout={handleLogout} />
          <div className="flex-1 mr-0 md:mr-28 transition-all duration-300 p-4">
            {currentScreen === 'home' && <EmployeeDashboard onNavigate={handleNavigate} />}

            {currentScreen === 'new-family' && (
              <NewFamilyScreen
                familyData={screenData}
                onBack={() => handleNavigate(screenData ? 'families-management' : 'home')}
                onSave={() => handleNavigate(screenData ? 'families-management' : 'home')}
              />
            )}

            {currentScreen === 'edit-family' && (
              <EditFamilyScreen
                familyId={screenData?.familyId}
                onBack={() => handleNavigate('families-management')}
              />
            )}

            {currentScreen === 'families-management' && <FamiliesManagement onNavigate={handleNavigate} onBack={handleBack} />}

            {/* Family details page rendering */}
            {currentScreen === 'family-details' && (
              <FamilyDetailsScreen
                familyId={screenData?.familyId}
                onNavigate={handleNavigate}
                onBack={() => handleNavigate('families-management')}
              />
            )}

            {currentScreen === 'case-details' && (
              <CaseDetailsScreen
                caseData={screenData}
                onNavigate={handleNavigate}
                onBack={() => handleNavigate('family-details', { familyId: screenData?.familyId })}
              />
            )}

            {currentScreen === 'schools' && <SchoolsManagement onNavigate={handleNavigate} onBack={handleBack} />}

            {currentScreen === 'visitation-centers' && <VisitationCentersManagement onNavigate={handleNavigate} onBack={handleBack} />}

            {currentScreen === 'violations' && <ViolationsScreen onBack={handleBack} />}
            {currentScreen === 'account' && <AccountScreen userType="employee" onLogout={handleLogout} onBack={handleBack} />}
            {currentScreen === 'data-change-requests' && <DataChangeRequestsScreen onNavigate={handleNavigate} onBack={handleBack} />}
            {currentScreen === 'complaints-management' && <ComplaintsManagement onNavigate={handleNavigate} onBack={handleBack} />}
          </div>
        </div>
      );
    }

    // 3. Parent or School Role
    if (userRole === 'parent' || userRole === 'school') {
      return (
        <div className="bg-background min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }} dir="rtl">
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} userRole={userRole} onLogout={handleLogout} />
          <div className="flex-1 mr-0 md:mr-28 transition-all duration-300 p-4">
            {currentScreen === 'home' && <ParentDashboard onNavigate={handleNavigate} />}
            {currentScreen === 'complaint' && <ComplaintScreen onBack={handleBack} onSubmit={handleBack} />}
            {currentScreen === 'school-reports' && <SchoolReportsScreen onBack={handleBack} onNavigate={handleNavigate} />}
            {currentScreen === 'case-details' && <ParentCaseDetailsScreen caseData={screenData} onBack={handleBack} />}
            {currentScreen === 'students-search' && <StudentsSearchScreen onBack={handleBack} onSave={handleBack} />}
            {currentScreen === 'account' && <AccountScreen userType={userRole} onLogout={handleLogout} onBack={handleBack} />}
          </div>
        </div>
      );
    }

    // 4. Fallback Role
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Permission Error</h1>
        <p className="mb-4 text-gray-700">You are logged in but the user type was not recognized.</p>
        <div className="bg-white p-4 rounded shadow mb-4 text-left dir-ltr">
          <p><strong>User Role:</strong> {String(userRole)}</p>
          <p><strong>Token:</strong> {localStorage.getItem('wesal_token') ? 'Exists' : 'Missing'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Sign Out & Start Over
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