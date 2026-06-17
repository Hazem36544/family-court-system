import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';

import { LoginLayout } from './components/LoginLayout';
import { LoginForm } from './components/LoginForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { SuccessTransition } from './components/SuccessTransition';
import { validateLoginFormFields, validatePasswordChangeFields } from './components/LoginHelpers';

export function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('login');

  // ✅ الحل الجذري: سحب البريد من الـ Session لو موجود عشان ميطيرش مع الريلود
  const [username, setUsername] = useState(() => sessionStorage.getItem('temp_court_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [userFieldName] = useState(() => 'usr_' + Math.random().toString(36).substring(2, 9));
  const [pwdFieldName] = useState(() => 'pwd_' + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (sessionStorage.getItem('force_change_password') === 'true') {
      setStep('change_password');
      setPassword('');
      setError('يرجى تغيير كلمة المرور المؤقتة قبل الدخول للداشبورد');
    } else {
      sessionStorage.removeItem('wesal_court_token');
      sessionStorage.removeItem('temp_court_token'); // حماية الريلود
      sessionStorage.removeItem('wesal_court_user_data');
      sessionStorage.removeItem('wesal_court_user_role');
      sessionStorage.removeItem('wesal_court_current_screen');
      sessionStorage.removeItem('wesal_user_data');
      sessionStorage.removeItem('wesal_token');
      // لم نقم بمسح 'temp_court_username' هنا عمداً لكي يبقى محتفظاً بالبريد
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    const { isValid, errors } = validateLoginFormFields(username, password);
    setFormErrors(errors);
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    // ✅ حفظ البريد في الـ Session بمجرد محاولة الدخول الناجحة
    sessionStorage.setItem('temp_court_username', username.trim());

    sessionStorage.removeItem('wesal_court_token');
    sessionStorage.removeItem('temp_court_token');
    sessionStorage.removeItem('wesal_court_user_data');
    sessionStorage.removeItem('wesal_court_user_role');
    sessionStorage.removeItem('force_change_password');
    sessionStorage.removeItem('wesal_user_data');
    sessionStorage.removeItem('wesal_token');

    try {
      console.log("Attempting to login as Family Court...");
      const response = await authAPI.loginFamilyCourt({ email: username.trim(), password: password.trim() });

      if (response.data && response.data.token) {
        let isTempPassword = false;
        let decodedPayload = {};

        try {
          const base64Url = response.data.token.split('.')[1];
          let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4 !== 0) base64 += '=';
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          decodedPayload = JSON.parse(jsonPayload);
          
          if (decodedPayload.tmp_pwd === "True" || decodedPayload.tmp_pwd === true || decodedPayload.tmp_pwd === "true") {
            isTempPassword = true;
          }
        } catch (e) {
          console.error("خطأ في قراءة التوكن", e);
        }

        if (isTempPassword) {
          sessionStorage.setItem('temp_court_token', response.data.token);
          sessionStorage.setItem('force_change_password', 'true');
          setStep('change_password');
          toast('يجب تأمين حساب المحكمة بكلمة مرور جديدة قبل الدخول', { icon: '🔒', duration: 4000 });
        } else {
          let userDataToSave = response.data.user;

          if (!userDataToSave && decodedPayload) {
            userDataToSave = {
              id: decodedPayload.courtId || decodedPayload.CourtId || decodedPayload.roleId || decodedPayload.nameid || decodedPayload.sub || decodedPayload.jti,
              email: decodedPayload.email || username, 
              name: decodedPayload.unique_name || decodedPayload.name || 'محكمة الأسرة',
              role: 'court',
              governorate: decodedPayload.governorate || decodedPayload.location || 'غير محدد'
            };
          }

          if (userDataToSave) {
            sessionStorage.setItem('wesal_court_user_data', JSON.stringify(userDataToSave));
            sessionStorage.setItem('wesal_user_data', JSON.stringify(userDataToSave));
          }
          
          sessionStorage.setItem('wesal_court_token', response.data.token);
          sessionStorage.setItem('wesal_court_user_role', 'court'); 

          console.log("Login successful - Role: court", userDataToSave);
          toast.success('تم تسجيل الدخول بنجاح!');
          onLogin('court'); 
        }
      } else {
        setError('فشل تسجيل الدخول: لم يتم استلام رمز الوصول');
      }
    } catch (err) {
      console.error("Login Error:", err);
      sessionStorage.removeItem('wesal_court_token');
      sessionStorage.removeItem('temp_court_token');
      sessionStorage.removeItem('wesal_user_data');

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

    const { isValid, errors } = validatePasswordChangeFields(password, newPassword, confirmPassword);
    setFormErrors(errors);
    if (!isValid) return;

    setIsLoading(true);
    setError("");

    const tempToken = sessionStorage.getItem("temp_court_token");
    if (tempToken) {
      sessionStorage.setItem("wesal_court_token", tempToken);
    }

    try {
      await authAPI.changePassword({ oldPassword: password, newPassword: newPassword });
      toast.success("تم تأمين الحساب بنجاح! يرجى تسجيل الدخول بالبيانات الجديدة.");
      
      sessionStorage.removeItem("force_change_password");
      sessionStorage.removeItem("wesal_court_token"); 
      sessionStorage.removeItem("temp_court_token"); 
      sessionStorage.removeItem("wesal_user_data");
      
      setStep('success_transition');

      setTimeout(() => {
        setStep('login');
        // يتم مسح الباسوردات فقط، والإيميل يظل ثابتاً ومأخوذاً من الـ Session
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);

    } catch (err) {
      console.error("Change Password Error:", err.response?.data);
      sessionStorage.removeItem("wesal_court_token"); 
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

  const handleInputChange = (setter, fieldName) => (e) => {
      setter(e.target.value);
      if (formErrors[fieldName]) {
          setFormErrors(prev => ({...prev, [fieldName]: null}));
      }
  };

  return (
    <LoginLayout>
        {step === 'login' && (
            <LoginForm 
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                isLoading={isLoading} error={error} formErrors={formErrors}
                userFieldName={userFieldName} pwdFieldName={pwdFieldName}
                handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleLogin={handleLogin}
            />
        )}
        
        {step === 'change_password' && (
            <ChangePasswordForm 
                password={password} setPassword={setPassword}
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword}
                isLoading={isLoading} error={error} formErrors={formErrors}
                handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleChangePassword={handleChangePassword}
            />
        )}

        {step === 'success_transition' && <SuccessTransition />}
    </LoginLayout>
  );
}