import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Plus, Search, MapPin, Phone, Loader2,
  Building, School, X, AlertCircle, Eye, CheckCircle, Copy
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export function SchoolsManagement({ onNavigate, onBack }) {
  const [schools, setSchools] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states for adding a school
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Modal state for viewing details
  const [selectedSchool, setSelectedSchool] = useState(null);

  // New school form data
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    contactNumber: ''
  });

  // Success credentials state (to show username/password once)
  const [successCredentials, setSuccessCredentials] = useState(null);

  // ==================================================================================
  // 1. Fetch schools from server
  // ==================================================================================
  const fetchSchools = async (query = '') => {
    setLoading(true);
    try {
      const params = { PageNumber: 1, PageSize: 100 };
      if (query) params.Name = query;
      const response = await api.get('/api/schools', { params });

      const items = response.data?.items || [];
      setSchools(items);
      setTotalCount(response.data?.totalCount || items.length);
    } catch (err) {
      console.error("Error fetching schools:", err);
      toast.error("حدث خطأ أثناء جلب قائمة المدارس");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchSchools(searchTerm);

  useEffect(() => {
    fetchSchools();
  }, []);


  // ==================================================================================
  // 3. Register new school logic
  // ==================================================================================
  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.address || !newSchool.contactNumber) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: newSchool.name,
        address: newSchool.address,
        contactNumber: newSchool.contactNumber
      };

      const res = await api.post('/api/schools', payload);

      setSuccessCredentials(res.data);
      fetchSchools();
      setNewSchool({ name: '', address: '', contactNumber: '' });
      setShowAddModal(false);

    } catch (err) {
      console.error("Add School Error:", err);
      setError(err.response?.data?.detail || err.response?.data?.title || "فشل تسجيل المدرسة. قد يكون الاسم مسجلاً بالفعل.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ إلى الحافظة بنجاح");
  };

  const closeSuccessModal = () => {
    setSuccessCredentials(null);
  };

  // ==================================================================================
  // User Interface (UI)
  // ==================================================================================
  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">

      {/* 1. Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/2 opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold mb-1">المدارس المسجلة</h1>
          </div>
        </div>
      </div>

      <div>

        {/* 2. Search & Add Button */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث عن المدارس بالاسم..."
                className="w-full pr-12 h-12 rounded-xl bg-white border-none shadow-sm text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-sm h-12 px-6 rounded-xl gap-2 font-bold transition-transform hover:scale-105"
            >
              <Plus className="w-5 h-5" /> <span>تسجيل مدرسة جديدة</span>
            </Button>
          </div>

          <div className="flex justify-start px-2">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center text-[#1e3a8a] shadow-sm border border-gray-100">
                <Building className="w-7 h-7" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900 leading-none">{totalCount}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-2">إجمالي المدارس المسجلة</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Grid View */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
        ) : schools.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لم يتم العثور على مدارس</h3>
            <p className="text-gray-500">لا توجد مدارس تطابق بحثك. يمكنك تسجيل مدرسة جديدة بدلاً من ذلك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {schools.map((school) => (
              <div
                key={school.id}
                onClick={() => setSelectedSchool(school)} // Make card clickable to view details
                className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] p-6 group cursor-pointer hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors shadow-sm">
                    <School className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                    <Eye className="w-3 h-3" /> عرض التفاصيل
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-xl mb-4 line-clamp-1" title={school.name}>{school.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{school.governorate} - {school.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span dir="ltr">{school.contactNumber || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ School Details Modal */}
      {/* ============================================================== */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
          <div className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center text-right">
              <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                <School className="w-6 h-6" /> ملف المدرسة
              </h2>
              <button onClick={() => setSelectedSchool(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-4 text-right">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-right">
                <p className="text-xs text-blue-500 mb-1 font-bold">اسم المدرسة</p>
                <p className="font-bold text-blue-900 text-lg">{selectedSchool.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                  <p className="text-xs text-gray-500 mb-1 font-bold">المحافظة</p>
                  <p className="font-bold text-gray-800">{selectedSchool.governorate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                  <p className="text-xs text-gray-500 mb-1 font-bold">رقم التواصل</p>
                  <p className="font-bold text-gray-800" dir="ltr">{selectedSchool.contactNumber || 'غير متوفر'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                <p className="text-xs text-gray-500 mb-1 font-bold">العنوان الكامل</p>
                <p className="font-bold text-gray-800">{selectedSchool.address}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
                <p className="text-xs text-gray-500 mb-1 font-bold">البريد الإلكتروني الرسمي</p>
                <p className={`font-bold ${selectedSchool.email ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                  {selectedSchool.email || 'غير متوفر'}
                </p>
              </div>

              {/* Security Note */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mt-4 flex items-start gap-3 text-right">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">بيانات تسجيل الدخول</p>
                  <p className="text-xs text-amber-700 leading-relaxed">لأسباب أمنية، تظهر كلمات المرور مرة واحدة فقط عند الإنشاء. إذا فقدت المدرسة بياناتها، يرجى الاتصال بمسؤول النظام لإعادة التعيين.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setSelectedSchool(null)} className="w-full bg-white text-gray-700 border border-gray-200 h-14 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-sm">إغلاق النافذة</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Register New School Modal */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
          <div className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center text-right">
              <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                <Building className="w-6 h-6" /> تسجيل مدرسة جديدة
              </h2>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-5 text-right">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100"><AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="text-sm font-medium">{error}</span></div>}

              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">اسم المدرسة بالكامل</label>
                <input type="text" value={newSchool.name} onChange={e => setNewSchool({ ...newSchool, name: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 text-right" placeholder="مثال: مدرسة المستقبل للغات" />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">رقم التواصل (اختياري)</label>
                <input type="tel" value={newSchool.contactNumber} onChange={e => setNewSchool({ ...newSchool, contactNumber: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 text-right" placeholder="01xxxxxxxxx" />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">العنوان بالتفصيل</label>
                <input type="text" value={newSchool.address} onChange={e => setNewSchool({ ...newSchool, address: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 text-right" placeholder="الشارع، المنطقة..." />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button disabled={isSaving} onClick={handleAddSchool} className="flex-1 bg-[#1e3a8a] text-white h-14 rounded-2xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base border-none">
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "حفظ وتسجيل المدرسة"}
              </button>
              <button disabled={isSaving} onClick={() => setShowAddModal(false)} className="w-32 bg-white text-gray-600 border border-gray-200 h-14 rounded-2xl font-bold hover:bg-gray-100 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Success Credentials Modal */}
      {/* ============================================================== */}
      {successCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-center border border-gray-100" dir="rtl">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">تم تسجيل المدرسة!</h2>
            <p className="text-gray-500 mb-8 text-sm">تم إنشاء حساب مخصص. يرجى نسخ هذه البيانات ومشاركتها مع إدارة المدرسة.</p>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 mb-8 text-right relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 relative z-10"><School className="w-5" /> بيانات الحساب</h3>

              <div className="space-y-3 relative z-10">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex justify-between items-center group">
                  <div className="text-right">
                    <span className="text-xs text-emerald-500 block mb-1 uppercase tracking-widest font-bold">اسم المستخدم</span>
                    <span className="text-sm font-mono font-bold text-emerald-900">{successCredentials.username}</span>
                  </div>
                  <button onClick={() => copyToClipboard(successCredentials.username)} className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"><Copy className="w-4 h-4" /></button>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex justify-between items-center group">
                  <div className="text-right">
                    <span className="text-xs text-emerald-500 block mb-1 uppercase tracking-widest font-bold">كلمة المرور المؤقتة</span>
                    <span className="text-sm font-mono font-bold text-emerald-900">{successCredentials.temporaryPassword}</span>
                  </div>
                  <button onClick={() => copyToClipboard(successCredentials.temporaryPassword)} className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <button onClick={closeSuccessModal} className="bg-[#1e3a8a] text-white h-14 rounded-2xl font-bold w-full hover:bg-blue-800 transition-all text-lg shadow-lg border-none">تم، إغلاق</button>
          </div>
        </div>
      )}

    </div>
  );
}