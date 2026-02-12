import React, { useState } from 'react';
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
  ChevronRight // تم إضافة هذه الأيقونة لزر الرجوع
} from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ComplaintsManagement({ onNavigate, onBack }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');

  // Mock data - في التطبيق الحقيقي سيتم جلبها من API
  const [complaints, setComplaints] = useState([
    {
      id: 'C-001',
      complaintNumber: 'COMP-2024-001',
      parentId: 'P-001',
      parentName: 'أحمد محمد عبد الله',
      parentPhone: '01012345678',
      caseNumber: 'Q-2024-001',
      type: 'منع الزيارة',
      subject: 'منع رؤية الأطفال بشكل متكرر',
      description: 'تم منعي من رؤية أطفالي في آخر ثلاث زيارات متتالية بدون أي سبب مشروع. تم الاتفاق على مواعيد الزيارة في حكم المحكمة ولكن الطرف الآخر لا يلتزم بها.',
      submissionDate: '2024-02-08',
      status: 'pending',
      priority: 'high',
      assignedTo: 'موظف المحكمة الأول'
    },
    {
      id: 'C-002',
      complaintNumber: 'COMP-2024-002',
      parentId: 'P-002',
      parentName: 'فاطمة حسن علي',
      parentPhone: '01098765432',
      caseNumber: 'Q-2024-003',
      type: 'عدم دفع النفقة',
      subject: 'تأخر في دفع نفقة الأطفال',
      description: 'لم يتم دفع النفقة منذ ثلاثة أشهر رغم الحكم الصادر من المحكمة. الأطفال يعانون من عدم توفر احتياجاتهم الأساسية.',
      submissionDate: '2024-02-07',
      status: 'under-review',
      priority: 'high',
      assignedTo: 'موظف المحكمة الثاني',
      notes: 'تم التواصل مع الطرف الآخر'
    },
    {
      id: 'C-003',
      complaintNumber: 'COMP-2024-003',
      parentId: 'P-003',
      parentName: 'محمود عبد العزيز',
      parentPhone: '01123456789',
      caseNumber: 'Q-2024-005',
      type: 'عدم الالتزام بموعد الزيارة',
      subject: 'تغيير مواعيد الزيارة باستمرار',
      description: 'يتم تغيير مواعيد الزيارة في اللحظة الأخيرة مما يسبب إزعاج كبير وتكاليف إضافية للتنقل.',
      submissionDate: '2024-02-06',
      status: 'resolved',
      priority: 'medium',
      assignedTo: 'موظف المحكمة الأول',
      responseDate: '2024-02-08',
      response: 'تم التواصل مع الطرفين والاتفاق على جدول زمني ثابت للزيارات. تم توثيق الاتفاق وإرساله للطرفين.'
    },
    {
      id: 'C-004',
      complaintNumber: 'COMP-2024-004',
      parentId: 'P-004',
      parentName: 'سارة إبراهيم',
      parentPhone: '01234567890',
      caseNumber: 'Q-2024-007',
      type: 'سوء معاملة الأطفال',
      subject: 'معاملة سيئة للأطفال أثناء الزيارة',
      description: 'الأطفال يعودون من الزيارات في حالة نفسية سيئة ويشتكون من المعاملة القاسية.',
      submissionDate: '2024-02-05',
      status: 'pending',
      priority: 'high',
      assignedTo: 'موظف المحكمة الثالث'
    },
    {
      id: 'C-005',
      complaintNumber: 'COMP-2024-005',
      parentId: 'P-005',
      parentName: 'خالد أحمد',
      parentPhone: '01156789012',
      caseNumber: 'Q-2024-010',
      type: 'عدم الالتزام بقرار المحكمة',
      subject: 'عدم تنفيذ قرار المحكمة',
      description: 'صدر قرار من المحكمة بخصوص الحضانة ولكن لم يتم تنفيذه حتى الآن.',
      submissionDate: '2024-02-04',
      status: 'under-review',
      priority: 'medium',
      assignedTo: 'موظف المحكمة الثاني'
    },
    {
      id: 'C-006',
      complaintNumber: 'COMP-2024-006',
      parentId: 'P-006',
      parentName: 'نورا محمد',
      parentPhone: '01267890123',
      caseNumber: 'Q-2024-012',
      type: 'أخرى',
      subject: 'استفسار عن إجراءات تعديل الحكم',
      description: 'أرغب في معرفة الإجراءات اللازمة لتعديل حكم الزيارة بسبب تغير الظروف.',
      submissionDate: '2024-02-03',
      status: 'resolved',
      priority: 'low',
      responseDate: '2024-02-05',
      response: 'تم توضيح الإجراءات المطلوبة وإرسال قائمة بالمستندات اللازمة.'
    }
  ]);

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesStatus;
  });

  const handleResolve = () => {
    if (selectedComplaint && response.trim()) {
      setComplaints(complaints.map(c => 
        c.id === selectedComplaint.id 
          ? { 
              ...c, 
              status: 'resolved', 
              response: response,
              responseDate: new Date().toISOString().split('T')[0]
            } 
          : c
      ));
      setSelectedComplaint(null);
      setResponse('');
    }
  };

  const handleReject = () => {
    if (selectedComplaint && response.trim()) {
      setComplaints(complaints.map(c => 
        c.id === selectedComplaint.id 
          ? { 
              ...c, 
              status: 'rejected', 
              response: response,
              responseDate: new Date().toISOString().split('T')[0]
            } 
          : c
      ));
      setSelectedComplaint(null);
      setResponse('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'under-review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'جديدة';
      case 'under-review':
        return 'قيد المراجعة';
      case 'resolved':
        return 'تم الحل';
      case 'rejected':
        return 'مرفوضة';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'under-review':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const underReviewCount = complaints.filter(c => c.status === 'under-review').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

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
            <h1 className="text-2xl font-bold mb-1">إدارة الشكاوى</h1>
            <p className="text-blue-200 text-sm opacity-90">مراجعة والرد على شكاوى أولياء الأمور</p>
          </div>
        </div>

        {/* تنبيه صغير */}
        {pendingCount > 0 && (
          <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">لديك {pendingCount} شكوى جديدة تحتاج للمراجعة</span>
          </div>
        )}
      </div>
      {/* --- نهاية الهيدر الجديد --- */}

      <div className="max-w-7xl mx-auto px-8">
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

          <Card className="p-4 bg-blue-50 border-blue-200">
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
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">جديدة</option>
              <option value="under-review">قيد المراجعة</option>
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
                  <th className="text-right px-6 py-4 text-sm font-medium">ولي الأمر</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">رقم القضية</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
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
                            <p className="text-xs text-muted-foreground">{complaint.parentPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{complaint.caseNumber}</span>
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
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
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

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-4xl bg-card max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold mb-1">تفاصيل الشكوى</h2>
                  <p className="text-sm text-muted-foreground">رقم الشكوى: {selectedComplaint.complaintNumber}</p>
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
                        <p className="text-xs text-muted-foreground mb-1">الوصف:</p>
                        <p className="text-sm leading-relaxed">{selectedComplaint.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">تاريخ التقديم:</p>
                          <p className="text-sm font-medium">{selectedComplaint.submissionDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">رقم القضية:</p>
                          <p className="text-sm font-medium font-mono">{selectedComplaint.caseNumber}</p>
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
                            {selectedComplaint.responseDate}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${
                            selectedComplaint.status === 'resolved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            الرد:
                          </p>
                          <p className={`text-sm leading-relaxed ${
                            selectedComplaint.status === 'resolved' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedComplaint.response}
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
                          disabled={!response.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          حل الشكوى
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleReject}
                          disabled={!response.trim()}
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
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
                        <p className="text-xs text-muted-foreground mb-1">رقم الجوال:</p>
                        <a 
                          href={`tel:${selectedComplaint.parentPhone}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          {selectedComplaint.parentPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.notes && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium mb-2 text-blue-900 text-sm">ملاحظات داخلية:</h3>
                      <p className="text-xs text-blue-800">{selectedComplaint.notes}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => onNavigate('case-details', { caseNumber: selectedComplaint.caseNumber })}
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