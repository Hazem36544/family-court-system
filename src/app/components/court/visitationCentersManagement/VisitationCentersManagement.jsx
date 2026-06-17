import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../../services/api'; 
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../../../utils/errorHandler';

// استيراد المكونات الفرعية
import { CentersHeader } from './components/CentersHeader';
import { CentersSearchFilter } from './components/CentersSearchFilter';
import { CentersGrid } from './components/CentersGrid';
import { CentersModals } from './components/CentersModals';

export function VisitationCentersManagement({ onNavigate, onBack }) {
  // ==========================================
  // States
  // ==========================================
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [savedLocationId, setSavedLocationId] = useState(null); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [successCredentials, setSuccessCredentials] = useState(null);
  const [addAnother, setAddAnother] = useState(false); 

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddExtraStaff, setShowAddExtraStaff] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '', subtitle: '' });

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [editLocationForm, setEditLocationForm] = useState({});
  const [editManagerForm, setEditManagerForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitialGovernorate = () => {
    const savedUser = sessionStorage.getItem('wesal_court_user_data');
    return savedUser ? (JSON.parse(savedUser).governorate || '') : '';
  };

  const [formData, setFormData] = useState({
      name: '', address: '', governorate: getInitialGovernorate(), 
      contactNumber: '', maxConcurrentVisits: 10, openingTime: '09:00', closingTime: '17:00',
      managerFullName: '', managerEmail: '', managerPhone: ''
  });

  // ==========================================
  // Effects
  // ==========================================
  useEffect(() => {
    const fetchCourtData = async () => {
      try {
        const sessionData = sessionStorage.getItem('wesal_court_user_data');
        if (sessionData) {
          const courtId = JSON.parse(sessionData).id;
          if (courtId) {
            const res = await api.get(`/api/courts/${courtId}`);
            if (res.data && res.data.governorate) {
              setFormData(prev => ({ ...prev, governorate: res.data.governorate }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch court gov:", err);
      }
    };
    fetchCourtData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchCenters = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [centersRes, staffsRes] = await Promise.allSettled([
        api.get('/api/visit-centers', { params: { PageNumber: 1, PageSize: 100 } }),
        api.get('/api/courts/me/center-staffs', { params: { PageNumber: 1, PageSize: 100 } })
      ]);

      if (centersRes.status === 'rejected') throw centersRes.reason;

      const rawCenters = centersRes.value.data?.items || [];
      const rawStaffs = staffsRes.status === 'fulfilled' ? (staffsRes.value.data?.items || []) : [];

      const mergedCenters = rawCenters.map(center => {
        // تم التعديل هنا: استخدام visitCenterId لمطابقة الـ API بدلاً من locationId
        const centerStaffs = rawStaffs.filter(staff => staff.visitCenterId === center.id);
        return { ...center, staffs: centerStaffs };
      });

      setCenters(mergedCenters);
      setFilteredCenters(mergedCenters);
      setIsSearching(!!searchTerm);
    } catch (err) {
      toast.error(getErrorMessage(err) || "حدث خطأ أثناء جلب قائمة مراكز الرؤية");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { fetchCenters(); }, []);

  useEffect(() => {
      if (!searchTerm.trim()) {
          setFilteredCenters(centers);
          setIsSearching(false);
      } else {
          setIsSearching(true);
          const term = searchTerm.toLowerCase().trim();
          setFilteredCenters(centers.filter(c => 
              c.name?.toLowerCase().includes(term) || 
              c.governorate?.toLowerCase().includes(term) ||
              c.staffs?.some(s => s.fullName?.toLowerCase().includes(term)) 
          ));
      }
      setVisibleCount(9);
  }, [searchTerm, centers]);

  // ==========================================
  // Handlers
  // ==========================================
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setVisibleCount(9);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
    if (error) setError(null);
  };

  const validateFullName = (name) => {
    if (!name) return false;
    return name.trim().split(/\s+/).length >= 4;
  };

  const validatePhone = (phone, isRequired = true) => {
    if (!phone && !isRequired) return null;
    if (!phone && isRequired) return "رقم التواصل مطلوب";
    if (!/^01[0125]\d{8}$/.test(phone)) return "غير صحيح";
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "صيغة غير صحيحة";
    return null;
  };

  const validateStep1 = () => {
    let errors = {};
    let isValid = true;
    if (!formData.name.trim()) { errors.name = "اسم المركز مطلوب"; isValid = false; }
    if (!formData.address.trim()) { errors.address = "العنوان التفصيلي مطلوب"; isValid = false; }
    const phoneErr = validatePhone(formData.contactNumber, true);
    if (phoneErr) { errors.contactNumber = phoneErr; isValid = false; }
    if (!formData.openingTime) { errors.openingTime = "مطلوب"; isValid = false; }
    if (!formData.closingTime) { errors.closingTime = "مطلوب"; isValid = false; }
    if (!formData.maxConcurrentVisits || formData.maxConcurrentVisits <= 0) { errors.maxConcurrentVisits = "مطلوب"; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const validateStep2 = () => {
    let errors = {};
    let isValid = true;
    if (!validateFullName(formData.managerFullName)) { errors.managerFullName = "يجب إدخال الاسم الرباعي"; isValid = false; }
    const emailErr = validateEmail(formData.managerEmail);
    if (emailErr) { errors.managerEmail = emailErr; isValid = false; }
    const phoneErr = validatePhone(formData.managerPhone, false);
    if (phoneErr) { errors.managerPhone = phoneErr; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const handleCreateCenter = async () => {
      if (!validateStep1()) return;
      setIsSaving(true);
      setError(null);
      try {
          const centerPayload = {
              name: formData.name.trim(),
              address: formData.address.trim(),
              contactNumber: formData.contactNumber.trim(),
              maxConcurrentVisits: parseInt(formData.maxConcurrentVisits),
              openingTime: formData.openingTime.split(':').length === 2 ? `${formData.openingTime}:00` : formData.openingTime,
              closingTime: formData.closingTime.split(':').length === 2 ? `${formData.closingTime}:00` : formData.closingTime
          };
          const centerRes = await api.post('/api/visit-centers', centerPayload);
          setSavedLocationId(centerRes.data); 
          setModalStep(2); 
      } catch (err) {
          setError(getErrorMessage(err) || "فشل في تسجيل بيانات المركز.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleCreateStaff = async (e, shouldAddAnother) => {
      e.preventDefault();
      if (!validateStep2()) return;
      setIsSaving(true);
      setAddAnother(shouldAddAnother);
      setError(null);
      try {
          const targetLocationId = showAddExtraStaff ? selectedCenter.id : savedLocationId;
          
          const staffPayload = {
              email: formData.managerEmail.trim(),
              fullName: formData.managerFullName.trim(),
              phone: formData.managerPhone.trim() || formData.contactNumber.trim(),
              visitCenterId: targetLocationId 
          };
          
          const staffRes = await api.post('/api/users/visit-center-staff', staffPayload);
          setSuccessCredentials({
              ...staffRes.data,
              loginEmail: formData.managerEmail, 
              originalName: staffRes.data.username 
          }); 
          toast.success("تم تسجيل الموظف بنجاح!");
      } catch (err) {
          setError(getErrorMessage(err) || "فشل في تسجيل حساب الموظف.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleCloseSuccess = async () => {
      setSuccessCredentials(null);
      
      if (addAnother) {
          setFormData(prev => ({...prev, managerFullName: '', managerEmail: '', managerPhone: ''}));
          setAddAnother(false);
          await fetchCenters(true); 
          
          if (showAddExtraStaff && selectedCenter) {
              const res = await api.get('/api/courts/me/center-staffs', { params: { PageNumber: 1, PageSize: 100 } });
              const staffs = res.data?.items || [];
              // تم التعديل هنا: استخدام visitCenterId
              const centerStaffs = staffs.filter(s => s.visitCenterId === selectedCenter.id);
              setSelectedCenter(prev => ({...prev, staffs: centerStaffs}));
          }
      } else {
          if (showAddExtraStaff) {
              setShowAddExtraStaff(false);
              setFormData(prev => ({...prev, managerFullName: '', managerEmail: '', managerPhone: ''}));
              await fetchCenters(true);
              const res = await api.get('/api/courts/me/center-staffs', { params: { PageNumber: 1, PageSize: 100 } });
              const staffs = res.data?.items || [];
              // تم التعديل هنا: استخدام visitCenterId
              const centerStaffs = staffs.filter(s => s.visitCenterId === selectedCenter.id);
              setSelectedCenter(prev => ({...prev, staffs: centerStaffs}));
          } else {
              closeModal();
              await fetchCenters(true);
          }
      }
  };

  const handleStartEditLocation = () => {
    setEditLocationForm({
      name: selectedCenter.name,
      address: selectedCenter.address,
      governorate: selectedCenter.governorate,
      contactNumber: selectedCenter.contactNumber,
      maxConcurrentVisits: selectedCenter.maxConcurrentVisits,
      openingTime: selectedCenter.openingTime.substring(0, 5),
      closingTime: selectedCenter.closingTime.substring(0, 5)
    });
    setIsEditingLocation(true);
  };

  const handleUpdateLocation = async () => {
    if (!editLocationForm.name || !editLocationForm.address || !editLocationForm.contactNumber) {
      toast.error('يرجى ملء جميع الحقول الإجبارية'); return;
    }
    setIsUpdating(true);
    try {
      const payload = {
         ...editLocationForm,
         maxConcurrentVisits: parseInt(editLocationForm.maxConcurrentVisits),
         openingTime: editLocationForm.openingTime.split(':').length === 2 ? `${editLocationForm.openingTime}:00` : editLocationForm.openingTime,
         closingTime: editLocationForm.closingTime.split(':').length === 2 ? `${editLocationForm.closingTime}:00` : editLocationForm.closingTime,
      };
      await api.put(`/api/visit-centers/${selectedCenter.id}`, payload, { params: { locationId: selectedCenter.id } });
      toast.success('تم تحديث بيانات المركز بنجاح');
      setIsEditingLocation(false);
      fetchCenters(true); 
      setSelectedCenter({...selectedCenter, ...payload}); 
    } catch(err) {
      toast.error(getErrorMessage(err) || "فشل التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartEditManager = () => {
    if (!selectedStaff) return;
    setEditManagerForm({
      managerName: selectedStaff.fullName,
      managerPhone: selectedStaff.phone !== '---' ? selectedStaff.phone : ''
    });
    setIsEditingManager(true);
  };

  const handleUpdateManager = async () => {
    if (!validateFullName(editManagerForm.managerName)) { toast.error("الاسم الرباعي مطلوب للموظف"); return; }
    setIsUpdating(true);
    try {
      await api.put(`/api/visit-center-staff/${selectedStaff.id}`, {
         fullName: editManagerForm.managerName,
         phone: editManagerForm.managerPhone
      });
      toast.success('تم تحديث بيانات الموظف بنجاح');
      setIsEditingManager(false);
      
      const updatedStaff = { ...selectedStaff, fullName: editManagerForm.managerName, phone: editManagerForm.managerPhone };
      setSelectedStaff(updatedStaff);
      
      const updatedCenters = centers.map(c => {
         if (c.id === selectedCenter.id) {
             return { ...c, staffs: c.staffs.map(s => s.id === updatedStaff.id ? updatedStaff : s) };
         }
         return c;
      });
      setCenters(updatedCenters);
      setFilteredCenters(updatedCenters.filter(c => c.name?.includes(searchTerm) || c.staffs?.some(s=>s.fullName.includes(searchTerm))));
      
      setSelectedCenter(prev => ({
          ...prev,
          staffs: prev.staffs.map(s => s.id === updatedStaff.id ? updatedStaff : s)
      }));

    } catch(err) {
      toast.error(getErrorMessage(err) || "فشل التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
      setShowAddModal(false);
      setTimeout(() => {
          setModalStep(1);
          setSavedLocationId(null);
          setError(null);
          setFormErrors({});
          setFormData({ name: '', address: '', governorate: formData.governorate, contactNumber: '', maxConcurrentVisits: 10, openingTime: '09:00', closingTime: '17:00', managerFullName: '', managerEmail: '', managerPhone: '' });
      }, 300); 
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ show: false, id: '', title: '', subtitle: '' });
    try {
      await api.delete(`/api/visit-centers/${id}`, { params: { locationId: id } });
      toast.success("تم حذف المركز بنجاح");
      setSelectedCenter(null);
      fetchCenters(true);
    } catch (e) {
      toast.error(getErrorMessage(e) || "فشل الحذف، قد تكون هناك بيانات مرتبطة بهذا المركز.");
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success("تم النسخ بنجاح"); };

  if (loading && centers.length === 0 && !isSearching) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل مراكز الرؤية...</span>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-700 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 pb-10 px-4 md:px-0">
          
          <CentersHeader onBack={onBack} />
          
          <CentersSearchFilter 
            centersCount={centers.length} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            clearSearch={clearSearch} 
            setShowAddModal={setShowAddModal} 
          />

          <CentersGrid 
            filteredCenters={filteredCenters} 
            isSearching={isSearching} 
            searchTerm={searchTerm} 
            visibleCount={visibleCount} 
            centersLength={centers.length} 
            setShowAddModal={setShowAddModal} 
            clearSearch={clearSearch} 
            handleLoadMore={handleLoadMore} 
            setSelectedCenter={setSelectedCenter} 
          />

        </div>
      </div>

      <CentersModals 
        showAddModal={showAddModal} setShowAddModal={setShowAddModal}
        modalStep={modalStep} closeModal={closeModal} error={error}
        formData={formData} handleFormChange={handleFormChange} formErrors={formErrors}
        savedLocationId={savedLocationId} isSaving={isSaving} handleCreateCenter={handleCreateCenter} handleCreateStaff={handleCreateStaff} addAnother={addAnother}
        showAddExtraStaff={showAddExtraStaff} setShowAddExtraStaff={setShowAddExtraStaff} setFormData={setFormData}
        selectedCenter={selectedCenter} setSelectedCenter={setSelectedCenter} isEditingLocation={isEditingLocation} setIsEditingLocation={setIsEditingLocation} handleStartEditLocation={handleStartEditLocation} editLocationForm={editLocationForm} setEditLocationForm={setEditLocationForm} handleUpdateLocation={handleUpdateLocation} isUpdating={isUpdating}
        selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} isEditingManager={isEditingManager} setIsEditingManager={setIsEditingManager} handleStartEditManager={handleStartEditManager} editManagerForm={editManagerForm} setEditManagerForm={setEditManagerForm} handleUpdateManager={handleUpdateManager}
        deleteModal={deleteModal} setDeleteModal={setDeleteModal} confirmDelete={confirmDelete}
        successCredentials={successCredentials} handleCloseSuccess={handleCloseSuccess} copyToClipboard={copyToClipboard}
      />
    </div>
  );
}