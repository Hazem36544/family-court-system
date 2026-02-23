import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, FileText, DollarSign, Paperclip, Briefcase, 
  Loader2, Calendar, MapPin, AlertCircle, Clock, CheckCircle, XCircle, User, Users, Plus, Save, Shield
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import api, { courtAPI, visitationAPI } from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function FamilyDetailsScreen({ familyId, onBack }) {
  const currentFamilyId = typeof familyId === 'object' ? (familyId?.familyId || familyId?.id) : familyId;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [paymentsError, setPaymentsError] = useState(null); 
  const [locations, setLocations] = useState([]); 

  // --- حالات نافذة "إضافة قضية" ---
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);
  const [caseForm, setCaseForm] = useState({ caseNumber: '', decisionSummary: '' });

  // --- حالات نافذة "قرارات المحكمة" ---
  const [showDecisionsModal, setShowDecisionsModal] = useState(false);
  const [isSubmittingDecisions, setIsSubmittingDecisions] = useState(false);
  const [decisionsForm, setDecisionsForm] = useState({
    custodialParentId: '',
    custodyStartAt: new Date().toISOString().split('T')[0],
    addAlimony: false,
    alimonyAmount: '',
    alimonyFrequency: 'Monthly',
    alimonyStartDate: new Date().toISOString().split('T')[0],
    alimonyEndDate: '', 
    addVisitation: false,
    locationId: '',
    visitFrequency: 'Weekly',
    visitStartDate: new Date().toISOString().split('T')[0],
    visitStartTime: '10:00',
    visitEndTime: '13:00'
  });

  const [data, setData] = useState({
    family: null, caseInfo: null, custody: null, schedule: null, alimony: null, visits: [], payments: [], documents: []
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) return "--";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return `${age} سنوات`;
  };

  const fetchFullData = async () => {
    if (!currentFamilyId) { setLoading(false); return; }
    setLoading(true); setPaymentsError(null); 
    
    try {
      const [familyRes, caseRes, locRes] = await Promise.allSettled([
        courtAPI.getFamily(currentFamilyId),
        courtAPI.getCaseByFamily(currentFamilyId),
        api.get('/api/visitation-locations', { params: { PageNumber: 1, PageSize: 100 } }) 
      ]);

      if (familyRes.status === 'rejected') throw new Error("فشل تحميل بيانات الأسرة الأساسية");
      const familyData = familyRes.value.data;
      const caseDataRaw = caseRes.status === 'fulfilled' ? caseRes.value.data : null;
      if (locRes.status === 'fulfilled') setLocations(locRes.value.data?.items || []);

      let validCase = null;
      if (caseDataRaw) {
          if (Array.isArray(caseDataRaw) && caseDataRaw.length > 0) validCase = caseDataRaw[0]; 
          else if (caseDataRaw.items && Array.isArray(caseDataRaw.items) && caseDataRaw.items.length > 0) validCase = caseDataRaw.items[0]; 
          else if (caseDataRaw.id) validCase = caseDataRaw; 
      }

      let detailsObj = { family: familyData, caseInfo: validCase, custody: null, schedule: null, alimony: null, visits: [], payments: [], documents: [] };

      if (validCase?.id) {
        const [alim, cust, sched] = await Promise.allSettled([
          api.get(`/api/court-cases/${validCase.id}/alimony`),
          api.get(`/api/court-cases/${validCase.id}/custodies`),
          api.get(`/api/court-cases/${validCase.id}/visitation-schedules`)
        ]);
        detailsObj.alimony = alim.status === 'fulfilled' ? alim.value.data : null;
        detailsObj.custody = cust.status === 'fulfilled' ? cust.value.data : null;
        detailsObj.schedule = sched.status === 'fulfilled' ? sched.value.data : null;
      }

      const visitsRes = await api.get('/api/visitations', { params: { FamilyId: currentFamilyId, PageSize: 10 } }).catch(() => null);
      detailsObj.visits = visitsRes?.data?.items || [];
      
      try {
          const payRes = await api.get(`/api/families/${currentFamilyId}/payments-due`); 
          detailsObj.payments = payRes.data?.items || [];
      } catch (err) {
          if (err.response && err.response.status === 403) setPaymentsError("بانتظار تسجيل قرار الحضانة لفتح السجل المالي والزيارات.");
      }

      setData(detailsObj);
    } catch (err) { toast.error("حدث خطأ أثناء تحميل تفاصيل الأسرة."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFullData(); }, [currentFamilyId]);

  const handleCreateCase = async (e) => {
      e.preventDefault();
      setIsSubmittingCase(true);
      try {
          await api.post('/api/court-cases', { familyId: currentFamilyId, caseNumber: caseForm.caseNumber || null, decisionSummary: caseForm.decisionSummary || null, documentId: null });
          toast.success("تم إنشاء القضية بنجاح!");
          setShowCaseModal(false);
          fetchFullData(); 
      } catch (error) { toast.error("حدث خطأ أثناء إنشاء القضية."); } 
      finally { setIsSubmittingCase(false); }
  };

  // --- التعديل الجوهري في دالة الحفظ للتعامل مع "الاستكمال" ---
  const handleSaveDecisions = async (e) => {
      e.preventDefault();
      if (!data.caseInfo?.id) return toast.error("لا توجد قضية مسجلة!");

      setIsSubmittingDecisions(true);
      const courtCaseId = data.caseInfo.id;
      const promises = [];

      try {
          // 1. تسجيل الحضانة (فقط إذا لم تكن مسجلة مسبقاً)
          if (!data.custody) {
              if (!decisionsForm.custodialParentId) {
                  setIsSubmittingDecisions(false);
                  return toast.error("يجب تحديد الطرف الحاضن أولاً!");
              }
              promises.push(api.post('/api/custodies', {
                  courtCaseId: courtCaseId,
                  custodialParentId: decisionsForm.custodialParentId,
                  startAt: new Date(decisionsForm.custodyStartAt).toISOString()
              }));
          }

          const defaultEndDate = new Date();
          defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 15);
          const formattedEndDate = defaultEndDate.toISOString().split('T')[0];

          // 2. تسجيل النفقة (إذا لم تكن مسجلة والموظف فعل الزر)
          if (!data.alimony && decisionsForm.addAlimony && decisionsForm.alimonyAmount) {
              promises.push(api.post('/api/alimonies', {
                  courtCaseId: courtCaseId,
                  amount: parseInt(decisionsForm.alimonyAmount),
                  frequency: decisionsForm.alimonyFrequency,
                  startDate: decisionsForm.alimonyStartDate, 
                  endDate: decisionsForm.alimonyEndDate || formattedEndDate
              }));
          }

          // 3. تسجيل الزيارة (إذا لم تكن مسجلة والموظف فعل الزر)
          if (!data.schedule && decisionsForm.addVisitation && decisionsForm.locationId) {
              promises.push(api.post('/api/visitation-schedules', {
                  courtCaseId: courtCaseId,
                  locationId: decisionsForm.locationId,
                  frequency: decisionsForm.visitFrequency,
                  startDate: decisionsForm.visitStartDate,
                  endDate: formattedEndDate, 
                  startTime: decisionsForm.visitStartTime.length === 5 ? decisionsForm.visitStartTime + ":00" : decisionsForm.visitStartTime, 
                  endTime: decisionsForm.visitEndTime.length === 5 ? decisionsForm.visitEndTime + ":00" : decisionsForm.visitEndTime
              }));
          }

          if (promises.length > 0) {
              await Promise.all(promises);
              toast.success("تم إرسال القرارات بنجاح!");
              setShowDecisionsModal(false);
          } else {
              toast.error("لم تقم بإضافة أي قرارات جديدة.");
          }
          fetchFullData(); 
      } catch (error) {
          console.error("Submission Error:", error);
          toast.error("حدث خطأ أثناء حفظ بعض القرارات. يرجى مراجعة الباك إند.");
          fetchFullData(); 
      } finally {
          setIsSubmittingDecisions(false);
      }
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" /><p className="text-gray-500 font-medium">جاري تحميل الملف...</p></div>;
  if (!data.family) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6"><AlertCircle className="w-16 h-16 text-red-400 mb-4" /><h2 className="text-xl font-bold text-gray-800 mb-2">تعذر تحميل بيانات الأسرة</h2><button onClick={onBack} className="border px-4 py-2 rounded-lg hover:bg-gray-100">العودة للقائمة</button></div>;

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      
      {showCaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-in zoom-in duration-300">
                  <button onClick={() => setShowCaseModal(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><Briefcase className="w-6 h-6 text-[#1e3a8a]" /> إضافة قضية جديدة</h2>
                  <p className="text-sm text-gray-500 mb-6">يرجى إدخال تفاصيل القضية لربطها بملف هذه الأسرة.</p>
                  
                  <form onSubmit={handleCreateCase} className="space-y-5">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">رقم القضية (اختياري)</label>
                          <input type="text" value={caseForm.caseNumber} onChange={(e) => setCaseForm({...caseForm, caseNumber: e.target.value})} placeholder="مثال: 2026/154" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-mono" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">ملخص القرار / ملاحظات</label>
                          <textarea value={caseForm.decisionSummary} onChange={(e) => setCaseForm({...caseForm, decisionSummary: e.target.value})} placeholder="اكتب ملخصاً لقرار المحكمة أو ملاحظات إضافية هنا..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="submit" disabled={isSubmittingCase} className="flex-1 bg-[#1e3a8a] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                              {isSubmittingCase ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} إنشاء القضية
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showDecisionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 relative animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-6 border-b flex justify-between items-center rounded-t-3xl">
                      <div>
                          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Shield className="text-[#1e3a8a]" /> {data.custody ? 'استكمال قرارات المحكمة' : 'تسجيل قرارات المحكمة'}</h2>
                          <p className="text-sm text-gray-500">القضية رقم: {data.caseInfo?.caseNumber || data.caseInfo?.id?.substring(0,8)}</p>
                      </div>
                      <button onClick={() => setShowDecisionsModal(false)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-all"><XCircle className="w-6 h-6" /></button>
                  </div>

                  <form onSubmit={handleSaveDecisions} className="p-6 space-y-6">
                      
                      {/* 1. الحضانة */}
                      <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                          <h3 className="font-bold text-purple-900 flex items-center gap-2 border-b border-purple-100 pb-3"><Users size={20}/> 1. قرار الحضانة</h3>
                          {data.custody ? (
                              <div className="bg-white p-4 rounded-xl border border-purple-200 text-purple-800 flex items-center gap-3 shadow-sm">
                                  <CheckCircle className="w-6 h-6 text-purple-600" /> 
                                  <div>
                                      <p className="font-bold">تم تسجيل الحضانة مسبقاً بنجاح.</p>
                                      <p className="text-sm">الطرف الحاضن: {data.custody.custodialParentId === data.family.father?.id ? 'الأب' : 'الأم'}</p>
                                  </div>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-2">تحديد الطرف الحاضن</label>
                                      <select required className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.custodialParentId} onChange={e => setDecisionsForm({...decisionsForm, custodialParentId: e.target.value})}>
                                          <option value="">-- اختر الحاضن --</option>
                                          {data.family.mother?.id && <option value={data.family.mother.id}>الأم: {data.family.mother.fullName}</option>}
                                          {data.family.father?.id && <option value={data.family.father.id}>الأب: {data.family.father.fullName}</option>}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                                      <input type="date" required className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.custodyStartAt} onChange={e => setDecisionsForm({...decisionsForm, custodyStartAt: e.target.value})} />
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 2. النفقة */}
                          <div className={`p-6 border rounded-2xl space-y-4 transition-all ${decisionsForm.addAlimony || data.alimony ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-100 grayscale-[50%]'}`}>
                              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                  <h3 className="font-bold text-green-900 flex items-center gap-2"><DollarSign size={20}/> 2. قرار النفقة</h3>
                                  {!data.alimony && (
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={decisionsForm.addAlimony} onChange={e => setDecisionsForm({...decisionsForm, addAlimony: e.target.checked})} />
                                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-[-100%] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                      </label>
                                  )}
                              </div>
                              {data.alimony ? (
                                  <div className="bg-white p-3 rounded-xl border border-green-200 text-green-700 text-sm font-bold flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5"/> تم تسجيل النفقة مسبقاً.
                                  </div>
                              ) : decisionsForm.addAlimony && (
                                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-700 mb-1">مبلغ النفقة (ج.م)</label>
                                          <input type="number" required={decisionsForm.addAlimony} placeholder="المبلغ" className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.alimonyAmount} onChange={e => setDecisionsForm({...decisionsForm, alimonyAmount: e.target.value})} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ البدء</label>
                                              <input type="date" required={decisionsForm.addAlimony} className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.alimonyStartDate} onChange={e => setDecisionsForm({...decisionsForm, alimonyStartDate: e.target.value})} />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">دورية الدفع</label>
                                              <select className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.alimonyFrequency} onChange={e => setDecisionsForm({...decisionsForm, alimonyFrequency: e.target.value})}>
                                                  <option value="Monthly">شهرياً</option><option value="Quarterly">ربع سنوي</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* 3. الزيارة */}
                          <div className={`p-6 border rounded-2xl space-y-4 transition-all ${decisionsForm.addVisitation || data.schedule ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-100 grayscale-[50%]'}`}>
                              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                  <h3 className="font-bold text-blue-900 flex items-center gap-2"><MapPin size={20}/> 3. قرار الرؤية</h3>
                                  {!data.schedule && (
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={decisionsForm.addVisitation} onChange={e => setDecisionsForm({...decisionsForm, addVisitation: e.target.checked})} />
                                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-[-100%] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                      </label>
                                  )}
                              </div>
                              {data.schedule ? (
                                  <div className="bg-white p-3 rounded-xl border border-blue-200 text-blue-700 text-sm font-bold flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5"/> تم تسجيل الرؤية مسبقاً.
                                  </div>
                              ) : decisionsForm.addVisitation && (
                                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-700 mb-1">مركز الرؤية المعتمد</label>
                                          <select required={decisionsForm.addVisitation} className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.locationId} onChange={e => setDecisionsForm({...decisionsForm, locationId: e.target.value})}>
                                              <option value="">-- اختر المركز --</option>
                                              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                          </select>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ البدء</label>
                                              <input type="date" required={decisionsForm.addVisitation} className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.visitStartDate} onChange={e => setDecisionsForm({...decisionsForm, visitStartDate: e.target.value})} />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">التكرار</label>
                                              <select className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.visitFrequency} onChange={e => setDecisionsForm({...decisionsForm, visitFrequency: e.target.value})}>
                                                  <option value="Weekly">أسبوعي</option><option value="BiWeekly">كل أسبوعين</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">وقت الحضور</label>
                                              <input type="time" required={decisionsForm.addVisitation} className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.visitStartTime} onChange={e => setDecisionsForm({...decisionsForm, visitStartTime: e.target.value})} />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-700 mb-1">وقت الانصراف</label>
                                              <input type="time" required={decisionsForm.addVisitation} className="w-full p-3 bg-white rounded-xl border border-gray-200" value={decisionsForm.visitEndTime} onChange={e => setDecisionsForm({...decisionsForm, visitEndTime: e.target.value})} />
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="pt-4 sticky bottom-0 bg-white py-4 border-t mt-4">
                          <button type="submit" disabled={isSubmittingDecisions} className="w-full bg-[#1e3a8a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all flex justify-center items-center gap-3 disabled:opacity-70 shadow-lg">
                              {isSubmittingDecisions ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                              حفظ القرارات
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Header الأساسي للصفحة */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8 mx-auto max-w-[95%] mt-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full max-w-6xl mx-auto flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group">
            <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">
                  ملف الأسرة: {data.family.father?.fullName?.split(' ')[0] || '---'} و {data.family.mother?.fullName?.split(' ')[0] || '---'}
                </h1>
                {data.caseInfo ? (
                    <Badge className="bg-green-500/20 text-green-100 border-green-500/30 text-xs px-3 py-0.5 rounded-full font-bold">نشطة</Badge>
                ) : (
                    <Badge className="bg-orange-500/20 text-orange-100 border-orange-500/30 text-xs px-3 py-0.5 rounded-full font-bold">لا توجد قضية</Badge>
                )}
            </div>
            <div className="flex items-center gap-4 text-blue-200 text-sm opacity-90 mt-2">
               {data.caseInfo ? (
                   <>
                       <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> القضية: {data.caseInfo?.caseNumber || data.caseInfo?.id?.substring(0,8)}</span>
                       <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> محكمة الأسرة المختصة</span>
                   </>
               ) : (
                   <span className="text-orange-200 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> يرجى إنشاء قضية أولاً لإضافة الحضانة والنفقة</span>
               )}
            </div>
          </div>

          <div className="mr-auto relative z-10 flex gap-3">
             {!data.caseInfo && (
                 <button onClick={() => setShowCaseModal(true)} className="bg-white text-[#1e3a8a] px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm">
                     <Plus className="w-5 h-5" /> إضافة قضية
                 </button>
             )}
             
             {/* 🌟 الزر الذكي المحدث: يظهر إذا كان هناك أي قرار ناقص 🌟 */}
             {data.caseInfo && (!data.custody || !data.alimony || !data.schedule) && (
                 <button onClick={() => setShowDecisionsModal(true)} className="bg-yellow-400 text-yellow-950 px-5 py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2 shadow-lg animate-pulse hover:animate-none">
                     <Shield className="w-5 h-5" /> {data.custody ? 'استكمال القرارات' : 'إضافة قرارات المحكمة'}
                 </button>
             )}

             <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                 <Briefcase className="w-8 h-8 text-blue-100" />
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Tabs defaultValue="details" className="w-full" dir="rtl" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 h-12 bg-gray-100/80 p-1 rounded-2xl">
            <TabsTrigger value="details" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">التفاصيل</TabsTrigger>
            <TabsTrigger value="visits" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">الزيارات</TabsTrigger>
            <TabsTrigger value="alimony" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">النفقة</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">المستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {data.custody && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-700"><Shield className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-purple-900">قرار الحضانة مسجل</h3>
                            <p className="text-sm text-purple-700">الطرف الحاضن: {data.custody.custodialParentId === data.family.father?.id ? 'الأب' : 'الأم'} • تاريخ البداية: {new Date(data.custody.startAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>
                    <Badge className="bg-purple-600 text-white">مُفعل</Badge>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
                    <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><User className="w-6 h-6" /></div>
                        <div><h3 className="font-bold text-lg text-gray-800">بيانات الأب</h3><p className="text-sm text-gray-500">{data.family.father?.fullName}</p></div>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الرقم القومي:</span><span className="font-mono font-bold text-gray-700">{data.family.father?.nationalId}</span></div>
                        <div className="flex justify-between p-2"><span className="text-gray-500 font-bold">الهاتف:</span><span>{data.family.father?.phone}</span></div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الوظيفة:</span><span>{data.family.father?.job}</span></div>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
                    <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600"><User className="w-6 h-6" /></div>
                        <div><h3 className="font-bold text-lg text-gray-800">بيانات الأم</h3><p className="text-sm text-gray-500">{data.family.mother?.fullName}</p></div>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الرقم القومي:</span><span className="font-mono font-bold text-gray-700">{data.family.mother?.nationalId}</span></div>
                        <div className="flex justify-between p-2"><span className="text-gray-500 font-bold">الهاتف:</span><span>{data.family.mother?.phone}</span></div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الوظيفة:</span><span>{data.family.mother?.job}</span></div>
                    </div>
                </Card>
            </div>

            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
              <h3 className="mb-6 font-bold text-lg flex items-center gap-2"><span className="w-2 h-6 bg-[#1e3a8a] rounded-full"></span>الأطفال ({data.family.children?.length || 0})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.family.children?.length > 0 ? data.family.children.map((child, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${child.gender === 'Female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        {child.gender === 'Female' ? 'F' : 'M'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">{child.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{calculateAge(child.birthDate)} • {child.gender === 'Female' ? 'أنثى' : 'ذكر'}</p>
                      </div>
                    </div>
                  </div>
                )) : <div className="col-span-2 text-center py-8 text-gray-400 italic">لا توجد بيانات أطفال.</div>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visits">
             <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">سجل الزيارات</h3>
                {data.schedule ? (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                        <p className="text-blue-800 font-bold mb-2">جدول الرؤية المعتمد:</p>
                        <p className="text-sm text-blue-600">من {data.schedule.startTime} إلى {data.schedule.endTime} • التكرار: {data.schedule.frequency}</p>
                    </div>
                ) : null}

                {data.visits.length > 0 ? (
                    <div className="space-y-3">
                        {data.visits.map((visit, idx) => (
                            <div key={idx} className="p-4 border rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{visit.date}</p>
                                    <p className="text-sm text-gray-500">الحالة: {visit.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">لا توجد زيارات مسجلة حالياً.</div>
                )}
             </Card>
          </TabsContent>

          <TabsContent value="alimony" className="space-y-6">
             <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    بيانات النفقة الأساسية
                </h3>
                {data.alimony ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500">المبلغ</p>
                            <p className="text-xl font-bold text-[#1e3a8a]">{data.alimony.amount} ج.م</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500">دورية الدفع</p>
                            <p className="text-xl font-bold text-[#1e3a8a]">{data.alimony.frequency || 'غير محدد'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">لا توجد بيانات نفقة مسجلة لهذه القضية.</div>
                )}
             </Card>

             <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    سجل المدفوعات والمستحقات
                </h3>
                {paymentsError ? (
                    <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 border border-red-100 text-red-600">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{paymentsError}</p>
                    </div>
                ) : data.payments.length > 0 ? (
                    <div className="space-y-3">
                        {data.payments.map((payment, idx) => (
                            <div key={idx} className="p-4 border border-gray-100 bg-gray-50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">{payment.amount} ج.م</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        تاريخ الاستحقاق: {payment.dueDate || 'غير محدد'}
                                    </p>
                                </div>
                                <Badge className={payment.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}>
                                    {payment.status === 'Paid' ? 'تم الدفع' : 'مستحقة'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">لا توجد مستحقات مالية مسجلة في الوقت الحالي.</div>
                )}
             </Card>
          </TabsContent>

          <TabsContent value="documents">
             <Card className="p-10 text-center">
                 <div className="flex flex-col items-center justify-center opacity-50">
                    <Paperclip className="w-12 h-12 mb-3" />
                    <p className="text-gray-500 font-medium">لا توجد مستندات مرفوعة حالياً.</p>
                 </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}