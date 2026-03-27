import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, FileText, Briefcase,
  Loader2, AlertCircle, User, Users, Plus, Save, Clock, HelpCircle,
  Shield, MapPin, DollarSign, Calendar, ExternalLink, Trash2, Pencil, IdCard,
  Download, Paperclip, FileCode2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import api, { courtAPI, visitationAPI, lookupAPI, commonAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export function CaseDetailsScreen({ caseData, onBack, onNavigate }) {
  const familyId = caseData?.familyId;
  const caseId = caseData?.caseId;

  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    family: null,
    caseInfo: null,
    custody: null,
    schedule: null,
    alimony: null,
    visitations: [],
    paymentsDue: []
  });

  const [selectedPaymentDue, setSelectedPaymentDue] = useState(null);
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // --- Modal States ---
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAlimonyModal, setShowAlimonyModal] = useState(false);
  const [showCloseCaseModal, setShowCloseCaseModal] = useState(false);
  const [showPaymentAttemptsModal, setShowPaymentAttemptsModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: '', title: '' });
  const [locations, setLocations] = useState([]);
  const [locationCache, setLocationCache] = useState({});

  // --- Form States ---
  const [closureNotes, setClosureNotes] = useState('');
  const [isClosingCase, setIsClosingCase] = useState(false);
  const [custodyForm, setCustodyForm] = useState({ custodialParentId: '', startAt: '', endAt: '' });
  const [scheduleForm, setScheduleForm] = useState({ locationId: '', frequency: 'Weekly', startDate: '', endDate: '', startTime: '', endTime: '' });
  const [alimonyForm, setAlimonyForm] = useState({ amount: '', frequency: 'Monthly', startDate: '', endDate: '' });

  const fetchData = async () => {
    if (!caseId || !familyId) return;
    setLoading(true);
    try {
      const [familyRes, caseRes, custodyRes, scheduleRes, alimonyRes, visitRes] = await Promise.allSettled([
        courtAPI.getFamily(familyId),
        courtAPI.getCaseByFamily(familyId),
        courtAPI.getCustodyByCourtCase(caseId),
        courtAPI.getVisitationScheduleByCourtCase(caseId),
        courtAPI.getAlimonyByCourtCase(caseId),
        visitationAPI.list({ FamilyId: familyId, PageSize: 50 })
      ]);

      const newData = {
        family: null,
        caseInfo: null,
        custody: null,
        schedule: null,
        alimony: null,
        visitations: [],
        paymentsDue: []
      };

      if (familyRes.status === 'fulfilled') newData.family = familyRes.value.data;

      if (caseRes.status === 'fulfilled') {
        const cData = caseRes.value.data;
        // Handle array or object with items
        if (Array.isArray(cData)) {
          newData.caseInfo = cData.find(c => c.id === caseId) || cData[0];
        } else if (cData?.items) {
          newData.caseInfo = cData.items.find(c => c.id === caseId) || cData.items[0];
        } else {
          newData.caseInfo = cData;
        }
      }

      if (custodyRes.status === 'fulfilled') newData.custody = custodyRes.value.data;
      if (scheduleRes.status === 'fulfilled') newData.schedule = scheduleRes.value.data;

      if (alimonyRes.status === 'fulfilled' && alimonyRes.value.data) {
        newData.alimony = {
          ...alimonyRes.value.data,
          amount: (alimonyRes.value.data.amount || 0) / 100
        };
      }

      if (visitRes.status === 'fulfilled') {
        const vData = visitRes.value.data;
        newData.visitations = vData.items || (Array.isArray(vData) ? vData : []);
      }


      // If alimony exists, fetch payments due
      if (newData.alimony?.id) {
        try {
          const pdRes = await courtAPI.listPaymentsDueByAlimony(newData.alimony.id, { PageSize: 50 });
          newData.paymentsDue = (pdRes.data.items || (Array.isArray(pdRes.data) ? pdRes.data : [])).map(pd => ({
            ...pd,
            amount: (pd.amount || 0) / 100
          }));
        } catch (e) {
          console.warn("Failed to fetch payments due:", e);
        }
      }

      setData(newData);

      // Resolve location names for visitations AND schedule
      const locationIdsToResolve = new Set();
      if (newData.schedule?.locationId) locationIdsToResolve.add(newData.schedule.locationId);
      newData.visitations.forEach(v => {
        if (v.locationId) locationIdsToResolve.add(v.locationId);
      });

      const missingIds = Array.from(locationIdsToResolve).filter(id => id && !locationCache[id]);

      if (missingIds.length > 0) {
        const newResolved = { ...locationCache };
        await Promise.allSettled(missingIds.map(async id => {
          try {
            const res = await lookupAPI.getLocation(id);
            newResolved[id] = res.data.name;
          } catch (e) {
            newResolved[id] = 'Unknown Location';
          }
        }));
        setLocationCache(newResolved);
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل تفاصيل القضية.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId, familyId]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (showScheduleModal && locations.length === 0) {
        try {
          const res = await lookupAPI.getVisitationLocations({ PageSize: 1000 });
          setLocations(res.data.items || (Array.isArray(res.data) ? res.data : []));
        } catch (e) {
          toast.error("فشل تحميل قائمة المواقع.");
        }
      }
    };
    fetchLocations();
  }, [showScheduleModal]);

  const handleFetchPaymentAttempts = async (pd) => {
    setSelectedPaymentDue(pd);
    setShowPaymentAttemptsModal(true);
    setLoadingAttempts(true);
    try {
      const res = await courtAPI.listPaymentsHistory(pd.id, { PageSize: 50 });
      setPaymentAttempts(res.data.items || []);
    } catch (e) {
      toast.error("فشل تحميل محاولات الدفع.");
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    if (!documentId) return;
    try {
      toast.loading("جاري تحضير التحميل...", { id: 'downloading' });
      const res = await commonAPI.getDocument(documentId);

      const downloadUrl = res.data?.downloadUrl;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        toast.success("جاري فتح المستند...", { id: 'downloading' });
      } else {
        // Fallback approach if downloadUrl is missing in the response object
        const fallbackUrl = `${import.meta.env.VITE_API_URL}/api/documents/${documentId}`;
        window.open(fallbackUrl, '_blank');
        toast.success("جاري فتح المستند...", { id: 'downloading' });
      }
    } catch (e) {
      toast.error("فشل جلب المستند.", { id: 'downloading' });
      console.error(e);
    }
  };

  // --- Action Handlers ---
  const handleSaveCustody = async (e) => {
    e.preventDefault();
    try {
      if (data.custody?.id) {
        await courtAPI.updateCustody(data.custody.id, {
          newCustodialParentId: custodyForm.custodialParentId,
          startAt: new Date(custodyForm.startAt).toISOString(),
          endAt: custodyForm.endAt ? new Date(custodyForm.endAt).toISOString() : null
        });
      } else {
        await courtAPI.createCustody({
          courtCaseId: caseId,
          custodialParentId: custodyForm.custodialParentId,
          startAt: new Date(custodyForm.startAt).toISOString(),
          endAt: custodyForm.endAt ? new Date(custodyForm.endAt).toISOString() : null
        });
      }
      toast.success("تم تحديث الحضانة بنجاح");
      setShowCustodyModal(false);
      fetchData();
    } catch (e) {
      toast.error("فشل حفظ الحضانة");
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();

    // Server expects HH:mm:ss for time fields
    const formatTime = (t) => {
      if (!t) return t;
      const parts = t.split(':');
      if (parts.length === 2) return `${t}:00`;
      return t;
    };

    const payload = {
      ...scheduleForm,
      startTime: formatTime(scheduleForm.startTime),
      endTime: formatTime(scheduleForm.endTime)
    };

    try {
      if (data.schedule?.id) {
        await courtAPI.updateSchedule(data.schedule.id, {
          scheduleId: data.schedule.id,
          ...payload
        });
      } else {
        await courtAPI.createSchedule({ courtCaseId: caseId, ...payload });
      }
      toast.success("تم حفظ الجدول بنجاح");
      setShowScheduleModal(false);
      fetchData();
    } catch (e) {
      toast.error("فشل حفظ الجدول");
    }
  };

  const handleSaveAlimony = async (e) => {
    e.preventDefault();
    const piastreAmount = Math.round(parseFloat(alimonyForm.amount) * 100);
    const payload = { ...alimonyForm, amount: piastreAmount };

    try {
      if (data.alimony?.id) {
        await courtAPI.updateAlimony(data.alimony.id, payload);
      } else {
        await courtAPI.createAlimony({ courtCaseId: caseId, ...payload });
      }
      toast.success("تم حفظ النفقة بنجاح");
      setShowAlimonyModal(false);
      fetchData();
    } catch (e) {
      toast.error("فشل حفظ النفقة");
    }
  };

  const handleCloseCase = async (e) => {
    e.preventDefault();
    if (!closureNotes.trim()) {
      toast.error("Please provide closure notes.");
      return;
    }
    setIsClosingCase(true);
    try {
      await courtAPI.closeCase(caseId, closureNotes);
      toast.success("تم إغلاق القضية بنجاح");
      setShowCloseCaseModal(false);
      setClosureNotes('');
      fetchData();
    } catch (e) {
      toast.error(e.message || "فشل إغلاق القضية");
    } finally {
      setIsClosingCase(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.type === 'custody') {
      try {
        const promises = [courtAPI.deleteCustody(deleteModal.id)];
        if (data.schedule?.id) promises.push(courtAPI.deleteSchedule(data.schedule.id));
        if (data.alimony?.id) promises.push(courtAPI.deleteAlimony(data.alimony.id));

        await Promise.allSettled(promises);
        toast.success("تم حذف الحضانة والقواعد التابعة لها");
      } catch (e) {
        toast.error("خطأ أثناء الحذف المتسلسل");
      }
    } else if (deleteModal.type === 'schedule') {
      try {
        await courtAPI.deleteSchedule(deleteModal.id);
        toast.success("تم حذف الجدول");
      } catch (e) { toast.error("فشل حذف الجدول"); }
    } else if (deleteModal.type === 'alimony') {
      try {
        await courtAPI.deleteAlimony(deleteModal.id);
        toast.success("تم حذف قاعدة النفقة");
      } catch (e) { toast.error("فشل حذف النفقة"); }
    }

    setDeleteModal({ show: false, type: '', id: '', title: '' });
    fetchData();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" dir="rtl">
      <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" />
      <p className="text-gray-500 font-medium">جاري تحميل تفاصيل القضية...</p>
    </div>
  );

  const father = data.family?.father;
  const mother = data.family?.mother;

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">

      {/* --- Modals --- */}
      {showCustodyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="p-8 w-full max-w-md animate-in zoom-in duration-300 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="text-[#1e3a8a]" /> إدارة الحضانة</h2>
            <form onSubmit={handleSaveCustody} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">الوالد الحاضن</label>
                <select
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
                  value={custodyForm.custodialParentId}
                  onChange={e => setCustodyForm({ ...custodyForm, custodialParentId: e.target.value })}
                  required
                >
                  <option value="">اختر الوالد</option>
                  {father && <option value={father.id}>الأب: {father.fullName}</option>}
                  {mother && <option value={mother.id}>الأم: {mother.fullName}</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">تاريخ البدء</label>
                <input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={custodyForm.startAt} onChange={e => setCustodyForm({ ...custodyForm, startAt: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">تاريخ الانتهاء (اختياري)</label>
                <input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={custodyForm.endAt} onChange={e => setCustodyForm({ ...custodyForm, endAt: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCustodyModal(false)} className="flex-1 py-3 border rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold border-none">حفظ</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="p-8 w-full max-w-lg animate-in zoom-in duration-300 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-[#1e3a8a]" /> إدارة الجدول</h2>
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">الموقع</label>
                  <select className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={scheduleForm.locationId} onChange={e => setScheduleForm({ ...scheduleForm, locationId: e.target.value })} required>
                    <option value="">اختر الموقع</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">التكرار</label>
                  <select className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={scheduleForm.frequency} onChange={e => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}>
                    <option value="Daily">يومي</option>
                    <option value="Weekly">أسبوعي</option>
                    <option value="Monthly">شهري</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">تاريخ البدء</label><input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={scheduleForm.startDate} onChange={e => setScheduleForm({ ...scheduleForm, startDate: e.target.value })} required /></div>
                <div><label className="block text-sm font-bold mb-1">تاريخ الانتهاء (اختياري)</label><input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={scheduleForm.endDate} onChange={e => setScheduleForm({ ...scheduleForm, endDate: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">وقت البدء</label><input type="time" className="w-full p-3 bg-gray-50 border rounded-xl" value={scheduleForm.startTime} onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} required /></div>
                <div><label className="block text-sm font-bold mb-1">وقت الانتهاء</label><input type="time" className="w-full p-3 bg-gray-50 border rounded-xl" value={scheduleForm.endTime} onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} required /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 border rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold border-none">حفظ</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAlimonyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="p-8 w-full max-w-md animate-in zoom-in duration-300 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="text-[#1e3a8a]" /> إدارة النفقة</h2>
            <form onSubmit={handleSaveAlimony} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">المبلغ (ج.م)</label>
                <input type="number" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={alimonyForm.amount} onChange={e => setAlimonyForm({ ...alimonyForm, amount: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">التكرار</label>
                <select className="w-full p-3 bg-gray-50 border rounded-xl outline-none" value={alimonyForm.frequency} onChange={e => setAlimonyForm({ ...alimonyForm, frequency: e.target.value })}>
                  <option value="Daily">يومي</option>
                  <option value="Weekly">أسبوعي</option>
                  <option value="Monthly">شهري</option>
                  <option value="Yearly">سنوي</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">تاريخ البدء</label><input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={alimonyForm.startDate} onChange={e => setAlimonyForm({ ...alimonyForm, startDate: e.target.value })} required /></div>
                <div><label className="block text-sm font-bold mb-1">تاريخ الانتهاء (اختياري)</label><input type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={alimonyForm.endDate} onChange={e => setAlimonyForm({ ...alimonyForm, endDate: e.target.value })} /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAlimonyModal(false)} className="flex-1 py-3 border rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold border-none">حفظ</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showCloseCaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="p-8 w-full max-w-md animate-in zoom-in duration-300 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600"><Shield /> إغلاق القضية</h2>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد أنك تريد إغلاق هذه القضية؟ يجب تقديم ملاحظات القرار النهائي أو أسباب الإغلاق.</p>
            <form onSubmit={handleCloseCase} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">ملاحظات الإغلاق</label>
                <textarea
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-red-100 outline-none"
                  value={closureNotes}
                  onChange={e => setClosureNotes(e.target.value)}
                  placeholder="أدخل قرار المحكمة النهائي أو أسباب الإغلاق..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCloseCaseModal(false)} className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-colors">إلغاء</button>
                <button type="submit" disabled={isClosingCase} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 border-none">
                  {isClosingCase ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />} إغلاق القضية
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="p-8 w-full max-w-md animate-in slide-in-from-bottom-5 duration-300 border-red-100 shadow-2xl text-right" dir="rtl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">هل أنت متأكد؟</h2>
            <p className="text-gray-500 text-center mb-6 px-4">
              أنت على وشك حذف <span className="font-bold text-gray-800 underline decoration-red-200">{deleteModal.title}</span>. لا يمكن التراجع عن هذا الإجراء.
            </p>

            {deleteModal.type === 'custody' && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
                <p className="text-sm text-red-700 font-bold leading-relaxed text-center">
                  حذف الحضانة سيؤدي تلقائياً لحذف جميع القواعد الأخرى والزيارات والمدفوعات المتعلقة بها.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ show: false, type: '', id: '', title: '' })}
                className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold border hover:bg-white transition-all active:scale-95"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 border-none"
              >
                نعم، احذف
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* --- Payment Attempts Modal --- */}
      {showPaymentAttemptsModal && selectedPaymentDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="p-8 w-full max-w-4xl bg-white animate-in zoom-in shadow-2xl rounded-[2.5rem] relative overflow-hidden border-orange-100 text-right" dir="rtl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-2xl flex items-center gap-3 text-orange-900">
                <DollarSign className="w-10 h-10 p-2 bg-orange-100 rounded-2xl text-orange-600 shadow-sm" />
                <div className="flex flex-col">
                  <span>محاولات الدفع</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">تاريخ الاستحقاق: <span className="text-orange-600 font-mono">{new Date(selectedPaymentDue.dueDate).toLocaleDateString('ar-EG')}</span></span>
                </div>
              </h3>
              <button
                onClick={() => { setShowPaymentAttemptsModal(false); setSelectedPaymentDue(null); }}
                className="p-3 hover:bg-orange-50 rounded-2xl transition-all active:scale-90 text-gray-400 hover:text-orange-500 border-none"
              >
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </div>

            {loadingAttempts ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                <p className="text-gray-400 font-bold animate-pulse">جاري جلب سجل المحاولات...</p>
              </div>
            ) : paymentAttempts.length > 0 ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar pr-4">
                {paymentAttempts.map((attempt, i) => (
                  <div key={attempt.id || i} className="p-6 bg-white rounded-[1.5rem] border border-gray-200/60 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg tracking-tight">{attempt.method === 'Online' ? 'دفع إلكتروني' : (attempt.method || 'دفع إلكتروني')}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">طريقة الدفع</p>
                        </div>
                      </div>
                      <Badge className={`${attempt.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'} text-xs px-3 py-1 rounded-full font-bold`}>
                        {attempt.status === 'Paid' ? 'مدفوعة' : 'ناجحة'}
                      </Badge>
                    </div>

                    <div className="space-y-4 border-t border-gray-100 pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50/80 px-4 py-3 rounded-2xl border border-gray-100/50 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">تاريخ الإتمام</span>
                          <span className="text-gray-900 font-mono font-black text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            {new Date(attempt.paidAt).toLocaleString('ar-EG')}
                          </span>
                        </div>

                        {attempt.receiptUrl && (
                          <a
                            href={attempt.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 text-sm font-black text-orange-600 transition-all bg-orange-50/50 hover:bg-orange-600 hover:text-white px-4 py-3 rounded-2xl border border-orange-100/50 shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" /> عرض الإيصال
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <HelpCircle className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 italic text-xl font-medium">لم يتم العثور على سجل لمحاولات الدفع لهذا الاستحقاق.</p>
                <p className="text-gray-300 text-sm mt-2">قد لا يكون الوالد قد بدأ أي عمليات دفع بعد.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* --- Main Header --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8" dir="rtl">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/3 opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">رقم القضية: {data.caseInfo?.caseNumber || ''}</h1>
              <Badge className="bg-blue-500/20 text-blue-100 border-blue-500/30 text-xs px-3 py-0.5 rounded-full font-bold">{data.caseInfo?.status === 'Open' ? 'نشطة' : (data.caseInfo?.status === 'Closed' ? 'مغلقة' : 'نشطة')}</Badge>
            </div>
            <p className="text-blue-100 text-sm opacity-90 font-medium font-sans">تاريخ التقديم: {data.caseInfo?.filedAt ? new Date(data.caseInfo.filedAt).toLocaleDateString('ar-EG') : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 mt-4 md:mt-0">
          {data.caseInfo?.documentId && (
            <button
              onClick={() => handleDownloadDocument(data.caseInfo.documentId)}
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20"
            >
              <Paperclip className="w-4 h-4" /> عرض المستند
            </button>
          )}

          {data.caseInfo?.status !== 'Closed' && (
            <button
              onClick={() => setShowCloseCaseModal(true)}
              className="bg-red-600/90 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg border-none flex items-center gap-2"
            >
              إغلاق القضية
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6" dir="rtl">

        {/* 2. Decision Summary */}
        <Card className="p-6 bg-[#1e3a8a]/5 border-blue-100 shadow-sm rounded-[2rem] relative overflow-hidden flex flex-col gap-4 text-right">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-[#1e3a8a]"></div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1e3a8a] flex items-center gap-2">
              <FileText className="w-4 h-4" /> قرار المحكمة
            </h3>
          </div>
          <p className="text-base text-gray-800 leading-relaxed font-medium">
            {data.caseInfo?.decisionSummary || 'لم يتم تسجيل ملخص قرار رسمي لهذه القضية بعد.'}
          </p>
        </Card>

        {data.caseInfo?.status === 'Closed' && (
          <Card className="p-4 bg-red-50/50 border-red-100 shadow-sm rounded-xl relative overflow-hidden flex flex-col md:flex-row md:items-start gap-3 text-right">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600"></div>
            <div className="min-w-[200px] shrink-0 mt-0.5">
              <h3 className="font-bold text-xs uppercase tracking-widest text-red-600 mb-1">
                ملاحظات الإغلاق
              </h3>
              {data.caseInfo?.closedAt && (
                <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 font-sans">
                  <Clock className="w-3 h-3" /> {new Date(data.caseInfo.closedAt).toLocaleDateString('ar-EG')}
                </p>
              )}
            </div>
            <p className="text-base text-gray-800 leading-relaxed font-medium flex-1">
              {data.caseInfo?.closureNotes || 'تم إغلاق القضية دون تسجيل ملاحظات إغلاق محددة.'}
            </p>
          </Card>
        )}

        {/* 3. Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Custody */}
          <Card className="p-4 relative hover:shadow-md transition-shadow text-right">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <h4 className="font-bold text-gray-900 text-xl tracking-tight">تفاصيل الحضانة</h4>
              {data.custody && data.caseInfo?.status !== 'Closed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCustodyForm({
                        custodialParentId: data.custody?.custodialParentId || '',
                        startAt: data.custody?.startAt ? data.custody.startAt.split('T')[0] : '',
                        endAt: data.custody?.endAt ? data.custody.endAt.split('T')[0] : ''
                      });
                      setShowCustodyModal(true);
                    }}
                    className="p-1.5 text-[#1e3a8a] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Rule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, type: 'custody', id: data.custody.id, title: 'قاعدة الحضانة' })}
                    className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-none"
                    title="حذف القاعدة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {data.custody ? (
              <div className="grid grid-cols-1 gap-y-3 text-base">
                <div className="flex justify-between">
                  <span className="text-gray-500">الوالد الحاضن:</span>
                  <span className="font-bold text-blue-700">{data.custody.custodialParentId === father?.id ? 'الأب' : 'الأم'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة:</span>
                  <span className="font-medium font-sans">
                    {new Date(data.custody.startAt).toLocaleDateString('ar-EG')} - {data.custody.endAt ? new Date(data.custody.endAt).toLocaleDateString('ar-EG') : 'غير محددة'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <AlertCircle className="w-5 h-5 text-gray-300 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                  {data.caseInfo?.status === 'Closed' ? 'القضية مغلقة - للعرض فقط' : (data.custody ? 'القاعدة غير محددة' : 'مطلوب تحديد قاعدة الحضانة')}
                </p>
                {data.caseInfo?.status !== 'Closed' && (
                  <button
                    onClick={() => {
                      setCustodyForm({ custodialParentId: '', startAt: '', endAt: '' });
                      setShowCustodyModal(true);
                    }}
                    className="text-[10px] font-bold text-white bg-[#1e3a8a] px-4 py-1.5 rounded-lg hover:bg-[#2b4fa3] transition-colors flex items-center gap-1 shadow-sm active:scale-95 border-none"
                  >
                    <Plus className="w-3 h-3" /> إضافة حضانة
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Visitation Schedule */}
          <Card className="p-4 relative hover:shadow-md transition-shadow text-right">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <h4 className="font-bold text-gray-900 text-xl tracking-tight">جدول الزيارات</h4>
              {data.schedule && data.caseInfo?.status !== 'Closed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScheduleForm({
                        locationId: data.schedule?.locationId || '',
                        frequency: data.schedule?.frequency || 'Weekly',
                        startDate: data.schedule?.startDate || '',
                        endDate: data.schedule?.endDate || '',
                        startTime: data.schedule?.startTime || '',
                        endTime: data.schedule?.endTime || ''
                      });
                      setShowScheduleModal(true);
                    }}
                    className="p-1.5 text-[#1e3a8a] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Rule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, type: 'schedule', id: data.schedule.id, title: 'جدول الزيارات' })}
                    className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-none"
                    title="حذف القاعدة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {data.schedule ? (
              <div className="grid grid-cols-1 gap-y-3 text-base">
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg mb-1">
                  <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4 transition-colors text-blue-500" /> الموقع:</span>
                  <span className="font-bold truncate max-w-[150px]">{locationCache[data.schedule.locationId] || 'غير معروف'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التكرار:</span>
                  <span className="font-bold">{data.schedule.frequency === 'Weekly' ? 'أسبوعي' : (data.schedule.frequency === 'Daily' ? 'يومي' : 'شهري')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة:</span>
                  <span className="font-medium font-sans">{new Date(data.schedule.startDate).toLocaleDateString('ar-EG')} - {data.schedule.endDate ? new Date(data.schedule.endDate).toLocaleDateString('ar-EG') : 'غير محددة'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">الفترة الزمنية:</span>
                  <span className="font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 italic font-sans flex items-center gap-1" dir="rtl">
                    {formatTime12h(data.schedule.startTime)} - {formatTime12h(data.schedule.endTime)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <AlertCircle className="w-5 h-5 text-gray-300 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                  {data.caseInfo?.status === 'Closed' ? 'القضية مغلقة - للعرض فقط' : (data.custody ? 'الجدول غير محدد' : 'مطلوب تحديد قاعدة الحضانة')}
                </p>
                {data.caseInfo?.status !== 'Closed' && (
                  <button
                    onClick={() => {
                      if (!data.custody) {
                        toast.error("يرجى تحديد قاعدة الحضانة أولاً!");
                        return;
                      }
                      setScheduleForm({ locationId: '', frequency: 'Weekly', startDate: '', endDate: '', startTime: '', endTime: '' });
                      setShowScheduleModal(true);
                    }}
                    className={`text-[10px] font-bold text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95 border-none ${data.custody ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed opacity-75'
                      }`}
                  >
                    <Plus className="w-3 h-3" /> إضافة جدول
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Alimony */}
          <Card className="p-4 relative hover:shadow-md transition-shadow text-right">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <h4 className="font-bold text-gray-900 text-xl tracking-tight">تفاصيل النفقة</h4>
              {data.alimony && data.caseInfo?.status !== 'Closed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAlimonyForm({
                        amount: data.alimony?.amount || '',
                        frequency: data.alimony?.frequency || 'Monthly',
                        startDate: data.alimony?.startDate || '',
                        endDate: data.alimony?.endDate || ''
                      });
                      setShowAlimonyModal(true);
                    }}
                    className="p-1.5 text-[#1e3a8a] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Rule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, type: 'alimony', id: data.alimony.id, title: 'قاعدة النفقة' })}
                    className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-none"
                    title="حذف القاعدة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {data.alimony ? (
              <div className="grid grid-cols-1 gap-y-3 text-base">
                <div className="flex justify-between items-center bg-orange-50/50 p-3 rounded-xl mb-1">
                  <span className="text-gray-500 font-medium">المبلغ:</span>
                  <span className="font-black text-orange-700 text-lg font-sans">{data.alimony.amount} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التكرار:</span>
                  <span className="font-bold">{data.alimony.frequency === 'Monthly' ? 'شهري' : (data.alimony.frequency === 'Weekly' ? 'أسبوعي' : (data.alimony.frequency === 'Daily' ? 'يومي' : 'سنوي'))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة:</span>
                  <span className="font-medium font-sans">
                    {new Date(data.alimony.startDate).toLocaleDateString('ar-EG')} - {data.alimony.endDate ? new Date(data.alimony.endDate).toLocaleDateString('ar-EG') : 'غير محددة'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <AlertCircle className="w-5 h-5 text-gray-300 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                  {data.caseInfo?.status === 'Closed' ? 'القضية مغلقة - للعرض فقط' : (data.custody ? 'النفقة غير محددة' : 'مطلوب تحديد قاعدة الحضانة')}
                </p>
                {data.caseInfo?.status !== 'Closed' && (
                  <button
                    onClick={() => {
                      if (!data.custody) {
                        toast.error("يرجى تحديد قاعدة الحضانة أولاً!");
                        return;
                      }
                      setAlimonyForm({ amount: '', frequency: 'Monthly', startDate: '', endDate: '' });
                      setShowAlimonyModal(true);
                    }}
                    className={`text-[10px] font-bold text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95 border-none ${data.custody ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed opacity-75'
                      }`}
                  >
                    <Plus className="w-3 h-3" /> إضافة نفقة
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 4. History Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visitation History */}
          <Card className="p-0 overflow-hidden border-blue-100/50 shadow-sm rounded-[2rem] text-right">
            <div className="p-6 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-xl flex items-center gap-3"><Clock className="text-blue-600 w-6 h-6" /> سجل الزيارات</h3>
            </div>
            <div className="p-6 bg-gray-50/50 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {data.visitations.length > 0 ? data.visitations.map((v, i) => (
                <div key={v.id || i} className="p-6 bg-white rounded-[1.5rem] border border-gray-200/60 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-gray-900 text-lg tracking-tight font-sans">{new Date(v.startAt).toLocaleDateString('ar-EG')}</span>
                    <Badge className={`${v.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'} text-xs px-3 py-1 rounded-full font-bold`}>{v.status === 'Completed' ? 'مكتملة' : v.status}</Badge>
                  </div>
                  <div className="space-y-4 border-t border-gray-100 pt-5">
                    <div className="flex justify-between items-center bg-gray-50/80 px-4 py-3 rounded-2xl border border-gray-100/50">
                      <span className="text-gray-500 flex items-center gap-2.5 text-sm font-bold">
                        <MapPin className="w-4 h-4 text-blue-500" /> LOCATION:
                      </span>
                      <span className="text-gray-900 text-sm font-black truncate max-w-[200px]">
                        {locationCache[v.locationId] || v.locationName || 'Unknown Location'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 px-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-blue-600 uppercase text-[10px] tracking-[0.1em] bg-blue-50 px-2 py-0.5 rounded">Companion</span>
                        <span className="text-gray-900 font-mono font-black text-sm">{v.companionNationalId || '---'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-orange-600 uppercase text-[10px] tracking-[0.1em] bg-orange-50 px-2 py-0.5 rounded">Visitor</span>
                        <span className="text-gray-900 font-mono font-black text-sm">{v.nonCustodialNationalId || '---'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500 mt-2 px-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-bold italic text-sm text-gray-600">{formatTime12h(v.startAt.split('T')[1])} - {formatTime12h(v.endAt.split('T')[1])}</span>
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-20 text-gray-400 italic text-lg font-medium">No visit history recorded.</p>}
            </div>
          </Card>

          {/* Payments Due History */}
          <Card className="p-0 overflow-hidden border-orange-100/50 shadow-sm rounded-[2rem] text-right">
            <div className="p-6 border-b border-gray-100 bg-white" dir="rtl">
              <h3 className="font-bold text-xl flex items-center gap-3"><DollarSign className="text-orange-600 w-6 h-6" /> سجل الدفعات المستحقة</h3>
            </div>
            <div className="p-6 bg-gray-50/50 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {data.paymentsDue.length > 0 ? data.paymentsDue.map((pd, i) => (
                <div key={pd.id || i} onClick={() => handleFetchPaymentAttempts(pd)} className={`p-6 bg-white rounded-[1.5rem] border transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedPaymentDue?.id === pd.id ? 'border-orange-500 shadow-orange-100 ring-2 ring-orange-500/10' : 'border-gray-200/60 hover:border-orange-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-gray-900 text-xl tracking-tight font-sans">{pd.amount} ج.م</span>
                    <Badge className={`${pd.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} text-xs px-3 py-1 rounded-full font-bold`}>{pd.status === 'Paid' ? 'مدفوعة' : pd.status}</Badge>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">تاريخ الاستحقاق</p>
                      <p className="text-sm text-gray-700 font-mono font-black">{new Date(pd.dueDate).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      التفاصيل <ChevronLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-20 text-gray-400 italic text-lg font-medium">لم يتم العثور على دفعات مستحقة.</p>}
            </div>
          </Card>
        </div>


      </div>
    </div>
  );
}