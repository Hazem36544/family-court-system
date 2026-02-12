import React, { useState } from 'react';
import { FileEdit, Filter, Clock, CheckCircle, XCircle, Eye, User, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function DataChangeRequestsScreen({ onNavigate, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mock data
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      parentId: 'P-001',
      parentName: 'أحمد محمد عبد الله',
      parentType: 'father',
      requestDate: '2024-02-05',
      status: 'pending',
      changes: [
        { field: 'رقم الجوال', oldValue: '01012345678', newValue: '01098765432' },
        { field: 'البريد الإلكتروني', oldValue: 'ahmed@example.com', newValue: 'ahmed.new@example.com' }
      ],
      reason: 'تغيير رقم الجوال بسبب فقدان الشريحة القديمة'
    },
    {
      id: 'REQ-002',
      parentId: 'P-002',
      parentName: 'فاطمة حسن علي',
      parentType: 'mother',
      requestDate: '2024-02-04',
      status: 'pending',
      changes: [
        { field: 'المدينة', oldValue: 'القاهرة', newValue: 'الجيزة' },
        { field: 'العنوان التفصيلي', oldValue: 'شارع الهرم، المنيل، القاهرة', newValue: 'شارع فيصل، الهرم، الجيزة' }
      ],
      reason: 'الانتقال إلى عنوان جديد'
    },
    {
      id: 'REQ-003',
      parentId: 'P-003',
      parentName: 'محمود عبد العزيز',
      parentType: 'father',
      requestDate: '2024-02-03',
      status: 'approved',
      changes: [
        { field: 'رقم الجوال', oldValue: '01123456789', newValue: '01234567890' }
      ],
      reason: 'تحديث رقم الجوال'
    },
    {
      id: 'REQ-004',
      parentId: 'P-004',
      parentName: 'سارة إبراهيم',
      parentType: 'mother',
      requestDate: '2024-02-02',
      status: 'rejected',
      changes: [
        { field: 'الاسم الكامل', oldValue: 'سارة إبراهيم محمد', newValue: 'سارة إبراهيم أحمد' }
      ],
      reason: 'تصحيح الاسم'
    }
  ]);

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.parentName.includes(searchQuery) || 
                          request.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    setSelectedRequest(null);
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      
      {/* --- بداية الهيدر الجديد (تم التعديل هنا فقط) --- */}
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
            <h1 className="text-2xl font-bold mb-1">طلبات تعديل البيانات</h1>
            <p className="text-blue-200 text-sm opacity-90">مراجعة والموافقة على طلبات تعديل بيانات أولياء الأمور</p>
          </div>
        </div>

        {/* تنبيه عدد الطلبات (بتصميم يتناسب مع الهيدر الجديد) */}
        {pendingCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {pendingCount} طلب قيد المراجعة</span>
          </div>
        )}
      </div>
      {/* --- نهاية الهيدر الجديد --- */}


      <div className="max-w-7xl mx-auto px-8">
        {/* Status Filter - Right aligned */}
        <div className="mb-6 flex justify-start">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">موافق عليها</p>
                <p className="text-2xl font-bold text-green-800">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">مرفوضة</p>
                <p className="text-2xl font-bold text-red-800">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="overflow-hidden bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium">المستخدم</th>
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
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            request.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'
                          }`}>
                            <User className={`w-5 h-5 ${
                              request.parentType === 'father' ? 'text-primary' : 'text-pink-600'
                            }`} />
                          </div>
                          <span className="font-medium">{request.parentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {request.requestDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض التفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-3xl bg-card max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل طلب التعديل</h2>
                  <p className="text-sm text-muted-foreground">رقم الطلب: {selectedRequest.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  className="hover:bg-muted"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              {/* Parent Info */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  معلومات مقدم الطلب
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium mr-2">{selectedRequest.parentName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">النوع:</span>
                    <span className="font-medium mr-2">
                      {selectedRequest.parentType === 'father' ? 'الأب' : 'الأم'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">تاريخ الطلب:</span>
                    <span className="font-medium mr-2">{selectedRequest.requestDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الحالة:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusBadge(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Changes */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">التغييرات المطلوبة:</h3>
                <div className="space-y-3">
                  {selectedRequest.changes.map((change, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">{change.field}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 border border-red-100 rounded p-2">
                          <p className="text-xs text-red-700 mb-1">القيمة الحالية:</p>
                          <p className="text-sm font-medium text-red-900">{change.oldValue}</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded p-2">
                          <p className="text-xs text-green-700 mb-1">القيمة الجديدة:</p>
                          <p className="text-sm font-medium text-green-900">{change.newValue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-900">سبب طلب التعديل:</h3>
                <p className="text-sm text-blue-800">{selectedRequest.reason}</p>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    الموافقة على الطلب
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedRequest.id)}
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض الطلب
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                    className="w-full"
                  >
                    إغلاق
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}