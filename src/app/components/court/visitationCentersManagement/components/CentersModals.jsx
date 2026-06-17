import React from 'react';
import { 
  Building2, UserCircle, X, AlertCircle, Loader2, MapPin, Pencil, 
  ChevronRight, CheckCircle, Copy, Trash2, Plus 
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { governoratesTranslation } from './CentersHelpers';

export function CentersModals({
  showAddModal, setShowAddModal, modalStep, closeModal, error, formData, handleFormChange, formErrors,
  savedLocationId, isSaving, handleCreateCenter, handleCreateStaff, addAnother,
  showAddExtraStaff, setShowAddExtraStaff, setFormData,
  selectedCenter, setSelectedCenter, isEditingLocation, setIsEditingLocation, handleStartEditLocation,
  editLocationForm, setEditLocationForm, handleUpdateLocation, isUpdating,
  selectedStaff, setSelectedStaff, isEditingManager, setIsEditingManager, handleStartEditManager,
  editManagerForm, setEditManagerForm, handleUpdateManager,
  deleteModal, setDeleteModal, confirmDelete,
  successCredentials, handleCloseSuccess, copyToClipboard
}) {
  return (
    <>
      {/* 1. نافذة إضافة مركز */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
           <div className="w-full max-w-2xl bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="bg-gray-50 p-6 md:p-8 border-b border-gray-100 flex justify-between items-center relative shrink-0">
                  <div className="absolute top-0 right-0 h-1 bg-[#1e3a8a] transition-all duration-500" style={{width: modalStep === 1 ? '50%' : '100%'}}></div>
                  <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                      {modalStep === 1 ? <Building2 className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />} 
                      {modalStep === 1 ? 'بيانات المركز الجديد' : 'تعيين موظف استقبال'}
                  </h2>
                  {modalStep === 1 && (
                      <button onClick={closeModal} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100 outline-none cursor-pointer"><X className="w-5 h-5" /></button>
                  )}
              </div>
              
              <div className="p-6 md:p-8 text-right bg-white flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                 {error && (
                     <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 shadow-sm">
                         <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> <span className="text-sm font-bold">{error}</span>
                     </div>
                 )}

                 {modalStep === 1 && (
                     <div className="space-y-5 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 relative">
                              <label className="text-sm font-bold text-gray-700">اسم المركز <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="اسم المركز بالكامل" value={formData.name} onChange={e => handleFormChange('name', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border ${formErrors.name ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                            </div>
                            
                            <div className="flex flex-col gap-1.5 relative">
                              <label className="text-sm font-bold text-gray-700">التواصل <span className="text-red-500">*</span></label>
                              <input type="tel" placeholder="01xxxxxxxxx" value={formData.contactNumber} onChange={e => handleFormChange('contactNumber', e.target.value.replace(/\D/g, ''))} maxLength={11} className={`w-full p-4 rounded-2xl outline-none font-mono font-bold text-sm text-right shadow-sm border ${formErrors.contactNumber ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} dir="ltr" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-bold text-gray-700">المحافظة</label>
                              <input type="text" value={governoratesTranslation[formData.governorate] || formData.governorate} disabled className="w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                              <label className="text-sm font-bold text-gray-700">العنوان التفصيلي <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="الشارع، المنطقة..." value={formData.address} onChange={e => handleFormChange('address', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border ${formErrors.address ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 px-1">فتح <span className="text-red-500">*</span></label>
                                <input type="time" value={formData.openingTime} onChange={e => handleFormChange('openingTime', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold font-sans text-xs shadow-sm border mt-1 ${formErrors.openingTime ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                            </div>
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 px-1">إغلاق <span className="text-red-500">*</span></label>
                                <input type="time" value={formData.closingTime} onChange={e => handleFormChange('closingTime', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold font-sans text-xs shadow-sm border mt-1 ${formErrors.closingTime ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                            </div>
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 px-1">سعة <span className="text-red-500">*</span></label>
                                <input type="number" placeholder="10" value={formData.maxConcurrentVisits} onChange={e => handleFormChange('maxConcurrentVisits', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border mt-1 ${formErrors.maxConcurrentVisits ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                            </div>
                        </div>
                     </div>
                 )}

                 {modalStep === 2 && (
                     <div className="space-y-6 animate-in slide-in-from-left duration-300">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
                            <div className="flex-1 pl-2">
                                <span className="text-xs text-blue-500 font-bold block">معرف المركز (Location ID)</span>
                                <span className="font-mono font-bold text-sm text-blue-900 truncate block select-all" dir="ltr">{savedLocationId}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 relative">
                           <label className="text-sm font-bold text-gray-700">الاسم الرباعي <span className="text-red-500">*</span></label>
                           <input type="text" placeholder="الاسم الرباعي للموظف" value={formData.managerFullName} onChange={e => handleFormChange('managerFullName', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border ${formErrors.managerFullName ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} />
                        </div>
                        <div className="flex flex-col gap-1.5 relative">
                           <label className="text-sm font-bold text-gray-700">البريد الإلكتروني <span className="text-red-500">*</span></label>
                           <input type="email" placeholder="staff@center.com" value={formData.managerEmail} onChange={e => handleFormChange('managerEmail', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-mono font-bold text-right text-sm shadow-sm border ${formErrors.managerEmail ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} dir="ltr" />
                        </div>
                        <div className="flex flex-col gap-1.5 relative">
                           <label className="text-sm font-bold text-gray-700">رقم الهاتف (اختياري)</label>
                           <input type="tel" placeholder="01xxxxxxxxx" value={formData.managerPhone} onChange={e => handleFormChange('managerPhone', e.target.value.replace(/\D/g, ''))} maxLength={11} className={`w-full p-4 rounded-2xl outline-none font-mono font-bold text-right text-sm shadow-sm border ${formErrors.managerPhone ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}`} dir="ltr" />
                        </div>
                     </div>
                 )}
              </div>
              
              <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 shrink-0">
                 {modalStep === 1 ? (
                     <>
                        <Button disabled={isSaving} onClick={handleCreateCenter} className="flex-1 bg-[#1e3a8a] text-white h-12 md:h-14 rounded-2xl font-bold shadow-sm hover:bg-blue-900 border-none outline-none cursor-pointer">
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "التالي: تسجيل الموظفين"}
                        </Button>
                        <Button disabled={isSaving} onClick={closeModal} variant="outline" className="w-full sm:w-32 bg-white text-gray-700 border-gray-200 h-12 md:h-14 rounded-2xl font-bold hover:bg-gray-100 cursor-pointer border-none outline-none shadow-sm">إلغاء</Button>
                     </>
                 ) : (
                     <>
                        <Button disabled={isSaving} onClick={(e) => handleCreateStaff(e, true)} className="flex-1 bg-green-600 text-white h-12 md:h-14 rounded-2xl font-bold shadow-sm hover:bg-green-700 outline-none border-none cursor-pointer">
                            {isSaving && addAnother ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ وإضافة موظف آخر"}
                        </Button>
                        <Button disabled={isSaving} onClick={(e) => handleCreateStaff(e, false)} className="flex-1 bg-[#1e3a8a] text-white h-12 md:h-14 rounded-2xl font-bold shadow-sm hover:bg-blue-900 outline-none border-none cursor-pointer">
                            {isSaving && !addAnother ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ وإنهاء"}
                        </Button>
                     </>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* 2. نافذة إضافة موظف إضافي (تم تطبيق قواعد الفليديشن والألوان هنا) */}
      {showAddExtraStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
           <div className="w-full max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="bg-green-50 p-6 flex justify-between items-center border-b border-green-100 shrink-0">
                  <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                      <UserCircle className="w-6 h-6" /> إضافة موظف استقبال جديد
                  </h2>
                  <button onClick={() => {setShowAddExtraStaff(false); setFormData(prev => ({...prev, managerFullName: '', managerEmail: '', managerPhone: ''}));}} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm border border-gray-100 outline-none cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 md:p-8 text-right bg-white flex-1 overflow-hidden space-y-5">
                  {/* عرض رسالة الخطأ العامة */}
                  {error && (
                     <div className="mb-2 bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 shadow-sm">
                         <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> <span className="text-sm font-bold">{error}</span>
                     </div>
                  )}

                  <div className="flex flex-col gap-1.5 relative">
                     <label className="text-sm font-bold text-gray-700">الاسم الرباعي <span className="text-red-500">*</span></label>
                     <input type="text" placeholder="الاسم الرباعي للموظف" value={formData.managerFullName} onChange={e => handleFormChange('managerFullName', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm shadow-sm border ${formErrors.managerFullName ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-600'}`} />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                     <label className="text-sm font-bold text-gray-700">البريد الإلكتروني <span className="text-red-500">*</span></label>
                     <input type="email" placeholder="staff@center.com" value={formData.managerEmail} onChange={e => handleFormChange('managerEmail', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-mono font-bold text-right text-sm shadow-sm border ${formErrors.managerEmail ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-600'}`} dir="ltr" />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                     <label className="text-sm font-bold text-gray-700">رقم الهاتف (اختياري)</label>
                     <input type="tel" placeholder="01xxxxxxxxx" value={formData.managerPhone} onChange={e => handleFormChange('managerPhone', e.target.value.replace(/\D/g, ''))} maxLength={11} className={`w-full p-4 rounded-2xl outline-none font-mono font-bold text-right text-sm shadow-sm border ${formErrors.managerPhone ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-600'}`} dir="ltr" />
                  </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 shrink-0">
                  <Button disabled={isSaving} onClick={(e) => handleCreateStaff(e, true)} className="flex-1 bg-green-600 text-white h-12 rounded-xl font-bold shadow-sm hover:bg-green-700 outline-none border-none cursor-pointer">
                      {isSaving && addAnother ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ وإضافة آخر"}
                  </Button>
                  <Button disabled={isSaving} onClick={(e) => handleCreateStaff(e, false)} className="flex-1 bg-[#1e3a8a] text-white h-12 rounded-xl font-bold shadow-sm hover:bg-blue-900 outline-none border-none cursor-pointer">
                      {isSaving && !addAnother ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ وإنهاء"}
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* 3. نافذة تفاصيل المركز */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
          <div className="w-full max-w-5xl bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[95vh]">
             <div className="bg-[#1e3a8a] p-5 md:p-6 border-b border-white/10 flex justify-between items-center text-right shrink-0">
               <h2 className="text-xl font-bold text-white flex items-center gap-3">
                 <Building2 className="w-6 h-6" /> ملف المركز التفصيلي
               </h2>
               <button onClick={() => { setSelectedCenter(null); setIsEditingLocation(false); setIsEditingManager(false); }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none outline-none cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-6 md:p-8 text-right overflow-y-auto custom-scrollbar px-2 pb-2 flex-1 bg-white flex flex-col md:flex-row gap-8 md:gap-10">
                  
                  {/* العمود الأول: بيانات المكان */}
                  <div className="flex-1 px-2">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-3 mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-[#1e3a8a] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> بيانات المكان
                      </h3>
                      {!isEditingLocation && (
                        <div className="flex gap-2">
                          <button onClick={handleStartEditLocation} className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer border-none outline-none bg-transparent">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteModal({ show: true, id: selectedCenter.id, title: selectedCenter.name })} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer border-none outline-none bg-transparent">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {!isEditingLocation ? (
                      <div className="space-y-4">
                        <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
                          <p className="text-[10px] text-gray-500 font-bold mb-1">اسم المركز</p>
                          <p className="font-bold text-[#1e3a8a] text-base leading-tight">{selectedCenter.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">المحافظة</p>
                            <p className="font-bold text-gray-800 text-sm">{selectedCenter.governorate}</p>
                          </div>
                          <div className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">رقم التواصل</p>
                            <p className="font-bold text-gray-800 text-sm font-mono" dir="ltr">{selectedCenter.contactNumber || '---'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">ساعات العمل</p>
                            <p className="font-bold text-gray-800 text-sm uppercase">
                               {selectedCenter.openingTime?.substring(0,5)} ص - {selectedCenter.closingTime?.substring(0,5)} م
                            </p>
                          </div>
                          <div className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">الطاقة الاستيعابية</p>
                            <p className="font-bold text-gray-800 text-sm">{selectedCenter.maxConcurrentVisits} زيارة</p>
                          </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
                          <p className="text-[10px] text-gray-500 font-bold mb-1">العنوان التفصيلي</p>
                          <p className="font-bold text-gray-800 text-sm leading-relaxed">{selectedCenter.address}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in">
                        <input type="text" value={editLocationForm.name} onChange={e => setEditLocationForm({...editLocationForm, name: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-[#1e3a8a] text-center" placeholder="اسم المركز" />
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" value={editLocationForm.governorate} disabled className="w-full p-3 rounded-xl bg-gray-100 text-gray-500 border border-gray-200 font-bold text-sm cursor-not-allowed text-center" />
                           <input type="tel" value={editLocationForm.contactNumber} onChange={e => setEditLocationForm({...editLocationForm, contactNumber: e.target.value.replace(/\D/g, '')})} maxLength={11} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-[#1e3a8a] font-mono text-center" placeholder="رقم التواصل" dir="ltr" />
                        </div>
                        <input type="text" value={editLocationForm.address} onChange={e => setEditLocationForm({...editLocationForm, address: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-[#1e3a8a] text-center" placeholder="العنوان التفصيلي" />
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <p className="text-[10px] text-gray-500 font-bold text-center mb-1">فتح</p>
                              <input type="time" value={editLocationForm.openingTime} onChange={e => setEditLocationForm({...editLocationForm, openingTime: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-xs outline-none text-center" />
                           </div>
                           <div>
                              <p className="text-[10px] text-gray-500 font-bold text-center mb-1">إغلاق</p>
                              <input type="time" value={editLocationForm.closingTime} onChange={e => setEditLocationForm({...editLocationForm, closingTime: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-xs outline-none text-center" />
                           </div>
                           <div>
                              <p className="text-[10px] text-gray-500 font-bold text-center mb-1">سعة</p>
                              <input type="number" value={editLocationForm.maxConcurrentVisits} onChange={e => setEditLocationForm({...editLocationForm, maxConcurrentVisits: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none text-center" />
                           </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                           <Button onClick={() => setIsEditingLocation(false)} variant="outline" className="flex-1 h-11 rounded-xl font-bold bg-gray-100 border-none hover:bg-gray-200 text-gray-600 shadow-sm cursor-pointer outline-none">إلغاء</Button>
                           <Button disabled={isUpdating} onClick={handleUpdateLocation} className="flex-1 h-11 rounded-xl font-bold bg-[#1e3a8a] text-white hover:bg-blue-900 border-none shadow-sm cursor-pointer outline-none">
                             {isUpdating ? <Loader2 className="w-4 h-4 animate-spin"/> : "حفظ التعديلات"}
                           </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* العمود الثاني: فريق الموظفين */}
                  <div className="flex-1 border-t md:border-t-0 md:border-r border-gray-100 pt-6 md:pt-0 md:pr-10 px-2">
                    <div className="flex items-center justify-between border-b border-green-100 pb-3 mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-green-600 flex items-center gap-2">
                        <UserCircle className="w-4 h-4" /> فريق موظفي الاستقبال
                      </h3>
                    </div>
                    <Button onClick={() => setShowAddExtraStaff(true)} className="w-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-none shadow-sm rounded-xl h-12 font-bold flex items-center justify-center gap-2 cursor-pointer mb-4 transition-colors">
                       <Plus className="w-5 h-5" /> إضافة موظف استقبال جديد
                    </Button>
                    <div className="space-y-3 pb-2">
                       {selectedCenter.staffs?.length > 0 ? selectedCenter.staffs.map(staff => (
                           <div key={staff.id} onClick={() => setSelectedStaff(staff)} className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-green-300 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                                    <UserCircle className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-800 text-sm mb-0.5">{staff.fullName}</p>
                                    <p className="text-xs text-gray-500 font-mono" dir="ltr">{staff.phone || staff.email}</p>
                                 </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                           </div>
                       )) : (
                           <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                              <p className="text-sm font-bold">لا يوجد موظفين مسجلين حالياً</p>
                           </div>
                       )}
                    </div>
                  </div>
             </div>
          </div>
        </div>
      )}

      {/* 4. نافذة تعديل بيانات الموظف */}
      {selectedStaff && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
               <div className="bg-green-50 p-5 border-b border-green-100 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-green-800 flex items-center gap-2"><UserCircle className="w-5 h-5"/> بيانات موظف الاستقبال</h3>
                  <button onClick={() => {setSelectedStaff(null); setIsEditingManager(false);}} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 cursor-pointer outline-none"><X className="w-4 h-4"/></button>
               </div>
               
               <div className="p-6 md:p-8 space-y-4">
                  {!isEditingManager ? (
                     <div className="space-y-4 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-green-200">
                           <UserCircle className="w-10 h-10" />
                        </div>
                        <p className="font-black text-xl text-gray-800 mb-1">{selectedStaff.fullName}</p>
                        <p className="text-sm text-gray-500 font-mono bg-gray-50 py-1.5 rounded-lg w-max mx-auto px-4" dir="ltr">{selectedStaff.email}</p>
                        <p className="text-sm text-gray-500 font-mono bg-gray-50 py-1.5 rounded-lg w-max mx-auto px-4 mt-1" dir="ltr">{selectedStaff.phone}</p>
                        
                        <div className="pt-6 flex gap-3">
                           <Button onClick={handleStartEditManager} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold h-12 cursor-pointer outline-none shadow-sm">
                              <Pencil className="w-4 h-4 ml-2 text-[#1e3a8a]" /> تعديل البيانات
                           </Button>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <input type="text" value={editManagerForm.managerName} onChange={e => setEditManagerForm({...editManagerForm, managerName: e.target.value})} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-green-600 text-center shadow-sm" placeholder="الاسم الرباعي" />
                        <input type="tel" value={editManagerForm.managerPhone} onChange={e => setEditManagerForm({...editManagerForm, managerPhone: e.target.value.replace(/\D/g, '')})} maxLength={11} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-green-600 font-mono text-center shadow-sm" placeholder="رقم الهاتف" dir="ltr" />
                        <input type="email" value={selectedStaff.email} disabled className="w-full p-4 rounded-xl bg-gray-100 border border-gray-200 font-bold text-sm text-gray-500 cursor-not-allowed font-mono text-center shadow-sm" dir="ltr" />
                        <div className="flex gap-3 pt-4">
                           <Button onClick={() => setIsEditingManager(false)} variant="outline" className="flex-1 h-12 rounded-xl font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer outline-none shadow-sm">إلغاء</Button>
                           <Button disabled={isUpdating} onClick={handleUpdateManager} className="flex-1 h-12 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 border-none cursor-pointer outline-none shadow-sm">
                             {isUpdating ? <Loader2 className="w-5 h-5 animate-spin"/> : "حفظ التعديلات"}
                           </Button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* 5. نافذة تأكيد الحذف */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in zoom-in duration-200" dir="rtl">
          <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 text-center flex flex-col items-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 border border-red-100 shadow-inner">
                 <Trash2 className="w-8 h-8 text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-3">تأكيد الحذف</h3>
               <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
                 هل أنت متأكد من حذف مركز "{deleteModal.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف بيانات حسابها.
               </p>
               <div className="flex gap-3 w-full">
                 <Button onClick={() => setDeleteModal({ show: false, id: '', title: '', subtitle: '' })} className="flex-1 h-12 bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 rounded-xl font-bold shadow-sm cursor-pointer outline-none">
                   تراجع
                 </Button>
                 <Button onClick={confirmDelete} className="flex-1 h-12 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold shadow-sm cursor-pointer outline-none border-none">
                   نعم، احذف المركز
                 </Button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. نافذة نجاح العملية */}
      {successCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 max-w-md w-full text-center border border-gray-100" dir="rtl">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100"><CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500" /></div>
             <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2">تم التسجيل بنجاح!</h2>
             <p className="text-gray-500 mb-8 text-sm font-bold">تم إنشاء حساب موظف الاستقبال بنجاح. يرجى حفظ بيانات الدخول التالية.</p>

             <div className="bg-blue-50/50 p-5 md:p-6 rounded-3xl border border-blue-100 mb-8 text-right relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl opacity-50"></div>
                <div className="space-y-3 relative z-10">
                   <div className="bg-white p-3.5 md:p-4 rounded-xl border border-blue-100 flex justify-between items-center group shadow-sm">
                      <div className="text-right flex-1 pl-2">
                          <span className="text-[10px] md:text-xs text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">بريد الدخول</span>
                          <span className="text-sm md:text-base font-mono font-bold text-blue-900 block truncate" dir="ltr">{successCredentials.loginEmail}</span>
                      </div>
                      <button onClick={() => copyToClipboard(successCredentials.loginEmail)} className="w-10 h-10 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 border-none cursor-pointer"><Copy className="w-4 h-4" /></button>
                   </div>
                   <div className="bg-white p-3.5 md:p-4 rounded-xl border border-blue-100 flex justify-between items-center group shadow-sm">
                      <div className="text-right flex-1 pl-2">
                          <span className="text-[10px] md:text-xs text-blue-500 block mb-0.5 font-bold uppercase tracking-widest">الرقم السري</span>
                          <span className="text-sm md:text-base font-mono font-bold text-blue-900 block truncate" dir="ltr">{successCredentials.temporaryPassword}</span>
                      </div>
                      <button onClick={() => copyToClipboard(successCredentials.temporaryPassword)} className="w-10 h-10 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 border-none cursor-pointer"><Copy className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
             <button onClick={handleCloseSuccess} className="w-full bg-[#1e3a8a] text-white h-12 md:h-14 rounded-2xl font-bold hover:bg-blue-900 transition-all text-base md:text-lg shadow-sm border-none outline-none cursor-pointer">حسناً، تم الحفظ</button>
          </div>
        </div>
      )}
    </>
  );
}