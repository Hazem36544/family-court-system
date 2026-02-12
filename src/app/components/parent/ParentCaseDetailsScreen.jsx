import React from 'react';
import { ArrowRight, Calendar, Users, MapPin, Scale, FileText } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function ParentCaseDetailsScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-7xl mx-auto">
          {/* تم إضافة زر الرجوع هنا لتفعيل خاصية onBack */}
          <button 
            onClick={onBack} 
            className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" /> 
            <span>العودة للرئيسية</span>
          </button>
          
          <h1 className="text-2xl mb-2">تفاصيل القضية</h1>
          <p className="text-sm opacity-80">CASE-12453</p>
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
                <Badge className="bg-secondary text-white">نشطة</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">رقم القضية</span>
                  <span className="font-medium">CASE-12453</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">تاريخ التسجيل</span>
                  <span className="font-medium">15 يناير 2024</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">نوع القضية</span>
                  <span className="font-medium">حضانة وزيارة</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">المحكمة</span>
                  <span className="font-medium">محكمة الأسرة بالقاهرة</span>
                </div>
              </div>
            </Card>

            {/* Custody Decision */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                قرار الحضانة
              </h2>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">صاحب الحضانة</span>
                  <span className="font-medium">فاطمة أحمد السيد</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">عدد الأطفال</span>
                  <span className="font-medium">3 أطفال</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تاريخ القرار</span>
                  <span className="font-medium">15 يناير 2024</span>
                </div>
              </div>
            </Card>

            {/* Visitation Schedule */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                جدول الزيارات
              </h2>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الأيام المحددة</span>
                  <span className="font-medium">الجمعة والسبت</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">التوقيت</span>
                  <span className="font-medium">10:00 ص - 4:00 م</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">مكان الزيارة</span>
                  <span className="font-medium text-left">مركز الزيارات - القاهرة</span>
                </div>
              </div>
            </Card>

            {/* Visit History */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                سجل الزيارات
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
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

            {/* Alimony Info */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                معلومات النفقة
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">المبلغ الشهري</span>
                  <span className="font-medium text-secondary">5,000 ج.م</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">تاريخ الاستحقاق</span>
                  <span className="font-medium">1 من كل شهر</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">آخر دفعة</span>
                  <span className="font-medium">1 ديسمبر 2024</span>
                </div>
              </div>
            </Card>

            {/* Overdue Alimony */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-destructive" />
                النفقات المتأخرة
              </h2>

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
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                سجل النفقات
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                {[
                  { name: 'محمد أحمد العلي', age: '8 سنوات', school: 'مدرسة الأمير فيصل', custody: 'الأب' },
                  { name: 'سارة أحمد العلي', age: '6 سنوات', school: 'مدرسة الأميرة نورة', custody: 'الأم' },
                  { name: 'عمر أحمد العلي', age: '4 سنوات', school: 'روضة براعم المستقبل', custody: 'الأب' }
                ].map((child, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{child.name}</span>
                      <Badge variant="outline">{child.age}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        المدرسة: {child.school}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">قرار الحضانة:</span>
                        <Badge variant="secondary" className="text-xs">
                          {child.custody}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Court Location */}
            <Card className="p-6">
              <h2 className="text-lg flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                موقع المحكمة
              </h2>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium mb-2">محكمة الأسرة بالقاهرة</p>
                <p className="text-sm text-muted-foreground mb-2">
                  شارع رمسيس، وسط البلد، القاهرة
                </p>
                <p className="text-sm text-muted-foreground">
                  ساعات العمل: السبت - الخميس (8:00 ص - 2:00 م)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}