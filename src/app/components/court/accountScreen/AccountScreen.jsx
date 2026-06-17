import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../../services/api'; 

import AccountHeader from './components/AccountHeader';
import ProfileCard from './components/ProfileCard';
import BasicInfo from './components/BasicInfo';
import SecurityBanner from './components/SecurityBanner';

// قاموس الترجمة
const governoratesTranslation = {
  "Cairo": "القاهرة", "Giza": "الجيزة", "Alexandria": "الإسكندرية",
  "Qalyubia": "القليوبية", "Dakahlia": "الدقهلية", "Sharqia": "الشرقية",
  "Gharbia": "الغربية", "Monufia": "المنوفية", "Beheira": "البحيرة",
  "Kafr El Sheikh": "كفر الشيخ", "Damietta": "دمياط", "Port Said": "بورسعيد",
  "Ismailia": "الإسماعيلية", "Suez": "السويس", "North Sinai": "شمال سيناء",
  "South Sinai": "جنوب سيناء", "Red Sea": "البحر الأحمر", "Matrouh": "مطروح",
  "Fayoum": "الفيوم", "Beni Suef": "بني سويف", "Minya": "المنيا",
  "Assiut": "أسيوط", "Sohag": "سوهاج", "Qena": "قنا",
  "Luxor": "الأقصر", "Aswan": "أسوان", "New Valley": "الوادي الجديد"
};

export function AccountScreen({ onLogout, onBack }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileData, setProfileData] = useState(() => {
    const savedUser = sessionStorage.getItem('wesal_court_user_data');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const englishGov = parsed.governorate;
      const arabicGov = governoratesTranslation[englishGov] || englishGov || 'غير متوفر';
      return { ...parsed, governorateAr: arabicGov };
    }
    return null;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const sessionData = sessionStorage.getItem('wesal_court_user_data');
        let courtId = null;

        if (sessionData) {
          courtId = JSON.parse(sessionData).id; 
        }

        if (courtId) {
          const res = await api.get(`/api/courts/${courtId}`);
          if (res.data) {
            const fetchedGov = res.data.governorate;
            const completeData = {
              ...res.data,
              governorateAr: governoratesTranslation[fetchedGov] || fetchedGov || 'غير متوفر'
            };
            
            setProfileData(completeData);
            sessionStorage.setItem('wesal_court_user_data', JSON.stringify({
               id: courtId,
               ...res.data
            }));
          }
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات المحكمة:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loadingProfile) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loadingProfile]);

  const displayInfo = {
    name: profileData?.name || profileData?.fullName || 'محكمة أسرة (غير محدد)',
    email: profileData?.email || 'غير متوفر',
    governorate: profileData?.governorateAr || profileData?.governorate || 'غير متوفر',
    address: profileData?.address || 'غير متوفر',
    contactInfo: profileData?.contactInfo || profileData?.contactNumber || profileData?.phone || 'غير متوفر',
  };

  const handleLogoutSafe = () => {
    sessionStorage.removeItem('wesal_court_token');
    sessionStorage.removeItem('wesal_court_user_data');
    sessionStorage.removeItem('wesal_court_user_role');
    sessionStorage.removeItem('wesal_court_current_screen');
    sessionStorage.removeItem('wesal_user_data');
    sessionStorage.removeItem('wesal_token');
    sessionStorage.removeItem('force_change_password');
    onLogout();
  };

  if (loadingProfile && !profileData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل بيانات الحساب...</span>
      </div>
    );
  }

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">

          <AccountHeader onBack={onBack} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-1">
                <ProfileCard displayName={displayInfo.name} onLogout={handleLogoutSafe} />
            </div>

            <div className="lg:col-span-2">
                <BasicInfo displayInfo={displayInfo} />
            </div>
          </div>

          <SecurityBanner />

        </div>
      </div>
    </div>
  );
}