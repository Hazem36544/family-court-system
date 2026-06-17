import React from 'react';
import { Building2, Search, Eye, MapPin, UserCircle, ChevronDown, Plus, X } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';

export function CentersGrid({ 
  filteredCenters, isSearching, searchTerm, visibleCount, 
  centersLength, setShowAddModal, clearSearch, handleLoadMore, setSelectedCenter 
}) {
  if (centersLength === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-gray-400">
          <Building2 className="w-16 h-16 opacity-30 mb-4 text-[#1e3a8a]" />
          <p className="font-bold text-xl text-gray-800">لا توجد مراكز مسجلة</p>
          <p className="text-sm font-bold text-gray-500 mt-2 mb-8">قم بتسجيل أول مركز رؤية في النظام الآن.</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-xl px-6 font-bold shadow-sm border-none outline-none cursor-pointer"><Plus className="w-4 h-4 mr-2" /> تسجيل مركز جديد</Button>
      </div>
    );
  }

  if (filteredCenters.length === 0 && isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-red-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-inner"><Search className="w-10 h-10 text-red-400" /></div>
          <p className="font-black text-2xl text-gray-800 mb-2">عذراً، لا توجد نتائج!</p>
          <p className="text-sm font-bold text-gray-500 mb-8 max-w-md text-center leading-relaxed">لم نتمكن من العثور على أي نتائج تطابق "{searchTerm}".</p>
          <button onClick={clearSearch} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-8 h-12 font-bold flex items-center gap-2 transition-all outline-none cursor-pointer shadow-sm active:scale-95">
             <X className="w-5 h-5 text-gray-400" /> مسح البحث
          </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {filteredCenters.slice(0, visibleCount).map((center) => (
          <Card 
            key={center.id} 
            onClick={() => setSelectedCenter(center)}
            className="group bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 hover:-translate-y-1 duration-500 ease-out transition-all rounded-[2rem] p-6 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-br-full -translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-5 relative z-10">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors shadow-sm">
                  <Building2 className="w-6 h-6 md:w-7 h-7" />
               </div>
               <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 flex items-center gap-1 group-hover:text-[#1e3a8a] transition-colors">
                   <Eye className="w-3 h-3" /> التفاصيل
               </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-1" title={center.name}>{center.name}</h3>
              <div className="space-y-2.5">
                 <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                    <span className="line-clamp-1 font-bold text-xs md:text-sm">{center.governorate} - {center.address}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <UserCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-bold text-xs md:text-sm text-green-700">{center.staffs?.length || 0} موظفين استقبال</span>
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {visibleCount < filteredCenters.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3.5 bg-white border-2 border-blue-100 text-[#1e3a8a] rounded-2xl font-bold shadow-sm hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none active:scale-95"
          >
            <ChevronDown className="w-5 h-5" /> عرض المزيد
          </button>
        </div>
      )}
    </>
  );
}