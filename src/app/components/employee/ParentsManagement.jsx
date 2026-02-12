import React, { useState } from 'react';
import { ChevronLeft, Search, User, Phone, Mail, Eye, UserPlus, Filter, Users } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ParentsManagement({ onBack, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - في التطبيق الحقيقي سيتم جلبها من API
  const mockParents = [
    {
      id: '1',
      name: 'أحمد محمد عبد الله',
      parentType: 'father',
      nationalId: '12345678901234',
      phone: '01012345678',
      email: 'ahmed.mohamed@email.com',
      city: 'القاهرة',
      address: 'مدينة نصر - شارع عباس العقاد',
      caseId: 'CASE-2024-001',
      username: 'parent_12345678901234',
      registrationDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'فاطمة حسن علي',
      parentType: 'mother',
      nationalId: '23456789012345',
      phone: '01123456789',
      email: 'fatma.hassan@email.com',
      city: 'الجيزة',
      address: 'الدقي - شارع التحرير',
      caseId: 'CASE-2024-002',
      username: 'parent_23456789012345',
      registrationDate: '2024-01-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'محمود عبد الرحمن',
      parentType: 'father',
      nationalId: '34567890123456',
      phone: '01234567890',
      email: 'mahmoud.abdelrahman@email.com',
      city: 'الإسكندرية',
      address: 'سموحة - شارع فوزي معاذ',
      caseId: 'CASE-2024-003',
      username: 'parent_34567890123456',
      registrationDate: '2024-02-01',
      status: 'active'
    },
    {
      id: '4',
      name: 'سارة أحمد محمد',
      parentType: 'mother',
      nationalId: '45678901234567',
      phone: '01098765432',
      email: 'sara.ahmed@email.com',
      city: 'القاهرة',
      address: 'مصر الجديدة - شارع الحجاز',
      username: 'parent_45678901234567',
      registrationDate: '2024-02-05',
      status: 'inactive'
    },
    {
      id: '5',
      name: 'خالد يوسف إبراهيم',
      parentType: 'father',
      nationalId: '56789012345678',
      phone: '01156789012',
      email: 'khaled.youssef@email.com',
      city: 'الجيزة',
      address: 'فيصل - شارع الهرم',
      caseId: 'CASE-2024-004',
      username: 'parent_56789012345678',
      registrationDate: '2024-02-10',
      status: 'active'
    },
    {
      id: '6',
      name: 'منى سعيد حسن',
      parentType: 'mother',
      nationalId: '67890123456789',
      phone: '01267890123',
      email: 'mona.saeed@email.com',
      city: 'القاهرة',
      address: 'المعادي - شارع 9',
      caseId: 'CASE-2024-005',
      username: 'parent_67890123456789',
      registrationDate: '2024-02-15',
      status: 'active'
    }
  ];

  const filteredParents = mockParents.filter(parent => {
    const matchesSearch = parent.name.includes(searchTerm) || 
                          parent.nationalId.includes(searchTerm) ||
                          parent.phone.includes(searchTerm) ||
                          parent.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || parent.parentType === filterType;
    const matchesStatus = filterStatus === 'all' || parent.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockParents.length,
    fathers: mockParents.filter(p => p.parentType === 'father').length,
    mothers: mockParents.filter(p => p.parentType === 'mother').length,
    active: mockParents.filter(p => p.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-2xl">إدارة أولياء الأمور</h1>
                <p className="text-sm opacity-80 mt-1">عرض وإدارة حسابات أولياء الأمور</p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate('add-parent')}
              className="bg-green-600 hover:bg-green-700 text-white h-11 px-6"
            >
              <UserPlus className="w-5 h-5 ml-2" />
              إضافة ولي أمر
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي أولياء الأمور</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.fathers}</p>
                <p className="text-sm text-muted-foreground">الآباء</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.mothers}</p>
                <p className="text-sm text-muted-foreground">الأمهات</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">حسابات نشطة</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث بالاسم، رقم البطاقة، الجوال..."
                  className="w-full pr-10 pl-4 py-3 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background"
              >
                <option value="all">جميع الأنواع</option>
                <option value="father">الآباء</option>
                <option value="mother">الأمهات</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Parents Table */}
        <Card className="overflow-hidden bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium">الاسم</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">رقم البطاقة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">المدينة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">رقم القضية</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>لا توجد نتائج مطابقة للبحث</p>
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            parent.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'
                          }`}>
                            <User className={`w-5 h-5 ${
                              parent.parentType === 'father' ? 'text-primary' : 'text-pink-600'
                            }`} />
                          </div>
                          <span className="font-medium">{parent.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">{parent.nationalId}</td>
                      <td className="px-6 py-4 text-sm">{parent.city}</td>
                      <td className="px-6 py-4">
                        {parent.caseId ? (
                          <span className="text-sm font-mono text-primary">{parent.caseId}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          parent.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {parent.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate('parent-details', parent)}
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

        {/* Results Count */}
        {filteredParents.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            عرض {filteredParents.length} من {mockParents.length} ولي أمر
          </p>
        )}
      </div>
    </div>
  );
}