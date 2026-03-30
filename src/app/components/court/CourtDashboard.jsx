import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  MessageSquare,
  MapPin,
  Scale,
  Loader2,
  Clock,
  Building2
} from 'lucide-react';
import api from '../../../services/api';

export function CourtDashboard({ onNavigate }) {
  // قراءة بيانات المحكمة من التخزين المحلي
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('wesal_user_data');
    return saved ? JSON.parse(saved) : { name: '', governorate: '' };
  });

  const [statsData, setStatsData] = useState({
    cases: '0',
    centers: '0',
    complaints: '0',
    violations: '0'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // دالة مساعدة لجلب البيانات بأمان بدون انهيار الصفحة
  const safeFetch = async (url) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Failed to fetch ${url}:`, e);
      return { totalCount: 0, items: [] }; 
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingActivities(true);

        // 1. جلب الإحصائيات الأساسية للمحكمة
        const familiesData = await safeFetch('/api/courts/me/families?PageSize=1&PageNumber=1');
        const centersData = await safeFetch('/api/visitation-locations?PageSize=1&PageNumber=1');
        const complaintsData = await safeFetch('/api/courts/me/complaints?PageSize=5&PageNumber=1'); // جلبنا 5 لاستخدامهم في الأنشطة
        const violationsData = await safeFetch('/api/obligation-alerts?PageSize=5&PageNumber=1');

        setStatsData({
          cases: familiesData.totalCount || 0,
          centers: centersData.totalCount || 0,
          complaints: complaintsData.complaints?.totalCount || complaintsData.totalCount || 0,
          violations: violationsData.alerts?.totalCount || violationsData.totalCount || 0
        });

        // 2. معالجة الأنشطة الأخيرة (الإشعارات)
        let mixed = [];

        // معالجة الشكاوى
        const complaintsItems = complaintsData.complaints?.items || complaintsData.items || [];
        if (complaintsItems.length > 0) {
          complaintsItems.forEach(item => mixed.push({
            id: item.id, 
            type: 'complaint',
            title: 'شكوى جديدة مسجلة',
            desc: item.description ? item.description.substring(0, 50) + '...' : 'تم تسجيل شكوى جديدة بالفرع',
            date: item.filedAt,
            icon: MessageSquare, 
            color: 'bg-orange-100 text-orange-600'
          }));
        }

        // معالجة المخالفات والتنبيهات
        const alertsItems = violationsData.alerts?.items || violationsData.items || [];
        if (alertsItems.length > 0) {
          alertsItems.forEach(item => mixed.push({
            id: item.id, 
            type: 'alert',
            title: 'تنبيه مخالفة',
            desc: item.description || 'تم رصد مخالفة جديدة بالفرع',
            date: item.triggeredAt,
            icon: AlertTriangle, 
            color: 'bg-red-100 text-red-600'
          }));
        }

        // ترتيب الأنشطة من الأحدث للأقدم وعرض آخر 6 فقط
        mixed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(mixed.slice(0, 6));

      } catch (error) {
        console.error("Critical Dashboard Error:", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 'families',
      title: 'العائلات المسجلة',
      value: statsData.cases,
      icon: Users,
      color: 'bg-blue-600',
      screen: 'families-management'
    },
    {
      id: 'visitation-centers',
      title: 'مراكز الرؤية المعتمدة',
      value: statsData.centers,
      icon: MapPin,
      color: 'bg-green-600',
      screen: 'visitation-centers'
    },
    {
      id: 'complaints',
      title: 'الشكاوى المسجلة',
      value: statsData.complaints,
      icon: MessageSquare,
      color: 'bg-orange-500',
      screen: 'complaints-management'
    },
    {
      id: 'violations',
      title: 'المخالفات المرصودة',
      value: statsData.violations,
      icon: AlertTriangle,
      color: 'bg-destructive',
      screen: 'violations'
    },
  ];

  const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">

        {/* --- Header --- */}
        <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
              <Scale className="w-10 h-10 text-white" />
            </div>

            <div>
              <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">لوحة تحكم مدير المحكمة</p>
              {/* عرض اسم المحكمة بشكل ديناميكي */}
              <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide">{userData.name || 'محكمة الأسرة'}</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm font-medium opacity-80">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {/* عرض المحافظة بشكل ديناميكي */}
                  محافظة {userData.governorate || 'غير محدد'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 min-w-[180px] cursor-default">
            <p className="text-blue-200 text-xs font-bold mb-1 uppercase tracking-wider">تاريخ اليوم</p>
            <p className="text-xl font-bold tracking-wide text-white">{today}</p>
          </div>
        </div>

        {/* --- Statistics --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => onNavigate(stat.screen)}
              className="group p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl overflow-hidden relative"
            >
              <div className="relative z-10 flex flex-col">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-4xl font-bold mb-2 text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`}></div>
            </div>
          ))}
        </div>

        {/* --- Recent Activities (Full Width) --- */}
        <div className="w-full flex flex-col gap-5 mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            سجل المراقبة والأنشطة الأخيرة
          </h2>
          
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl min-h-[300px]">
            <div className="space-y-6">

              {loadingActivities ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#1e3a8a]" />
                  <p className="font-bold text-gray-500">جاري جلب سجل الأنشطة...</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Clock className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-bold text-lg text-gray-500">الوضع مستقر.</p>
                  <p className="text-sm text-gray-400 mt-2">لا توجد أنشطة أو إشعارات مسجلة حديثاً.</p>
                </div>
              ) : (
                <div>
                  {recentActivities.map((activity, index) => {
                    const isLast = index === recentActivities.length - 1;
                    return (
                      <div key={activity.id || index} className={`flex items-start gap-5 pb-6 ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 p-4 -mx-4 rounded-2xl transition-colors`}>
                        <div className={`w-12 h-12 rounded-2xl ${activity.color} flex items-center justify-center shrink-0 shadow-sm`}>
                          <activity.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                            <p className="text-base font-bold text-gray-800">{activity.title}</p>
                            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold whitespace-nowrap self-start sm:self-auto">
                                {getTimeAgo(activity.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{activity.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}