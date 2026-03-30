import React, { useState } from 'react';
import { UserPlus, Loader2, AlertCircle, Save, UserCircle } from 'lucide-react';
import api from '../../../services/api'; 
import CredentialsSuccessModal from '../ui/CredentialsSuccessModal'; // تم تحديث المسار بدقة
import { toast } from 'react-hot-toast';

export function StaffManagement({ onNavigate, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // إرسال البيانات للباك إند لإنشاء الموظف
      const response = await api.post('/api/users/court-staff', formData);
      
      // ✅ تم التعديل هنا: الاعتماد على formData.email مباشرة لتجاهل الاسم المرجّع من السيرفر
      const credentials = {
        username: formData.email,
        temporaryPassword: response.data.temporaryPassword 
      };
      
      setCreatedCredentials(credentials);
      setSuccessModalOpen(true);
      
      // تفريغ الفورم بعد النجاح
      setFormData({
        fullName: '', email: '', phone: ''
      });
      toast.success('تم إنشاء حساب الموظف بنجاح!');

    } catch (err) {
      console.error("Create Staff Error:", err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.title || 'حدث خطأ أثناء الإنشاء، يرجى التأكد من البيانات.';
      setError(errorMsg);
      toast.error('فشلت العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 w-full font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        
        {/* الهيدر */}
        <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                <div>
                    <h1 className="text-2xl font-bold mb-1">إضافة موظف محكمة جديد</h1>
                    <p className="text-blue-200 text-sm opacity-90">تسجيل بيانات الموظف لإنشاء حسابه على نظام وصال</p>
                </div>
            </div>

            <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10 shadow-inner">
                <UserCircle className="w-8 h-8 text-blue-100" />
            </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col space-y-8">
            
            {/* عنوان الفورم */}
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="bg-blue-50 p-3 rounded-xl text-[#1e3a8a]">
                <UserPlus size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">البيانات الأساسية للموظف</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم الرباعي</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white outline-none transition-all font-medium text-gray-800" 
                  placeholder="مثال: أحمد محمود عبدالله" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">البريد الإلكتروني الوظيفي</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white outline-none transition-all text-left font-mono" 
                    dir="ltr" 
                    placeholder="staff@wesal.gov.eg" 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">رقم التواصل (اختياري)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white outline-none transition-all text-left font-mono" 
                    dir="ltr" 
                    placeholder="01xxxxxxxxx" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="flex justify-center mt-10 mb-8">
              <button 
                type="submit" disabled={loading}
                className="w-full md:w-[60%] lg:w-[50%] bg-[#1e3a8a] text-white px-8 py-4.5 rounded-2xl font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 text-lg border border-blue-800 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Save size={24} />}
                <span>إضافة الموظف وإنشاء الحساب</span>
              </button>
          </div>

        </form>
      </div>

       {/* Credentials Modal */}
      <CredentialsSuccessModal 
        isOpen={successModalOpen} 
        onClose={() => setSuccessModalOpen(false)}
        credentials={createdCredentials}
      />

    </div>
  );
}