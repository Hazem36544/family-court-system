import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // حالات شاشة تغيير كلمة المرور
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // التقاط أمر التغيير الإجباري لو كان موجود مسبقاً
  useEffect(() => {
    if (localStorage.getItem('force_change_password') === 'true') {
      setStep('change_password');
      setPassword('');
      setError('يرجى تغيير كلمة المرور المؤقتة قبل الدخول للداشبورد');
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log("Attempting to login as Family Court...");

      // توجيه الطلب حصرياً لمسار المحكمة
      const response = await authAPI.loginFamilyCourt({
        email: username,
        password: password
      });

      console.log("Server response:", response);

      if (response.data && response.data.token) {
        let isTempPassword = false;
        let decodedPayload = {};

        // فك التوكن واستخراج كل البيانات المخبأة بداخله
        try {
          // فك تشفير الـ Payload الخاص بـ JWT (الجزء الأوسط)
          const base64Url = response.data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          decodedPayload = JSON.parse(jsonPayload);
          
          if (decodedPayload.tmp_pwd === "True" || decodedPayload.tmp_pwd === true) {
            isTempPassword = true;
          }
        } catch (e) {
          console.error("خطأ في قراءة التوكن", e);
        }

        // حفظ التوكن
        localStorage.setItem('wesal_token', response.data.token);

        if (isTempPassword) {
          // لو مؤقت: نمنع الدخول ونفتح شاشة التغيير
          localStorage.setItem('force_change_password', 'true');
          setStep('change_password');
          toast('يجب تأمين حساب المحكمة بكلمة مرور جديدة قبل الدخول', { icon: '🔒', duration: 4000 });
        } else {
          // لو سليم: نستخرج بيانات اليوزر من التوكن ونحفظها في localStorage
          
          // محاولة الحصول على بيانات المستخدم من الـ Response أولاً (إن وجدت)
          let userDataToSave = response.data.user;

          // إذا لم يرسل السيرفر user object، نستخرجه من الـ Claims اللي في التوكن
          if (!userDataToSave && decodedPayload) {
            userDataToSave = {
              id: decodedPayload.nameid || decodedPayload.sub || decodedPayload.jti,
              email: decodedPayload.email || username, // fallback للـ username اللي دخله
              name: decodedPayload.unique_name || decodedPayload.name || 'محكمة الأسرة',
              role: 'court',
              // بعض الأنظمة تخزن المحافظة في claim خاص، نبحث عنها:
              governorate: decodedPayload.governorate || decodedPayload.location || 'غير محدد'
            };
          }

          if (userDataToSave) {
            localStorage.setItem('wesal_user_data', JSON.stringify(userDataToSave));
          }
          
          localStorage.setItem('wesal_user_role', 'court'); // حفظ الصلاحية

          console.log("Login successful - Role: court", userDataToSave);
          onLogin('court'); // إرسال صلاحية المحكمة
        }
      } else {
        setError('فشل تسجيل الدخول: لم يتم استلام رمز الوصول');
      }

    } catch (err) {
      console.error("Login Error:", err);
      localStorage.removeItem('wesal_token');

      if (err.response) {
        const errorMsg = err.response.data?.detail || err.response.data?.title || "";

        if (err.response.status === 403 && (errorMsg.toLowerCase().includes("temporary password") || errorMsg.includes("تغيير كلمة المرور"))) {
          setStep('change_password');
          setError('');
          toast('يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول', { icon: '🔒', duration: 4000 });
        } else if (err.response.status === 401) {
          setError('بيانات الاعتماد غير صالحة (تحقق من البريد الإلكتروني وكلمة المرور)');
        } else if (err.response.status === 404) {
          setError('هذه المحكمة غير مسجلة في النظام');
        } else if (err.response.status === 500) {
          setError('خطأ داخلي في الخادم');
        } else {
          setError(`حدث خطأ: ${errorMsg || err.response.status}`);
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('فشل الاتصال بالخادم. تأكد من تشغيل النظام الخلفي');
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();

    if (!password || !newPassword || !confirmPassword) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPassword.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 خانات على الأقل");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authAPI.changePassword({
        oldPassword: password,
        newPassword: newPassword
      });

      toast.success("تم تأمين الحساب بنجاح! يرجى تسجيل الدخول بالبيانات الجديدة.");
      localStorage.removeItem("force_change_password");
      localStorage.removeItem("wesal_token"); 
      
      // الرجوع لشاشة اللوج إن
      setTimeout(() => {
        setStep('login');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);

    } catch (err) {
      console.error("Change Password Error:", err.response?.data);
      const validationErrors = err.response?.data?.errors;
      let errorMessage = "فشل في تغيير كلمة المرور.";

      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map(errItem => errItem.description || "خطأ في الشروط").join(" - ");
        } else {
          errorMessage = Object.values(validationErrors).flat().join(" - ");
        }
      } else {
        errorMessage = err.response?.data?.detail || err.response?.data?.title || errorMessage;
      }

      setError(errorMessage);
      toast.error("حدث خطأ أثناء المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      step === 'login' ? handleLogin(e) : handleChangePassword(e);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#F5F5F5'
      }}
    >
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Family Court Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">نظام إدارة محاكم الأسرة</h1>
          <p className="text-base text-[#95a5a6]">وصال</p>
        </div>

        {/* شاشة تسجيل الدخول */}
        {step === 'login' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold mb-8 text-center text-[#2c3e50]">تسجيل دخول المحكمة</h2>

            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block mb-2 text-[#2c3e50] font-medium text-sm text-right">
                  البريد الإلكتروني للمحكمة
                </label>
                <Input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: court@wesal.gov.eg"
                  className="w-full h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg text-right"
                  dir="ltr"
                  disabled={isLoading}
                  onKeyDown={handleKeyPress}
                />
              </div>

              <div>
                <label className="block mb-2 text-[#2c3e50] font-medium text-sm text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pr-4 pl-12 h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg text-right"
                    dir="ltr"
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 text-base font-bold rounded-lg mt-6 flex items-center justify-center gap-2 border-none"
                style={{
                  background: isLoading ? '#95a5a6' : '#2c5aa0',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = '#234a87')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = '#2c5aa0')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>

              <div className="text-center pt-2">
                <a href="#" className="text-sm font-medium" style={{ color: '#2c5aa0' }}>
                  هل نسيت كلمة المرور؟
                </a>
              </div>
            </div>
          </div>
        )}

        {/* شاشة التغيير الإجباري لكلمة المرور */}
        {step === 'change_password' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative overflow-hidden border-t-4" style={{ borderColor: '#2c5aa0' }}>
            
            <div className="flex flex-col items-center mb-6 mt-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#eef2f7', color: '#2c5aa0' }}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#2c3e50] mb-2 text-center">تأمين الحساب</h2>
              <p className="text-center text-[#95a5a6] text-sm">
                يرجى تغيير كلمة المرور المؤقتة بكلمة مرور خاصة بك للمتابعة.
              </p>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block mb-2 text-[#2c3e50] font-medium text-sm text-right">
                  كلمة المرور المؤقتة (الحالية)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-4 pl-12 h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg text-right font-mono tracking-widest"
                    dir="ltr"
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#2c3e50] font-medium text-sm text-right">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-4 pl-12 h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg text-right font-mono tracking-widest"
                    dir="ltr"
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50]">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#2c3e50] font-medium text-sm text-right">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-4 pl-12 h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg text-right font-mono tracking-widest"
                    dir="ltr"
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isLoading || !password || !newPassword || !confirmPassword}
                className="w-full h-12 text-base font-bold rounded-lg mt-6 flex items-center justify-center gap-2 border-none"
                style={{
                  background: (isLoading || !password || !newPassword || !confirmPassword) ? '#95a5a6' : '#2c5aa0',
                  color: 'white',
                  cursor: (isLoading || !password || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
                ) : (
                  <><Lock className="w-4 h-4" /> حفظ وتأمين الحساب</>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-[#95a5a6]">
            آمن ومعتمد من قبل وزارة العدل
          </p>
        </div>
      </div>
    </div>
  );
}