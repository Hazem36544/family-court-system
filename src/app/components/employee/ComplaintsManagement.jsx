import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Phone, 
  ChevronRight,
  Loader2 
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { complaintsAPI } from '../../../services/api'; // تم التحديث لاستخدام complaintsAPI
import { toast } from 'react-hot-toast';

export function ComplaintsManagement({ onNavigate, onBack }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. جلب الشكاوى (Fetch Logic - متوافق مع Swagger: GET /api/courts/me/complaints)
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: 1,
        PageSize: 50
        // حسب Swagger، لا يوجد باراميتر Status في مسار GET هذا، لذلك الفلترة ستتم محلياً.
      };

      const res = await complaintsAPI.listMyComplaints(params);
      
      const rawData = res.data?.items || res.data || [];
      
      // مطابقة البيانات مع Wesal.Contracts.Complaints.ComplaintResponse
      const mappedComplaints = rawData.map(item => ({
        id: item.id,
        complaintNumber: item.id.substring(0, 8).toUpperCase(),
        parentId: item.reporterId,
        parentName: 'ولي أمر', // يجب جلب الاسم من مكان آخر إذا لم يكن في الرد المباشر
        parentPhone: 'غير متوفر', // غير موجود في الرد المباشر
        caseNumber: '---', // غير موجود في الرد المباشر
        type: item.type || 'عامة',
        subject: item.type || 'شكوى بدون عنوان', // يمكن استخدام type كموضوع
        description: item.description || '',
        submissionDate: item.filedAt ? item.filedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: translateStatus(item.status), // ترجمة وتوحيد الحالة
        rawStatus: item.status,
        response: item.resolutionNotes || '',
        responseDate: item.resolvedAt ? item.resolvedAt.split('T')[0] : null
      }));

      setComplaints(mappedComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      // لا تعرض Toast هنا لتجنب إزعاج المستخدم بسبب مشاكل الـ CORS قبل حلها من الـ Backend
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []); // تم إزالة statusFilter من هنا لأن الفلترة ستتم محلياً

  // 2. حل الشكوى (Resolve - متوافق مع Swagger: PATCH /api/complaints/{id}/status)
  const handleResolve = async () => {
    if (selectedComplaint && response.trim()) {
      setActionLoading(true);
      try {
        await complaintsAPI.updateStatus(selectedComplaint.id, {
          status: 'Resolved', // قد تحتاج إلى تعديل هذا ليتطابق تماماً مع القيم المقبولة في الـ Backend
          resolutionNotes: response
        });
        
        toast.success("تم حل الشكوى بنجاح");
        await fetchComplaints();
        setSelectedComplaint(null);
        setResponse('');
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.detail || "فشل في إرسال الرد";
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // 3. رفض الشكوى (Reject - متوافق مع Swagger: PATCH /api/complaints/{id}/status)
  const handleReject = async () => {
    if (selectedComplaint && response.trim()) {
      setActionLoading(true);
      try {
        await complaintsAPI.updateStatus(selectedComplaint.id, {
          status: 'Rejected', // قد تحتاج إلى تعديل هذا ليتطابق تماماً مع القيم المقبولة في الـ Backend
          resolutionNotes: response
        });

        toast.success("تم رفض الشكوى");
        await fetchComplaints();
        setSelectedComplaint(null);
        setResponse('');
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.detail || "فشل في تحديث الحالة";
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // دوال الترجمة والتنسيق
  const translateStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'approved' || s === 'closed') return 'resolved';
    if (s === 'rejected' || s === 'dismissed') return 'rejected';
    return 'pending'; // Default
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'جديدة / قيد المراجعة';
      case 'resolved': return 'تم الحل';
      case 'rejected': return 'مرفوضة';
      default: return status || 'غير محدد';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // الإحصائيات والفلترة المحلية
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const underReviewCount = 0; // لتبسيط الواجهة حسب الحالات المتوفرة
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const filteredComplaints = statusFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status === statusFilter);

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
            <h1 className="text-2xl font-bold mb-1">إدارة الشكاوى</h1>
            <p className="text-blue-200 text-sm opacity-90">مراجعة والرد على شكاوى أولياء الأمور</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {pendingCount} شكوى جديدة تحتاج للمراجعة</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-8">
        
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" />
            </div>
        ) : (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-yellow-700 mb-1">شكاوى جديدة</p>
                        <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-yellow-700" />
                    </div>
                    </div>
                </Card>

                {/* Card مخفية أو يمكن إزالتها إذا لم تكن هناك حالة Under Review مستقلة */}
                <Card className="p-4 bg-blue-50 border-blue-200 opacity-50">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-700 mb-1">قيد المراجعة</p>
                        <p className="text-2xl font-bold text-blue-800">{underReviewCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-700" />
                    </div>
                    </div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-green-700 mb-1">تم الحل</p>
                        <p className="text-2xl font-bold text-green-800">{resolvedCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-700" />
                    </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex justify-start">
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
                >
                <option value="all">جميع الحالات</option>
                <option value="pending">جديدة / قيد المراجعة</option>
                <option value="resolved">تم الحل</option>
                <option value="rejected">مرفوضة</option>
                </select>
            </div>
            </div>

            {/* Complaints List */}
            <Card className="overflow-hidden bg-card border-border">
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-muted/50">
                    <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">ولي الأمر (الشاكي)</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {filteredComplaints.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد شكاوى مطابقة</p>
                        </td>
                    </tr>
                    ) : (
                    filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{complaint.parentName}</p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {complaint.parentId?.substring(0,8)}</p>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {complaint.submissionDate}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(complaint.status)}`}>
                            {getStatusIcon(complaint.status)}
                            {getStatusText(complaint.status)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedComplaint(complaint)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                            <Eye className="w-4 h-4 ml-1" /> التفاصيل
                            </Button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </Card>
        </>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-4xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل الشكوى</h2>
                  <p className="text-sm text-muted-foreground font-mono">رقم الشكوى: {selectedComplaint.complaintNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedComplaint.status)}`}>
                    {getStatusIcon(selectedComplaint.status)}
                    {getStatusText(selectedComplaint.status)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedComplaint(null);
                      setResponse('');
                    }}
                    className="hover:bg-muted"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Right Column - Complaint Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Complaint Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      معلومات الشكوى
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">الموضوع / النوع:</p>
                        <p className="text-sm font-bold">{selectedComplaint.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">الوصف:</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedComplaint.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">تاريخ التقديم:</p>
                          <p className="text-sm font-medium">{selectedComplaint.submissionDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Section */}
                  {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected' ? (
                    <div className={`p-4 rounded-lg border ${
                      selectedComplaint.status === 'resolved' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <h3 className={`font-medium mb-3 ${
                        selectedComplaint.status === 'resolved' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        الرد على الشكوى
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs mb-1 ${
                            selectedComplaint.status === 'resolved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            تاريخ الرد:
                          </p>
                          <p className={`text-sm font-medium ${
                            selectedComplaint.status === 'resolved' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedComplaint.responseDate || 'غير متوفر'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${
                            selectedComplaint.status === 'resolved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            الرد:
                          </p>
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            selectedComplaint.status === 'resolved' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedComplaint.response || 'لا توجد ملاحظات.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block">الرد على الشكوى:</span>
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="اكتب ردك على الشكوى هنا..."
                          rows={5}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleResolve}
                          disabled={!response.trim() || actionLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4 ml-2" />}
                          حل الشكوى
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleReject}
                          disabled={!response.trim() || actionLoading}
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4 ml-2" />}
                          رفض الشكوى
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Left Column - Parent Contact Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      معلومات التواصل
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">الاسم:</p>
                        <p className="text-sm font-medium">{selectedComplaint.parentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">المُعرف:</p>
                        <p className="text-sm font-medium font-mono text-xs text-muted-foreground">{selectedComplaint.parentId}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => onNavigate('case-details', { caseNumber: selectedComplaint.caseNumber })}
                    className="w-full"
                    disabled
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    عرض تفاصيل القضية (غير متاح حالياً)
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