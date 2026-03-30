import React from 'react';
import { CheckCircle, Copy, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CredentialsSuccessModal = ({ isOpen, onClose, credentials }) => {
  if (!isOpen || !credentials) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ بنجاح!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-300" dir="rtl">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-800 mb-2">تم إنشاء الحساب بنجاح!</h2>
        <p className="text-gray-500 mb-8 text-sm">تم إضافة الحساب للنظام. يرجى حفظ بيانات الدخول التالية وإرسالها للمستخدم.</p>

        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8 text-right relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl opacity-50 pointer-events-none"></div>
          
          <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-blue-50">
              <div>
                <span className="text-[10px] text-blue-500 block mb-0.5 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> اسم المستخدم / البريد
                </span>
                <span className="text-sm font-mono font-bold text-blue-900 select-all">{credentials.username}</span>
              </div>
              <button onClick={() => copyToClipboard(credentials.username)} className="p-2 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-all active:scale-95">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-blue-50">
              <div>
                <span className="text-[10px] text-blue-500 block mb-0.5 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> كلمة المرور المؤقتة
                </span>
                <span className="text-sm font-mono font-bold text-blue-900 select-all">{credentials.temporaryPassword}</span>
              </div>
              <button onClick={() => copyToClipboard(credentials.temporaryPassword)} className="p-2 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-all active:scale-95">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full bg-[#1e3a8a] text-white h-14 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95"
        >
          حسناً، قمت بحفظ البيانات
        </button>
      </div>
    </div>
  );
};

export default CredentialsSuccessModal;