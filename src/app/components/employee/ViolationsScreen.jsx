import React, { useState } from 'react';
import { ChevronRight, AlertTriangle, User, Calendar, FileText, XCircle, CheckCircle, Clock, Phone, MapPin, Eye, ChevronLeft } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function ViolationsScreen({ onBack }) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  const [violations, setViolations] = useState([
    {
      id: 'VIO-001',
      caseId: 'CASE-12453',
      caseNumber: 'Q-2024-001',
      parentName: 'أحمد محمد عبد الله',
      parentPhone: '01012345678',
      parentAddress: 'القاهرة، مدينة نصر، شارع عباس العقاد',
      type: 'عدم دفع النفقة',
      description: 'تأخر في دفع النفقة لمدة شهرين',
      details: 'لم يتم دفع النفقة الشهرية المقررة بمبلغ 2000 جنيه مصري منذ شهرين متتاليين (نوفمبر وديسمبر 2024). تم التواصل مع ولي الأمر مرتين دون استجابة. المبلغ المستحق: 4000 جنيه مصري.',
      date: '2024-12-15',
      reportedBy: 'الطرف الآخر',
      status: 'قيد المراجعة',
      statusColor: 'bg-yellow-500',
      severity: 'متوسطة',
      notes: 'تم إرسال إنذار رسمي في 2024-12-10'
    },
    {
      id: 'VIO-002',
      caseId: 'CASE-12387',
      caseNumber: 'Q-2024-003',
      parentName: 'فاطمة حسن علي',
      parentPhone: '01098765432',
      parentAddress: 'الجيزة، الدقي، شارع التحرير',
      type: 'عدم الالتزام بموعد الزيارة',
      description: 'غياب متكرر عن الزيارات المجدولة',
      details: 'تم تسجيل غياب ولي الأمر عن آخر 4 زيارات مجدولة دون إبلاغ مسبق أو عذر مقبول. مواعيد الزيارات الفائتة: 2024-11-25، 2024-12-02، 2024-12-09، 2024-12-16. هذا يؤثر سلباً على الأطفال ويخالف قرار المحكمة.',
      date: '2024-12-20',
      reportedBy: 'موظف المحكمة',
      status: 'قيد المراجعة',
      statusColor: 'bg-yellow-500',
      severity: 'عالية'
    },
    {
      id: 'VIO-003',
      caseId: 'CASE-12298',
      caseNumber: 'Q-2024-005',
      parentName: 'محمود عبد العزيز',
      parentPhone: '01123456789',
      parentAddress: 'القاهرة، مصر الجديدة، شارع الحجاز',
      type: 'منع الزيارة',
      description: 'منع الطرف الآخر من رؤية الأطفال',
      details: 'قام ولي الأمر بمنع الطرف الآخر من رؤية الأطفال في 2024-12-05 رغم وجود قرار محكمة بالسماح بالزيارة كل يوم جمعة. تم حل المخالفة بعد جلسة وساطة بين الطرفين في 2024-12-08.',
      date: '2024-12-10',
      reportedBy: 'الطرف الآخر',
      status: 'تم الحل',
      statusColor: 'bg-green-500',
      severity: 'عالية',
      actions: 'تمت جلسة وساطة وتم الاتفاق على احترام مواعيد الزيارة',
      resolvedDate: '2024-12-08'
    },
  ]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'عالية': return 'bg-destructive';
      case 'متوسطة': return 'bg-yellow-500';
      case 'منخفضة': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'معلقة':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'قيد المراجعة':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'تم الحل':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'مرفوضة':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'معلقة':
        return <Clock className="w-4 h-4" />;
      case 'قيد المراجعة':
        return <AlertTriangle className="w-4 h-4" />;
      case 'تم الحل':
        return <CheckCircle className="w-4 h-4" />;
      case 'مرفوضة':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleResolve = () => {
    if (selectedViolation && actionNotes.trim()) {
      setViolations(violations.map(v => 
        v.id === selectedViolation.id 
          ? { 
              ...v, 
              status: 'تم الحل', 
              statusColor: 'bg-green-500',
              actions: actionNotes,
              resolvedDate: new Date().toISOString().split('T')[0]
            } 
          : v
      ));
      setSelectedViolation(null);
      setActionNotes('');
    }
  };

  const handleReject = () => {
    if (selectedViolation && actionNotes.trim()) {
      setViolations(violations.map(v => 
        v.id === selectedViolation.id 
          ? { 
              ...v, 
              status: 'مرفوضة', 
              statusColor: 'bg-red-500',
              actions: actionNotes,
              resolvedDate: new Date().toISOString().split('T')[0]
            } 
          : v
      ));
      setSelectedViolation(null);
      setActionNotes('');
    }
  };

  const pendingCount = violations.filter(v => v.status === 'معلقة').length;
  const underReviewCount = violations.filter(v => v.status === 'قيد المراجعة').length;
  const resolvedCount = violations.filter(v => v.status === 'تم الحل').length;

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      
      {/* --- بداية الهيدر الجديد --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8 mx-auto max-w-[95%] mt-4">
        
        {/* زخارف الخلفية */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          {/* زر الرجوع */}
          <button 
            onClick={onBack} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold mb-1">المخالفات والتنبيهات</h1>
            <p className="text-blue-200 text-sm opacity-90">متابعة المخالفات واتخاذ الإجراءات اللازمة</p>
          </div>
        </div>

        {/* تنبيه صغير */}
        {underReviewCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {underReviewCount} مخالفة قيد المراجعة</span>
          </div>
        )}
      </div>
      {/* --- نهاية الهيدر الجديد --- */}

      <div className="max-w-7xl mx-auto px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">معلقة</p>
                <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-800">{underReviewCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">محلولة</p>
                <p className="text-2xl font-bold text-green-800">{resolvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Violations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {violations.map((violation) => (
            <Card 
              key={violation.id}
              onClick={() => setSelectedViolation(violation)}
              className="p-5 cursor-pointer hover:shadow-lg transition-shadow bg-card border-border"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 ${getSeverityColor(violation.severity)}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle className={`w-6 h-6 ${getSeverityColor(violation.severity).replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium mb-1">{violation.type}</p>
                      <p className="text-sm text-muted-foreground">مخالفة {violation.id}</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-sm">{violation.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${violation.statusColor} text-white text-xs`}>
                    {violation.status}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">{violation.caseId}</span>
                  <span className="text-xs text-muted-foreground">{violation.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-5xl bg-card max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل المخالفة</h2>
                  <p className="text-sm text-muted-foreground">رقم المخالفة: {selectedViolation.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedViolation.status)}`}>
                    {getStatusIcon(selectedViolation.status)}
                    {selectedViolation.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedViolation(null);
                      setActionNotes('');
                    }}
                    className="hover:bg-muted"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Violation Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Violation Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      معلومات المخالفة
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">نوع المخالفة:</p>
                        <p className="text-sm font-medium">{selectedViolation.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">التفاصيل:</p>
                        <p className="text-sm leading-relaxed">{selectedViolation.details}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">تاريخ المخالفة:</p>
                          <p className="text-sm font-medium">{selectedViolation.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">رقم القضية:</p>
                          <p className="text-sm font-medium font-mono">{selectedViolation.caseNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action/Resolution Section */}
                  {selectedViolation.status === 'تم الحل' || selectedViolation.status === 'مرفوضة' ? (
                    <div className={`p-4 rounded-lg border ${
                      selectedViolation.status === 'تم الحل' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <h3 className={`font-medium mb-3 ${
                        selectedViolation.status === 'تم الحل' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {selectedViolation.status === 'تم الحل' ? 'تفاصيل الحل' : 'سبب الرفض'}
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs mb-1 ${
                            selectedViolation.status === 'تم الحل' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            التاريخ:
                          </p>
                          <p className={`text-sm font-medium ${
                            selectedViolation.status === 'تم الحل' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedViolation.resolvedDate}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${
                            selectedViolation.status === 'تم الحل' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            الإجراءات المتخذة:
                          </p>
                          <p className={`text-sm leading-relaxed ${
                            selectedViolation.status === 'تم الحل' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedViolation.actions}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block">الإجراءات المتخذة:</span>
                        <textarea
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="اكتب الإجراءات المتخذة لحل المخالفة..."
                          rows={5}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleResolve}
                          disabled={!actionNotes.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          حل المخالفة
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleReject}
                          disabled={!actionNotes.trim()}
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض المخالفة
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Parent Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      معلومات ولي الأمر
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">الاسم:</p>
                        <p className="text-sm font-medium">{selectedViolation.parentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">رقم الجوال:</p>
                        <a 
                          href={`tel:${selectedViolation.parentPhone}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          {selectedViolation.parentPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">العنوان:</p>
                        <p className="text-sm flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{selectedViolation.parentAddress}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {}}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    عرض تفاصيل القضية
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}