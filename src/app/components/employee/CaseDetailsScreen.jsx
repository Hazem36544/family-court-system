import React from 'react';
import { 
  ChevronLeft, 
  FileText, 
  DollarSign, 
  Paperclip,
  ChevronRight, 
  Briefcase     
} from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function CaseDetailsScreen({ caseData, onBack }) {
  
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      
      {/* --- بداية الهيدر --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8 mx-auto max-w-[95%] mt-4">
        
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* تعديل العرض هنا: خليناه max-w-6xl بدل max-w-md */}
        <div className="w-full max-w-6xl mx-auto flex items-center gap-5 relative z-10">
          <button 
            onClick={onBack} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">قضية {caseData?.id || 'CASE-12453'}</h1>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-xs px-3 py-0.5 rounded-full">
                    {caseData?.status || 'نشطة'}
                </Badge>
            </div>
            <p className="text-blue-200 text-sm opacity-90">عرض التفاصيل الكاملة لملف الأسرة</p>
          </div>

          <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mr-auto">
             <Briefcase className="w-8 h-8 text-blue-100" />
          </div>
        </div>
      </div>
      {/* --- نهاية الهيدر --- */}


      {/* --- محتوى الصفحة --- */}
      {/* تعديل العرض هنا أيضاً: max-w-6xl */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Tabs defaultValue="details" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 mb-6 text-xs">
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="visits">الزيارات</TabsTrigger>
            <TabsTrigger value="alimony">النفقة</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Case Information */}
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">معلومات القضية</h3>
                  <p className="text-sm text-muted-foreground">بيانات القضية الأساسية</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">رقم القضية:</span>
                  <span className="text-sm font-medium">CASE-12453</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تاريخ القضية:</span>
                  <span className="text-sm">2023-11-20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">مكان المحكمة:</span>
                  <span className="text-sm">محكمة الأسرة - القاهرة الجديدة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">حالة القضية:</span>
                  <Badge className="bg-green-500 text-white text-xs">نشطة</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">القاضي المسؤول:</span>
                  <span className="text-sm">المستشار محمد حسن إبراهيم</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">قرار الحضانة</h3>
                  <p className="text-sm text-muted-foreground">صادر بتاريخ 2024-01-15</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحاضن:</span>
                  <span className="text-sm">أحمد محمد العلي (الأب)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">عدد الأطفال:</span>
                  <span className="text-sm">3 أطفال</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">مدة الحضانة:</span>
                  <span className="text-sm">حتى بلوغ 15 سنة</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">أسماء الأطفال</h3>
              <div className="space-y-3">
                {[
                  { name: 'محمد أحمد العلي', age: '8 سنوات', custody: 'الأب', school: 'مدرسة الأمير فيصل الابتدائية', studentCode: 'STD-2024-001', schoolCode: 'SCH-CAI-001' },
                  { name: 'سارة أحمد العلي', age: '6 سنوات', custody: 'الأم', school: 'مدرسة الأميرة نورة الابتدائية', studentCode: 'STD-2024-002', schoolCode: 'SCH-CAI-002' },
                  { name: 'عمر أحمد العلي', age: '4 سنوات', custody: 'الأب', school: 'روضة براعم المستقبل', studentCode: 'STD-2024-003', schoolCode: 'SCH-CAI-003' }
                ].map((child, index) => (
                  <div key={index} className="p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{child.name}</p>
                        <p className="text-xs text-muted-foreground">{child.age}</p>
                      </div>
                    </div>
                    <div className="mr-11 pt-2 border-t border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">قرار الحضانة:</span>
                        <Badge variant="outline" className="text-xs">
                          {child.custody}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">كود الطالب:</span>
                        <span className="text-xs font-medium font-mono">{child.studentCode}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-muted-foreground">المدرسة:</span>
                        <span className="text-xs font-medium text-left max-w-[180px]">{child.school}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">كود المدرسة:</span>
                        <span className="text-xs font-medium font-mono">{child.schoolCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Father Information */}
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">بيانات الأب</h3>
                  <p className="text-sm text-muted-foreground">المعلومات الشخصية للأب</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الاسم الكامل:</span>
                  <span className="text-sm font-medium">أحمد محمد العلي</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الرقم القومي:</span>
                  <span className="text-sm">28503151234567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">رقم الجوال:</span>
                  <span className="text-sm">01012345678</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">الوظيفة:</span>
                  <span className="text-sm font-medium text-left max-w-[200px]">مهندس بترول - شركة البترول المصرية</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">العنوان:</span>
                  <span className="text-sm text-left max-w-[200px]">القاهرة الجديدة، التجمع الخامس</span>
                </div>
              </div>
            </Card>

            {/* Mother Information */}
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">بيانات الأم</h3>
                  <p className="text-sm text-muted-foreground">المعلومات الشخصية للأم</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الاسم الكامل:</span>
                  <span className="text-sm font-medium">فاطمة خالد السالم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الرقم القومي:</span>
                  <span className="text-sm">29104201234568</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">رقم الجوال:</span>
                  <span className="text-sm">01098765432</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">الوظيفة:</span>
                  <span className="text-sm font-medium text-left max-w-[200px]">معلمة - مدرسة النيل الدولية</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">العنوان:</span>
                  <span className="text-sm text-left max-w-[200px]">مدينة نصر، القاهرة</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">جدول الزيارات</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <div>
                    <p className="text-sm mb-1">الزيارة القادمة</p>
                    <p className="text-xs text-muted-foreground">الجمعة 10:00 صباحاً</p>
                  </div>
                  <Badge className="bg-secondary text-white">مجدولة</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card border-border">
              <h3 className="mb-3">تفاصيل الزيارة</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">اليوم:</span>
                  <span>كل جمعة</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الوقت:</span>
                  <span>10:00 صباحاً - 4:00 مساءً</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المكان:</span>
                  <span>مركز الزيارات العائلية</span>
                </div>
              </div>
            </Card>

            {/* Visit History */}
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">سجل الزيارات</h3>
              <div className="space-y-3">
                {[
                  { 
                    date: '2024-12-20', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'حضر', 
                    statusColor: 'bg-green-500', 
                    reason: null, 
                    details: null 
                  },
                  { 
                    date: '2024-12-13', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'حضر', 
                    statusColor: 'bg-green-500', 
                    reason: null, 
                    details: null 
                  },
                  { 
                    date: '2024-12-06', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'لم يحضر', 
                    statusColor: 'bg-destructive', 
                    reason: 'مرض الطفل',
                    details: {
                      description: 'إصابة الطفل محمد بنزلة برد حاد وارتفاع في درجة الحرارة (39 درجة)',
                      reportedBy: 'الأم - فاطمة خالد السالم',
                      reportDate: '2024-12-05',
                      document: 'تقرير طبي من مستشفى القاهرة العام',
                      verified: true
                    }
                  },
                  { 
                    date: '2024-11-29', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'حضر', 
                    statusColor: 'bg-green-500', 
                    reason: null, 
                    details: null 
                  },
                  { 
                    date: '2024-11-22', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'لم يحضر', 
                    statusColor: 'bg-destructive', 
                    reason: 'ظروف طارئة - سفر خارج المدينة',
                    details: {
                      description: 'سفر اضطراري للإسكندرية بسبب وفاة أحد أقارب الأب. تم إبلاغ المحكمة قبل موعد الزيارة بـ 48 ساعة.',
                      reportedBy: 'الأب - أحمد محمد العلي',
                      reportDate: '2024-11-20',
                      document: 'شهادة وفاة + تذاكر السفر',
                      verified: true
                    }
                  },
                  { 
                    date: '2024-11-15', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'حضر', 
                    statusColor: 'bg-green-500', 
                    reason: null, 
                    details: null 
                  },
                  { 
                    date: '2024-11-08', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'لم يحضر', 
                    statusColor: 'bg-destructive', 
                    reason: 'منع من قبل الحاضن',
                    details: {
                      description: 'رفضت الأم تسليم الأطفال للزيارة بحجة أن الأب تأخر في دفع النفقة الشهرية. تم توثيق الحادثة من قبل مركز الزيارات.',
                      reportedBy: 'مركز الزيارات العائلية',
                      reportDate: '2024-11-08',
                      document: 'محضر توثيق من مركز الزيارات',
                      verified: true
                    }
                  },
                  { 
                    date: '2024-11-01', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'حضر', 
                    statusColor: 'bg-green-500', 
                    reason: null, 
                    details: null 
                  },
                  { 
                    date: '2024-10-25', 
                    day: 'الجمعة', 
                    time: '10:00 ص - 4:00 م', 
                    status: 'لم يحضر', 
                    statusColor: 'bg-destructive', 
                    reason: 'ظروف عمل طارئة',
                    details: {
                      description: 'اجتماع طارئ في العمل لا يمكن تأجيله. الأب يعمل مهندساً في شركة البترول وكان هناك حالة طوارئ في الموقع.',
                      reportedBy: 'الأب - أحمد محمد العلي',
                      reportDate: '2024-10-25',
                      document: 'خطاب من جهة العمل',
                      verified: false
                    }
                  },
                ].map((visit, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${visit.status === 'حضر' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{visit.day}</span>
                          <span className="text-xs text-muted-foreground">{visit.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{visit.time}</p>
                      </div>
                      <Badge className={`${visit.statusColor} text-white`}>
                        {visit.status}
                      </Badge>
                    </div>
                    {visit.reason && visit.details && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground min-w-fit font-medium">سبب عدم الحضور:</span>
                          <span className="text-xs text-destructive font-bold">{visit.reason}</span>
                        </div>
                        
                        <div className="bg-white/50 rounded p-3 space-y-2">
                          <div>
                            <p className="text-xs text-foreground leading-relaxed">{visit.details.description}</p>
                          </div>
                          
                          <div className="pt-2 border-t border-border/30 space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground min-w-fit">تم الإبلاغ بواسطة:</span>
                              <span className="text-xs font-medium">{visit.details.reportedBy}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground min-w-fit">تاريخ الإبلاغ:</span>
                              <span className="text-xs">{visit.details.reportDate}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground min-w-fit">المستند الداعم:</span>
                              <span className="text-xs">{visit.details.document}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground min-w-fit">حالة التحقق:</span>
                              <Badge variant={visit.details.verified ? "default" : "outline"} className="text-xs h-5">
                                {visit.details.verified ? '✓ تم التحقق' : '⏳ قيد المراجعة'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Alimony Tab */}
          <TabsContent value="alimony" className="space-y-4">
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">تفاصيل النفقة</h3>
                  <p className="text-sm text-muted-foreground">النفقة الشهرية المستحقة</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المبلغ الشهري:</span>
                  <span className="text-lg font-bold">5,000 ج.م</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تاريخ الاستحقاق:</span>
                  <span className="text-sm">1 من كل شهر</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">حالة الدفع:</span>
                  <Badge className="bg-secondary text-white">منتظمة</Badge>
                </div>
              </div>
            </Card>

            {/* Overdue Alimony */}
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-destructive">النفقات المتأخرة</h3>
                  <p className="text-sm text-muted-foreground">المبالغ المستحقة وغير المدفوعة</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">إجمالي المتأخرات:</span>
                  <span className="text-2xl font-bold text-destructive">15,000 ج.م</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">عدد الأشهر المتأخرة:</span>
                  <Badge className="bg-destructive text-white">3 أشهر</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي الإنذارات:</span>
                  <Badge variant="outline" className="border-destructive text-destructive font-bold">8 إنذارات</Badge>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    month: 'سبتمبر 2024', 
                    amount: '5,000 ج.م', 
                    daysLate: 98, 
                    dueDate: '2024-09-01',
                    expectedPaymentDate: '2025-02-15',
                    warningsCount: 3,
                    warnings: [
                      { date: '2024-09-15', type: 'إنذار أول', status: 'تم الإرسال' },
                      { date: '2024-10-01', type: 'إنذار ثاني', status: 'تم الإرسال' },
                      { date: '2024-11-15', type: 'إنذار نهائي', status: 'تم الإرسال' }
                    ]
                  },
                  { 
                    month: 'أغسطس 2024', 
                    amount: '5,000 ج.م', 
                    daysLate: 128, 
                    dueDate: '2024-08-01',
                    expectedPaymentDate: '2025-03-01',
                    warningsCount: 3,
                    warnings: [
                      { date: '2024-08-15', type: 'إنذار أول', status: 'تم الإرسال' },
                      { date: '2024-09-01', type: 'إنذار ثاني', status: 'تم الإرسال' },
                      { date: '2024-10-15', type: 'إنذار نهائي', status: 'تم الإرسال' }
                    ]
                  },
                  { 
                    month: 'يوليو 2024', 
                    amount: '5,000 ج.م', 
                    daysLate: 159, 
                    dueDate: '2024-07-01',
                    expectedPaymentDate: '2025-02-28',
                    warningsCount: 2,
                    warnings: [
                      { date: '2024-07-15', type: 'إنذار أول', status: 'تم الإرسال' },
                      { date: '2024-08-15', type: 'إنذار ثاني', status: 'تم الإرسال' }
                    ]
                  },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-destructive">{item.month}</span>
                          <Badge variant="outline" className="text-xs border-destructive text-destructive">
                            متأخر {item.daysLate} يوم
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">تاريخ الاستحقاق: {item.dueDate}</p>
                      </div>
                      <span className="text-lg font-bold text-destructive">{item.amount}</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">الحالة:</span>
                        <Badge className="bg-destructive text-white text-xs">غير مدفوع</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">موعد الدفع المتوقع:</span>
                        <span className="text-xs font-bold text-destructive">{item.expectedPaymentDate}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">عدد الإنذارات:</span>
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600 bg-orange-50">
                          {item.warningsCount} إنذار
                        </Badge>
                      </div>
                      
                      {/* Warnings Details */}
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs font-medium text-muted-foreground mb-2">تفاصيل الإنذارات:</p>
                        <div className="space-y-1">
                          {item.warnings.map((warning, wIndex) => (
                            <div key={wIndex} className="flex items-center justify-between bg-white/50 p-2 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-orange-600 font-medium">{warning.type}</span>
                                <span className="text-muted-foreground">({warning.date})</span>
                              </div>
                              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                {warning.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Alimony Payment History */}
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">سجل النفقات</h3>
              <div className="space-y-3">
                {[
                  { 
                    month: 'ديسمبر 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع', 
                    statusColor: 'bg-green-500', 
                    dueDate: '2024-12-01', 
                    paidDate: '2024-12-01', 
                    paymentMethod: 'تحويل بنكي', 
                    receiptNumber: 'REC-2024-12-001', 
                    daysLate: 0 
                  },
                  { 
                    month: 'نوفمبر 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع متأخر', 
                    statusColor: 'bg-orange-500', 
                    dueDate: '2024-11-01', 
                    paidDate: '2024-11-03', 
                    paymentMethod: 'دفع نقدي', 
                    receiptNumber: 'REC-2024-11-001', 
                    daysLate: 2 
                  },
                  { 
                    month: 'أكتوبر 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع', 
                    statusColor: 'bg-green-500', 
                    dueDate: '2024-10-01', 
                    paidDate: '2024-10-01', 
                    paymentMethod: 'تحويل بنكي', 
                    receiptNumber: 'REC-2024-10-001', 
                    daysLate: 0 
                  },
                  { 
                    month: 'سبتمبر 2024', 
                    amount: '5,000 ج.م', 
                    status: 'غير مدفوع', 
                    statusColor: 'bg-destructive', 
                    dueDate: '2024-09-01', 
                    paidDate: null, 
                    paymentMethod: null, 
                    receiptNumber: null, 
                    daysLate: null 
                  },
                  { 
                    month: 'أغسطس 2024', 
                    amount: '5,000 ج.م', 
                    status: 'غير مدفوع', 
                    statusColor: 'bg-destructive', 
                    dueDate: '2024-08-01', 
                    paidDate: null, 
                    paymentMethod: null, 
                    receiptNumber: null, 
                    daysLate: null 
                  },
                  { 
                    month: 'يوليو 2024', 
                    amount: '5,000 ج.م', 
                    status: 'غير مدفوع', 
                    statusColor: 'bg-destructive', 
                    dueDate: '2024-07-01', 
                    paidDate: null, 
                    paymentMethod: null, 
                    receiptNumber: null, 
                    daysLate: null 
                  },
                  { 
                    month: 'يونيو 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع متأخر', 
                    statusColor: 'bg-orange-500', 
                    dueDate: '2024-06-01', 
                    paidDate: '2024-06-05', 
                    paymentMethod: 'تحويل بنكي', 
                    receiptNumber: 'REC-2024-06-001', 
                    daysLate: 4 
                  },
                  { 
                    month: 'مايو 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع', 
                    statusColor: 'bg-green-500', 
                    dueDate: '2024-05-01', 
                    paidDate: '2024-05-01', 
                    paymentMethod: 'دفع نقدي', 
                    receiptNumber: 'REC-2024-05-001', 
                    daysLate: 0 
                  },
                  { 
                    month: 'أبريل 2024', 
                    amount: '5,000 ج.م', 
                    status: 'مدفوع متأخر', 
                    statusColor: 'bg-orange-500', 
                    dueDate: '2024-04-01', 
                    paidDate: '2024-04-08', 
                    paymentMethod: 'تحويل بنكي', 
                    receiptNumber: 'REC-2024-04-001', 
                    daysLate: 7 
                  },
                ].map((payment, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    payment.status === 'مدفوع' ? 'bg-green-50 border-green-200' : 
                    payment.status === 'مدفوع متأخر' ? 'bg-orange-50 border-orange-200' : 
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{payment.month}</span>
                          <span className="text-lg font-bold">{payment.amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">تاريخ الاستحقاق: {payment.dueDate}</p>
                      </div>
                      <Badge className={`${payment.statusColor} text-white`}>
                        {payment.status}
                      </Badge>
                    </div>
                    {payment.paidDate && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        {payment.daysLate > 0 && (
                          <div className="mb-2 p-2 bg-orange-100 border border-orange-300 rounded">
                            <p className="text-xs font-bold text-orange-700">
                              ⚠️ تم دفعها بعد {payment.daysLate} {payment.daysLate === 1 ? 'يوم' : payment.daysLate === 2 ? 'يومين' : 'أيام'} من تاريخ الاستحقاق
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">تاريخ الدفع:</span>
                          <span className="font-medium">{payment.paidDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">طريقة الدفع:</span>
                          <span className="font-medium">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">رقم الإيصال:</span>
                          <span className="font-medium">{payment.receiptNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">المستندات الرسمية</h3>
              <div className="space-y-3">
                {[
                  { name: 'حكم الحضانة', date: '2024-01-15', type: 'PDF' },
                  { name: 'جدول الزيارات', date: '2024-01-15', type: 'PDF' },
                  { name: 'قرار النفقة', date: '2024-01-20', type: 'PDF' },
                  { name: 'تقرير الباحث الاجتماعي', date: '2024-01-10', type: 'PDF' },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}