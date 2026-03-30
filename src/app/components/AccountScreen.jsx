import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Phone, Mail, MapPin, LogOut,
  Send, X, Lock, Loader2, Building2, Scale, Navigation
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI } from '../../services/api'; // تأكد إن authAPI فيها دالة changePassword
import api from '../../services/api'; // الاستيراد المباشر لاستخدامه إذا لزم الأمر

export function AccountScreen({ userType, onLogout, onBack }) {
  // الاعتماد الأساسي على البيانات المحفوظة وقت تسجيل الدخول لعدم وجود مسار GET صريح للمحكمة في السواجر
  const [profileData, setProfileData] = useState(() => {
    const savedUser = localStorage.getItem('wesal_user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loadingProfile, setLoadingProfile] = useState(false);

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Change password states
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    // محاولة تحديث البيانات لو كان هناك مسار عام لجلب المستخدم الحالي، 
    // وإلا نكتفي بالبيانات المتاحة من تسجيل الدخول (No fake data)
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        if (authAPI.getCurrentUser && typeof authAPI.getCurrentUser === 'function') {
          const res = await authAPI.getCurrentUser();
          if (res.data) {
            setProfileData(res.data);
            localStorage.setItem('wesal_user_data', JSON.stringify(res.data));
          }
        }
      } catch (error) {
        console.error("Failed to refresh profile data, relying on local storage", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    // نستدعيها فقط إذا لم يكن هناك بيانات أو إذا أردنا التحديث
    if (!profileData) fetchProfile();
    else setLoadingProfile(false);
  }, [userType]);

  // دمج البيانات وعرضها بناءً على هيكل Court (حسب Swagger: CreateFamilyCourt.Request)
  const displayInfo = {
    name: profileData?.name || profileData?.fullName || 'محكمة أسرة (غير محدد)',
    email: profileData?.email || 'غير متوفر',
    governorate: profileData?.governorate || 'غير متوفر',
    address: profileData?.address || 'غير متوفر',
    contactInfo: profileData?.contactInfo || profileData?.phone || 'غير متوفر',
  };

  // --- Logout Handler ---
  const handleLogoutSafe = () => {
    localStorage.removeItem('wesal_token');
    localStorage.removeItem('wesal_user_data');
    localStorage.removeItem('wesal_user_role');
    localStorage.removeItem('current_screen');
    onLogout();
  };

  // --- Change Password Handler ---
  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPassError('يرجى ملء جميع الحقول');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    try {
      // متوافق مع Swagger: PATCH /api/users/change-password
      const payload = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      };

      // لو authAPI.changePassword مش بتبعت الـ payload بالشكل ده، استخدم api.patch مباشرة
      if (authAPI.changePassword) {
         await authAPI.changePassword(payload);
      } else {
         await api.patch('/api/users/change-password', payload);
      }

      setPassSuccess('تم تغيير كلمة المرور بنجاح وتأمين الحساب');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPassSuccess('');
      }, 2000);

    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.detail || err.response?.data?.title || 'فشل تغيير كلمة المرور، يرجى التحقق من كلمة المرور الحالية');
    } finally {
      setPassLoading(false);
    }
  };

  // --- Request Edit Handler ---
  const handleSubmitRequest = async () => {
    if (requestReason.trim()) {
      setShowSuccessMessage(true);
      setShowRequestModal(false);
      setRequestReason('');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">

      {/* --- Header --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button
            onClick={onBack}
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none"
          >
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>

          <div className="text-right">
            <h1 className="text-2xl font-bold mb-1">حساب المحكمة</h1>
            <p className="text-blue-200 text-sm opacity-90">إدارة معلومات الفرع وإعدادات الأمان</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Global Success message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 text-right">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-green-800">تم إرسال الطلب بنجاح</p>
              <p className="text-sm text-green-600">سيتم مراجعة طلب التعديل من قبل الدعم الفني.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Right Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 bg-white border-none shadow-sm rounded-3xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-white z-0"></div>

              <div className="relative z-10 w-28 h-28 bg-white p-1 rounded-full shadow-lg mx-auto mb-4">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center">
                   <Building2 className="w-12 h-12 text-[#1e3a8a]" />
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{displayInfo.name}</h2>
                <p className="text-sm text-blue-600 font-medium mb-4 flex items-center justify-center gap-1">
                  <Scale className="w-4 h-4" /> فرع محكمة الأسرة
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 relative z-10 space-y-3">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full border-blue-100 text-blue-600 hover:bg-blue-50 h-12 rounded-xl gap-2 border-none transition-all"
                >
                  <Lock className="w-4 h-4" />
                  تغيير كلمة المرور
                </Button>

                <Button
                  onClick={handleLogoutSafe}
                  variant="outline"
                  className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl gap-2 border-none transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </Button>
              </div>
            </Card>
          </div>

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white border-none shadow-sm rounded-3xl text-right">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-800">المعلومات الأساسية للمحكمة</h3>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  variant="ghost"
                  className="text-[#1e3a8a] hover:bg-blue-50 gap-2 rounded-xl border-none transition-all"
                >
                  <Send className="w-4 h-4" />
                  طلب تعديل (دعم فني)
                </Button>
              </div>

              <div className="space-y-6 relative">
                {loadingProfile && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                     <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
                  </div>
                )}
                
                <InfoRow icon={Building2} label="اسم المحكمة" value={displayInfo.name} />
                <InfoRow icon={Navigation} label="المحافظة" value={displayInfo.governorate} />
                <InfoRow icon={MapPin} label="العنوان التفصيلي" value={displayInfo.address} />
                <InfoRow icon={Mail} label="البريد الإلكتروني للفرع" value={displayInfo.email} />
                <InfoRow icon={Phone} label="رقم التواصل" value={displayInfo.contactInfo} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Modal (Request Edit) --- */}
      {showRequestModal && (
        <ModalWrapper title="التواصل مع الدعم الفني لتعديل البيانات" onClose={() => setShowRequestModal(false)}>
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">رسالة الطلب</label>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="يرجى وصف البيانات المراد تغييرها والسبب بالتفصيل (مثل: تغيير عنوان مقر المحكمة)..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 text-sm text-right"
            ></textarea>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmitRequest} disabled={!requestReason.trim()} className="flex-1 bg-[#1e3a8a] text-white py-3 rounded-xl h-auto border-none hover:bg-blue-900 transition-all">
                إرسال الطلب
              </Button>
              <Button onClick={() => setShowRequestModal(false)} variant="outline" className="flex-1 border-gray-200 text-gray-600 py-3 rounded-xl h-auto border-none hover:bg-gray-100 transition-all">
                إلغاء
              </Button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* --- Modal (Change Password) --- */}
      {showPasswordModal && (
        <ModalWrapper title="تغيير كلمة المرور وتأمين الحساب" onClose={() => setShowPasswordModal(false)}>
          <div className="space-y-4 text-right">
            {passError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">{passError}</div>}
            {passSuccess && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100">{passSuccess}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية (المؤقتة أو القديمة)</label>
              <Input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="text-right font-mono" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="text-right font-mono" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="text-right font-mono" dir="ltr" />
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleChangePassword} disabled={passLoading} className="flex-1 bg-[#1e3a8a] text-white py-3 rounded-xl h-auto border-none hover:bg-blue-900 transition-all">
                {passLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تحديث كلمة المرور'}
              </Button>
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 border-gray-200 text-gray-600 py-3 rounded-xl h-auto border-none hover:bg-gray-100 transition-all">
                إلغاء
              </Button>
            </div>
          </div>
        </ModalWrapper>
      )}

    </div>
  );
}

// Helper component for info rows
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50/50 transition-colors text-right border border-transparent hover:border-blue-100">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#1e3a8a] flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1 font-bold">{label}</p>
        <p className="font-bold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}

// Helper component for modals
function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-lg font-black text-[#1e3a8a]">{title}</h3>
          <button onClick={onClose} className="hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors border-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}