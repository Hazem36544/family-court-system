import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, User, Phone, Mail, MapPin, LogOut, Shield,
  Edit, Send, X, GraduationCap, Hash, Users, Lock, Loader2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI, courtAPI } from '../../services/api'; // API import

export function AccountScreen({ userType, onLogout, onBack }) {
  // Initial state from local storage to prevent flicker
  const [profileData, setProfileData] = useState(() => {
    const savedUser = localStorage.getItem('wesal_user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loadingProfile, setLoadingProfile] = useState(false); // To fetch fresh data

  // Modal and loading states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Change password states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 1. Fetch updated user data from server on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        // Use the specific GetCourtStaffProfile endpoint
        const res = await (userType === 'employee' ? courtAPI.getProfile() : authAPI.getCurrentUser());
        setProfileData(res.data);
        // Update local storage
        localStorage.setItem('wesal_user_data', JSON.stringify(res.data));
      } catch (error) {
        console.error("Failed to refresh profile data", error);
        // Fallback to cached data
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [userType]);

  // Default data for display in case real data is missing
  const defaultInfo = {
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    position: '',
    department: '',
    location: '',
    type: '',
    studentsCount: ''
  };

  // Merge real data with fallback
  // The court staff schema is: fullName, email, phone
  const displayInfo = {
    ...defaultInfo,
    ...profileData,
    name: profileData?.fullName || profileData?.name || defaultInfo.name,
    employeeId: profileData?.userName || profileData?.id || defaultInfo.employeeId,
    phone: profileData?.phone || profileData?.phoneNumber || defaultInfo.phone,
    email: profileData?.email || defaultInfo.email
  };

  // --- Logout Handlers ---
  const handleLogoutSafe = () => {
    localStorage.removeItem('wesal_token');
    localStorage.removeItem('wesal_user_data');
    onLogout();
  };

  // --- Change Password Handlers ---
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
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
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPassSuccess('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassSuccess('');
      }, 2000);

    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.detail || err.response?.data?.message || 'فشل تغيير كلمة المرور، يرجى التحقق من كلمة المرور الحالية');
    } finally {
      setPassLoading(false);
    }
  };

  // --- Request Edit Handlers ---
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
            <h1 className="text-2xl font-bold mb-1">حسابي</h1>
            <p className="text-blue-200 text-sm opacity-90">إدارة معلوماتك الشخصية وإعدادات الأمان</p>
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
              <p className="text-sm text-green-600">سيتم مراجعة طلبك وسنتواصل معك قريباً.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Right Column (Left in LTR): Profile Card */}
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
                <h2 className="text-xl font-bold text-gray-800 mb-1">{displayInfo.name}</h2>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {userType === 'employee' ? (profileData?.position || 'موظف محكمة') : 'حساب مدرسة'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 relative z-10 space-y-3">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full border-blue-100 text-blue-600 hover:bg-blue-50 h-12 rounded-xl gap-2 border-none"
                >
                  <Lock className="w-4 h-4" />
                  تغيير كلمة المرور
                </Button>

                <Button
                  onClick={handleLogoutSafe}
                  variant="outline"
                  className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl gap-2 border-none"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </Button>
              </div>
            </Card>
          </div>

          {/* Left Column (Right in LTR): Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white border-none shadow-sm rounded-3xl text-right">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-800">المعلومات الأساسية</h3>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  variant="ghost"
                  className="text-[#1e3a8a] hover:bg-blue-50 gap-2 rounded-xl border-none"
                >
                  <Edit className="w-4 h-4" />
                  طلب تعديل
                </Button>
              </div>

              <div className="space-y-6">
                {userType === 'parent' ? (
                  <>
                    <InfoRow icon={Hash} label="كود المدرسة" value={displayInfo.employeeId} />
                    <InfoRow icon={GraduationCap} label="نوع المدرسة" value={displayInfo.type} />
                    <InfoRow icon={Phone} label="رقم الهاتف" value={displayInfo.phone} />
                    <InfoRow icon={Mail} label="البريد الإلكتروني" value={displayInfo.email} />
                    <InfoRow icon={MapPin} label="الموقع" value={displayInfo.location} />
                    <InfoRow icon={Users} label="عدد الطلاب" value={displayInfo.studentsCount} />
                  </>
                ) : (
                  <>
                    <InfoRow icon={Users} label="الاسم الكامل" value={displayInfo.name} />
                    <InfoRow icon={Phone} label="رقم الهاتف المحمول" value={displayInfo.phone} />
                    <InfoRow icon={Mail} label="البريد الإلكتروني" value={displayInfo.email} />
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Modal (Request Edit) --- */}
      {showRequestModal && (
        <ModalWrapper title="طلب تعديل البيانات" onClose={() => setShowRequestModal(false)}>
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">سبب التعديل</label>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="يرجى وصف البيانات المراد تغييرها والسبب..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 text-sm text-right"
            ></textarea>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmitRequest} disabled={!requestReason.trim()} className="flex-1 bg-[#1e3a8a] text-white py-3 rounded-xl h-auto border-none">
                إرسال الطلب
              </Button>
              <Button onClick={() => setShowRequestModal(false)} variant="outline" className="flex-1 border-gray-200 text-gray-600 py-3 rounded-xl h-auto border-none">
                إلغاء
              </Button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* --- Modal (Change Password) --- */}
      {showPasswordModal && (
        <ModalWrapper title="تغيير كلمة المرور" onClose={() => setShowPasswordModal(false)}>
          <div className="space-y-4 text-right">
            {passError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{passError}</div>}
            {passSuccess && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center">{passSuccess}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
              <Input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="text-right" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="text-right" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="text-right" />
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleChangePassword} disabled={passLoading} className="flex-1 bg-[#1e3a8a] text-white py-3 rounded-xl h-auto border-none">
                {passLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'حفظ التغييرات'}
              </Button>
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 border-gray-200 text-gray-600 py-3 rounded-xl h-auto border-none">
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
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-right">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1e3a8a]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-gray-800">{value || 'غير متوفر'}</p>
      </div>
    </div>
  );
}

// Helper component for modals
function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors border-none"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}