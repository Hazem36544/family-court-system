import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Briefcase, 
  Edit, 
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function CasesManagement({ onNavigate, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');

  // البيانات
  const [casesState] = useState([
    { 
      id: 'CASE-12453', 
      familyId: 'FAM-001',
      fatherName: 'أحمد محمد العلي',
      motherName: 'فاطمة خالد السالم',
      children: 3,
      status: 'نشطة',
      statusClass: 'bg-green-100 text-green-700',
      statusLabel: 'نشطة'
    },
    { 
      id: 'CASE-12387', 
      familyId: 'FAM-002',
      fatherName: 'عبدالله سعد الحربي',
      motherName: 'نورة عبدالرحمن القحطاني',
      children: 2,
      status: 'قيد المراجعة',
      statusClass: 'bg-yellow-100 text-yellow-700',
      statusLabel: 'قيد المراجعة'
    },
    { 
      id: 'CASE-12298', 
      familyId: 'FAM-003',
      fatherName: 'محمد عبدالعزيز الدوسري',
      motherName: 'مريم أحمد الشمري',
      children: 4,
      status: 'نشطة',
      statusClass: 'bg-green-100 text-green-700',
      statusLabel: 'نشطة'
    },
    { 
      id: 'CASE-12156', 
      familyId: 'FAM-004',
      fatherName: 'خالد يوسف المطيري',
      motherName: 'سارة محمد العتيبي',
      children: 1,
      status: 'محفوظة',
      statusClass: 'bg-gray-100 text-gray-700',
      statusLabel: 'محفوظة'
    },
  ]);

  const filteredCases = casesState.filter(c =>
    c.id.includes(searchTerm) || c.fatherName.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">
      
      {/* 1. الهيدر الأزرق الجديد */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">جميع القضايا</h1>
            <p className="text-blue-200 text-sm opacity-90">إدارة القضايا الأسرية المسجلة في المحكمة</p>
          </div>
        </div>
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
           <Briefcase className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* 2. شريط البحث والإضافة */}
      <div className="flex flex-col gap-6 mb-8">
         <div className="flex flex-col md:flex-row gap-4">
            {/* البحث (أول عنصر في RTL = يمين) */}
            <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="البحث برقم القضية..."
                  className="w-full pr-12 pl-4 py-3 h-12 rounded-xl bg-white border-none shadow-sm text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* زر الإضافة (تاني عنصر في RTL = شمال) */}
            <Button 
                onClick={() => onNavigate('new-family')}
                className="bg-white text-gray-700 hover:bg-gray-50 border-none shadow-sm h-12 px-6 rounded-xl gap-2 font-bold"
            >
                <Plus className="w-5 h-5" />
                <span>إضافة قضية جديدة</span>
            </Button>
         </div>

         {/* الإحصائيات */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right"> {/* تعديل المحاذاة */}
                   <p className="text-2xl font-bold text-gray-800">{casesState.length}</p>
                   <p className="text-xs text-gray-500">إجمالي القضايا</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                   <Briefcase className="w-6 h-6" />
                </div>
            </Card>

            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right">
                   <p className="text-2xl font-bold text-gray-800">{casesState.filter(c => c.statusLabel === 'نشطة').length}</p>
                   <p className="text-xs text-gray-500">قضايا نشطة</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                   <FileText className="w-6 h-6" />
                </div>
            </Card>

            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right">
                   <p className="text-2xl font-bold text-gray-800">{casesState.filter(c => c.statusLabel === 'قيد المراجعة').length}</p>
                   <p className="text-xs text-gray-500">قيد المراجعة</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                   <AlertCircle className="w-6 h-6" />
                </div>
            </Card>
         </div>
      </div>

      {/* 3. قائمة الكروت (تصحيح الاتجاهات) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((family) => (
          <Card 
            key={family.id}
            onClick={() => onNavigate('case-details', { familyId: family.familyId })}
            className="group bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-xl p-6 cursor-pointer"
          >
            {/* الهيدر: الأكواد يمين - التعديل شمال */}
            <div className="flex justify-between items-start mb-6">
               
               {/* 1. الأكواد والأيقونة (يمين في RTL) */}
               <div className="text-right flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                     <Users className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-600 font-mono mb-1">
                        {family.familyId}
                     </div>
                     <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                        <span>{family.id}</span>
                     </div>
                  </div>
               </div>

               {/* 2. زر تعديل (شمال في RTL) */}
               <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('new-family', family);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 px-4 h-9"
               >
                  <Edit className="w-4 h-4" />
                  تعديل
               </Button>
            </div>

            {/* تفاصيل القضية */}
            <div className="space-y-4">
               {/* صف الأب */}
               <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                   {/* التسمية يمين */}
                  <span className="text-xs text-gray-400 order-1">الأب</span>
                  {/* الاسم شمال */}
                  <span className="font-bold text-gray-800 text-lg order-2">{family.fatherName}</span>
               </div>

               {/* صف الأم */}
               <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-xs text-gray-400 order-1">الأم</span>
                  <span className="font-medium text-gray-700 order-2">{family.motherName}</span>
               </div>

               {/* صف عدد الأطفال */}
               <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-xs text-gray-400 order-1">عدد الأطفال</span>
                  <span className="font-medium text-gray-700 order-2">{family.children} أطفال</span>
               </div>

               {/* صف حالة القضية */}
               <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-400 order-1">حالة القضية</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold order-2 ${family.statusClass}`}>
                     {family.statusLabel}
                  </span>
               </div>
            </div>

          </Card>
        ))}
      </div>
    </div>
  );
}