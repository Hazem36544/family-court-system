import React from 'react';
import { Search, UserCircle, Plus, X, Pencil, AlertCircle, Phone, ChevronDown } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { rolesTranslation, getStaffTheme } from './StaffHelpers';

export function StaffGrid({ 
  filteredStaff, isSearching, searchTerm, visibleCount, staffLength,
  setShowAddModal, clearSearch, handleLoadMore,
  setSelectedStaff, setEditFormData, setShowEditModal, setFormErrors, setError,
  setDeleteModal, handleViewStaff
}) {
  if (staffLength === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-gray-400">
          <UserCircle className="w-16 h-16 opacity-30 mb-4 text-[#1e3a8a]" />
          <p className="font-bold text-xl text-gray-800">لا يوجد موظفين</p>
          <p className="text-sm font-bold text-gray-500 mt-2 mb-8">قم بتسجيل أول موظف في المحكمة الآن.</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-xl px-6 font-bold shadow-sm border-none outline-none"><Plus className="w-4 h-4 mr-2" /> إضافة موظف جديد</Button>
      </div>
    );
  }

  if (filteredStaff.length === 0 && isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-red-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-inner"><Search className="w-10 h-10 text-red-400" /></div>
          <p className="font-black text-2xl text-gray-800 mb-2">عذراً، لا توجد نتائج!</p>
          <p className="text-sm font-bold text-gray-500 mb-8 max-w-md text-center leading-relaxed">لم نتمكن من العثور على موظف يطابق بحثك.</p>
          <button onClick={clearSearch} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-8 h-12 font-bold flex items-center gap-2 transition-all outline-none cursor-pointer shadow-sm active:scale-95">
             <X className="w-5 h-5 text-gray-400" /> مسح البحث
          </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {filteredStaff.slice(0, visibleCount).map((staff) => {
          const theme = getStaffTheme(staff.role);
          
          return (
            <Card 
              key={staff.id} 
              onClick={() => handleViewStaff(staff)}
              className={`group bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md ${theme.hoverBorder} transition-all rounded-[2rem] p-6 cursor-pointer relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-24 h-24 ${theme.bg} rounded-br-full -translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform pointer-events-none`}></div>
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                 <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shadow-sm shrink-0`}>
                    <UserCircle className="w-6 h-6 md:w-7 h-7" />
                 </div>
                 <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); setSelectedStaff(staff); setEditFormData({ fullName: staff.fullName, phone: staff.phone || '' }); setShowEditModal(true); setFormErrors({}); setError(null); }} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors outline-none border-none cursor-pointer">
                     <Pencil className="w-4 h-4" />
                   </button>
                 </div>
              </div>
              
              <div className="relative z-10">
                <h3 className={`font-bold text-gray-800 text-lg mb-1 line-clamp-1 ${theme.hoverText}`} title={staff.fullName}>{staff.fullName}</h3>
                <div className="mb-4">
                  <span className={`text-[10px] font-bold ${theme.badgeText} ${theme.badgeBg} px-2.5 py-1 rounded-md border ${theme.badgeBorder} uppercase tracking-widest`}>
                    {rolesTranslation[staff.role] || staff.role}
                  </span>
                </div>
                <div className="space-y-2.5">
                   <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="line-clamp-1 font-mono font-bold text-xs md:text-sm truncate" dir="ltr">{staff.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <Phone className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                      <span className="font-bold font-mono text-xs md:text-sm uppercase" dir="ltr">{staff.phone || 'غير متوفر'}</span>
                   </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {visibleCount < filteredStaff.length && (
        <div className="flex justify-center mt-8 animate-in fade-in">
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