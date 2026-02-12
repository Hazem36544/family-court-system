import React, { useState } from 'react';
import { 
  ChevronRight, // غيرت الأيقونة لـ Right عشان الـ RTL
  User, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut, 
  Shield, 
  Edit, 
  Send, 
  X, 
  GraduationCap, 
  Hash, 
  Users 
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function AccountScreen({ userType, onLogout, onBack }) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // بيانات تجريبية حسب النوع
  const userInfo = userType === 'employee'
    ? {
        name: 'محمد أحمد السالم',
        employeeId: 'EMP-2024-4567',
        phone: '01012345678',
        email: 'employee@court.gov.eg',
        position: 'موظف محكمة الأسرة',
        department: 'محكمة الأسرة - القاهرة'
      }
    : {
        name: 'مدرسة الأمير فيصل',
        employeeId: 'SCH-CAI-2024-001',
        phone: '0221234567',
        email: 'alfaisal.school@edu.eg',
        location: 'القاهرة - مدينة نصر - شارع الطيران',
        type: 'مدرسة ابتدائية حكومية',
        studentsCount: '450 طالب'
      };

  const handleRequestEdit = () => {
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    if (requestReason.trim()) {
      setShowSuccessMessage(true);
      setShowRequestModal(false);
      setRequestReason('');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleCancelRequest = () => {
    setShowRequestModal(false);
    setRequestReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">
      
      {/* --- الهيدر الجديد (Integrated Blue Header) --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        
        {/* خلفيات جمالية */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          {/* زر الرجوع */}
          <button 
            onClick={onBack} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold mb-1">الحساب الشخصي</h1>
            <p className="text-blue-200 text-sm opacity-90">إدارة بياناتك الشخصية وإعدادات الأمان</p>
          </div>
        </div>

        {/* أيقونة تعبيرية على اليسار */}
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
           {userType === 'employee' ? <User className="w-8 h-8 text-blue-100" /> : <GraduationCap className="w-8 h-8 text-blue-100" />}
        </div>
      </div>
      {/* --- نهاية الهيدر --- */}

      <div className="max-w-7xl mx-auto">
        
        {/* رسالة النجاح */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <Send className="w-4 h-4" />
            </div>
            <div>
               <p className="font-bold text-green-800">تم إرسال الطلب بنجاح</p>
               <p className="text-sm text-green-600">سيتم مراجعة طلبك والرد عليك قريباً.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* العمود الأيمن: كارت البروفايل */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 bg-white border-none shadow-sm rounded-3xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-white z-0"></div>
              
              <div className="relative z-10 w-28 h-28 bg-white p-1 rounded-full shadow-lg mx-auto mb-4">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center">
                  {userType === 'employee' ? (
                    <User className="w-12 h-12 text-[#1e3a8a]" />
                  ) : (
                    <GraduationCap className="w-12 h-12 text-[#1e3a8a]" />
                  )}
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{userInfo.name}</h2>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {userType === 'employee' ? userInfo.position : 'حساب مدرسة'}
                </p>
                
                {userType === 'employee' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>{userInfo.department}</span>
                  </div>
                )}
              </div>

              {/* زر الخروج */}
              <div className="mt-8 pt-6 border-t border-gray-100 relative z-10">
                <Button 
                  onClick={onLogout}
                  variant="outline"
                  className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </Button>
                <p className="mt-4 text-xs text-gray-400">الإصدار 1.0.0</p>
              </div>
            </Card>

            {/* كارت الأمان الصغير */}
            <Card className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
               <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
               <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">بياناتك محمية</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    جميع البيانات مشفرة ومحفوظة وفقاً لأعلى معايير الأمان.
                  </p>
               </div>
            </Card>
          </div>

          {/* العمود الأيسر: التفاصيل */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white border-none shadow-sm rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-gray-800">المعلومات الأساسية</h3>
                 <Button 
                    onClick={handleRequestEdit}
                    variant="ghost" 
                    className="text-[#1e3a8a] hover:bg-blue-50 gap-2 rounded-xl"
                 >
                    <Edit className="w-4 h-4" />
                    طلب تعديل
                 </Button>
              </div>

              <div className="space-y-6">
                {/* --- عرض البيانات حسب النوع --- */}
                {userType === 'parent' ? ( // هنا ممكن يكون 'school' حسب اللوجيك بتاعك، بس همشي ع الكود القديم
                   <>
                     <InfoRow icon={Hash} label="كود المدرسة" value={userInfo.employeeId} />
                     <InfoRow icon={GraduationCap} label="نوع المدرسة" value={userInfo.type} />
                     <InfoRow icon={Phone} label="رقم الهاتف" value={userInfo.phone} />
                     <InfoRow icon={Mail} label="البريد الإلكتروني" value={userInfo.email} />
                     <InfoRow icon={MapPin} label="العنوان" value={userInfo.location} />
                     <InfoRow icon={Users} label="عدد الطلاب" value={userInfo.studentsCount} />
                   </>
                ) : (
                   <>
                     <InfoRow icon={Hash} label="الرقم الوظيفي" value={userInfo.employeeId} />
                     <InfoRow icon={Phone} label="رقم الجوال" value={userInfo.phone} />
                     <InfoRow icon={Mail} label="البريد الإلكتروني" value={userInfo.email} />
                     {/* ممكن تزود هنا العنوان لو موجود للموظف */}
                   </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Modal (نافذة طلب التعديل) --- */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
               <h3 className="text-lg font-bold">طلب تعديل بيانات</h3>
               <button onClick={handleCancelRequest} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">سبب التعديل</label>
               <textarea 
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="يرجى توضيح البيانات المراد تعديلها والسبب..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 text-sm"
               ></textarea>
               
               <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-3 rounded-lg text-center">
                  سيتم مراجعة الطلب خلال 48 ساعة عمل.
               </p>

               <div className="flex gap-3 mt-6">
                  <Button 
                     onClick={handleSubmitRequest} 
                     disabled={!requestReason.trim()}
                     className="flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white py-3 rounded-xl h-auto"
                  >
                     إرسال الطلب
                  </Button>
                  <Button 
                     onClick={handleCancelRequest} 
                     variant="outline" 
                     className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl h-auto"
                  >
                     إلغاء
                  </Button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// مكون مساعد صغير لعرض الصفوف بشكل نظيف
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1e3a8a]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}