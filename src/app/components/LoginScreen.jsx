import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI } from '../../services/api'; 

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log("جاري محاولة تسجيل الدخول...");
      
      const response = await authAPI.loginCourtStaff({ 
        email: username, 
        password: password 
      });

      console.log("رد السيرفر:", response);

      if (response.data && response.data.token) {
        localStorage.setItem('wesal_token', response.data.token);
        
        if (response.data.user) {
             localStorage.setItem('wesal_user_data', JSON.stringify(response.data.user));
        }

        console.log("تم تسجيل الدخول بنجاح - توكن حقيقي");
        onLogin('employee');
      } else {
        setError('فشل تسجيل الدخول: لم يتم استلام مفتاح الدخول (Token)');
      }

    } catch (err) {
      console.error("Login Error:", err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('بيانات الدخول غير صحيحة (تأكد من الإيميل وكلمة المرور)');
        } else if (err.response.status === 404) {
             setError('هذا المستخدم غير مسجل في النظام');
        } else if (err.response.status === 500) {
             setError('خطأ في السيرفر الداخلي');
        } else {
             setError(`حدث خطأ: ${err.response.data?.message || err.response.status}`);
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('فشل الاتصال بالخادم. تأكد أن الباك-إند يعمل');
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4" 
      dir="rtl" 
      style={{ 
        fontFamily: 'Cairo, sans-serif',
        background: '#F5F5F5'
      }}
    >
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32">
            <img 
              src={`${import.meta.env.BASE_URL}logo.svg`} 
              alt="شعار محكمة الأسرة" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">نظام إدارة محكمة الأسرة</h1>
          <p className="text-base text-[#95a5a6]">لم الشمل</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-8 text-center text-[#2c3e50]">تسجيل الدخول</h2>
          
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-[#2c3e50] font-medium text-sm">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="example@court.gov.eg"
                className="w-full text-right h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg"
                dir="rtl"
                disabled={isLoading}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div>
              <label className="block mb-2 text-[#2c3e50] font-medium text-sm">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full text-right pr-12 h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg"
                  dir="rtl"
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
              className="w-full h-12 text-base font-bold rounded-lg mt-6 flex items-center justify-center gap-2"
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
                  جاري الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>

            <div className="text-center pt-2">
              <a href="#" className="text-sm font-medium" style={{ color: '#2c5aa0' }}>
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#95a5a6]">
            نظام آمن ومعتمد من وزارة العدل
          </p>
        </div>
      </div>
    </div>
  );
}