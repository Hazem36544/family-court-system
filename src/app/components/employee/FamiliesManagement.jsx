import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Users, ChevronRight,
  FileText, AlertCircle, Loader2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import api from '../../../services/api'; 
import { toast } from 'react-hot-toast';

export function FamiliesManagement({ onNavigate, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFamilies = async (query = '') => {
    setLoading(true);
    try {
      const params = { PageSize: 10, PageNumber: 1 };
      if (query) params.NationalId = query;
      const response = await api.get('/api/courts/me/families', { params });
      
      setTotalCount(response.data.totalCount || 0);
      const familiesData = response.data.items || [];
      
      const formattedFamilies = familiesData.map(family => ({
        id: family.familyId,
        displayId: family.familyId.substring(0, 8).toUpperCase(),
        fatherName: family.father?.fullName || 'غير مسجل',
        motherName: family.mother?.fullName || 'غير مسجل',
        children: family.children?.length || 0,
        statusLabel: 'مسجلة',
        statusClass: 'bg-green-100 text-green-700'
      }));
      setFamilies(formattedFamilies);
    } catch (err) {
      console.error("Error fetching families:", err);
      setFamilies([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFamilies(); }, []);

  const handleSearch = () => fetchFamilies(searchTerm);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">
      
      {/* 1. Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">إدارة الأسر</h1>
            <p className="text-blue-200 text-sm opacity-90">السجل المركزي للأسر المسجلة في النظام</p>
          </div>
        </div>
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
           <Users className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* 2. Search & Stats */}
      <div className="flex flex-col gap-6 mb-8">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="البحث بالرقم القومي للأب أو الأم..."
                  className="w-full pr-12 h-12 rounded-xl bg-white border-none shadow-sm text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <Button onClick={() => onNavigate('new-family')} className="bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-sm h-12 px-6 rounded-xl gap-2 font-bold transition-transform hover:scale-105">
                <Plus className="w-5 h-5" /> <span>إضافة أسرة جديدة</span>
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right"><p className="text-2xl font-bold text-gray-800">{totalCount}</p><p className="text-xs text-gray-500">إجمالي الأسر</p></div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
            </Card>
            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right"><p className="text-2xl font-bold text-gray-800">{totalCount}</p><p className="text-xs text-gray-500">أسر نشطة</p></div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><FileText className="w-6 h-6" /></div>
            </Card>
            <Card className="p-4 bg-white border-none shadow-sm rounded-xl flex items-center justify-between">
                <div className="text-right"><p className="text-2xl font-bold text-gray-800">0</p><p className="text-xs text-gray-500">تحتاج استكمال</p></div>
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><AlertCircle className="w-6 h-6" /></div>
            </Card>
         </div>
      </div>

      {/* 3. Grid View */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          {families.map((family) => (
            <Card 
              key={family.id}
              onClick={() => onNavigate('family-details', { familyId: family.id })}
              className="group bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all rounded-xl p-6 cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="text-right flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                       <Users className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-gray-600 font-mono mb-1">{family.displayId}</div>
                       <div className="text-gray-400 text-xs font-mono">{family.id.substring(0, 8)}...</div>
                    </div>
                 </div>
                 {/* تم إزالة زر التعديل كما طلبت ليكون التعديل من داخل صفحة التفاصيل */}
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-xs text-gray-400 order-1">الأب</span>
                    <span className="font-bold text-gray-800 text-lg order-2">{family.fatherName}</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-xs text-gray-400 order-1">الأم</span>
                    <span className="font-medium text-gray-700 order-2">{family.motherName}</span>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-400 order-1">عدد الأطفال: <span className="text-gray-700 font-bold">{family.children}</span></span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold order-2 ${family.statusClass}`}>
                       {family.statusLabel}
                    </span>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}