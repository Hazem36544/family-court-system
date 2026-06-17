import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Scale,
  Loader2,
  Building2,
  Calendar,
  UserCircle
} from 'lucide-react';
import api from '../../../../services/api';
import { getErrorMessage } from '../../../../utils/errorHandler';
import { toast } from 'react-hot-toast';

// ✅ قاموس ترجمة المحافظات
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

  // قراءة البيانات المبدئية من sessionStorage مع تطبيق الترجمة
  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('wesal_court_user_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      const englishGov = parsed.governorate;
      const arabicGov = governoratesTranslation[englishGov] || englishGov || 'غير محدد';
      
      return { 
        name: parsed.name || 'محكمة الأسرة', 
        governorate: arabicGov 
      };
    }
    return { name: 'محكمة الأسرة', governorate: 'غير محدد' };
  });

  const [statsData, setStatsData] = useState({
    staff: 0,
    centers: 0,
    centerStaff: 0
  });

  // ✅ دالة جلب آمنة لتفادي الأخطاء
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

        // 1. جلب وتحديث بيانات المحكمة
        try {
          const sessionData = sessionStorage.getItem('wesal_court_user_data');
          let courtId = null;

          if (sessionData) {
            courtId = JSON.parse(sessionData).id;
          }
          
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

        // 2. جلب الإحصائيات المسموحة لمدير المحكمة فقط
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
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const stats = [
    {
      id: 'staff',
      title: 'موظفي المحكمة',
      value: statsData.staff,
      icon: Users,
      color: 'bg-blue-600',
      screen: 'staff-management'
    },
    {
      id: 'visitation-centers',
      title: 'مراكز الرؤية',
      value: statsData.centers,
      icon: MapPin,
      color: 'bg-green-600',
      screen: 'visitation-centers'
    },
    {
      id: 'center-staff',
      title: 'مديري مراكز الرؤية',
      value: statsData.centerStaff,
      icon: UserCircle,
      color: 'bg-teal-500',
      screen: 'visitation-centers' 
    }
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

          {/* --- Header --- */}
          <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner shrink-0">
                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <div>
                <p className="text-blue-200 text-xs md:text-sm font-bold mb-1 opacity-90">لوحة تحكم إدارة المحكمة</p>
                <h1 className="text-xl md:text-3xl font-bold mb-2 tracking-wide">{userData.name}</h1>
                <div className="flex items-center gap-3 text-blue-100 text-xs md:text-sm font-bold opacity-90">
                  <span className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-800">
                    <Building2 className="w-4 h-4" />
                    محافظة {userData.governorate}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto bg-white/10 px-6 py-4 md:px-8 md:py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 shadow-sm cursor-default">
              <p className="text-blue-200 text-xs font-bold mb-1 flex items-center justify-center gap-1.5"><Calendar className="w-3 h-3"/> تاريخ اليوم</p>
              <p className="text-lg md:text-xl font-bold tracking-wide text-white">{today}</p>
            </div>
          </div>

          {/* --- Statistics --- */}
          {/* ✅ تم تحديث الكروت لتكون متطابقة تماماً مع كروت نظام المدرسة في السلاسة والحركة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
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
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}