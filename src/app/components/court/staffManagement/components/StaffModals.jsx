import React from 'react';
import { 
  UserPlus, X, AlertCircle, AlertTriangle, ChevronDown, Search, Loader2, 
  Pencil, UserCircle, Phone, Activity, Trash2, CheckCircle, Copy 
} from 'lucide-react';
import { Card } from '../../../ui/card';
import { rolesTranslation, rolesOptions, getStaffTheme } from './StaffHelpers';

export function StaffModals({
  showAddModal, setShowAddModal, closeAddModal, error, setError, formErrors, setFormErrors,
  formData, setFormData, handleFormChange, handleAddSubmit, isSaving,
  isRoleDropdownOpen, setIsRoleDropdownOpen, roleSearchTerm, handleRoleSearchChange, handleRoleKeyDown,
  roleDropdownRef, roleListRef, filteredRoles, roleHighlightedIndex, setRoleHighlightedIndex, handleSelectRole,

  showEditModal, setShowEditModal, editFormData, setEditFormData, handleEditSubmit, selectedStaff,

  showViewModal, setShowViewModal, staffReport, loadingReport,

  deleteModal, setDeleteModal, handleConfirmDelete,

  successModalOpen, setSuccessModalOpen, createdCredentials, handleCopy
}) {

  const viewTheme = selectedStaff ? getStaffTheme(selectedStaff.role) : getStaffTheme('');

  return (
    <>
      {/* 1. Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
           {/* تم زيادة العرض قليلاً ليكون max-w-[550px] ليتناسب مع البادنج */}
           <div className="w-full max-w-[550px] bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gray-50 p-5 md:p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h2 className="text-lg md:text-xl font-bold text-[#1e3a8a] flex items-center gap-2"><UserPlus className="w-5 md:w-6 h-5 md:h-6" /> إضافة موظف جديد</h2>
                  <button onClick={closeAddModal} className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100 outline-none cursor-pointer"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
              
              {/* تم استبدال space-y بـ flex flex-col gap-5 لمنع المسافات الوهمية وإضافة بادنج مريح */}
              <form onSubmit={handleAddSubmit} noValidate className="p-6 md:p-8 flex flex-col gap-4 md:gap-5 text-right overflow-y-auto custom-scrollbar flex-1">
                 {error && (
                   <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 border border-red-100">
                     <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> <span className="text-sm font-bold">{error}</span>
                   </div>
                 )}

                 {/* تم إخراجه من مسافات الـ flex عبر absolute */}
                 <div className="absolute opacity-0 -z-10 pointer-events-none" aria-hidden="true">
                    <input type="text" name="chrome_trap_usr" autoComplete="username" tabIndex={-1} />
                    <input type="password" name="chrome_trap_pwd" autoComplete="current-password" tabIndex={-1} />
                 </div>

                 {/* حقل الدور الوظيفي (Dropdown) */}
                 <div className="flex flex-col gap-1.5 relative" ref={roleDropdownRef}>
                    <label className="text-sm font-bold text-gray-700">الدور الوظيفي <span className="text-red-500">*</span></label>
                    <div className="relative w-full h-[56px]">
                        <input 
                            type="text"
                            value={roleSearchTerm}
                            onChange={handleRoleSearchChange}
                            onKeyDown={handleRoleKeyDown} 
                            onFocus={() => setIsRoleDropdownOpen(true)}
                            placeholder="-- اختر تخصص الموظف --"
                            className={`w-full h-full px-4 pl-12 rounded-xl outline-none transition-all font-bold text-sm border shadow-sm
                                ${isRoleDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : ''}
                                ${formErrors.role && !isRoleDropdownOpen ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}
                            `}
                        />
                        <ChevronDown 
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} 
                        />
                    </div>
                    {formErrors.role && !isRoleDropdownOpen && <p className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0"/> {formErrors.role}</p>}

                    {isRoleDropdownOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-opacity duration-300 opacity-100">
                            <ul ref={roleListRef} className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((roleOpt, index) => (
                                        <li 
                                            key={roleOpt.value} 
                                            id={`role-item-${index}`}
                                            onClick={() => handleSelectRole(roleOpt)}
                                            onMouseEnter={() => setRoleHighlightedIndex(index)}
                                            className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center
                                                ${formData.role === roleOpt.value ? 'bg-blue-50 text-[#1e3a8a]' : ''}
                                                ${roleHighlightedIndex === index && formData.role !== roleOpt.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}
                                            `}
                                        >
                                            {roleOpt.label}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-6 text-sm text-gray-500 font-medium text-center flex flex-col items-center gap-2">
                                        <Search className="w-5 h-5 opacity-30" /> لا توجد تخصصات مطابقة
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-1.5 relative">
                   <label className="text-sm font-bold text-gray-700">الاسم الرباعي <span className="text-red-500">*</span></label>
                   <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange(setFormData)} placeholder="اسم الموظف بالكامل" autoComplete="off" className={`w-full p-4 h-[56px] rounded-xl outline-none transition-all font-bold text-sm shadow-sm border ${formErrors.fullName ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] text-gray-800'}`} />
                   {formErrors.fullName && <span className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-start gap-1"><AlertTriangle className="w-3 h-3 shrink-0"/> {formErrors.fullName}</span>}
                 </div>
                 
                 <div className="flex flex-col gap-1.5 relative">
                   <label className="text-sm font-bold text-gray-700">البريد الإلكتروني الوظيفي <span className="text-red-500">*</span></label>
                   <input type="email" name="email" value={formData.email} onChange={handleFormChange(setFormData)} placeholder="staff@wesal.gov.eg" autoComplete="off" className={`w-full p-4 h-[56px] rounded-xl outline-none transition-all font-mono font-bold text-right text-sm shadow-sm border ${formErrors.email ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] text-gray-800'}`} dir="ltr" />
                   {formErrors.email && <span className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-start gap-1"><AlertTriangle className="w-3 h-3 shrink-0"/> {formErrors.email}</span>}
                 </div>

                 <div className="flex flex-col gap-1.5 relative">
                   <label className="text-sm font-bold text-gray-700">رقم الهاتف (اختياري)</label>
                   <input type="tel" name="phone" value={formData.phone} onChange={(e)=>{ e.target.value = e.target.value.replace(/\D/g, ''); handleFormChange(setFormData)(e); }} maxLength={11} placeholder="01xxxxxxxxx" autoComplete="off" className={`w-full p-4 h-[56px] rounded-xl outline-none transition-all font-mono font-bold text-right text-sm shadow-sm border ${formErrors.phone ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] text-gray-800'}`} dir="ltr" />
                   {formErrors.phone && <span className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-start gap-1"><AlertTriangle className="w-3 h-3 shrink-0"/> {formErrors.phone}</span>}
                 </div>

                 <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100 shrink-0">
                    <button type="button" disabled={isSaving} onClick={closeAddModal} className="flex-1 bg-white text-gray-600 border border-gray-200 h-14 rounded-xl font-bold hover:bg-gray-50 shadow-sm outline-none cursor-pointer transition-colors">إلغاء</button>
                    <button type="submit" disabled={isSaving} className="flex-1 bg-[#1e3a8a] text-white h-14 rounded-xl font-bold hover:bg-blue-900 flex items-center justify-center gap-2 shadow-sm border-none outline-none cursor-pointer transition-colors">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء الحساب"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* 2. Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
           <div className="w-full max-w-[550px] bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gray-50 p-5 md:p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h2 className="text-lg md:text-xl font-bold text-[#1e3a8a] flex items-center gap-2"><Pencil className="w-5 md:w-6 h-5 md:h-6" /> تعديل بيانات الموظف</h2>
                  <button onClick={() => setShowEditModal(false)} className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100 outline-none cursor-pointer"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
              <form onSubmit={handleEditSubmit} noValidate className="p-6 md:p-8 flex flex-col gap-4 md:gap-5 text-right overflow-y-auto custom-scrollbar flex-1">
                 {error && (
                   <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 border border-red-100">
                     <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> <span className="text-sm font-bold">{error}</span>
                   </div>
                 )}
                 <div className="bg-blue-50/50 p-4 md:p-5 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-[11px] md:text-xs font-bold text-blue-500 mb-1.5 uppercase tracking-widest">تخصص الموظف</p>
                    <p className="font-bold text-blue-900 text-sm md:text-base">{rolesTranslation[selectedStaff?.role] || selectedStaff?.role}</p>
                 </div>
                 
                 <div className="flex flex-col gap-1.5 relative">
                   <label className="text-sm font-bold text-gray-700">الاسم الرباعي <span className="text-red-500">*</span></label>
                   <input type="text" name="fullName" value={editFormData.fullName} onChange={handleFormChange(setEditFormData)} className={`w-full p-4 h-[56px] rounded-xl outline-none font-bold text-sm shadow-sm border ${formErrors.fullName ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                   {formErrors.fullName && <span className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-start gap-1"><AlertTriangle className="w-3 h-3 shrink-0"/>{formErrors.fullName}</span>}
                 </div>

                 <div className="flex flex-col gap-1.5 relative">
                   <label className="text-sm font-bold text-gray-700">رقم الهاتف (اختياري)</label>
                   <input type="tel" name="phone" value={editFormData.phone} onChange={(e)=>{ e.target.value = e.target.value.replace(/\D/g, ''); handleFormChange(setEditFormData)(e); }} maxLength={11} className={`w-full p-4 h-[56px] rounded-xl outline-none font-mono font-bold text-right text-sm shadow-sm border ${formErrors.phone ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} dir="ltr" />
                   {formErrors.phone && <span className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-start gap-1"><AlertTriangle className="w-3 h-3 shrink-0"/>{formErrors.phone}</span>}
                 </div>

                 <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100 shrink-0">
                    <button type="button" disabled={isSaving} onClick={() => setShowEditModal(false)} className="flex-1 bg-white text-gray-600 border border-gray-200 h-14 rounded-xl font-bold hover:bg-gray-50 shadow-sm cursor-pointer outline-none transition-colors">إلغاء</button>
                    <button type="submit" disabled={isSaving} className="flex-1 bg-[#1e3a8a] text-white h-14 rounded-xl font-bold hover:bg-blue-900 flex items-center justify-center gap-2 shadow-sm cursor-pointer outline-none border-none transition-colors">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التعديلات"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* 3. View Staff Details & Reports Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
          <div className="w-full max-w-2xl bg-gray-50 border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
             {/* Header uses viewTheme */}
             <div className={`${viewTheme.headerBg} p-6 border-b border-white/10 flex justify-between items-start text-right shrink-0`}>
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-sm">
                   <UserCircle className="w-8 h-8" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white mb-1">{selectedStaff.fullName}</h2>
                   <span className="text-xs font-bold text-white/80 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
                      {rolesTranslation[selectedStaff.role] || selectedStaff.role}
                   </span>
                 </div>
               </div>
               <button onClick={() => setShowViewModal(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none outline-none cursor-pointer"><X className="w-4 h-4" /></button>
             </div>

             <div className="p-6 md:p-8 space-y-6 text-right overflow-y-auto custom-scrollbar">
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-1"><AlertCircle className="w-3 h-3"/> البريد الإلكتروني</p>
                    <p className="font-bold text-gray-800 text-sm font-mono truncate" dir="ltr">{selectedStaff.email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3"/> رقم التواصل</p>
                    <p className="font-bold text-gray-800 text-sm font-mono" dir="ltr">{selectedStaff.phone || 'غير متوفر'}</p>
                  </div>
                </div>

                {/* Performance Report Section */}
                <div className="pt-2">
                   <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                     <Activity className={`w-5 h-5 ${viewTheme.text}`}/> تقرير الأداء والإنجاز
                   </h3>
                   
                   {loadingReport ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className={`w-8 h-8 animate-spin ${viewTheme.text} mb-2`} />
                        <span className="text-xs font-bold text-gray-500">جاري جلب الإحصائيات...</span>
                      </div>
                   ) : staffReport ? (
                      <div className="space-y-4 animate-in slide-in-from-bottom-2">
                         {/* Shared Stats */}
                         <div className="grid grid-cols-2 gap-4">
                           <div className={`${viewTheme.bg} p-4 rounded-2xl border ${viewTheme.borderColor} shadow-sm flex flex-col items-center text-center`}>
                              <span className={`text-[10px] ${viewTheme.text} font-bold uppercase tracking-widest mb-2`}>المهام المفتوحة حالياً</span>
                              <span className={`text-2xl font-black ${viewTheme.darkText} font-mono`}>{staffReport.currentlyOpenItems || 0}</span>
                           </div>
                           <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
                              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-2 text-center leading-tight">متوسط وقت الإنجاز</span>
                              <span className="text-2xl font-black text-emerald-900 font-mono flex items-baseline gap-1">
                                {staffReport.averageResolutionTimeDays ? staffReport.averageResolutionTimeDays.toFixed(1) : '-'} <span className="text-xs font-sans">يوم</span>
                              </span>
                           </div>
                         </div>

                         {/* Role Specific Stats */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedStaff.role === 'SettlementSpecialist' && (
                               <>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">عائلات تم تسجيلها</span>
                                    <span className="text-lg font-black text-gray-900 font-mono">{staffReport.totalFamiliesEnrolled || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-600">تسويات ناجحة</span>
                                    <span className="text-lg font-black text-green-700 font-mono">{staffReport.successfulSettlements || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center sm:col-span-2">
                                    <span className="text-xs font-bold text-red-600">قضايا تم تصعيدها للمحكمة</span>
                                    <span className="text-lg font-black text-red-700 font-mono">{staffReport.escalatedFamilies || 0}</span>
                                 </div>
                               </>
                            )}

                            {selectedStaff.role === 'CaseClerk' && (
                               <>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">إجمالي القضايا المستلمة</span>
                                    <span className="text-lg font-black text-gray-900 font-mono">{staffReport.totalCasesAssigned || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-600">قضايا تم إغلاقها</span>
                                    <span className="text-lg font-black text-green-700 font-mono">{staffReport.casesClosed || 0}</span>
                                 </div>
                               </>
                            )}

                            {selectedStaff.role === 'ComplianceMonitor' && (
                               <>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">إجمالي الشكاوى المستلمة</span>
                                    <span className="text-lg font-black text-gray-900 font-mono">{staffReport.totalComplaintsAssigned || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-600">شكاوى تم حلها</span>
                                    <span className="text-lg font-black text-green-700 font-mono">{staffReport.complaintsResolved || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">إجمالي تنبيهات الالتزام</span>
                                    <span className="text-lg font-black text-gray-900 font-mono">{staffReport.totalAlertsAssigned || 0}</span>
                                 </div>
                                 <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-600">تنبيهات تمت معالجتها</span>
                                    <span className="text-lg font-black text-green-700 font-mono">{staffReport.alertsResolved || 0}</span>
                                 </div>
                               </>
                            )}
                         </div>
                      </div>
                   ) : (
                      <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center">
                         <div className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                         <p className="text-sm font-bold text-gray-500">لا توجد إحصائيات كافية لعرض التقرير حتى الآن.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in" dir="rtl">
          <Card className="p-8 w-full max-w-md animate-in slide-in-from-bottom-5 duration-300 border-none shadow-2xl rounded-[2rem] text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">إيقاف الحساب</h2>
            <p className="text-gray-500 text-sm font-bold mb-8 px-2 leading-relaxed">
              أنت على وشك حذف الموظف <span className="text-gray-800 underline decoration-red-200">{deleteModal.title}</span>. 
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ show: false, id: '', title: '' })} className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm outline-none cursor-pointer">تراجع</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-sm hover:bg-red-700 transition-all active:scale-95 border-none outline-none cursor-pointer">إيقاف الحساب</button>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 max-w-md w-full text-center border border-gray-100" dir="rtl">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
             </div>
             <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2">تم الربط والتسجيل بنجاح!</h2>
             <p className="text-gray-500 mb-8 text-sm font-bold">تم إنشاء ملف الموظف وحسابه بنجاح. يرجى حفظ بيانات الدخول التالية.</p>

             <div className="bg-blue-50/50 p-5 md:p-6 rounded-3xl border border-blue-100 mb-8 text-right relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl opacity-50"></div>
                <div className="space-y-3 relative z-10">
                   <div className="bg-white p-3 md:p-3.5 rounded-xl border border-blue-100 flex justify-between items-center group shadow-sm">
                      <div className="text-right overflow-hidden flex-1 pl-2">
                          <span className="text-[10px] md:text-xs text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">اسم المستخدم</span>
                          <span className="text-xs md:text-sm font-mono font-bold text-blue-900 truncate block" dir="ltr">{createdCredentials?.username}</span>
                      </div>
                      <button onClick={() => handleCopy(createdCredentials?.username)} className="p-2 md:p-2.5 text-blue-400 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors shrink-0 outline-none border-none cursor-pointer" title="نسخ اسم المستخدم">
                          <Copy className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                   </div>
                   <div className="bg-white p-3 md:p-3.5 rounded-xl border border-blue-100 flex justify-between items-center group shadow-sm">
                      <div className="text-right overflow-hidden flex-1 pl-2">
                          <span className="text-[10px] md:text-xs text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">كلمة المرور المؤقتة</span>
                          <span className="text-xs md:text-sm font-mono font-bold text-blue-900 truncate block" dir="ltr">{createdCredentials?.temporaryPassword}</span>
                      </div>
                      <button onClick={() => handleCopy(createdCredentials?.temporaryPassword)} className="p-2 md:p-2.5 text-blue-400 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors shrink-0 outline-none border-none cursor-pointer" title="نسخ كلمة المرور">
                          <Copy className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                   </div>
                </div>
             </div>
             <button onClick={() => setSuccessModalOpen(false)} className="w-full bg-[#1e3a8a] text-white h-12 md:h-14 rounded-xl md:rounded-2xl font-bold hover:bg-blue-900 transition-all text-base md:text-lg shadow-lg shadow-blue-900/20 border-none outline-none active:scale-95 cursor-pointer">حسناً، تم الحفظ</button>
          </div>
        </div>
      )}

    </>
  );
}