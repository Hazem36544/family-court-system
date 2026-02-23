import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  ChevronLeft, 
  MessageSquare, 
  FileEdit,
  Scale,
  Loader2 
} from 'lucide-react';
import api from '../../../services/api'; 

export function EmployeeDashboard({ onNavigate }) {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('wesal_user_data');
    return saved ? JSON.parse(saved) : { name: 'موظف المحكمة', employeeId: 'EMP-2026' };
  });

  const [statsData, setStatsData] = useState({
    cases: '0',
    requests: '0',
    complaints: '0',
    violations: '0'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // دالة مساعدة لجلب البيانات بأمان (عشان لو واحد باظ الباقي يكمل)
  const safeFetch = async (url) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Failed to fetch ${url}:`, e);
      return { totalCount: 0, items: [] }; // رجع داتا فاضية لو فشل
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingActivities(true);

        // 1. طلب القضايا (التعديل الجذري: شلنا الباراميترز مؤقتاً للتجربة)
        // لو اشتغل، يبقى السيرفر كان مخنوق من الـ params الغلط
        const familiesData = await safeFetch('/api/courts/me/families');
        
        // باقي الطلبات
        const complaintsData = await safeFetch('/api/courts/me/complaints?PageSize=1&PageNumber=1');
        const violationsData = await safeFetch('/api/obligation-alerts?PageSize=1&PageNumber=1');
        const requestsData = await safeFetch('/api/custody-requests?PageSize=1&PageNumber=1');

        setStatsData({
          cases: familiesData.totalCount || 0,
          complaints: complaintsData.totalCount || 0,
          violations: violationsData.totalCount || 0,
          requests: requestsData.totalCount || 0
        });

        // 2. جلب النشاطات (برضه بأمان)
        const visitsList = await safeFetch('/api/visitations?PageSize=5&PageNumber=1'); 
        const complaintsList = await safeFetch('/api/courts/me/complaints?PageSize=5&PageNumber=1');
        const alertsList = await safeFetch('/api/obligation-alerts?PageSize=5&PageNumber=1');

        let mixed = [];
        
        // معالجة الزيارات
        if (visitsList.items) {
          visitsList.items.forEach(item => mixed.push({
            id: item.id, type: 'visit',
            title: 'تم تسجيل زيارة جديدة',
            desc: `زيارة بتاريخ ${new Date(item.startAt).toLocaleDateString('ar-EG')}`,
            date: item.startAt,
            icon: Users, color: 'bg-blue-100 text-blue-600'
          }));
        }

        // معالجة الشكاوى
        if (complaintsList.items) {
          complaintsList.items.forEach(item => mixed.push({
            id: item.id, type: 'complaint',
            title: 'شكوى جديدة',
            desc: item.description ? item.description.substring(0, 40) + '...' : 'شكوى جديدة',
            date: item.filedAt,
            icon: FileEdit, color: 'bg-green-100 text-green-600'
          }));
        }

        // معالجة المخالفات
        if (alertsList.items) {
          alertsList.items.forEach(item => mixed.push({
            id: item.id, type: 'alert',
            title: 'مخالفة مسجلة',
            desc: item.description || 'مخالفة جديدة',
            date: item.triggeredAt,
            icon: AlertTriangle, color: 'bg-red-100 text-red-600'
          }));
        }

        mixed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(mixed.slice(0, 3));

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
      id: 'cases',
      title: 'إجمالي القضايا', 
      value: statsData.cases, 
      icon: Briefcase, 
      color: 'bg-blue-500',
      screen: 'cases'
    },
    { 
      id: 'data-requests',
      title: 'طلبات التعديل', 
      value: statsData.requests, 
      icon: FileEdit, 
      color: 'bg-green-600',
      screen: 'data-change-requests'
    },
    { 
      id: 'complaints',
      title: 'الشكاوى الجديدة', 
      value: statsData.complaints, 
      icon: MessageSquare, 
      color: 'bg-orange-500',
      screen: 'complaints-management'
    },
    { 
      id: 'violations',
      title: 'المخالفات المعلقة', 
      value: statsData.violations, 
      icon: AlertTriangle, 
      color: 'bg-destructive', 
      screen: 'violations'
    },
  ];

  const quickActions = [
    { label: 'إدارة القضايا', screen: 'cases' },
    { label: 'الشكاوى', screen: 'complaints-management' },
    { label: 'طلبات تعديل البيانات', screen: 'data-change-requests' },
    { label: 'المخالفات', screen: 'violations' },
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- الهيدر --- */}
        <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner transform rotate-3 hover:rotate-0 transition-all duration-300">
              <Scale className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">مرحباً بك،</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide">{userData.name || 'موظف المحكمة'}</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm font-medium opacity-80">
                <span className="flex items-center gap-1">
                   <Briefcase className="w-4 h-4" />
                   محكمة الأسرة - القاهرة
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 min-w-[180px] hover:bg-white/20 transition-colors cursor-default">
            <p className="text-blue-200 text-xs font-bold mb-1 uppercase tracking-wider">تاريخ اليوم</p>
            <p className="text-xl font-bold tracking-wide text-white">{today}</p>
          </div>
        </div>

        {/* --- الإحصائيات --- */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                الإجراءات السريعة
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <div 
                  key={action.label}
                  onClick={() => onNavigate(action.screen)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-blue-50/50 bg-white border-none shadow-sm rounded-2xl group"
                >
                  <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors">{action.label}</span>
                  <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                آخر النشاطات
            </h2>
            <div className="p-6 bg-white border-none shadow-sm rounded-3xl min-h-[300px]">
              <div className="space-y-6">
                
                {loadingActivities ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>جاري تحميل البيانات...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">لا توجد نشاطات حديثة.</p>
                ) : (
                  recentActivities.map((activity, index) => {
                    const isLast = index === recentActivities.length - 1;
                    return (
                      <div key={activity.id || index} className={`flex items-start gap-4 pb-6 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                        <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center mt-1`}>
                          <activity.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <p className="text-base font-bold text-gray-800 mb-1">{activity.title}</p>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{getTimeAgo(activity.date)}</span>
                          </div>
                          <p className="text-sm text-gray-500">{activity.desc}</p>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}