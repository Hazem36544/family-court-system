import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Save, X, Users, Briefcase, 
  FileText, DollarSign, Baby, CheckCircle, 
  Loader2, MapPin, Calendar, Clock, AlertCircle
} from 'lucide-react';
import api, { courtAPI, lookupAPI } from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function EditFamilyScreen({ onBack, familyId }) {
  // ==================================================================================
  // 1. تعريف الحالة (State Definitions)
  // ==================================================================================
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);

  // حالات البيانات مهيأة بقيم افتراضية آمنة
  // ✅ أضفنا closureNotes لحالة القضية
  const [caseInfo, setCaseInfo] = useState({ id: '', caseNumber: '', caseDate: '', courtLocation: 'محكمة الأسرة - القاهرة', status: 'نشطة', closureNotes: '' });
  const [visitInfo, setVisitInfo] = useState({ id: '', schedule: '', locationId: '', notes: '', frequency: 'Weekly', startDate: '', startTime: '', endTime: '' });
  const [alimonyInfo, setAlimonyInfo] = useState({ id: '', amount: '', frequency: 'Monthly', status: 'منتظمة', startDate: '', endDate: '' });
  const [father, setFather] = useState({ id: '', fullName: '', nationalId: '', phone: '', email: '', job: '', address: '', birthDate: '', gender: 'Male' });
  const [mother, setMother] = useState({ id: '', fullName: '', nationalId: '', phone: '', email: '', job: '', address: '', birthDate: '', gender: 'Female' });
  const [children, setChildren] = useState([]);

  // للاحتفاظ بالحالة الأصلية (لمعرفة هل تم التغيير إلى مغلقة حديثاً أم كانت مغلقة من قبل)
  const [originalCaseStatus, setOriginalCaseStatus] = useState('نشطة');

  // ==================================================================================
  // 2. التحميل الأولي وملء الحقول (Auto-fill)
  // ==================================================================================
  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!familyId) return;
      setLoading(true);
      setError(null);
      
      try {
        // 1. جلب الأماكن
        const locRes = await lookupAPI.getVisitationLocations().catch(() => ({ data: { items: [] } }));
        setLocations(locRes.data?.items || []);

        // 2. جلب بيانات الأسرة
        const familyRes = await api.get(`/api/families/${familyId}`);
        const famData = familyRes.data || {};
        
        if (famData.father) setFather({ ...famData.father });
        if (famData.mother) setMother({ ...famData.mother });
        if (famData.children) setChildren(famData.children);

        // 3. جلب القضية المرتبطة
        const caseRes = await courtAPI.getCaseByFamily(familyId).catch(() => ({ data: null }));
        if (caseRes.data) {
          
          let caseData = null;
          if (caseRes.data.items && caseRes.data.items.length > 0) {
              caseData = caseRes.data.items[0];
          } else if (Array.isArray(caseRes.data) && caseRes.data.length > 0) {
              caseData = caseRes.data[0];
          } else if (caseRes.data.id || caseRes.data.courtCaseId) {
              caseData = caseRes.data;
          }
          
          if (caseData) {
              const currentCaseId = caseData.id || caseData.courtCaseId;
              const fetchedCaseNumber = caseData.caseNumber || caseData.courtCaseNumber || caseData.caseNo;
              const fallbackNumber = currentCaseId ? currentCaseId.substring(0, 8).toUpperCase() : 'غير متوفر';
              const fetchedStatus = caseData.status || (caseData.isClosed ? 'مغلقة' : 'نشطة');

              setCaseInfo({
                id: currentCaseId,
                caseNumber: fetchedCaseNumber || fallbackNumber,
                caseDate: caseData.filedAt?.split('T')[0] || caseData.createdAt?.split('T')[0] || '',
                courtLocation: 'محكمة الأسرة - القاهرة',
                status: fetchedStatus,
                closureNotes: caseData.decisionSummary || ''
              });
              
              setOriginalCaseStatus(fetchedStatus);

              // 4. جلب النفقة والزيارة بأمان تام
              if (currentCaseId) {
                  const [alimonyRes, scheduleRes] = await Promise.all([
                    courtAPI.getAlimonyByCourtCase(currentCaseId).catch(() => ({ data: null })),
                    courtAPI.getVisitationScheduleByCourtCase(currentCaseId).catch(() => ({ data: null }))
                  ]);

                  // معالجة النفقة
                  let alimonyData = alimonyRes.data?.items ? alimonyRes.data.items[0] : (Array.isArray(alimonyRes.data) ? alimonyRes.data[0] : alimonyRes.data);
                  if (alimonyData) {
                    setAlimonyInfo({
                      id: alimonyData.id || alimonyData.alimoneyId || '',
                      amount: alimonyData.amount || '',
                      frequency: alimonyData.frequency || 'Monthly',
                      status: 'منتظمة',
                      startDate: alimonyData.startDate?.split('T')[0] || '',
                      endDate: alimonyData.endDate?.split('T')[0] || ''
                    });
                  }

                  // معالجة جدول الزيارة
                  let scheduleData = scheduleRes.data?.items ? scheduleRes.data.items[0] : (Array.isArray(scheduleRes.data) ? scheduleRes.data[0] : scheduleRes.data);
                  if (scheduleData) {
                    setVisitInfo({
                      id: scheduleData.id || scheduleData.visitationScheduleId || '',
                      locationId: scheduleData.locationId || '',
                      frequency: scheduleData.frequency || 'Weekly',
                      startDate: scheduleData.startDate?.split('T')[0] || '',
                      startTime: scheduleData.startTime?.substring(0, 5) || '',
                      endTime: scheduleData.endTime?.substring(0, 5) || '',
                      notes: ''
                    });
                  }
              }
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("فشل في استرجاع بعض بيانات الملف. يرجى التأكد من اتصالك بالإنترنت.");
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [familyId]);

  // ==================================================================================
  // 3. دوال المعالجة (Helpers)
  // ==================================================================================
  const extractBirthDate = (id) => {
    if (!id || id.length !== 14) return new Date().toISOString().split('T')[0];
    const century = id[0] === '2' ? '19' : '20';
    const year = century + id.substring(1, 3);
    const month = id.substring(3, 5);
    const day = id.substring(5, 7);
    return `${year}-${month}-${day}`;
  };

  const clean = (obj) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
      if (typeof newObj[key] === 'string' && newObj[key].trim() === '') newObj[key] = null;
    });
    return newObj;
  };

  const handleFatherChange = (e) => setFather(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleMotherChange = (e) => setMother(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ==================================================================================
  // 4. تنفيذ التعديل (Update Logic)
  // ==================================================================================
  const handleUpdate = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // 1. تحديث الأب والأم (إذا كان لهم ID)
      const fatherPayload = { ...clean(father), birthDate: extractBirthDate(father.nationalId) };
      const motherPayload = { ...clean(mother), birthDate: extractBirthDate(mother.nationalId) };
      
      if (father.id) await courtAPI.updateParent(father.id, fatherPayload);
      if (mother.id) await courtAPI.updateParent(mother.id, motherPayload);

      // 2. تحديث حالة القضية (إذا تغيرت إلى مغلقة فقط)
      if (caseInfo.id && caseInfo.status === 'مغلقة' && originalCaseStatus !== 'مغلقة') {
          // ✅ إرسال طلب إغلاق القضية بناءً على السواجر
          await courtAPI.closeCase(caseInfo.id, caseInfo.closureNotes || "تم إغلاق القضية بدون تفاصيل");
      }

      // 3. تحديث أو إنشاء النفقة (فقط إذا تم إدخال مبلغ)
      const alimonyVal = Number(alimonyInfo.amount);
      if (caseInfo.id && alimonyVal > 0) {
          const alimonyPayload = {
              amount: alimonyVal,
              frequency: alimonyInfo.frequency || 'Monthly',
              startDate: alimonyInfo.startDate || new Date().toISOString().split('T')[0],
              endDate: alimonyInfo.endDate || '2040-01-01'
          };
          if (alimonyInfo.id) {
              await courtAPI.updateAlimony(alimonyInfo.id, alimonyPayload);
          } else {
              await courtAPI.createAlimony({ ...alimonyPayload, courtCaseId: caseInfo.id });
          }
      }

      // 4. تحديث أو إنشاء جدول الزيارة (فقط إذا كانت البيانات مكتملة)
      if (caseInfo.id && visitInfo.locationId && visitInfo.startTime && visitInfo.endTime) {
          const formattedStartTime = visitInfo.startTime.length === 5 ? `${visitInfo.startTime}:00` : visitInfo.startTime;
          const formattedEndTime = visitInfo.endTime.length === 5 ? `${visitInfo.endTime}:00` : visitInfo.endTime;
          
          const visitPayload = {
              locationId: visitInfo.locationId,
              frequency: visitInfo.frequency || 'Weekly',
              startDate: visitInfo.startDate || new Date().toISOString().split('T')[0],
              endDate: '2040-01-01',
              startTime: formattedStartTime,
              endTime: formattedEndTime
          };
          
          if (visitInfo.id) {
              await courtAPI.updateSchedule(visitInfo.id, visitPayload);
          } else {
              await courtAPI.createSchedule({ ...visitPayload, courtCaseId: caseInfo.id });
          }
      }

      toast.success("تم تحديث وحفظ بيانات القضية بنجاح!");
      onBack(); 
    } catch (err) {
      console.error("Update Error:", err);
      const msg = err.response?.data?.detail || err.response?.data?.title || "حدث خطأ أثناء حفظ التعديلات. يرجى التأكد من الصلاحيات.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  // ==================================================================================
  // 5. واجهة المستخدم (UI)
  // ==================================================================================
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50" dir="rtl">
              <Loader2 className="w-12 h-12 text-[#1e3a8a] animate-spin mb-4" />
              <p className="font-bold text-gray-600">جاري استرجاع بيانات الملف...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-xl mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <button onClick={onBack} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all group"><ChevronRight className="w-6 h-6 text-white" /></button>
            <div>
                <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">إدارة القضايا</p>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-wide">تعديل بيانات القضية</h1>
            </div>
          </div>
          <div className="hidden md:flex w-20 h-20 bg-white/10 rounded-3xl items-center justify-center border border-white/10 shadow-inner"><FileText className="w-10 h-10 text-white" /></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100 whitespace-pre-wrap"><AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="font-medium text-sm">{error}</span></div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === العمود الجانبي === */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* كارت معلومات القضية */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    {/* شريط أحمر للإشارة للإغلاق إذا كانت مغلقة */}
                    {caseInfo.status === 'مغلقة' && <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>}

                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> معلومات القضية</h3>
                    <div className="space-y-4">
                        <input type="text" value={caseInfo.caseNumber || ''} disabled className="w-full p-3 bg-gray-100 text-gray-500 rounded-xl border-none font-mono cursor-not-allowed" placeholder="رقم القضية" title="رقم القضية غير قابل للتعديل" />
                        <input type="date" value={caseInfo.caseDate || ''} disabled className="w-full p-3 bg-gray-100 text-gray-500 rounded-xl border-none cursor-not-allowed" title="تاريخ القضية" />
                        
                        <div className="w-full p-3 bg-gray-100/50 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-500 cursor-not-allowed">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">المحكمة المختصة (تتحدد تلقائياً)</span>
                        </div>

                        {/* ✅ تعديل حالة القضية */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block font-bold">حالة القضية</label>
                          <select 
                            value={caseInfo.status} 
                            disabled={originalCaseStatus === 'مغلقة'} 
                            onChange={(e) => setCaseInfo({...caseInfo, status: e.target.value})} 
                            className={`w-full p-3 rounded-xl border-none font-bold ${caseInfo.status === 'مغلقة' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
                            title={originalCaseStatus === 'مغلقة' ? "لا يمكن إعادة فتح قضية مغلقة" : ""}
                          >
                              <option value="نشطة">نشطة</option>
                              <option value="مغلقة">مغلقة (إيقاف نهائي)</option>
                          </select>
                        </div>

                        {/* ✅ حقل ملاحظات الإغلاق (يظهر فقط إذا اختار حالة مغلقة) */}
                        {caseInfo.status === 'مغلقة' && originalCaseStatus !== 'مغلقة' && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="text-xs text-red-500 mb-1 block font-bold">يرجى كتابة سبب الإغلاق *</label>
                             <textarea 
                                value={caseInfo.closureNotes || ''} 
                                onChange={(e) => setCaseInfo({...caseInfo, closureNotes: e.target.value})} 
                                className="w-full p-3 bg-red-50/50 border border-red-200 rounded-xl h-24 resize-none text-sm focus:ring-1 focus:ring-red-300" 
                                placeholder="مثال: تم الإغلاق بناءً على تصالح الطرفين أو حكم محكمة رقم..." 
                             />
                          </div>
                        )}

                        {originalCaseStatus === 'مغلقة' && caseInfo.closureNotes && (
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                             <p className="text-xs text-gray-400 font-bold mb-1">سبب الإغلاق المسجل:</p>
                             <p className="text-sm text-gray-700">{caseInfo.closureNotes}</p>
                           </div>
                        )}
                    </div>
                </div>

                {/* كارت النفقة والزيارة */}
                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 transition-opacity ${caseInfo.status === 'مغلقة' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> النفقة والزيارة</h3>
                    <div className="space-y-4">
                        {/* النفقة */}
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={alimonyInfo.amount || ''} onChange={(e) => setAlimonyInfo({...alimonyInfo, amount: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none" placeholder="النفقة (ج.م)" />
                            <select value={alimonyInfo.frequency || 'Monthly'} onChange={(e) => setAlimonyInfo({...alimonyInfo, frequency: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none"><option value="Monthly">شهري</option><option value="Quarterly">ربع سنوي</option></select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none" value={alimonyInfo.startDate || ''} onChange={e => setAlimonyInfo({...alimonyInfo, startDate: e.target.value})} title="تاريخ بداية النفقة" />
                             <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none" value={alimonyInfo.endDate || ''} onChange={e => setAlimonyInfo({...alimonyInfo, endDate: e.target.value})} title="تاريخ نهاية النفقة" />
                        </div>

                        <div className="border-t pt-3 mt-2">
                             {/* الزيارة */}
                             <div className="mb-3">
                                <label className="text-xs text-gray-400 mb-1 block">مكان الزيارة</label>
                                <select 
                                    value={visitInfo.locationId || ''} 
                                    onChange={(e) => setVisitInfo({...visitInfo, locationId: e.target.value})} 
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                                >
                                    <option value="">اختر المكان...</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                             </div>
                             
                             <textarea value={visitInfo.notes || ''} onChange={(e) => setVisitInfo({...visitInfo, notes: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none h-20 resize-none text-sm mb-3" placeholder="ملاحظات التعديل..." />

                             <div className="grid grid-cols-2 gap-3 mb-3">
                                 <input type="time" className="w-full p-3 bg-gray-50 rounded-xl border-none" value={visitInfo.startTime || ''} onChange={e => setVisitInfo({...visitInfo, startTime: e.target.value})} title="وقت الحضور" />
                                 <input type="time" className="w-full p-3 bg-gray-50 rounded-xl border-none" value={visitInfo.endTime || ''} onChange={e => setVisitInfo({...visitInfo, endTime: e.target.value})} title="وقت الانصراف" />
                             </div>
                             
                             <select value={visitInfo.frequency || 'Weekly'} onChange={(e) => setVisitInfo({...visitInfo, frequency: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none mb-3"><option value="Weekly">أسبوعي</option><option value="BiWeekly">كل أسبوعين</option></select>
                             <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none mb-3" value={visitInfo.startDate || ''} onChange={e => setVisitInfo({...visitInfo, startDate: e.target.value})} title="تاريخ بدء الزيارة" />
                        </div>
                    </div>
                </div>
            </div>

            {/* === العمود الرئيسي === */}
            <div className="lg:col-span-8 space-y-8">
                {/* كروت الأب والأم */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* بيانات الأب */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-blue-200 transition-all">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3 border-b pb-4"><Users className="text-blue-600" /> بيانات الأب</h3>
                        <div className="space-y-4">
                            <input type="text" name="fullName" placeholder="الاسم الرباعي" value={father.fullName || ''} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                            <input type="text" name="nationalId" placeholder="الرقم القومي (غير قابل للتعديل)" disabled value={father.nationalId || ''} className="w-full p-3 bg-gray-100 text-gray-500 rounded-xl border-none font-mono cursor-not-allowed" title="الرقم القومي غير قابل للتعديل بعد الإنشاء" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="tel" name="phone" placeholder="رقم الهاتف" value={father.phone || ''} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                                <input type="text" name="job" placeholder="الوظيفة" value={father.job || ''} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                            </div>
                            <input type="text" name="address" placeholder="العنوان" value={father.address || ''} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                             <input type="email" name="email" placeholder="البريد الإلكتروني" value={father.email || ''} onChange={handleFatherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                        </div>
                    </div>
                    {/* بيانات الأم */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-pink-200 transition-all">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3 border-b pb-4"><Users className="text-pink-600" /> بيانات الأم</h3>
                        <div className="space-y-4">
                            <input type="text" name="fullName" placeholder="الاسم الرباعي" value={mother.fullName || ''} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-100" />
                            <input type="text" name="nationalId" placeholder="الرقم القومي (غير قابل للتعديل)" disabled value={mother.nationalId || ''} className="w-full p-3 bg-gray-100 text-gray-500 rounded-xl border-none font-mono cursor-not-allowed" title="الرقم القومي غير قابل للتعديل بعد الإنشاء" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="tel" name="phone" placeholder="رقم الهاتف" value={mother.phone || ''} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                                <input type="text" name="job" placeholder="الوظيفة" value={mother.job || ''} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                            </div>
                            <input type="text" name="address" placeholder="العنوان" value={mother.address || ''} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                             <input type="email" name="email" placeholder="البريد الإلكتروني" value={mother.email || ''} onChange={handleMotherChange} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                        </div>
                    </div>
                </div>

                {/* كارت الأطفال (للعرض فقط) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-4"><Baby className="text-green-600" /> الأطفال المسجلون</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold">للعرض فقط</span>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-xl mb-6 text-sm text-blue-800 font-medium">
                        لا يمكن إضافة أو إزالة أطفال من ملف الأسرة بعد إنشائه لضمان استقرار السجلات القانونية.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.length > 0 ? children.map((child, index) => (
                            <div key={child.id || index} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${child.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                        <Baby />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{child.fullName || child.name || 'غير مسجل'}</p>
                                        <span className="text-xs text-gray-500">{child.birthDate?.split('T')[0] || 'تاريخ الميلاد غير متوفر'}</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-400 py-8 col-span-2 border border-dashed rounded-2xl">لا يوجد أطفال مسجلين</p>}
                    </div>
                </div>
            </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4 pb-10">
            <button 
                onClick={handleUpdate} 
                disabled={isSaving || originalCaseStatus === 'مغلقة'} 
                className="flex-1 bg-[#1e3a8a] text-white h-16 rounded-2xl font-bold text-xl hover:bg-blue-800 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-7 h-7" />}
                {originalCaseStatus === 'مغلقة' ? 'القضية مغلقة (لا يمكن التعديل)' : (isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات النهائية')}
            </button>
            <button onClick={onBack} disabled={isSaving} className="w-48 bg-white text-gray-600 border border-gray-200 h-16 rounded-2xl font-bold hover:bg-gray-50 transition-all text-lg">إلغاء</button>
        </div>
      </div>
    </div>
  );
}