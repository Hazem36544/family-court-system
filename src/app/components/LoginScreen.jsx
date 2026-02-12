import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
// تأكد أنك قمت بتغيير أسماء الملفات داخل مجلد ui أيضاً إلى .jsx
import { Button } from './ui/button';
import { Input } from './ui/input';

// ⚠️ تم استبدال رابط فيجما برابط صورة مؤقت
const loginLogo = "/logo.svg"; 

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // جميع المستخدمين يدخلون كموظف محكمة
    onLogin('employee');
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
      {/* Login Container */}
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32">
            <img src={loginLogo} alt="شعار محكمة الأسرة" className="w-full h-full object-contain" />
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
            {/* Username/ID */}
            <div>
              <label className="block mb-2 text-[#2c3e50] font-medium text-sm">
                اسم المستخدم أو الرقم القومي
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم أو الرقم القومي"
                className="w-full text-right h-12 text-sm bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0] rounded-lg"
                dir="rtl"
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Password */}
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
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full h-12 text-base font-bold rounded-lg mt-6"
              style={{
                background: '#2c5aa0',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#234a87'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2c5aa0'}
            >
              تسجيل الدخول
            </Button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <a href="#" className="text-sm font-medium" style={{ color: '#2c5aa0' }}>
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-sm text-[#95a5a6]">
            نظام آمن ومعتمد من وزارة العدل
          </p>
        </div>
      </div>
    </div>
  );
}