import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Search, MapPin, Phone, Loader2, 
  CheckCircle, Copy, X, AlertCircle, Eye, Clock, Building2, UserCircle 
} from 'lucide-react';
import api from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function VisitationCentersManagement({ onNavigate, onBack }) {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [successCredentials, setSuccessCredentials] = useState(null);

  const [formData, setFormData] = useState({
      name: '',
      address: '',
      governorate: 'القاهرة',
      contactNumber: '',
      maxConcurrentVisits: 10,
      openingTime: '09:00',
      closingTime: '17:00',
      managerFullName: '',
      managerEmail: '',
      managerPhone: ''
  });

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/visitation-locations', { params: { PageNumber: 1, PageSize: 100 } });
      const items = response.data?.items || [];
      setCenters(items);
      setFilteredCenters(items);
    } catch (err) {
      toast.error("حدث خطأ أثناء جلب قائمة مراكز الرؤية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCenters(); }, []);

  useEffect(() => {
      if (!searchTerm) {
          setFilteredCenters(centers);
      } else {
          const term = searchTerm.toLowerCase();
          setFilteredCenters(centers.filter(c => 
              c.name?.toLowerCase().includes(term) || c.governorate?.toLowerCase().includes(term)
          ));
      }
  }, [searchTerm, centers]);

  const handleAddCenter = async () => {
      if (!formData.name || !formData.address || !formData.managerFullName || !formData.managerEmail) {
          setError("يرجى تعبئة بيانات المركز الأساسية وبيانات مدير المركز");
          return;
      }

      setIsSaving(true);
      setError(null);

      try {
          const centerPayload = {
              name: formData.name,
              address: formData.address,
              governorate: formData.governorate,
              contactNumber: formData.contactNumber,
              maxConcurrentVisits: parseInt(formData.maxConcurrentVisits),
              openingTime: `${formData.openingTime}:00`,
              closingTime: `${formData.closingTime}:00`
          };

          const centerRes = await api.post('/api/visitation-locations', centerPayload);
          const newLocationId = centerRes.data; 

          const staffPayload = {
              email: formData.managerEmail,
              fullName: formData.managerFullName,
              phone: formData.managerPhone || formData.contactNumber,
              locationId: newLocationId 
          };

          const staffRes = await api.post('/api/users/visit-center-staff', staffPayload);
          
          // ✅ التعديل هنا: دمج بيانات الاستجابة مع الإيميل لضمان عرضه الصحيح في الـ UI
          setSuccessCredentials({
              ...staffRes.data,
              loginEmail: formData.managerEmail, // الإيميل الذي سيستخدم في اللوجين
              originalName: staffRes.data.username // نحتفظ بالاسم تحسباً لأي حاجة
          }); 
          
          fetchCenters();
          setShowAddModal(false);
          setFormData({ name: '', address: '', governorate: 'القاهرة', contactNumber: '', maxConcurrentVisits: 10, openingTime: '09:00', closingTime: '17:00', managerFullName: '', managerEmail: '', managerPhone: '' });
          
      } catch (err) {
          console.error("Registration Error:", err);
          setError(err.response?.data?.detail || err.response?.data?.title || "فشل في إتمام عملية التسجيل.");
      } finally {
          setIsSaving(false);
      }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ بنجاح");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      
      {/* 1. Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <button onClick={onBack} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all group">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">إدارة النظام</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">مراكز الرؤية المعتمدة</h1>
          </div>
        </div>
        <div className="hidden md:flex w-20 h-20 bg-white/10 rounded-3xl items-center justify-center border border-white/10 shadow-inner relative z-10">
           <Building2 className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* 2. شريط البحث وزر الإضافة */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن مركز بالاسم أو المحافظة..."
                  className="w-full pr-12 p-4 h-14 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-lg shadow-blue-100 h-14 px-8 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-105"
            >
                <Plus className="w-5 h-5" /> <span>تسجيل مركز جديد</span>
            </button>
        </div>

        {/* 3. عرض المربعات (Grid View) */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
        ) : centers.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد مراكز مسجلة</h3>
              <p className="text-gray-500">ابدأ بإضافة أول مركز رؤية معتمد في النظام.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredCenters.map((center) => (
              <div 
                key={center.id} 
                onClick={() => setSelectedCenter(center)}
                className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] p-6 group cursor-pointer hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors shadow-sm">
                      <MapPin className="w-7 h-7" />
                   </div>
                   <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                       <Eye className="w-3 h-3" /> تفاصيل
                   </span>
                </div>
                <h3 className="font-bold text-gray-800 text-xl mb-4 line-clamp-1">{center.name}</h3>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{center.governorate} - {center.address}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{center.openingTime?.substring(0,5)} ص - {center.closingTime?.substring(0,5)} م</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Pop-up إضافة مركز رؤية جديد */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                      <Building2 className="w-6 h-6" /> تسجيل مركز رؤية ومسؤول جديد
                  </h2>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 shadow-sm border border-gray-100"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-5">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500" /> بيانات المركز</h3>
                    <input type="text" placeholder="اسم المركز" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="المحافظة" value={formData.governorate} onChange={e => setFormData({...formData, governorate: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                        <input type="tel" placeholder="رقم الهاتف" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <input type="text" placeholder="العنوان التفصيلي" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1"><label className="text-[10px] text-gray-500 mb-1 block mr-1 font-bold">فتح</label><input type="time" value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none" /></div>
                        <div className="col-span-1"><label className="text-[10px] text-gray-500 mb-1 block mr-1 font-bold">إغلاق</label><input type="time" value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none" /></div>
                        <div className="col-span-1"><label className="text-[10px] text-gray-500 mb-1 block mr-1 font-bold">القدرة</label><input type="number" value={formData.maxConcurrentVisits} onChange={e => setFormData({...formData, maxConcurrentVisits: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none text-center" /></div>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-2"><UserCircle className="w-3 h-3 text-blue-500" /> حساب المدير المسؤول</h3>
                    <input type="text" placeholder="اسم المسؤول الرباعي" value={formData.managerFullName} onChange={e => setFormData({...formData, managerFullName: e.target.value})} className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-100 focus:ring-2 focus:ring-blue-200" />
                    <input type="email" placeholder="البريد الإلكتروني المهني" value={formData.managerEmail} onChange={e => setFormData({...formData, managerEmail: e.target.value})} className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-100 focus:ring-2 focus:ring-blue-200" />
                    <input type="tel" placeholder="رقم هاتف المسؤول (اختياري)" value={formData.managerPhone} onChange={e => setFormData({...formData, managerPhone: e.target.value})} className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-100 focus:ring-2 focus:ring-blue-200" />
                    
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 animate-pulse"><AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="text-xs font-medium">{error}</span></div>}
                 </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                 <button disabled={isSaving} onClick={handleAddCenter} className="flex-1 bg-[#1e3a8a] text-white h-14 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-blue-800 disabled:opacity-70">
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Building2 className="w-5 h-5" />}
                    {isSaving ? "جاري إنشاء السجلات..." : "إتمام التسجيل النهائي"}
                 </button>
                 <button disabled={isSaving} onClick={() => setShowAddModal(false)} className="w-32 bg-white text-gray-600 border border-gray-200 h-14 rounded-2xl font-bold hover:bg-gray-100 transition-all">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {/* ✅ Pop-up رسالة النجاح الخضراء */}
      {successCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
             </div>
             <h2 className="text-2xl font-black text-gray-800 mb-2">تم الربط والتسجيل بنجاح!</h2>
             <p className="text-gray-500 mb-8 text-sm">تم إنشاء ملف المركز وحساب المدير بنجاح. يرجى حفظ بيانات الدخول التالية.</p>

             <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8 text-right relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl opacity-50"></div>
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-center">
                      <div>
                          {/* ✅ التعديل هنا: تغيير التسمية لبريد تسجيل الدخول وعرض الإيميل */}
                          <span className="text-[10px] text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">بريد تسجيل الدخول</span>
                          <span className="text-base font-mono font-bold text-blue-900">{successCredentials.loginEmail}</span>
                      </div>
                      <button onClick={() => copyToClipboard(successCredentials.loginEmail)} className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 hover:bg-blue-50 transition-all active:scale-95"><Copy className="w-4 h-4" /></button>
                   </div>
                   <div className="h-px bg-blue-200/50 w-full"></div>
                   <div className="flex justify-between items-center">
                      <div>
                          <span className="text-[10px] text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">كلمة المرور المؤقتة</span>
                          <span className="text-base font-mono font-bold text-blue-900">{successCredentials.temporaryPassword}</span>
                      </div>
                      <button onClick={() => copyToClipboard(successCredentials.temporaryPassword)} className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 hover:bg-blue-50 transition-all active:scale-95"><Copy className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
             <button onClick={() => setSuccessCredentials(null)} className="w-full bg-[#1e3a8a] text-white h-14 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg">حسناً، تم الحفظ</button>
          </div>
        </div>
      )}

      {/* ✅ Pop-up عرض تفاصيل المركز */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-50 p-3 rounded-2xl"><Building2 className="w-6 h-6 text-[#1e3a8a]" /></div>
                    <button onClick={() => setSelectedCenter(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">{selectedCenter.name}</h2>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[10px] text-gray-500 mb-1 font-bold">المحافظة</p><p className="font-bold text-sm text-gray-800">{selectedCenter.governorate}</p></div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[10px] text-gray-500 mb-1 font-bold">رقم التواصل</p><p className="font-bold text-sm text-gray-800 dir-ltr">{selectedCenter.contactNumber || '---'}</p></div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[10px] text-gray-500 mb-1 font-bold">ساعات العمل</p><p className="font-bold text-sm text-gray-800 uppercase">{selectedCenter.openingTime?.substring(0,5)} - {selectedCenter.closingTime?.substring(0,5)}</p></div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[10px] text-gray-500 mb-1 font-bold">الطاقة الاستيعابية</p><p className="font-bold text-sm text-gray-800">{selectedCenter.maxConcurrentVisits} حالة متزامنة</p></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[10px] text-gray-500 mb-1 font-bold">الموقع</p><p className="font-bold text-sm text-gray-800">{selectedCenter.address}</p></div>
                  <button onClick={() => setSelectedCenter(null)} className="w-full bg-white border border-gray-200 text-gray-700 h-14 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">إغلاق النافذة</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}