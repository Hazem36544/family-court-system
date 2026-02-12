import React, { useState, useRef } from 'react';
import { Shield, ChevronRight, CheckCircle } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function VerificationCodeScreen({ onVerify, onBack }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      setError('الرجاء إدخال الكود كاملاً');
      return;
    }

    // For demo purposes, accept "123456" as valid code
    if (enteredCode === '123456') {
      onVerify();
    } else {
      setError('الكود المدخل غير صحيح. الرجاء المحاولة مرة أخرى');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md bg-card shadow-2xl border-border">
        {/* Header Section */}
        <div className="bg-primary text-primary-foreground p-8 rounded-t-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">التحقق الأمني</h1>
            <p className="text-sm opacity-90 leading-relaxed">
              أدخل كود التحقق الخاص بك
              <br />
              <span className="font-medium">الكود المحدد من إدارة المحكمة</span>
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3 text-center">
              أدخل كود التحقق المكون من 6 أرقام
            </label>
            <div className="flex gap-2 justify-center" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : digit
                      ? 'border-primary bg-primary/5'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isCodeComplete}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-5 h-5 ml-2" />
            تأكيد الكود
          </Button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full mt-4 py-3 text-muted-foreground hover:text-foreground font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
            العودة لتسجيل الدخول
          </button>
        </div>

        {/* Footer */}
        <div className="bg-muted px-8 py-4 border-t border-border rounded-b-lg">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>التحقق الآمن لحماية حسابك</span>
          </div>
        </div>
      </Card>
    </div>
  );
}