import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Save, UserPlus, Users, Briefcase, 
  Baby, Trash2, CheckCircle, Copy, Loader2, AlertCircle
} from 'lucide-react';
import api, { courtAPI } from '../../../services/api'; 

export function NewFamilyScreen({ onBack, onSave, familyData }) {
  const isEditMode = !!familyData;

  const [schoolsList, setSchoolsList] = useState([]); 

  const [father, setFather] = useState({
    fullName: '', nationalId: '', phone: '', email: '', 
    job: '', address: '', birthDate: '', gender: 'Male'
  });

  const [mother, setMother] = useState({
    fullName: '', nationalId: '', phone: '', email: '', 
    job: '', address: '', birthDate: '', gender: 'Female'
  });

  const [children, setChildren] = useState([]);
  const [newChild, setNewChild] = useState({
    name: '', birthDate: '', gender: 'Male', school: '', studentCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [successData, setSuccessData] = useState({
      family: null
  });

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const schoolRes = await api.get('/api/schools', { params: { PageNumber: 1, PageSize: 100 } });
            if (schoolRes.data && schoolRes.data.items) {
                setSchoolsList(schoolRes.data.items);
            }
        } catch (e) {
            console.warn("⚠️ فشل تحميل قائمة المدارس", e);
        }
    };
    
    fetchInitialData();

    if (familyData) {
      setFather(prev => ({ ...prev, ...familyData.father }));
      setMother(prev => ({ ...prev, ...familyData.mother }));
      setChildren(familyData.children || []);
    }
  }, [familyData]);

  const extractBirthDate = (id) => {
    if (!id || id.length !== 14) return new Date().toISOString().split('T')[0];
    const century = id[0] === '2' ? '19' : '20';
    const year = century + id.substring(1, 3);
    const month = id.substring(3, 5);
    const day = id.substring(5, 7);
    return `${year}-${month}-${day}`;
  };

  const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const clean = (obj) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
      if (typeof newObj[key] === 'string' && newObj[key].trim() === '') {
        newObj[key] = null;
      }
    });
    return newObj;
  };

  const handleFatherChange = (e) => setFather({ ...father, [e.target.name]: e.target.value });
  const handleMotherChange = (e) => setMother({ ...mother, [e.target.name]: e.target.value });
  
  const addChild = () => {
    if (!newChild.name) return;
    setChildren([...children, { ...newChild, id: Date.now() }]);
    setNewChild({ 
      name: '', birthDate: '', gender: 'Male', school: '', studentCode: '' 
    });
  };

  const removeChild = (id) => setChildren(children.filter(c => c.id !== id));

  const copyToClipboard = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
  };

  const getSchoolName = (schoolId) => {
      if (!schoolId) return 'مدرسة غير محددة';
      const school = schoolsList.find(s => s.id === schoolId);
      return school ? school.name : 'مدرسة غير محددة';
  };

  // ==================================================================================
  // تنفيذ الحفظ (Submit Logic) - مخصص لإنشاء الأسرة فقط
  // ==================================================================================
  const handleSubmit = async () => {
    if (!father.nationalId || !mother.nationalId || !father.fullName) {
      setError("يرجى إدخال البيانات الأساسية (الاسم والرقم القومي) للأب والأم");
      window.scrollTo(0, 0);
      return;
    }

    let finalChildren = [...children];
    if (newChild.name && newChild.name.trim() !== '') {
      finalChildren.push({ ...newChild, id: Date.now() });
      setChildren(finalChildren);
      setNewChild({ name: '', birthDate: '', gender: 'Male', school: '', studentCode: '' });
    }

    setLoading(true);
    setError(null);

    try {
      const processedChildren = finalChildren.map(c => ({
        fullName: c.name,
        birthDate: c.birthDate ? new Date(c.birthDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        gender: c.gender,
        schoolId: (c.school && isUUID(c.school)) ? c.school : null
      }));

      const familyPayload = {
        father: { 
            ...clean(father), 
            birthDate: extractBirthDate(father.nationalId),
            job: father.job || null,
            address: father.address || null,
            email: father.email || null,
            phone: father.phone || null
        },
        mother: { 
            ...clean(mother), 
            birthDate: extractBirthDate(mother.nationalId),
            job: mother.job || null,
            address: mother.address || null,
            email: mother.email || null,
            phone: mother.phone || null
        },
        children: processedChildren 
      };

      console.log("1. Sending Family Payload...");
      const familyRes = await courtAPI.enrollFamily(familyPayload);
      setSuccessData({ family: familyRes.data });

    } catch (err) {
      console.error("❌ Fatal Error:", err);
      const msg = err.response?.data?.detail || err.response?.data?.title || "فشل في إنشاء الملف. يرجى مراجعة صحة البيانات وتغيير الرقم القومي إذا كان مسجلاً مسبقاً.";
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================================================
  // واجهة المستخدم (UI)
  // ==================================================================================

  if (successData.family) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 max-w-4xl w-full text-center border border-gray-100 animate-in zoom-in duration-300">
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">تم فتح الملف بنجاح!</h2>
           
           <p className="text-gray-500 mb-8">تم تسجيل الأسرة وإصدار بيانات الدخول بنجاح.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right">
              {/* حساب الأب */}
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
                 <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 relative z-10"><Users className="w-5" /> حساب الأب</h3>
                 <div className="space-y-3 relative z-10">
                    <div className="bg-white p-3 rounded-xl border border-blue-200 flex justify-between items-center">
                       <span className="text-sm font-mono font-bold text-blue-800 truncate">{successData.family.fatherCredential?.username}</span>
                       <Copy className="w-4 h-4 cursor-pointer text-blue-500 flex-shrink-0" onClick={() => copyToClipboard(successData.family.fatherCredential?.username)} />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-200 flex justify-between items-center">
                       <span className="text-sm font-mono font-bold text-blue-800 truncate">{successData.family.fatherCredential?.temporaryPassword}</span>
                       <Copy className="w-4 h-4 cursor-pointer text-blue-500 flex-shrink-0" onClick={() => copyToClipboard(successData.family.fatherCredential?.temporaryPassword)} />
                    </div>
                 </div>
              </div>

              {/* حساب الأم */}
              <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-20 h-20 bg-pink-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
                 <h3 className="font-bold text-pink-900 mb-4 flex items-center gap-2 relative z-10"><Users className="w-5" /> حساب الأم</h3>
                 <div className="space-y-3 relative z-10">
                    <div className="bg-white p-3 rounded-xl border border-pink-200 flex justify-between items-center">
                       <span className="text-sm font-mono font-bold text-pink-800 truncate">{successData.family.motherCredential?.username}</span>
                       <Copy className="w-4 h-4 cursor-pointer text-pink-500 flex-shrink-0" onClick={() => copyToClipboard(successData.family.motherCredential?.username)} />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-pink-200 flex justify-between items-center">
                       <span className="text-sm font-mono font-bold text-pink-800 truncate">{successData.family.motherCredential?.temporaryPassword}</span>
                       <Copy className="w-4 h-4 cursor-pointer text-pink-500 flex-shrink-0" onClick={() => copyToClipboard(successData.family.motherCredential?.temporaryPassword)} />
                    </div>
                 </div>
              </div>
           </div>
           
           <button onClick={onSave} className="bg-[#1e3a8a] text-white px-8 py-4 rounded-2xl font-bold w-full hover:bg-blue-800 transition-all text-lg shadow-lg">إغلاق والعودة للقائمة</button>
        </div>
      </div>
    );
  }

  // --- الشاشة الرئيسية ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <button onClick={onBack} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all group"><ChevronRight className="w-6 h-6 text-white" /></button>
            <div><p className="text-blue-200 text-sm font-medium mb-1 opacity-90">إدارة الأسر</p><h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-wide">{isEditMode ? 'تعديل الملف' : 'تسجيل أسرة جديدة'}</h1></div>
          </div>
          <div className="hidden md:flex w-20 h-20 bg-white/10 rounded-3xl items-center justify-center border border-white/10 shadow-inner"><UserPlus className="w-10 h-10 text-white" /></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 whitespace-pre-wrap"><AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="font-medium text-sm">{error}</span></div>}

        {/* 🌟 الصف الأول: الأب والأم (عمودين متساويين) 🌟 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* بيانات الأب */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-blue-200 transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3 border-b pb-4"><Users className="text-blue-600" /> بيانات الأب</h3>
                <div className="space-y-4">
                    <input type="text" name="fullName" placeholder="الاسم الرباعي" value={father.fullName} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                    <input type="text" name="nationalId" placeholder="الرقم القومي" maxLength="14" value={father.nationalId} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none font-mono" />
                    <input type="tel" name="phone" placeholder="رقم الهاتف" value={father.phone} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                    <input type="text" name="job" placeholder="الوظيفة" value={father.job} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                    <input type="text" name="address" placeholder="العنوان" value={father.address} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                </div>
            </div>

            {/* بيانات الأم */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-pink-200 transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3 border-b pb-4"><Users className="text-pink-600" /> بيانات الأم</h3>
                <div className="space-y-4">
                    <input type="text" name="fullName" placeholder="الاسم الرباعي" value={mother.fullName} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-100" />
                    <input type="text" name="nationalId" placeholder="الرقم القومي" maxLength="14" value={mother.nationalId} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none font-mono" />
                    <input type="tel" name="phone" placeholder="رقم الهاتف" value={mother.phone} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                    <input type="text" name="job" placeholder="الوظيفة" value={mother.job} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                    <input type="text" name="address" placeholder="العنوان" value={mother.address} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                </div>
            </div>
            
        </div>

        {/* 🌟 الصف الثاني: كارت إضافة الأطفال بعرض الشاشة بالكامل 🌟 */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-4 border-b pb-4"><Baby className="text-green-600" /> بيانات الأطفال</h3>
            <div className="bg-gray-50 p-6 rounded-3xl mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input type="text" value={newChild.name} onChange={(e) => setNewChild({...newChild, name: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none" placeholder="اسم الطفل" />
                    <input type="date" value={newChild.birthDate} onChange={(e) => setNewChild({...newChild, birthDate: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none" />
                    <select value={newChild.gender} onChange={(e) => setNewChild({...newChild, gender: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none"><option value="Male">ذكر</option><option value="Female">أنثى</option></select>
                    <input type="text" value={newChild.studentCode} onChange={(e) => setNewChild({...newChild, studentCode: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none" placeholder="كود الطالب" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select 
                        value={newChild.school} 
                        onChange={(e) => setNewChild({...newChild, school: e.target.value})} 
                        className="w-full p-3 bg-white rounded-xl border-none text-gray-600 text-sm"
                    >
                        <option value="">اختر المدرسة (اختياري)...</option>
                        {schoolsList.map(school => (
                            <option key={school.id} value={school.id}>
                                {school.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={addChild} className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"><UserPlus size={20} /> إضافة الطفل للقائمة</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {children.length > 0 ? children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${child.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}><Baby /></div>
                            <div>
                                <p className="font-bold text-gray-800">{child.name}</p>
                                <span className="text-xs text-gray-500">{child.birthDate} • {getSchoolName(child.school)} {child.studentCode ? ` (${child.studentCode})` : ''}</span>
                            </div>
                        </div>
                        <button onClick={() => removeChild(child.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 size={18}/></button>
                    </div>
                )) : <p className="col-span-full text-center text-gray-400 py-8 border border-dashed rounded-2xl">لم يتم إضافة أطفال بعد</p>}
            </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4 pb-10">
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] text-white h-16 rounded-2xl font-bold text-xl hover:bg-blue-800 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-7 h-7" />}
                {loading ? 'جاري الحفظ والإنشاء...' : 'حفظ وإنشاء الملف'}
            </button>
            <button onClick={onBack} disabled={loading} className="w-48 bg-white text-gray-600 border border-gray-200 h-16 rounded-2xl font-bold hover:bg-gray-50 transition-all text-lg">إلغاء</button>
        </div>
      </div>
    </div>
  );
}