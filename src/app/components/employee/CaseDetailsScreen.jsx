import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, FileText, DollarSign, Briefcase, 
  Loader2, MapPin, AlertCircle, User, Shield, Baby, Users
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import api, { courtAPI } from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function CaseDetailsScreen({ caseData, onBack }) {
  const familyId = caseData?.familyId || caseData?.id;
  const caseId = caseData?.id || caseData?.caseId; 

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    family: null,
    caseInfo: null,
    custody: null,
    alimony: null
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) return "--";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} سنوات`;
  };

  useEffect(() => {
    const fetchFullData = async () => {
      if (!familyId) return;
      setLoading(true);
      
      try {
        // 1. جلب البيانات الأساسية (الأسرة والقضية)
        const [familyRes, caseRes] = await Promise.allSettled([
          courtAPI.getFamily(familyId),
          courtAPI.getCaseByFamily(familyId)
        ]);

        if (familyRes.status === 'rejected') {
           throw new Error("فشل تحميل بيانات الأسرة الأساسية");
        }
        
        const familyData = familyRes.value.data;
        const caseDataRaw = caseRes.status === 'fulfilled' ? caseRes.value.data : null;

        // تحديد القضية الصحيحة
        let validCase = null;
        if (caseDataRaw) {
            if (Array.isArray(caseDataRaw) && caseDataRaw.length > 0) validCase = caseDataRaw[0]; 
            else if (caseDataRaw.items && Array.isArray(caseDataRaw.items) && caseDataRaw.items.length > 0) validCase = caseDataRaw.items[0]; 
            else if (caseDataRaw.id) validCase = caseDataRaw; 
        }

        let detailsObj = {
          family: familyData,
          caseInfo: validCase,
          custody: null,
          alimony: null
        };

        // 2. جلب التفاصيل الفرعية المرتبطة بالقضية (الحضانة والنفقة فقط)
        if (validCase?.id) {
            const [alimRes, custRes] = await Promise.allSettled([
                api.get(`/api/court-cases/${validCase.id}/alimony`),
                api.get(`/api/court-cases/${validCase.id}/custodies`)
            ]);

            detailsObj.alimony = alimRes.status === 'fulfilled' ? alimRes.value.data : null;
            detailsObj.custody = custRes.status === 'fulfilled' ? custRes.value.data : null;
        }

        setData(detailsObj);
      } catch (err) {
        console.error("Master Fetch Error:", err);
        toast.error("حدث خطأ أثناء تحميل تفاصيل القضية.");
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [familyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" />
        <p className="text-gray-500 font-medium">جاري تحميل تفاصيل القضية...</p>
      </div>
    );
  }

  if (!data.family) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
              <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">تعذر تحميل بيانات القضية</h2>
              <button onClick={onBack} className="border px-4 py-2 rounded-lg hover:bg-gray-100 mt-4">العودة للقائمة</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      
      {/* Header الأساسي لصفحة القضية */}
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
                  القضية رقم: {data.caseInfo?.caseNumber || caseId?.substring(0,8)}
                </h1>
                <Badge className="bg-green-500/20 text-green-100 border-green-500/30 text-xs px-3 py-0.5 rounded-full font-bold">
                    {data.caseInfo?.status || 'نشطة'}
                </Badge>
            </div>
            <div className="flex items-center gap-4 text-blue-200 text-sm opacity-90 mt-2">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> أسرة: {data.family.father?.fullName?.split(' ')[0]} و {data.family.mother?.fullName?.split(' ')[0]}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> محكمة الأسرة المختصة</span>
            </div>
          </div>
          
          <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mr-auto">
             <Briefcase className="w-8 h-8 text-blue-100" />
          </div>
        </div>
      </div>

      {/* المحتوى المجمع - لوحة تحكم بسيطة ونظيفة (بدون تبويبات) */}
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* 1. ملخص قرارات المحكمة */}
        <Card className="p-6 bg-white border-border shadow-sm rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#1e3a8a]"></div>
            <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><Briefcase className="text-[#1e3a8a]" /> ملخص قرارات القضية</h3>
            
            {data.caseInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* الحضانة */}
                    <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3 text-purple-800 font-bold">
                            <Shield className="w-5 h-5" /> قرار الحضانة
                        </div>
                        {data.custody ? (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">الطرف الحاضن</p>
                                <p className="text-lg font-bold text-purple-900">{data.custody.custodialParentId === data.family.father?.id ? 'الأب' : 'الأم'}</p>
                            </div>
                        ) : <p className="text-sm text-gray-400">لم يتم تسجيل حضانة</p>}
                    </div>

                    {/* النفقة */}
                    <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3 text-green-800 font-bold">
                            <DollarSign className="w-5 h-5" /> قرار النفقة
                        </div>
                        {data.alimony ? (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">مبلغ النفقة</p>
                                <p className="text-lg font-bold text-green-900">{data.alimony.amount} ج.م <span className="text-sm font-normal">({data.alimony.frequency === 'Monthly' ? 'شهرياً' : 'ربع سنوي'})</span></p>
                            </div>
                        ) : <p className="text-sm text-gray-400">لم يتم تسجيل نفقة</p>}
                    </div>

                    {/* الزيارة (رسالة توجيهية بدلاً من جلب الجدول) */}
                    <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3 text-blue-800 font-bold">
                            <MapPin className="w-5 h-5" /> مكان الزيارة
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">تفاصيل الرؤية</p>
                            <p className="text-sm font-bold text-blue-900 leading-tight">مسجلة ومتاحة في ملف الأسرة</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">لا توجد بيانات مسجلة لهذه القضية حتى الآن.</div>
            )}
        </Card>

        {/* 2. بيانات الأطراف (الأب والأم) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><User className="w-6 h-6" /></div>
                    <div><h3 className="font-bold text-lg text-gray-800">بيانات الأب</h3><p className="text-sm text-gray-500">{data.family.father?.fullName}</p></div>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الرقم القومي:</span><span className="font-mono font-bold text-gray-700">{data.family.father?.nationalId}</span></div>
                    <div className="flex justify-between p-2"><span className="text-gray-500 font-bold">الهاتف:</span><span>{data.family.father?.phone || 'غير مسجل'}</span></div>
                </div>
            </Card>

            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600"><User className="w-6 h-6" /></div>
                    <div><h3 className="font-bold text-lg text-gray-800">بيانات الأم</h3><p className="text-sm text-gray-500">{data.family.mother?.fullName}</p></div>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500 font-bold">الرقم القومي:</span><span className="font-mono font-bold text-gray-700">{data.family.mother?.nationalId}</span></div>
                    <div className="flex justify-between p-2"><span className="text-gray-500 font-bold">الهاتف:</span><span>{data.family.mother?.phone || 'غير مسجل'}</span></div>
                </div>
            </Card>
        </div>

        {/* 3. بيانات الأطفال */}
        <Card className="p-6 bg-card border-border shadow-sm rounded-2xl mb-10">
          <h3 className="mb-6 font-bold text-lg flex items-center gap-2"><Baby className="text-[#1e3a8a]" /> الأطفال المشتركين ({data.family.children?.length || 0})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.family.children?.length > 0 ? data.family.children.map((child, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4 transition-all hover:bg-gray-100">
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
            )) : <div className="col-span-2 text-center py-8 text-gray-400 italic">لا توجد بيانات أطفال مسجلة.</div>}
          </div>
        </Card>

      </div>
    </div>
  );
}