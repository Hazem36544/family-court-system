import React, { useState, useEffect } from 'react';
import {
  Search, Users, ChevronLeft, Loader2, ShieldCheck
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

  // جلب العائلات (مربوط بمسار المحكمة للرقابة)
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
        children: family.children?.length || 0
      }));
      setFamilies(formattedFamilies);
    } catch (err) {
      console.error("Error fetching families:", err);
      setFamilies([]);
      // إخفاء رسالة الخطأ إذا كان الخطأ 404 (لا توجد عائلات)
      if (err.response?.status !== 404) {
        toast.error("حدث خطأ أثناء جلب سجل العائلات");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFamilies(); }, []);

  const handleSearch = () => fetchFamilies(searchTerm);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6" dir="rtl">

      {/* 1. Header المخصص للرقابة */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/3 blur-3xl opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div className="text-right">
            <p className="text-blue-200 text-sm font-medium mb-1 opacity-90">الرقابة والمتابعة</p>
            <h1 className="text-2xl font-bold">سجل العائلات المعتمد</h1>
          </div>
        </div>
        <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center border border-white/10 shadow-inner relative z-10 ml-4">
           <ShieldCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* 2. Search & Stats */}
      <div className="flex flex-col gap-6 mb-8">
        
        {/* تم حذف زر الإضافة وتوسيع مربع البحث ليكون مركزي ومناسب للرقابة */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-2/3 lg:w-1/2">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث برقم الوالد القومي..."
              className="w-full pr-12 pl-24 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm text-right focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-11 px-6 bg-[#1e3a8a] text-white rounded-xl hover:bg-blue-800 transition-colors"
            >
              بحث
            </Button>
          </div>
        </div>

        <div className="flex justify-start px-2 mt-2">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#1e3a8a] shadow-sm border border-gray-100">
              <Users className="w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 leading-none">{totalCount}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-2">إجمالي العائلات بالفرع</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid View */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a]" /></div>
      ) : families.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عائلات</h3>
            <p className="text-gray-500">لم يتم العثور على عائلات مطابقة للبحث في السجلات.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {families.map((family) => (
            <Card
              key={family.id}
              onClick={() => onNavigate('family-details', { familyId: family.id })}
              className="group bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-[2rem] p-6 cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-right flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-sm">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#1e3a8a] transition-colors line-clamp-1">
                      عائلة: {family.fatherName.split(' ')[0]} و {family.motherName.split(' ')[0]}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">الوالدان الأساسيان</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الأبناء المسجلين:</span>
                  <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-black border border-gray-100">{family.children}</span>
                </div>
                <div className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                  <Search className="w-3 h-3" /> عرض السجل
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}