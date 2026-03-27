import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertTriangle, User, Calendar, FileText, XCircle, CheckCircle, Clock, Eye, Loader2, Filter, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { alertsAPI, courtAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export function ViolationsScreen({ onBack }) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedParentNationalId, setSelectedParentNationalId] = useState('');

  // State for real data
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  // State for server stats
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    resolved: 0
  });

  // 1. Fetch violations from server
  const fetchViolations = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: 1,
        PageSize: 50
      };

      if (statusFilter !== 'all') {
        params.Status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.ViolationType = typeFilter;
      }

      const res = await alertsAPI.list(params);
      const rawItems = res.data?.alerts?.items || [];

      setStats({
        pending: res.data?.pendingCount || 0,
        underReview: res.data?.underReviewCount || 0,
        resolved: res.data?.resolvedCount || 0
      });

      const mappedViolations = rawItems.map(v => ({
        id: v.id,
        courtId: v.courtId,
        parentId: v.parentId,
        parentName: v.parentName || 'غير متوفر',
        relatedEntityId: v.relatedEntityId,
        type: v.violationType,
        description: v.description,
        triggeredAt: v.triggeredAt ? v.triggeredAt.split('T')[0] : 'غير متوفر',
        status: v.status,
        resolvedAt: v.resolvedAt ? v.resolvedAt.split('T')[0] : null,
        resolutionNotes: v.resolutionNotes
      }));

      setViolations(mappedViolations);
    } catch (error) {
      console.error("Error fetching violations:", error);
      toast.error('فشل تحميل قائمة المخالفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    const fetchParentNationalId = async () => {
      if (selectedViolation?.parentId) {
        try {
          const res = await courtAPI.getParent(selectedViolation.parentId);
          setSelectedParentNationalId(res.data?.nationalId || 'غير متوفر');
        } catch (error) {
          console.error("Error fetching parent nationalId:", error);
          setSelectedParentNationalId('غير متوفر');
        }
      } else {
        setSelectedParentNationalId('');
      }
    };
    fetchParentNationalId();
  }, [selectedViolation]);

  // 2. Resolve or Update status
  const updateViolationStatus = async (status) => {
    // Only require notes for resolving, can mark as UnderReview without notes if needed
    if (!selectedViolation || (status === 'Resolved' && !actionNotes.trim())) {
      toast.error(status === 'Resolved' ? 'يرجى تقديم ملاحظات الحل قبل الإغلاق.' : 'بيانات المخالفة مفقودة');
      return;
    }

    setActionLoading(true);
    try {
      console.log(`Sending UpdateObligationAlertStatus request for ID: ${selectedViolation.id} with status: ${status}`);

      const payload = {
        status: status,
        resolutionNotes: actionNotes.trim() || (status === 'UnderReview' ? 'Reviewing the violation...' : '')
      };

      // Calling UpdateObligationAlertStatus endpoint via alertsAPI.updateStatus
      await alertsAPI.updateStatus(selectedViolation.id, payload);

      toast.success(`تم تحديث حالة المخالفة بنجاح إلى ${status === 'UnderReview' ? 'قيد المراجعة' : 'محولة'}`);

      await fetchViolations();
      setSelectedViolation(null);
      setActionNotes('');
    } catch (error) {
      console.error('Error updating violation status:', error);
      toast.error(error.message || 'فشل معالجة الإجراء');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'UnderReview': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'UnderReview': return <AlertCircle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getViolationTypeLabel = (type) => {
    switch (type) {
      case 'MissedVisit': return 'زيارة فائتة';
      case 'OverstayedVisit': return 'تجاوز وقت الزيارة';
      case 'UnpaidAlimony': return 'نفقة غير مدفوعة';
      case 'CustodyBreach': return 'مخالفة شروط الحضانة';
      default: return type;
    }
  };

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
            <h1 className="text-2xl font-bold mb-1">Violations & Alerts</h1>
          </div>
        </div>
      </div> */}

      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/2 opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold mb-1">المخالفات والتنبيهات</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gray-50 border-gray-200 text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
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
                    <p className="text-2xl font-bold text-blue-800">{stats.underReview}</p>
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
                    <p className="text-2xl font-bold text-green-800">{stats.resolved}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-700" /></div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-muted-foreground ml-1" />
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">تصفية حسب:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px] w-full"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="Pending">قيد الانتظار</option>
                  <option value="UnderReview">قيد المراجعة</option>
                  <option value="Resolved">تم الحل</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px] w-full"
                >
                  <option value="all">جميع أنواع المخالفات</option>
                  <option value="MissedVisit">زيارة فائتة</option>
                  <option value="OverstayedVisit">تجاوز وقت الزيارة</option>
                  <option value="UnpaidAlimony">نفقة غير مدفوعة</option>
                  <option value="CustodyBreach">مخالفة شروط الحضانة</option>
                </select>
              </div>
            </div>

            {/* Violations List */}
            <Card className="overflow-hidden bg-card border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-right px-6 py-4 font-semibold text-muted-foreground">الوالد/ة</th>
                      <th className="text-right px-6 py-4 font-semibold text-muted-foreground">النوع</th>
                      <th className="text-right px-6 py-4 font-semibold text-muted-foreground">تاريخ التنشيط</th>
                      <th className="text-right px-6 py-4 font-semibold text-muted-foreground">الحالة</th>
                      <th className="text-right px-6 py-4 font-semibold text-muted-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {violations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>لم يتم العثور على مخالفات</p>
                        </td>
                      </tr>
                    ) : (
                      violations.map((violation) => (
                        <tr key={violation.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <span className="font-medium block">{violation.parentName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{getViolationTypeLabel(violation.type)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />{violation.triggeredAt}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-sans">
                            <span className={`inline-flex items-center gap-1 border px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(violation.status)}`}>
                              {getStatusIcon(violation.status)} {violation.status === 'Pending' ? 'قيد الانتظار' : violation.status === 'UnderReview' ? 'قيد المراجعة' : 'تم الحل'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedViolation(violation)} className="text-primary hover:text-primary hover:bg-primary/10 border-none">
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

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-3xl bg-card max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 text-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل المخالفة</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedViolation(null); setActionNotes(''); }} className="hover:bg-muted border-none"><XCircle className="w-5 h-5" /></Button>
              </div>

              <div className="mb-6 p-5 bg-muted/30 rounded-2xl border border-border/50">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#1e3a8a] border-b border-blue-100 pb-2"><AlertCircle className="w-5 h-5" /> نظرة عامة على المعلومات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">اسم الوالد/ة</span>
                    <span className="font-medium text-gray-900">{selectedViolation.parentName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">الرقم القومي</span>
                    <span className="font-medium text-gray-900 font-sans">{selectedParentNationalId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">نوع المخالفة</span>
                    <span className="font-medium text-gray-900">{getViolationTypeLabel(selectedViolation.type)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">تاريخ التنشيط</span>
                    <span className="font-medium text-gray-900 font-sans">{selectedViolation.triggeredAt}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">الحالة الحالية</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-semibold mt-1 ${getStatusBadge(selectedViolation.status)}`}>
                      {getStatusIcon(selectedViolation.status)} {selectedViolation.status === 'Pending' ? 'قيد الانتظار' : selectedViolation.status === 'UnderReview' ? 'قيد المراجعة' : 'تم الحل'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 text-right">
                <h3 className="font-medium mb-3">وصف المخالفة:</h3>
                <div className="bg-muted/20 border border-border rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedViolation.description || 'لا يوجد وصف مقدم'}</p>
                </div>
              </div>

              {selectedViolation.status === 'Resolved' && selectedViolation.resolutionNotes && (
                <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-green-900">ملاحظة الحل</h3>
                    {selectedViolation.resolvedAt && (
                      <span className="text-xs font-bold text-green-700">تم الحل بتاريخ: {selectedViolation.resolvedAt}</span>
                    )}
                  </div>
                  <div className="text-base font-medium text-green-800 bg-green-100/50 p-4 rounded-xl whitespace-pre-wrap">
                    {selectedViolation.resolutionNotes}
                  </div>
                </div>
              )}

              {selectedViolation.status !== 'Resolved' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات الحل:</label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="اكتب النتائج أو الإجراءات المتخذة..."
                      className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => updateViolationStatus('Resolved')}
                      disabled={actionLoading || !actionNotes.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm"
                    >
                      تم الحل
                    </Button>
                    {selectedViolation.status !== 'UnderReview' && (
                      <Button
                        onClick={() => updateViolationStatus('UnderReview')}
                        disabled={actionLoading}
                        className="w-full md:flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
                      >
                        قيد المراجعة
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedViolation.status === 'Resolved' && (
                <div className="pt-4 border-t border-border mt-4">
                  <Button variant="outline" onClick={() => setSelectedViolation(null)} className="w-full border-none bg-gray-100 hover:bg-gray-200">إغلاق النافذة</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}