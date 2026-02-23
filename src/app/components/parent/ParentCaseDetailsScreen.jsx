import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Users, MapPin, Scale, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { courtAPI, visitationAPI } from '/src/services/api'; // استيراد الخدمات
import { toast } from 'react-hot-toast';

export function ParentCaseDetailsScreen({ familyId, onBack }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    caseInfo: null,
    custody: null,
    schedule: null,
    alimony: null,
    visitations: [],
    payments: [],
    children: [],
    family: null
  });

  // دالة مساعدة لحساب العمر
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} سنوات`;
  };

  // دالة لجلب كل البيانات
  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!familyId) return;
      setIsLoading(true);

      try {
        // 1. جلب بيانات الأسرة (للأطفال والأبوين)
        const familyReq = courtAPI.getFamily(familyId);
        // 2. جلب بيانات القضية
        const caseReq = courtAPI.getCaseByFamily(familyId);
        
        const [familyRes, caseRes] = await Promise.all([familyReq, caseReq]);
        
        const familyData = familyRes.data;
        const caseData = caseRes.data; // قد تكون null لو مفيش قضية لسه

        let details = {
          family: familyData,
          children: familyData.children || [],
          caseInfo: caseData,
          custody: null,
          schedule: null,
          alimony: null,
          visitations: [],
          payments: []
        };

        // لو فيه قضية، نجيب باقي التفاصيل المعتمدة عليها
        if (caseData && caseData.id) {
          const caseId = caseData.id;

          // نستخدم allSettled عشان لو حاجة مش موجودة (404) ميتعملش كراش للباقي
          const results = await Promise.allSettled([
            courtAPI.getAlimonyByCourtCase(caseId),         // 0
            courtAPI.getCustodyByCourtCase(caseId),         // 1
            courtAPI.getVisitationScheduleByCourtCase(caseId), // 2
            visitationAPI.list({ FamilyId: familyId, PageSize: 10 }), // 3: آخر 10 زيارات
            courtAPI.listPaymentsDueByFamily(familyId)      // 4: المدفوعات
          ]);

          // تفريغ النتائج
          if (results[0].status === 'fulfilled') details.alimony = results[0].value.data;
          if (results[1].status === 'fulfilled') details.custody = results[1].value.data;
          if (results[2].status === 'fulfilled') details.schedule = results[2].value.data;
          if (results[3].status === 'fulfilled') details.visitations = results[3].value.data.items || [];
          if (results[4].status === 'fulfilled') details.payments = results[4].value.data.items || [];
        }

        setData(details);

      } catch (error) {
        console.error("Error fetching case details:", error);
        toast.error("حدث خطأ أثناء تحميل بعض بيانات القضية");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
  }, [familyId]);


  // حساب الإحصائيات المالية محلياً
  const calculateFinancials = () => {
    if (!data.payments.length) return { totalOverdue: 0, monthsLate: 0, lastPayment: '-' };
    
    // تصفية غير المدفوع والذي تاريخ استحقاقه فات
    const overdue = data.payments.filter(p => p.status !== 'Paid' && new Date(p.dueDate) < new Date());
    const totalOverdue = overdue.reduce((sum, curr) => sum + (curr.amount || 0), 0);
    
    // آخر دفعة
    const paid = data.payments.filter(p => p.status === 'Paid').sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    const lastPaymentDate = paid.length > 0 ? paid[0].paidAt?.split('T')[0] : 'لا يوجد';

    return {
      totalOverdue,
      monthsLate: overdue.length,
      lastPayment: lastPaymentDate
    };
  };

  const financials = calculateFinancials();

  // Helper to get Parent Name by ID
  const getParentName = (id) => {
    if (data.family?.father?.id === id) return data.family.father.fullName + " (الأب)";
    if (data.family?.mother?.id === id) return data.family.mother.fullName + " (الأم)";
    return "غير محدد";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري تجميع ملف القضية...</p>
      </div>
    );
  }

  // إذا لم يتم العثور على قضية
  if (!data.caseInfo) {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
         <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ArrowRight className="w-5 h-5" /> <span>العودة</span>
         </button>
         <Card className="p-12 text-center">
            <Scale className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">لا توجد قضية نشطة لهذه الأسرة</h2>
            <p className="text-muted-foreground mt-2">يرجى إنشاء قضية جديدة من شاشة "فتح ملف أسرة".</p>
         </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack} 
            className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" /> 
            <span>العودة للرئيسية</span>
          </button>
          
          <h1 className="text-2xl mb-2">تفاصيل القضية</h1>
          <p className="text-sm opacity-80 font-mono">{data.caseInfo.caseNumber || 'رقم القضية غير مسجل'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Right Column */}
          <div className="space-y-6">
            {/* Case Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  حالة القضية
                </h2>
                <Badge className={`${data.caseInfo.status === 'Closed' ? 'bg-gray-500' : 'bg-green-600'} text-white`}>
                  {data.caseInfo.status === 'Active' ? 'نشطة' : data.caseInfo.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">رقم القضية</span>
                  <span className="font-medium font-mono">{data.caseInfo.caseNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">تاريخ التسجيل</span>
                  <span className="font-medium">{data.caseInfo.filedAt?.split('T')[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">نوع القضية</span>
                  <span className="font-medium">نفقة / حضانة / رؤية</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">ملخص القرار</span>
                  <span className="font-medium text-sm max-w-[200px] text-left truncate">
                    {data.caseInfo.decisionSummary || 'لا يوجد ملخص'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Custody Decision */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                قرار الحضانة
              </h2>
              
              {data.custody ? (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">صاحب الحضانة</span>
                    <span className="font-medium text-primary">
                        {getParentName(data.custody.custodialParentId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">عدد الأطفال</span>
                    <span className="font-medium">{data.children.length} أطفال</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ بدء الحضانة</span>
                    <span className="font-medium">{data.custody.startAt?.split('T')[0]}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded">
                    لم يتم تسجيل قرار حضانة بعد
                </div>
              )}
            </Card>

            {/* Visitation Schedule */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                جدول الزيارات
              </h2>
              
              {data.schedule ? (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">التكرار</span>
                    <span className="font-medium">{data.schedule.frequency || 'أسبوعي'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">التوقيت</span>
                    <span className="font-medium font-mono">
                        {data.schedule.startTime?.substring(0, 5)} - {data.schedule.endTime?.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ البدء</span>
                    <span className="font-medium">{data.schedule.startDate?.split('T')[0]}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded">
                    لا يوجد جدول زيارة مسجل
                </div>
              )}
            </Card>

            {/* Visit History - From API */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                سجل الزيارات (آخر 10)
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.visitations.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">لا توجد زيارات مسجلة</p>
                ) : (
                    data.visitations.map((visit, index) => (
                    <div key={visit.id || index} className={`p-4 rounded-lg border ${visit.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                                {new Date(visit.startAt).toLocaleDateString('ar-EG', { weekday: 'long' })}
                            </span>
                            <span className="text-xs text-muted-foreground">{visit.startAt?.split('T')[0]}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {visit.startAt?.split('T')[1].substring(0, 5)} - {visit.endAt?.split('T')[1].substring(0, 5)}
                            </p>
                        </div>
                        <Badge className={`${visit.status === 'Completed' ? 'bg-green-600' : 'bg-destructive'} text-white`}>
                            {visit.status === 'Completed' ? 'تمت' : visit.status === 'Missed' ? 'لم يحضر' : visit.status}
                        </Badge>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </Card>
          </div>

          {/* Left Column */}
          <div className="space-y-6">
            {/* Children Info */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                معلومات الأطفال
              </h2>
              
              <div className="space-y-3">
                {data.children.map((child, index) => (
                  <div key={child.id || index} className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{child.fullName}</span>
                      <Badge variant="outline">{calculateAge(child.birthDate)}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        تاريخ الميلاد: {child.birthDate?.split('T')[0]}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">الجنس:</span>
                        <Badge variant="secondary" className="text-xs">
                          {child.gender === 'Male' ? 'ذكر' : 'أنثى'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {data.children.length === 0 && <p className="text-center text-muted-foreground">لا يوجد أطفال مسجلين</p>}
              </div>
            </Card>

            {/* Court Location - Static for now as API doesn't link case to specific location details directly */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                موقع المحكمة
              </h2>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium mb-2">محكمة الأسرة</p>
                <p className="text-sm text-muted-foreground mb-2">
                  (يتم تحديد العنوان بناءً على الدائرة القضائية)
                </p>
                <p className="text-sm text-muted-foreground">
                  ساعات العمل الرسمية: 8:00 ص - 2:00 م
                </p>
              </div>
            </Card>

            {/* Alimony Info */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                معلومات النفقة
              </h2>
              
              {data.alimony ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">المبلغ الدوري</span>
                    <span className="font-medium text-secondary text-lg">{data.alimony.amount} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">التكرار</span>
                    <span className="font-medium">{data.alimony.frequency === 'Monthly' ? 'شهري' : data.alimony.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">آخر دفعة</span>
                    <span className="font-medium">{financials.lastPayment}</span>
                    </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded">
                    لم يتم تحديد نفقة لهذه القضية
                </div>
              )}
            </Card>

            {/* Overdue Alimony - Calculated from Payments API */}
            {financials.totalOverdue > 0 && (
                <Card className="p-6 border-destructive/50">
                <h2 className="text-lg flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    المتأخرات المالية
                </h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">إجمالي المستحق:</span>
                    <span className="text-2xl font-bold text-destructive">{financials.totalOverdue} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">عدد الدفعات المتأخرة:</span>
                    <Badge className="bg-destructive text-white">{financials.monthsLate} دفعات</Badge>
                    </div>
                </div>
                </Card>
            )}

            {/* Payments History */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                سجل الدفعات (الأحدث)
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.payments.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">لا توجد سجلات دفع</p>
                ) : (
                    data.payments.map((payment, index) => (
                    <div key={payment.id || index} className={`p-4 rounded-lg border ${
                        payment.status === 'Paid' ? 'bg-green-50 border-green-200' : 
                        'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{payment.dueDate?.split('T')[0]}</span>
                            <span className="text-lg font-bold">{payment.amount} ج.م</span>
                            </div>
                            <p className="text-xs text-muted-foreground">تاريخ الاستحقاق</p>
                        </div>
                        <Badge className={`${payment.status === 'Paid' ? 'bg-green-600' : 'bg-destructive'} text-white`}>
                            {payment.status === 'Paid' ? 'مدفوع' : 'غير مدفوع'}
                        </Badge>
                        </div>
                        {payment.paidAt && (
                            <div className="mt-2 text-xs text-green-700 font-medium">
                                تم الدفع في: {payment.paidAt.split('T')[0]}
                            </div>
                        )}
                    </div>
                    ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}