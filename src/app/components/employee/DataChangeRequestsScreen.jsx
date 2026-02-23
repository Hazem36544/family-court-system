import React, { useState, useEffect } from 'react';
import { FileEdit, Filter, Clock, CheckCircle, XCircle, Eye, User, Calendar, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { requestsAPI } from '../../../services/api'; // استيراد الـ API الصحيح
import { toast } from 'react-hot-toast';

export function DataChangeRequestsScreen({ onNavigate, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionNotes, setActionNotes] = useState(''); // لإضافة ملاحظات عند القبول/الرفض
  
  // State للبيانات الحقيقية
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. جلب الطلبات من السيرفر
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // بناء الـ Parameters حسب الفلتر المختار
      const params = {
        PageNumber: 1,
        PageSize: 50
      };
      
      // إذا كان هناك فلتر للحالة غير 'all'، نقوم بإرساله
      // ملاحظة: قد يحتاج السيرفر أن تكون الحالة capitalized (مثل 'Pending')
      if (statusFilter !== 'all') {
         params.Status = statusFilter; 
      }

      // الاتصال بالرابط GET /api/custody-requests المخصص في api.js
      const res = await requestsAPI.list(params);
      
      const rawData = res.data?.items || res.data || [];

      // تحويل البيانات (Mapping) لتناسب الواجهة بناءً على CustodyRequestResponse
      const mappedRequests = rawData.map(item => ({
        id: item.id,
        // نعرض اسم الأب أو الأم كمقدم للطلب (أو كلاهما)
        parentName: item.fatherName || item.motherName || 'غير محدد',
        parentType: item.fatherName ? 'father' : 'mother', // افتراض للعرض
        requestDate: item.requestedAt ? item.requestedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: translateStatus(item.status), // توحيد الحالة للفلترة المحلية والعرض
        rawStatus: item.status,
        // تغييرات الحضانة المطلوبة
        startDate: item.startDate,
        endDate: item.endDate,
        reason: item.reason || 'لا توجد أسباب مسجلة',
        decisionNote: item.decisionNote || '',
        processedAt: item.processedAt ? item.processedAt.split('T')[0] : null
      }));

      setRequests(mappedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("فشل تحميل قائمة الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  // دوال مساعدة لترجمة الحالة
  const translateStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'accepted') return 'approved';
    if (s === 'rejected' || s === 'declined') return 'rejected';
    return 'pending'; // Default
  };

  // 2. معالجة الطلب (موافقة / رفض)
  const processRequest = async (requestId, isApproved) => {
    setActionLoading(true);
    try {
      // بناءً على Swagger: ProcessCustodyRequest.Request
      await requestsAPI.process(requestId, {
         isApproved: isApproved,
         decisionNote: actionNotes || (isApproved ? 'تمت الموافقة' : 'تم الرفض')
      });

      toast.success(isApproved ? "تمت الموافقة على الطلب بنجاح" : "تم رفض الطلب بنجاح");
      await fetchRequests(); // تحديث القائمة
      setSelectedRequest(null);
      setActionNotes(''); // تفريغ الملاحظات
    } catch (error) {
      console.error("Error processing request", error);
      toast.error("فشل تنفيذ العملية");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter requests locally (for local search by ID or name)
  const filteredRequests = requests.filter(request => {
    const matchesSearch = (request.parentName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (request.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

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
            <h1 className="text-2xl font-bold mb-1">طلبات التعديل والحضانة</h1>
            <p className="text-blue-200 text-sm opacity-90">مراجعة والبت في طلبات أولياء الأمور</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {pendingCount} طلب قيد المراجعة</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-8">
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
        ) : (
        <>
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
                    <option value="pending">قيد المراجعة</option>
                    <option value="approved">موافق عليه</option>
                    <option value="rejected">مرفوض</option>
                  </select>
              </div>
              <div className="w-full md:w-1/3">
                  <input 
                    type="text" 
                    placeholder="بحث بالاسم أو رقم الطلب..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                  />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-yellow-700 mb-1">قيد المراجعة</p>
                    <p className="text-2xl font-bold text-yellow-800">{requests.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-700" /></div>
                </div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-green-700 mb-1">موافق عليها</p>
                    <p className="text-2xl font-bold text-green-800">{requests.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-700" /></div>
                </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-red-700 mb-1">مرفوضة</p>
                    <p className="text-2xl font-bold text-red-800">{requests.filter(r => r.status === 'rejected').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center"><XCircle className="w-6 h-6 text-red-700" /></div>
                </div>
            </Card>
            </div>

            {/* Requests List */}
            <Card className="overflow-hidden bg-card border-border">
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium">مقدم الطلب</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">تاريخ الطلب</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {filteredRequests.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد طلبات مطابقة</p>
                        </td>
                    </tr>
                    ) : (
                    filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${request.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'}`}>
                                <User className={`w-5 h-5 ${request.parentType === 'father' ? 'text-primary' : 'text-pink-600'}`} />
                            </div>
                            <div>
                                <span className="font-medium block">{request.parentName}</span>
                                <span className="text-xs text-muted-foreground font-mono">ID: {request.id.substring(0,8)}</span>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />{request.requestDate}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 border px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                            {getStatusIcon(request.status)} {getStatusText(request.status)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)} className="text-primary hover:text-primary hover:bg-primary/10">
                            <Eye className="w-4 h-4 ml-1" /> التفاصيل والقرار
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-3xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل طلب الحضانة / التعديل</h2>
                  <p className="text-sm text-muted-foreground font-mono">رقم الطلب: {selectedRequest.id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(null); setActionNotes(''); }} className="hover:bg-muted"><XCircle className="w-5 h-5" /></Button>
              </div>

              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> معلومات الطلب الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">الأطراف (إن وجد):</span> <span className="font-medium mr-2">{selectedRequest.parentName}</span></div>
                  <div><span className="text-muted-foreground">تاريخ تقديم الطلب:</span> <span className="font-medium mr-2">{selectedRequest.requestDate}</span></div>
                  <div><span className="text-muted-foreground">الحالة الحالية:</span> <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-medium mr-2 ${getStatusBadge(selectedRequest.status)}`}>{getStatusIcon(selectedRequest.status)} {getStatusText(selectedRequest.status)}</span></div>
                  {selectedRequest.processedAt && (
                    <div><span className="text-muted-foreground">تاريخ المعالجة:</span> <span className="font-medium mr-2">{selectedRequest.processedAt}</span></div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">تفاصيل التعديل / الطلب:</h3>
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded p-3">
                         <p className="text-xs text-blue-700 mb-1">تاريخ البدء المقترح:</p>
                         <p className="text-sm font-medium text-blue-900">{selectedRequest.startDate || 'غير محدد'}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded p-3">
                         <p className="text-xs text-blue-700 mb-1">تاريخ الانتهاء المقترح:</p>
                         <p className="text-sm font-medium text-blue-900">{selectedRequest.endDate || 'غير محدد'}</p>
                      </div>
                   </div>
                   <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">أسباب تقديم الطلب:</p>
                      <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{selectedRequest.reason}</p>
                   </div>
                </div>
              </div>

              {selectedRequest.status !== 'pending' && selectedRequest.decisionNote && (
                <div className={`mb-6 p-4 rounded-lg border ${selectedRequest.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <h3 className={`font-medium mb-2 ${selectedRequest.status === 'approved' ? 'text-green-900' : 'text-red-900'}`}>ملاحظات القرار المتخذ:</h3>
                  <p className={`text-sm ${selectedRequest.status === 'approved' ? 'text-green-800' : 'text-red-800'} whitespace-pre-wrap`}>{selectedRequest.decisionNote}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات القرار (اختياري / تظهر لولي الأمر):</label>
                    <textarea 
                       value={actionNotes}
                       onChange={(e) => setActionNotes(e.target.value)}
                       placeholder="اكتب سبب الرفض أو شروط القبول..."
                       className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => processRequest(selectedRequest.id, true)} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4 ml-2" />} قبول الطلب
                    </Button>
                    <Button variant="outline" onClick={() => processRequest(selectedRequest.id, false)} disabled={actionLoading} className="flex-1 border-red-500 text-red-600 hover:bg-red-50">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4 ml-2" />} رفض الطلب
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="pt-4 border-t border-border mt-4">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)} className="w-full">إغلاق النافذة</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}