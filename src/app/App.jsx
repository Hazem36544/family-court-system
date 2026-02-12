import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { AccountScreen } from './components/AccountScreen';

// Employee Screens
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { NewFamilyScreen } from './components/employee/NewFamilyScreen';
import { CasesManagement } from './components/employee/CasesManagement';
import { CaseDetailsScreen } from './components/employee/CaseDetailsScreen';
import { ViolationsScreen } from './components/employee/ViolationsScreen';
import { DataChangeRequestsScreen } from './components/employee/DataChangeRequestsScreen';
import { ComplaintsManagement } from './components/employee/ComplaintsManagement';
import { VerificationCodeScreen } from './components/employee/VerificationCodeScreen';

// Parent Screens
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ComplaintScreen } from './components/parent/ComplaintScreen';
import { SchoolReportsScreen } from './components/parent/SchoolReportsScreen';
import { ParentCaseDetailsScreen } from './components/parent/ParentCaseDetailsScreen';
import { StudentsSearchScreen } from './components/parent/StudentsSearchScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [userRole, setUserRole] = useState('employee'); 
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenData, setScreenData] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false); 

  const handleLogin = (role) => {
    setUserRole(role);
    if (role === 'employee') {
      setNeedsVerification(true);
    } else {
      setIsLoggedIn(true);
    }
    setCurrentScreen('home');
  };

  const handleVerificationSuccess = () => {
    setNeedsVerification(false);
    setIsLoggedIn(true);
  };

  const handleVerificationBack = () => {
    setNeedsVerification(false);
    setUserRole(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('home');
    setScreenData(null);
    setNeedsVerification(false);
  };

  const handleNavigate = (screen, data) => {
    setCurrentScreen(screen);
    setScreenData(data);
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setScreenData(null);
  };

  // Helper function to render content based on state
  const renderContent = () => {
    // Not logged in - Show login
    if (!isLoggedIn) {
      if (needsVerification && userRole === 'employee') {
        return <VerificationCodeScreen onVerify={handleVerificationSuccess} onBack={handleVerificationBack} />;
      }
      return <LoginScreen onLogin={handleLogin} />;
    }

    // --- Employee Screens ---
    if (userRole === 'employee') {
      return (
        <div className="bg-background min-h-screen flex" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} userRole="employee" onLogout={handleLogout} />
          
          {/* تم التعديل هنا: mr-28 بدلاً من mr-72 */}
          <div className="flex-1 mr-28 transition-all duration-300">
            {currentScreen === 'home' && (
              <EmployeeDashboard onNavigate={handleNavigate} />
            )}
            {currentScreen === 'new-family' && (
              <NewFamilyScreen 
                familyData={screenData}
                onBack={() => setCurrentScreen(screenData ? 'cases' : 'home')} 
                onSave={() => setCurrentScreen(screenData ? 'cases' : 'home')} 
              />
            )}
            {currentScreen === 'cases' && (
              <CasesManagement onNavigate={handleNavigate} onBack={handleBack} />
            )}
            {currentScreen === 'case-details' && (
              <CaseDetailsScreen caseData={screenData} onBack={() => setCurrentScreen('cases')} />
            )}
            {currentScreen === 'violations' && (
              <ViolationsScreen onBack={handleBack} />
            )}
            {currentScreen === 'account' && (
              <AccountScreen userType="employee" onLogout={handleLogout} onBack={handleBack} />
            )}
            {currentScreen === 'data-change-requests' && (
              <DataChangeRequestsScreen onNavigate={handleNavigate} onBack={handleBack} />
            )}
            {currentScreen === 'complaints-management' && (
              <ComplaintsManagement onNavigate={handleNavigate} onBack={handleBack} />
            )}
          </div>
        </div>
      );
    }

    // --- Parent Screens ---
    if (userRole === 'parent') {
      return (
        <div className="bg-background min-h-screen flex" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} userRole="parent" onLogout={handleLogout} />
          
          {/* تم التعديل هنا: mr-28 بدلاً من mr-72 */}
          <div className="flex-1 mr-28 transition-all duration-300">
            {currentScreen === 'home' && (
              <ParentDashboard onNavigate={handleNavigate} />
            )}
            {currentScreen === 'complaint' && (
              <ComplaintScreen onBack={() => setCurrentScreen('home')} onSubmit={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'school-reports' && (
              <SchoolReportsScreen onBack={handleBack} onNavigate={handleNavigate} />
            )}
            {currentScreen === 'case-details' && (
              <ParentCaseDetailsScreen caseData={screenData} onBack={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'students-search' && (
              <StudentsSearchScreen onBack={() => setCurrentScreen('home')} onSave={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'account' && (
              <AccountScreen userType="parent" onLogout={handleLogout} onBack={handleBack} />
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <BrowserRouter>
      <ScrollToTop trigger={currentScreen} />
      {renderContent()}
    </BrowserRouter>
  );
}