import React from 'react';
import { 
  GraduationCap, 
  ChevronLeft, 
  MessageSquare, 
  Bell, 
  Search,
  FileText,
  Calendar
} from 'lucide-react';
// تأكد من المسارات الصحيحة
import { Card } from '../ui/card';

export function ParentDashboard({ onNavigate }) {
  
  // تاريخ اليوم
  const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- بداية الهيدر الجديد (School Banner) --- */}
        <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/20">
          
          {/* خلفية جمالية */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

          {/* الجزء الأيمن: بيانات المدرسة */}
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            {/* أيقونة المدرسة */}
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner transform rotate-3 hover:rotate-0 transition-all duration-300">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            
            {/* النصوص */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">مدرسة الأمير فيصل الابتدائية</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm font-medium opacity-90">
                <span>القاهرة - مدينة نصر</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="font-mono tracking-wider dir-ltr">sch-cairo-0142</span>
              </div>
            </div>
          </div>

          {/* الجزء الأيسر: العام الدراسي */}
          <div className="mt-6 md:mt-0 bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center relative z-10 min-w-[180px] hover:bg-white/20 transition-colors cursor-default">
            <p className="text-blue-200 text-xs font-bold mb-1 uppercase tracking-wider">العام الدراسي</p>
            <p className="text-2xl font-bold tracking-widest font-mono text-white">2025/2026</p>
          </div>

        </div>
        {/* --- نهاية الهيدر الجديد --- */}


        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* إحصائية سريعة: التقارير */}
            <Card 
                onClick={() => onNavigate('school-reports')}
                className="group p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl flex items-center gap-4 relative overflow-hidden"
            >
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-green-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">التقارير المدرسية</p>
                    <p className="text-2xl font-bold text-gray-800">3 تقارير</p>
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </div>
            </Card>

             {/* إحصائية سريعة: الإشعارات */}
             <Card 
                className="group p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl flex items-center gap-4 relative overflow-hidden"
            >
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Bell className="w-7 h-7 text-red-500" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">الإشعارات</p>
                    <p className="text-2xl font-bold text-gray-800">5 جديدة</p>
                </div>
            </Card>

             {/* إحصائية سريعة: التاريخ */}
             <Card 
                className="p-5 bg-white border-none shadow-sm rounded-3xl flex items-center gap-4 cursor-default"
            >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">تاريخ اليوم</p>
                    <p className="text-lg font-bold text-gray-800">{today}</p>
                </div>
            </Card>
        </div>

        {/* Action Cards Grid */}
        <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            الخدمات المتاحة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* كارت البحث عن طالب */}
          <Card 
            onClick={() => onNavigate('students-search')}
            className="group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-1">البحث عن الطلاب</p>
            <p className="text-sm text-gray-500">البحث برقم الهوية أو الاسم</p>
          </Card>

          {/* كارت تقديم شكوى */}
          <Card 
            onClick={() => onNavigate('complaint')}
            className="group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-100 transition-colors">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-1">تقديم شكوى</p>
            <p className="text-sm text-gray-500">إرسال شكوى جديدة للإدارة</p>
          </Card>

          {/* كارت عرض التقارير */}
          <Card 
            onClick={() => onNavigate('school-reports')}
            className="group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-none shadow-sm rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-1">التقارير المدرسية</p>
            <p className="text-sm text-gray-500">متابعة الأداء الدراسي والغياب</p>
          </Card>
          
        </div>
      </div>
    </div>
  );
}