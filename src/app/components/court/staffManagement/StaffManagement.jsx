import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../../services/api'; 
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../../../utils/errorHandler';

// مكوناتنا الفرعية
import { StaffHeader } from './components/StaffHeader';
import { StaffSearchFilter } from './components/StaffSearchFilter';
import { StaffGrid } from './components/StaffGrid';
import { StaffModals } from './components/StaffModals';
import { validateFullName, validatePhone, validateEmail, rolesTranslation, rolesOptions } from './components/StaffHelpers';

export function StaffManagement({ onNavigate, onBack }) {
  // ==========================================
  // 1. States الرئيسية
  // ==========================================
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // الفلتر الجديد
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  // ==========================================
  // 2. States النوافذ والفورم
  // ==========================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffReport, setStaffReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', role: '' });
  const [editFormData, setEditFormData] = useState({ fullName: '', phone: '' });

  // ==========================================
  // 3. States Dropdown الخاصة بإضافة الموظف
  // ==========================================
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState(''); 
  const [roleHighlightedIndex, setRoleHighlightedIndex] = useState(-1); 
  const roleDropdownRef = useRef(null);
  const roleListRef = useRef(null);
  const filteredRoles = rolesOptions.filter(r => r.label.includes(roleSearchTerm));

  // إغلاق الدروب داون للإضافة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
        setRoleHighlightedIndex(-1);
        if (!formData.role) {
          setRoleSearchTerm('');
        } else {
          const selected = rolesOptions.find(r => r.value === formData.role);
          if (selected) setRoleSearchTerm(selected.label);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formData.role]);

  useEffect(() => {
    if (isRoleDropdownOpen && roleHighlightedIndex >= 0 && roleListRef.current) {
      const highlightedElement = document.getElementById(`role-item-${roleHighlightedIndex}`);
      if (highlightedElement) highlightedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [roleHighlightedIndex, isRoleDropdownOpen]);

  const handleRoleSearchChange = (e) => {
    setRoleSearchTerm(e.target.value);
    setIsRoleDropdownOpen(true);
    setRoleHighlightedIndex(-1); 
    if (formData.role) setFormData({ ...formData, role: '' });
    if (formErrors.role) setFormErrors({ ...formErrors, role: null });
    if (error) setError(null);
  };

  const handleSelectRole = (roleOpt) => {
    setFormData({ ...formData, role: roleOpt.value });
    setRoleSearchTerm(roleOpt.label); 
    setIsRoleDropdownOpen(false);
    setRoleHighlightedIndex(-1);
    if (formErrors.role) setFormErrors({ ...formErrors, role: null });
    if (error) setError(null);
  };

  const handleRoleKeyDown = (e) => {
    if (!isRoleDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setIsRoleDropdownOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setRoleHighlightedIndex(prev => prev < filteredRoles.length - 1 ? prev + 1 : prev); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setRoleHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev)); } 
    else if (e.key === 'Enter') {
      e.preventDefault(); 
      if (roleHighlightedIndex >= 0 && roleHighlightedIndex < filteredRoles.length) handleSelectRole(filteredRoles[roleHighlightedIndex]);
    } else if (e.key === 'Escape') { setIsRoleDropdownOpen(false); setRoleHighlightedIndex(-1); }
  };

  // ==========================================
  // 4. Effects الأساسية
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchStaff = async (isSilent = false) => {
    if (!isSilent) setLoading(true); 
    try {
      const response = await api.get('/api/courts/me/staffs', { params: { PageNumber: 1, PageSize: 100 } });
      setStaffList(response.data?.items || []);
    } catch (err) {
      toast.error(getErrorMessage(err) || "حدث خطأ أثناء جلب قائمة الموظفين");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(false); }, []);

  // دمج فلتر البحث مع فلتر النوع الجديد
  useEffect(() => {
    let result = staffList;

    if (searchTerm.trim()) {
        setIsSearching(true);
        const term = searchTerm.toLowerCase().trim();
        result = result.filter(s => 
            s.fullName?.toLowerCase().includes(term) || 
            s.email?.toLowerCase().includes(term) ||
            rolesTranslation[s.role]?.includes(term)
        );
    } else {
        setIsSearching(false);
    }

    if (filterRole !== 'all') {
        result = result.filter(s => s.role === filterRole);
    }

    setFilteredStaff(result);
    setVisibleCount(9);
  }, [searchTerm, filterRole, staffList]);

  // ==========================================
  // 5. Handlers والدوال الأساسية
  // ==========================================
  const clearSearch = () => { setSearchTerm(''); setIsSearching(false); setVisibleCount(9); };
  const handleLoadMore = () => setVisibleCount(prev => prev + 9);
  const handleFormChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    if (error) setError(null);
  };

  const validateAddForm = () => {
    let errors = {};
    let isValid = true;
    if (!validateFullName(formData.fullName)) { errors.fullName = "يجب إدخال الاسم رباعياً"; isValid = false; }
    const emailErr = validateEmail(formData.email);
    if (emailErr) { errors.email = emailErr; isValid = false; }
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) { errors.phone = phoneErr; isValid = false; }
    if (!formData.role) { errors.role = "يجب اختيار الدور الوظيفي"; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const validateEditForm = () => {
    let errors = {};
    let isValid = true;
    if (!validateFullName(editFormData.fullName)) { errors.fullName = "يجب إدخال الاسم رباعياً"; isValid = false; }
    const phoneErr = validatePhone(editFormData.phone);
    if (phoneErr) { errors.phone = phoneErr; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) { toast.error("يرجى مراجعة وتصحيح الأخطاء في البيانات"); return; }
    setIsSaving(true); setError(null);
    try {
      const payload = { fullName: formData.fullName.trim(), email: formData.email.trim(), phone: formData.phone.trim(), role: formData.role };
      const response = await api.post('/api/users/court-staff', payload);
      setCreatedCredentials({ username: formData.email, temporaryPassword: response.data.temporaryPassword });
      setSuccessModalOpen(true);
      setFormData({ fullName: '', email: '', phone: '', role: '' });
      setRoleSearchTerm(''); 
      setShowAddModal(false);
      fetchStaff(true);
    } catch (err) { setError(getErrorMessage(err) || "فشل تسجيل الموظف."); } 
    finally { setIsSaving(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) { toast.error("يرجى مراجعة وتصحيح الأخطاء"); return; }
    setIsSaving(true); setError(null);
    try {
      await api.put(`/api/court-staff/${selectedStaff.id}`, { fullName: editFormData.fullName.trim(), phone: editFormData.phone.trim() });
      toast.success("تم تحديث بيانات الموظف بنجاح");
      setShowEditModal(false);
      fetchStaff(true);
    } catch (err) { setError(getErrorMessage(err) || "فشل تحديث البيانات."); } 
    finally { setIsSaving(false); }
  };

  const handleViewStaff = async (staff) => {
    setSelectedStaff(staff); setShowViewModal(true); setLoadingReport(true); setStaffReport(null);
    try {
      const res = await api.get(`/api/court-staff/${staff.id}/report`);
      setStaffReport(res.data);
    } catch (err) { console.warn("No report found or error fetching report", err); } 
    finally { setLoadingReport(false); }
  };

  const handleConfirmDelete = () => {
    toast.error("سيتم تفعيل ميزة الحذف قريباً من قبل إدارة النظام.", { icon: '⏳' });
    setDeleteModal({ show: false, id: '', title: '' });
  };

  const closeAddModal = () => {
    setShowAddModal(false); setFormErrors({}); setError(null);
    setFormData({ fullName: '', email: '', phone: '', role: '' }); setRoleSearchTerm('');
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); toast.success("تم النسخ بنجاح!"); };

  if (loading && staffList.length === 0 && !isSearching) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل سجل الموظفين...</span>
      </div>
    );
  }

  // ==========================================
  // 6. الـ Render
  // ==========================================
  return (
    <div className="w-full font-sans pb-10" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 px-4 md:px-0">
          
          <StaffHeader onBack={onBack} />
          
          <StaffSearchFilter 
             staffCount={staffList.length} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
             clearSearch={clearSearch} setShowAddModal={setShowAddModal} 
             setFormErrors={setFormErrors} setError={setError}
             filterRole={filterRole} setFilterRole={setFilterRole}
          />

          <StaffGrid 
             filteredStaff={filteredStaff} isSearching={isSearching} searchTerm={searchTerm} 
             visibleCount={visibleCount} staffLength={staffList.length} 
             setShowAddModal={setShowAddModal} clearSearch={clearSearch} handleLoadMore={handleLoadMore}
             setSelectedStaff={setSelectedStaff} setEditFormData={setEditFormData} setShowEditModal={setShowEditModal} 
             setFormErrors={setFormErrors} setError={setError} setDeleteModal={setDeleteModal} handleViewStaff={handleViewStaff}
          />

        </div>
      </div>

      <StaffModals 
        showAddModal={showAddModal} setShowAddModal={setShowAddModal} closeAddModal={closeAddModal}
        error={error} setError={setError} formErrors={formErrors} setFormErrors={setFormErrors}
        formData={formData} setFormData={setFormData} handleFormChange={handleFormChange} handleAddSubmit={handleAddSubmit} isSaving={isSaving}
        isRoleDropdownOpen={isRoleDropdownOpen} setIsRoleDropdownOpen={setIsRoleDropdownOpen} roleSearchTerm={roleSearchTerm}
        handleRoleSearchChange={handleRoleSearchChange} handleRoleKeyDown={handleRoleKeyDown} roleDropdownRef={roleDropdownRef}
        roleListRef={roleListRef} filteredRoles={filteredRoles} roleHighlightedIndex={roleHighlightedIndex} setRoleHighlightedIndex={setRoleHighlightedIndex}
        handleSelectRole={handleSelectRole}
        showEditModal={showEditModal} setShowEditModal={setShowEditModal} editFormData={editFormData} setEditFormData={setEditFormData}
        handleEditSubmit={handleEditSubmit} selectedStaff={selectedStaff}
        showViewModal={showViewModal} setShowViewModal={setShowViewModal} staffReport={staffReport} loadingReport={loadingReport}
        deleteModal={deleteModal} setDeleteModal={setDeleteModal} handleConfirmDelete={handleConfirmDelete}
        successModalOpen={successModalOpen} setSuccessModalOpen={setSuccessModalOpen} createdCredentials={createdCredentials} handleCopy={handleCopy}
      />
    </div>
  );
}