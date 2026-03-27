import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Users, ChevronLeft, Loader2
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
        children: family.children?.length || 0
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
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/3 blur-3xl opacity-50"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all">
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">إدارة العائلات</h1>
          </div>
        </div>
      </div>

      {/* 2. Search & Stats */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث بالرقم القومي..."
              className="w-full pr-12 h-12 rounded-xl bg-white border-none shadow-sm text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={() => onNavigate('new-family')} className="bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-sm h-12 px-6 rounded-xl gap-2 font-bold transition-transform hover:scale-105">
            <Plus className="w-5 h-5" /> <span>تسجيل عائلة جديدة</span>
          </Button>
        </div>

        <div className="flex justify-start px-2">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center text-[#1e3a8a] shadow-sm border border-gray-100">
              <Users className="w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 leading-none">{totalCount}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-2">إجمالي العائلات المسجلة</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid View */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {families.map((family) => (
            <Card
              key={family.id}
              onClick={() => onNavigate('family-details', { familyId: family.id })}
              className="group bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all rounded-xl p-6 cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-right flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-inner">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {family.fatherName} و {family.motherName}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">أفراد العائلة الأساسيين</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الأبناء:</span>
                  <span className="bg-blue-50 text-[#1e3a8a] px-3 py-1 rounded-lg text-xs font-black">{family.children}</span>
                </div>
                <div className="text-[10px] font-bold text-blue-600/40 uppercase tracking-[0.2em]">ملف العائلة</div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}