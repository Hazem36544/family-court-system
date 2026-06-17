import React, { useState, useEffect } from 'react';
import { Users, MapPin, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { getErrorMessage } from '../../../../utils/errorHandler';

// المكونات الفرعية اللي قسمناها
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';

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

export function CourtDashboard({ onNavigate }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('wesal_court_user_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      const englishGov = parsed.governorate;
      const arabicGov = governoratesTranslation[englishGov] || englishGov || 'غير محدد';
      return { name: parsed.name || 'محكمة الأسرة', governorate: arabicGov };
    }
    return { name: 'محكمة الأسرة', governorate: 'غير محدد' };
  });

  const [statsData, setStatsData] = useState({ staff: 0, centers: 0, centerStaff: 0 });

  const safeFetch = async (url) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Failed to fetch ${url}:`, e);
      return {}; 
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        try {
          const sessionData = sessionStorage.getItem('wesal_court_user_data');
          let courtId = sessionData ? JSON.parse(sessionData).id : null;
          
          if (courtId) {
            const courtRes = await api.get(`/api/courts/${courtId}`);
            const fetchedGov = courtRes.data?.governorate;
            setUserData({
              name: courtRes.data?.name || 'محكمة الأسرة',
              governorate: governoratesTranslation[fetchedGov] || fetchedGov || 'غير محدد'
            });
          }
        } catch (courtErr) {
          console.error("Failed to fetch fresh court details:", courtErr);
        }

        const staffData = await safeFetch('/api/courts/me/staffs?PageSize=1&PageNumber=1');
        const centersData = await safeFetch('/api/visit-centers?PageSize=1&PageNumber=1'); 
        const centerStaffData = await safeFetch('/api/courts/me/center-staffs?PageSize=1&PageNumber=1');

        setStatsData({
          staff: staffData.totalCount || 0,
          centers: centersData.totalCount || 0,
          centerStaff: centerStaffData.totalCount || 0
        });

      } catch (error) {
        console.error("Critical Dashboard Error:", error);
        toast.error(getErrorMessage(error) || "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const stats = [
    { id: 'staff', title: 'موظفي المحكمة', value: statsData.staff, icon: Users, color: 'bg-blue-600', screen: 'staff-management' },
    { id: 'visitation-centers', title: 'مراكز الرؤية', value: statsData.centers, icon: MapPin, color: 'bg-green-600', screen: 'visitation-centers' },
    { id: 'center-staff', title: 'مديري مراكز الرؤية', value: statsData.centerStaff, icon: UserCircle, color: 'bg-teal-500', screen: 'visitation-centers' }
  ];

  const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل لوحة التحكم...</span>
      </div>
    );
  }

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">

          <DashboardHeader userData={userData} today={today} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-4">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} onNavigate={onNavigate} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}