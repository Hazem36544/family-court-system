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
  ChevronLeft,
  Loader2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { complaintsAPI, commonAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export function ComplaintsManagement({ onNavigate, onBack }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ pending: 0, resolved: 0, underReview: 0 });

  const [documentDetails, setDocumentDetails] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  // 1. جلب الشكاوى (Fetch Logic - متوافق مع Swagger: GET /api/courts/me/complaints)
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: 1,
        PageSize: 50
      };

      if (statusFilter !== 'all') {
        params.Status = statusFilter;
      }

      const res = await complaintsAPI.listMyComplaints(params);

      const rawData = res.data?.complaints?.items || [];

      setCounts({
        pending: res.data?.pendingCount || 0,
        underReview: res.data?.underReviewCount || 0,
        resolved: res.data?.resolvedCount || 0
      });

      const mappedComplaints = rawData.map(item => ({
        id: item.id,
        complaintNumber: item.id.substring(0, 8).toUpperCase(),
        parentId: item.reporterId,
        documentId: item.documentId || null,
        parentName: item.reporterName || 'غير مسجل',
        type: item.type || 'General',
        subject: item.type || 'شكوى عامة',
        description: item.description || '',
        submissionDate: item.filedAt ? item.filedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: translateStatus(item.status),
        rawStatus: item.status,
        response: item.resolutionNotes || '',
        responseDate: item.resolvedAt ? item.resolvedAt.split('T')[0] : null
      }));

      setComplaints(mappedComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("حدث خطأ أثناء جلب سجل الشكاوى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  // 2. جلب المستندات
  useEffect(() => {
    if (selectedComplaint && selectedComplaint.documentId) {
      fetchDocumentDetails(selectedComplaint.documentId);
    } else {
      setDocumentDetails(null);
    }
  }, [selectedComplaint]);

  const fetchDocumentDetails = async (docId) => {
    setDocumentLoading(true);
    setDocumentDetails(null);
    try {
      const res = await commonAPI.getDocument(docId);
      setDocumentDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch document', err);
      toast.error('فشل تحميل المستند المرفق');
    } finally {
      setDocumentLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'تاريخ غير معروف';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const handleDownloadDocument = () => {
    if (!documentDetails) return;

    if (documentDetails.downloadUrl) {
      window.open(documentDetails.downloadUrl, '_blank');
    } else if (documentDetails.url || documentDetails.fileUrl) {
      window.open(documentDetails.url || documentDetails.fileUrl, '_blank');
    } else if (documentDetails.fileContent || documentDetails.content || documentDetails.base64) {
      const b64Data = documentDetails.fileContent || documentDetails.content || documentDetails.base64;
      const type = documentDetails.contentType || documentDetails.mimeType || 'application/octet-stream';
      const link = document.createElement('a');
      link.href = `data:${type};base64,${b64Data}`;
      link.download = documentDetails.fileName || documentDetails.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("لا يمكن تحميل محتوى المستند تلقائياً.");
    }
  };

  // دوال الترجمة والتنسيق
  const translateStatus = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'resolved' || s === 'approved' || s === 'closed') return 'resolved';
    if (s === 'underreview' || s === 'under_review') return 'underReview';
    return 'pending'; 
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'underReview': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'underReview': return 'قيد المراجعة';
      case 'resolved': return 'تم الحل';
      default: return status || 'غير معروف';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'underReview': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const pendingCount = counts.pending;
  const underReviewCount = counts.underReview;
  const resolvedCount = counts.resolved;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">

      {/* Header المخصص للرقابة */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/2 opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">الرقابة والمتابعة</p>
            <h1 className="text-2xl font-bold mb-1">مراقبة سجل الشكاوى</h1>
          </div>
        </div>
        <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center border border-white/10 shadow-inner relative z-10 ml-4">
           <ShieldCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gray-50 border-gray-200 text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200 text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">قيد المراجعة</p>
                    <p className="text-2xl font-bold text-blue-800">{underReviewCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200 text-right">
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
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-5 h-5 text-muted-foreground ml-1" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">تصفية حسب:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px] w-full text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="underReview">قيد المراجعة</option>
                  <option value="resolved">تم الحل</option>
                </select>
              </div>
            </div>

            {/* Complaints List */}
            <Card className="overflow-hidden bg-card border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">مقدم الشكوى</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">تاريخ التقديم</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الحالة</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>لا توجد شكاوى في هذا السجل</p>
                        </td>
                      </tr>
                    ) : (
                      complaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{complaint.parentName}</p>
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
                              className="text-primary hover:text-primary hover:bg-primary/10 border-none"
                            >
                              <Eye className="w-4 h-4 ml-1" /> مراجعة الشكوى
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

      {/* Complaint Details Modal (Read-Only) */}
      {selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <Card className="w-full max-w-2xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 text-right rounded-[2rem]">
              <div className="p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold mb-1">سجل تفاصيل الشكوى</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedComplaint.status)}`}>
                      {getStatusIcon(selectedComplaint.status)}
                      {getStatusText(selectedComplaint.status)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedComplaint(null)}
                      className="hover:bg-muted border-none rounded-full"
                    >
                      <XCircle className="w-6 h-6 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Main Complaint Details Section */}
                  <div className="space-y-6">
                    <div className="p-5 bg-muted/30 rounded-2xl border border-border/50">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#1e3a8a] border-b border-blue-100 pb-2">
                        <FileText className="w-5 h-5" />
                        نظرة عامة على الشكوى
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                          <p className="text-muted-foreground block mb-0.5">اسم مقدم الشكوى</p>
                          <p className="font-medium text-gray-900">{selectedComplaint.parentName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground block mb-0.5">موضوع / نوع الشكوى</p>
                          <p className="font-medium text-gray-900">{selectedComplaint.subject}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground block mb-0.5">تاريخ التقديم</p>
                          <p className="font-medium text-gray-900 font-sans">{selectedComplaint.submissionDate}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-muted-foreground block mb-2">نص الشكوى:</p>
                        <div className="bg-white border border-border rounded-xl p-4 min-h-[80px]">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedComplaint.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 flex flex-col justify-center items-start">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#1e3a8a] border-b border-blue-100 pb-2 w-full">
                        <FileText className="w-5 h-5" />
                        المستندات المرفقة
                      </h3>
                      {!selectedComplaint.documentId ? (
                        <div className="w-full text-center py-6 border border-dashed rounded-xl bg-white text-muted-foreground">
                          <p className="text-sm">لا يوجد مستند مرفق بهذه الشكوى.</p>
                        </div>
                      ) : documentLoading ? (
                        <div className="w-full flex flex-col items-center justify-center py-6 border rounded-xl bg-white">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">جاري تحميل المستند...</p>
                        </div>
                      ) : documentDetails ? (
                        <div className="w-full border rounded-xl p-4 bg-white space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold truncate max-w-[200px] md:max-w-xs" title={documentDetails.fileName || documentDetails.name || 'دليل مرفق'}>
                                {documentDetails.fileName || documentDetails.name || 'دليل مرفق'}
                              </p>
                              {(documentDetails.contentType || documentDetails.mimeType) && (
                                <p className="text-xs text-muted-foreground mt-1">التنسيق: {documentDetails.contentType || documentDetails.mimeType}</p>
                              )}
                              {documentDetails.fileSizeBytes !== undefined && (
                                <p className="text-xs text-muted-foreground mt-0.5">الحجم: {formatBytes(documentDetails.fileSizeBytes)}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            className="w-full border-none h-10"
                            onClick={handleDownloadDocument}
                          >
                            عرض / تحميل المستند
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full text-center py-6 border border-dashed rounded-xl bg-red-50 text-red-600">
                          <p className="text-sm">فشل تحميل معلومات المستند.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-red-200 hover:bg-red-100"
                            onClick={() => fetchDocumentDetails(selectedComplaint.documentId)}
                          >
                            إعادة المحاولة
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Response Section (Read Only) */}
                    {selectedComplaint.status === 'resolved' && selectedComplaint.response ? (
                      <div className="mb-6 p-5 rounded-2xl border bg-green-50 border-green-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-green-900">إجراءات الحل المتخذة من قبل الموظف</h3>
                          {selectedComplaint.responseDate && (
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">تاريخ الحل: {selectedComplaint.responseDate}</span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-green-800 leading-relaxed whitespace-pre-wrap">
                          {selectedComplaint.response}
                        </div>
                      </div>
                    ) : selectedComplaint.status === 'underReview' ? (
                      <div className="mb-6 p-5 rounded-2xl border bg-blue-50 border-blue-200 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-blue-800">هذه الشكوى قيد المراجعة والتحقيق من قبل موظف المحكمة المختص.</p>
                      </div>
                    ) : (
                      <div className="mb-6 p-5 rounded-2xl border bg-orange-50 border-orange-200 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-orange-800">هذه الشكوى لا تزال في انتظار المراجعة واتخاذ الإجراء من قبل موظف المحكمة المختص.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)} className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-all">إغلاق التفاصيل</Button>
                </div>

              </div>
            </Card>
          </div>
        )
      }
    </div >
  );
}