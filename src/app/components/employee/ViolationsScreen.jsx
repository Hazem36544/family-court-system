import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertTriangle, User, Calendar, FileText, XCircle, CheckCircle, Clock, Phone, MapPin, Eye, ChevronLeft, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { alertsAPI } from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function ViolationsScreen({ onBack }) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  
  // State للبيانات الحقيقية
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // State جديد لحفظ الإحصائيات القادمة من السيرفر
  const [serverStats, setServerStats] = useState({
    pending: 0,
    underReview: 0,
    resolved: 0
  });

  // 1. جلب المخالفات من السيرفر
  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await alertsAPI.list({
        PageNumber: 1,
        PageSize: 50
      });

      // ⚠️ التعديل الجذري هنا: قراءة المصفوفة من المكان الصحيح حسب Swagger
      const rawData = res.data?.alerts?.items || [];

      // حفظ الإحصائيات الرسمية من السيرفر
      setServerStats({
        pending: res.data?.pendingCount || 0,
        underReview: res.data?.underReviewCount || 0,
        resolved: res.data?.resolvedCount || 0
      });

      // تحويل البيانات لتناسب الواجهة
      const mappedViolations = rawData.map(v => ({
        id: v.id,
        referenceNumber: v.id.substring(0, 8).toUpperCase(), 
        caseId: v.courtId || '---',
        caseNumber: v.relatedEntityId || 'غير مرتبط',
        parentName: v.parentId || 'ولي الأمر', 
        parentPhone: 'غير متوفر',
        parentAddress: 'غير مسجل',
        type: v.type || 'مخالفة عامة',
        description: v.description || 'بدون عنوان',
        details: v.description || '',
        date: v.triggeredAt ? v.triggeredAt.split('T')[0] : new Date().toISOString().split('T')[0],
        reportedBy: 'النظام',
        status: translateStatus(v.status), 
        rawStatus: v.status, 
        statusColor: getStatusColor(v.status),
        severity: translateSeverity(v.type), 
        notes: v.resolutionNotes,
        actions: v.resolutionNotes,
        resolvedDate: v.resolvedAt ? v.resolvedAt.split('T')[0] : null
      }));

      setViolations(mappedViolations);
    } catch (error) {
      console.error("Error fetching violations:", error);
      toast.error("فشل تحميل قائمة المخالفات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  // دوال مساعدة للترجمة والتلوين
  const translateStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'approved') return 'تم الحل';
    if (s === 'rejected' || s === 'dismissed') return 'مرفوضة';
    if (s === 'underreview' || s === 'pending') return 'قيد المراجعة';
    return 'معلقة';
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'approved') return 'bg-green-500';
    if (s === 'rejected' || s === 'dismissed') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const translateSeverity = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes('missed') || t?.includes('failure')) return 'عالية';
    if (t?.includes('delay') || t?.includes('late')) return 'متوسطة';
    return 'منخفضة';
  };

  // 2. حل المخالفة
  const handleResolve = async () => {
    if (selectedViolation && actionNotes.trim()) {
      setActionLoading(true);
      try {
        await alertsAPI.updateStatus(selectedViolation.id, {
          status: 'Resolved', 
          resolutionNotes: actionNotes
        });
        toast.success("تم حل المخالفة بنجاح");
        await fetchViolations();
        setSelectedViolation(null);
        setActionNotes('');
      } catch (error) {
        console.error("Error resolving violation", error);
        toast.error("فشل تنفيذ العملية");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // 3. رفض المخالفة
  const handleReject = async () => {
    if (selectedViolation && actionNotes.trim()) {
      setActionLoading(true);
      try {
        await alertsAPI.updateStatus(selectedViolation.id, {
          status: 'Rejected', 
          resolutionNotes: actionNotes
        });
        toast.success("تم رفض المخالفة");
        await fetchViolations();
        setSelectedViolation(null);
        setActionNotes('');
      } catch (error) {
        console.error("Error rejecting violation", error);
        toast.error("فشل تنفيذ العملية");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // UI Helper Functions
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
      case 'معلقة': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'قيد المراجعة': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'تم الحل': return 'bg-green-100 text-green-700 border-green-200';
      case 'مرفوضة': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'معلقة': return <Clock className="w-4 h-4" />;
      case 'قيد المراجعة': return <AlertTriangle className="w-4 h-4" />;
      case 'تم الحل': return <CheckCircle className="w-4 h-4" />;
      case 'مرفوضة': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      
      {/* Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8 mx-auto max-w-[95%] mt-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">المخالفات والتنبيهات</h1>
            <p className="text-blue-200 text-sm opacity-90">متابعة المخالفات واتخاذ الإجراءات اللازمة</p>
          </div>
        </div>

        {serverStats.underReview > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {serverStats.underReview} مخالفة قيد المراجعة</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-8">
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
        ) : (
        <>
            {/* Stats Summary - يتم قراءتها الآن من السيرفر */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-700 mb-1">معلقة</p><p className="text-2xl font-bold text-gray-800">{serverStats.pending}</p></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-gray-700" /></div>
                </div>
            </Card>
            <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                <div><p className="text-sm text-yellow-700 mb-1">قيد المراجعة</p><p className="text-2xl font-bold text-yellow-800">{serverStats.underReview}</p></div>
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-yellow-700" /></div>
                </div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                <div><p className="text-sm text-green-700 mb-1">محلولة</p><p className="text-2xl font-bold text-green-800">{serverStats.resolved}</p></div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-700" /></div>
                </div>
            </Card>
            </div>

            {/* Violations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {violations.length === 0 ? (
               <div className="col-span-1 lg:col-span-2 text-center py-10 text-muted-foreground">
                  لا توجد مخالفات حالياً.
               </div>
            ) : (
              violations.map((violation) => (
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
                          <p className="text-sm text-muted-foreground">مخالفة {violation.referenceNumber}</p>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                      </div>
                      </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 mb-4">
                      <p className="text-sm line-clamp-2">{violation.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                      <Badge className={`${violation.statusColor} text-white text-xs`}>
                          {violation.status}
                      </Badge>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{violation.caseNumber}</span>
                      <span className="text-xs text-muted-foreground">{violation.date}</span>
                      </div>
                  </div>
                  </Card>
              ))
            )}
            </div>
        </>
        )}
      </div>

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-5xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل المخالفة</h2>
                  <p className="text-sm text-muted-foreground">رقم المخالفة: {selectedViolation.referenceNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedViolation.status)}`}>
                    {getStatusIcon(selectedViolation.status)}
                    {selectedViolation.status}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedViolation(null); setActionNotes(''); }} className="hover:bg-muted">
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Violation Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> معلومات المخالفة</h3>
                    <div className="space-y-3">
                      <div><p className="text-xs text-muted-foreground mb-1">نوع المخالفة:</p><p className="text-sm font-medium">{selectedViolation.type}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">التفاصيل:</p><p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedViolation.details}</p></div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div><p className="text-xs text-muted-foreground mb-1">تاريخ المخالفة:</p><p className="text-sm font-medium">{selectedViolation.date}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-1">المُعرف ذو الصلة:</p><p className="text-sm font-medium font-mono">{selectedViolation.caseNumber}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Section */}
                  {selectedViolation.status === 'تم الحل' || selectedViolation.status === 'مرفوضة' ? (
                    <div className={`p-4 rounded-lg border ${selectedViolation.status === 'تم الحل' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <h3 className={`font-medium mb-3 ${selectedViolation.status === 'تم الحل' ? 'text-green-900' : 'text-red-900'}`}>
                        {selectedViolation.status === 'تم الحل' ? 'تفاصيل الحل' : 'سبب الرفض'}
                      </h3>
                      <div className="space-y-2">
                        <div><p className="text-xs mb-1 opacity-70">التاريخ:</p><p className="text-sm font-medium">{selectedViolation.resolvedDate || 'غير متوفر'}</p></div>
                        <div><p className="text-xs mb-1 opacity-70">الإجراءات المتخذة:</p><p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedViolation.actions || 'لا توجد ملاحظات.'}</p></div>
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
                        <Button onClick={handleResolve} disabled={!actionNotes.trim() || actionLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4 ml-2" />} حل المخالفة
                        </Button>
                        <Button onClick={handleReject} disabled={!actionNotes.trim() || actionLoading} className="flex-1 border-red-500 text-red-600 hover:bg-red-50" variant="outline">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4 ml-2" />} رفض المخالفة
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> معلومات ولي الأمر</h3>
                    <div className="space-y-3">
                      <div><p className="text-xs text-muted-foreground mb-1">المُعرف:</p><p className="text-sm font-medium font-mono text-xs">{selectedViolation.parentName}</p></div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">رقم الجوال:</p>
                        <p className="text-sm font-medium text-muted-foreground">{selectedViolation.parentPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">العنوان:</p>
                        <p className="text-sm flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="text-muted-foreground">{selectedViolation.parentAddress}</span></p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full"><FileText className="w-4 h-4 ml-2" /> عرض تفاصيل المحكمة (ID: {selectedViolation.caseId.substring(0,8)})</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}