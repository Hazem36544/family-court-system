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
  ChevronLeft,
  Loader2
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { complaintsAPI, commonAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export function ComplaintsManagement({ onNavigate, onBack }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
        // نرسل الحالة للفلترة في السيرفر
        params.Status = statusFilter;
      }

      const res = await complaintsAPI.listMyComplaints(params);

      // الرد الجديد يحتوي على كائن complaints وبداخله items، بالإضافة إلى العدادات
      const rawData = res.data?.complaints?.items || [];

      setCounts({
        pending: res.data?.pendingCount || 0,
        underReview: res.data?.underReviewCount || 0,
        resolved: res.data?.resolvedCount || 0
      });


      // مطابقة البيانات مع Wesal.Contracts.Complaints.ComplaintResponse
      const mappedComplaints = rawData.map(item => ({
        id: item.id,
        complaintNumber: item.id.substring(0, 8).toUpperCase(),
        parentId: item.reporterId,
        documentId: item.documentId || null,
        // ملاحظة: reporterName و reporterPhone و courtCaseNumber غير موجودين في الـ Schema، 
        // سنحتفظ بهم كـ Optional في حال أرسلهم السيرفر (كـ Dynamic Properties)
        parentName: item.reporterName || 'Unknown',
        parentPhone: '',
        caseNumber: '',
        type: item.type || 'General',
        subject: item.type || 'Complaint',
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

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

  // 2. حل الشكوى (Resolve - متوافق مع Swagger: PATCH /api/complaints/{id}/status)
  const handleResolve = async () => {
    if (selectedComplaint && response.trim()) {
      setActionLoading(true);
      try {
        await complaintsAPI.updateStatus(selectedComplaint.id, {
          status: 'Resolved',
          resolutionNotes: response
        });

        toast.success('تم حل الشكوى بنجاح');
        await fetchComplaints();
        setSelectedComplaint(null);
        setResponse('');
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.detail || 'فشل إرسال الرد';
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // 3. قيد المراجعة (Under Review)
  const handleUnderReview = async () => {
    if (selectedComplaint) {
      setActionLoading(true);
      try {
        await complaintsAPI.updateStatus(selectedComplaint.id, {
          status: 'UnderReview',
          resolutionNotes: response || ''
        });

        toast.success('تم تحديد الشكوى قيد المراجعة');
        await fetchComplaints();
        setSelectedComplaint(null);
        setResponse('');
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.detail || 'فشل تحديث الحالة';
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };



  // دوال الترجمة والتنسيق
  const translateStatus = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'resolved' || s === 'approved' || s === 'closed') return 'resolved';
    if (s === 'underreview' || s === 'under_review') return 'underReview';
    return 'pending'; // Default



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

  // الإحصائيات
  const pendingCount = counts.pending;
  const underReviewCount = counts.underReview;
  const resolvedCount = counts.resolved;



  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">

      {/* Header */}
      {/* <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl mb-8 mx-auto max-w-[95%] mt-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">Complaints Management</h1>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">You have {pendingCount} new complaints needing review</span>
          </div>
        )}
      </div> */}

      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/2 opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold mb-1">إدارة الشكاوى</h1>
          </div>
        </div>
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
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px] w-full"
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
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الوالد/ة</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">التاريخ</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الحالة</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>لا توجد شكاوى مطابقة</p>
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
                              <Eye className="w-4 h-4 ml-1" /> عرض التفاصيل
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
      {
        selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <Card className="w-full max-w-xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 text-right">
              <div className="p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold mb-1">تفاصيل الشكوى</h2>
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
                      className="hover:bg-muted border-none"
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">

                  {/* Main Complaint Details Section */}
                  <div className="space-y-6">
                    {/* Complaint Info */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        معلومات الشكوى
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">اسم الوالد/ة:</p>
                          <p className="text-base font-medium">{selectedComplaint.parentName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">الموضوع / النوع:</p>
                          <p className="text-base font-bold">{selectedComplaint.subject}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">الوصف:</p>
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{selectedComplaint.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">تاريخ التقديم:</p>
                            <p className="text-base font-medium font-sans">{selectedComplaint.submissionDate}</p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="p-4 bg-muted/30 rounded-lg flex flex-col justify-center items-start">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        المستندات
                      </h3>
                      {!selectedComplaint.documentId ? (
                        <div className="w-full text-center py-6 border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                          <p className="text-sm">لا يوجد مستند مرفق بهذه الشكوى.</p>
                        </div>
                      ) : documentLoading ? (
                        <div className="w-full flex flex-col items-center justify-center py-6 border rounded-lg bg-card">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">جاري تحميل المستند...</p>
                        </div>
                      ) : documentDetails ? (
                        <div className="w-full border rounded-lg p-4 bg-card space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px] md:max-w-xs" title={documentDetails.fileName || documentDetails.name || 'دليل مرفق'}>
                                {documentDetails.fileName || documentDetails.name || 'دليل مرفق'}
                              </p>
                              {(documentDetails.contentType || documentDetails.mimeType) && (
                                <p className="text-xs text-muted-foreground mt-0.5">التنسيق: {documentDetails.contentType || documentDetails.mimeType}</p>
                              )}
                              {documentDetails.fileSizeBytes !== undefined && (
                                <p className="text-xs text-muted-foreground mt-0.5">الحجم: {formatBytes(documentDetails.fileSizeBytes)}</p>
                              )}
                              {documentDetails.uploadedAt && (
                                <p className="text-xs text-muted-foreground mt-0.5">تاريخ الرفع: {formatDate(documentDetails.uploadedAt)}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            className="w-full border-none"
                            onClick={handleDownloadDocument}
                          >
                            تحميل المستند
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full text-center py-6 border border-dashed rounded-lg bg-red-50 text-red-600">
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

                    {/* Response Section */}
                    {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected' ? (
                      <div className={`p-4 rounded-lg border ${selectedComplaint.status === 'resolved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <p className={`text-xs font-bold uppercase tracking-wider ${selectedComplaint.status === 'resolved' ? 'text-green-700' : 'text-red-700'}`}>
                                ملاحظة الحل
                              </p>
                              {selectedComplaint.responseDate && (
                                <p className={`text-xs font-bold ${selectedComplaint.status === 'resolved' ? 'text-green-600' : 'text-red-600'}`}>
                                  تم الحل بتاريخ: {selectedComplaint.responseDate}
                                </p>
                              )}
                            </div>
                            <p className={`text-base font-medium whitespace-pre-wrap p-4 rounded-xl ${selectedComplaint.status === 'resolved' ? 'text-green-800 bg-green-100/50' : 'text-red-800 bg-red-100/50'}`}>
                              {selectedComplaint.response || 'لا توجد ملاحظات مقدمة.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block">
                          <span className="text-base font-medium mb-2 block">الرد على الشكوى:</span>

                          <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="اكتب ردك على الشكوى هنا..."
                            rows={5}
                            className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </label>
                        <div className="flex flex-col md:flex-row items-center gap-3">
                          <Button
                            onClick={handleResolve}
                            disabled={!response.trim() || actionLoading}
                            className="w-full md:flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-sm"
                          >
                            تم الحل
                          </Button>
                          {selectedComplaint.status !== 'underReview' && (
                            <Button
                              onClick={handleUnderReview}
                              disabled={actionLoading}
                              className="w-full md:flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
                            >
                              قيد المراجعة
                            </Button>
                          )}
                        </div>


                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )
      }
    </div >
  );
}