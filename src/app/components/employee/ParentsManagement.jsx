import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Search, User, UserPlus, Users, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { courtAPI } from '../api'; // استيراد الـ API
import { toast } from 'react-hot-toast';

export function ParentsManagement({ onBack, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State for API data
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });

  // 1. جلب البيانات من السيرفر
  const fetchFamilies = async (nationalIdSearch = null) => {
    setIsLoading(true);
    try {
      // إعداد الباراميترز
      const params = {
        PageNumber: 1,
        PageSize: 100, // نجلب عدد كبير للفلترة المحلية حالياً
      };

      // لو البحث بالرقم القومي نبعته للسيرفر
      if (nationalIdSearch) {
        params.NationalId = nationalIdSearch;
      }

      const response = await courtAPI.searchFamilies(params);
      
      if (response.data && response.data.items) {
        setFamilies(response.data.items);
        setPagination({
            pageNumber: response.data.pageNumber,
            totalPages: response.data.totalPages,
            totalCount: response.data.totalCount
        });
      }
    } catch (error) {
      console.error("Error fetching families:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الأسر");
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل مبدئي
  useEffect(() => {
    fetchFamilies();
  }, []);

  // التعامل مع البحث عند الضغط على Enter أو توقف الكتابة
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        // لو البحث أرقام فقط (رقم قومي) نكلم السيرفر
        if (/^\d+$/.test(searchTerm) && searchTerm.length > 4) {
            fetchFamilies(searchTerm);
        } else if (searchTerm === '') {
            fetchFamilies(); // إعادة تعيين
        }
        // لو بحث بالاسم، هنعتمد على الفلترة المحلية في الخطوة التالية
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  // 2. تحويل هيكل الأسرة (Family) إلى قائمة أفراد (Parents)
  // Flatten Families into Parents List
  const processedParents = useMemo(() => {
    let parentsList = [];

    families.forEach(family => {
        // معالجة الأب
        if (family.father) {
            parentsList.push({
                id: family.father.id,
                familyId: family.familyId,
                name: family.father.fullName,
                parentType: 'father',
                nationalId: family.father.nationalId,
                phone: family.father.phone || '-',
                email: family.father.email || '-',
                // محاولة استخراج المدينة من العنوان إذا كان بتنسيق "المدينة - العنوان"
                city: family.father.address ? family.father.address.split('-')[0].trim() : 'غير محدد', 
                address: family.father.address,
                caseId: null, // القائمة لا ترجع رقم القضية حالياً
                status: 'active' // افتراضي
            });
        }
        // معالجة الأم
        if (family.mother) {
            parentsList.push({
                id: family.mother.id,
                familyId: family.familyId,
                name: family.mother.fullName,
                parentType: 'mother',
                nationalId: family.mother.nationalId,
                phone: family.mother.phone || '-',
                email: family.mother.email || '-',
                city: family.mother.address ? family.mother.address.split('-')[0].trim() : 'غير محدد',
                address: family.mother.address,
                caseId: null,
                status: 'active'
            });
        }
    });

    // 3. تطبيق الفلاتر المحلية (للاسم والنوع)
    return parentsList.filter(parent => {
        const lowerSearch = searchTerm.toLowerCase();
        // البحث يشمل الاسم أو الرقم القومي أو الهاتف
        const matchesSearch = 
            parent.name?.toLowerCase().includes(lowerSearch) || 
            parent.nationalId?.includes(lowerSearch) ||
            parent.phone?.includes(lowerSearch);
        
        const matchesType = filterType === 'all' || parent.parentType === filterType;
        const matchesStatus = filterStatus === 'all' || parent.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });
  }, [families, searchTerm, filterType, filterStatus]);


  // إحصائيات سريعة من البيانات المعروضة
  const stats = {
    total: processedParents.length,
    fathers: processedParents.filter(p => p.parentType === 'father').length,
    mothers: processedParents.filter(p => p.parentType === 'mother').length,
    active: processedParents.filter(p => p.status === 'active').length
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
            <div className="flex gap-3">
                <Button 
                    onClick={() => fetchFamilies()} 
                    variant="secondary" 
                    className="h-11 px-4 bg-white/10 hover:bg-white/20 text-white border-0"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
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
                <p className="text-2xl font-bold">{pagination.totalCount > 0 ? pagination.totalCount * 2 : stats.total}</p> {/* تقريبي لأن كل أسرة فيها فردين */}
                <p className="text-sm text-muted-foreground">إجمالي الأفراد</p>
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
                  placeholder="البحث بالاسم، رقم البطاقة..."
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
                  <th className="text-right px-6 py-4 text-sm font-medium">العائلة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        </td>
                    </tr>
                ) : processedParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>لا توجد نتائج مطابقة للبحث</p>
                    </td>
                  </tr>
                ) : (
                  processedParents.map((parent, index) => (
                    <tr key={`${parent.id}-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            parent.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'
                          }`}>
                            <User className={`w-5 h-5 ${
                              parent.parentType === 'father' ? 'text-primary' : 'text-pink-600'
                            }`} />
                          </div>
                          <div>
                            <span className="font-medium block">{parent.name}</span>
                            <span className="text-xs text-muted-foreground">{parent.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">{parent.nationalId}</td>
                      <td className="px-6 py-4 text-sm">{parent.city}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {parent.familyId.substring(0, 8)}...
                        </span>
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
                          // عند الضغط ننتقل لتفاصيل الأسرة باستخدام معرف الأسرة
                          onClick={() => onNavigate('family-details', { familyId: parent.familyId })}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Search className="w-4 h-4 ml-1" />
                          التفاصيل
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
        {!isLoading && processedParents.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            عرض {processedParents.length} فرد (من أصل {families.length} أسرة)
          </p>
        )}
      </div>
    </div>
  );
}