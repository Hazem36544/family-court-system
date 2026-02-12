import React from 'react';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  GraduationCap, 
  ChevronLeft, 
  UserPlus, 
  MessageSquare, 
  FileEdit,
  Scale // ضفت أيقونة الميزان عشان تليق عالمحكمة
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function EmployeeDashboard({ onNavigate }) {
  const stats = [
    { 
      id: 'cases',
      title: 'إجمالي القضايا', 
      value: '245', 
      icon: Briefcase, 
      color: 'bg-blue-500',
      screen: 'cases'
    },
    { 
      id: 'data-requests',
      title: 'طلبات التعديل', 
      value: '4', 
      icon: FileEdit, 
      color: 'bg-green-600',
      screen: 'data-change-requests'
    },
    { 
      id: 'complaints',
      title: 'الشكاوى الجديدة', 
      value: '8', 
      icon: MessageSquare, 
      color: 'bg-orange-500',
      screen: 'complaints-management'
    },
    { 
      id: 'violations',
      title: 'المخالفات المعلقة', 
      value: '12', 
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

  // تاريخ اليوم للعرض
  const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- بداية الهيدر الجديد (نفس ستايل المدرسة) --- */}
        <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/20">
          
          {/* خلفية جمالية (دوائر شفافة) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

          {/* الجزء الأيمن: بيانات الموظف والمحكمة */}
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            {/* أيقونة المحكمة/الميزان */}
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner transform rotate-3 hover:rotate-0 transition-all duration-300">
              <Scale className="w-10 h-10 text-white" />
            </div>
            
            {/* النصوص */}
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">مرحباً بك،</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide">موظف المحكمة</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm font-medium opacity-80">
                <span className="flex items-center gap-1">
                   <Briefcase className="w-4 h-4" />
                   محكمة الأسرة - القاهرة
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="font-mono tracking-wider dir-ltr">EMP-2026-CAI</span>
              </div>
            </div>
          </div>

          {/* الجزء الأيسر: التاريخ (بديل للعام الدراسي) */}
          <div className="mt-6 md:mt-0 bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 min-w-[180px] hover:bg-white/20 transition-colors cursor-default">
            <p className="text-blue-200 text-xs font-bold mb-1 uppercase tracking-wider">تاريخ اليوم</p>
            <p className="text-xl font-bold tracking-wide text-white">{today}</p>
          </div>

        </div>
        {/* --- نهاية الهيدر الجديد --- */}


        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.id}
                onClick={() => onNavigate(stat.screen)}
                className="group p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl overflow-hidden relative"
              >
                <div className="relative z-10 flex flex-col">
                  <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-4xl font-bold mb-2 text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                </div>
                {/* زخرفة خلفية خفيفة للكارت */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`}></div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - واخدة عمود واحد */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                الإجراءات السريعة
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Card 
                  key={action.label}
                  onClick={() => onNavigate(action.screen)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-blue-50/50 bg-white border-none shadow-sm rounded-2xl group"
                >
                  <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors">{action.label}</span>
                  <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity - واخدة عمودين */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                آخر النشاطات
            </h2>
            <Card className="p-6 bg-white border-none shadow-sm rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="text-base font-bold text-gray-800 mb-1">تم تسجيل زيارة جديدة</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">منذ 15 دقيقة</span>
                    </div>
                    <p className="text-sm text-gray-500">تم تسجيل زيارة للأب "أحمد محمد" في القضية رقم #12453</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-1">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <p className="text-base font-bold text-gray-800 mb-1">تحديث بيانات أسرة</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">منذ ساعة</span>
                    </div>
                    <p className="text-sm text-gray-500">تم تحديث الحالة الاجتماعية في ملف الأسرة #4521</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-0 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-1">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <p className="text-base font-bold text-gray-800 mb-1">مخالفة جديدة مسجلة</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">منذ 3 ساعات</span>
                    </div>
                    <p className="text-sm text-gray-500">تغيب الطرف الحاضن عن موعد الزيارة في القضية #12387</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}