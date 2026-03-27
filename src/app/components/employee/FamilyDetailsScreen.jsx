import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, FileText, Briefcase,
    Loader2, AlertCircle, User, Users, Plus, Save, Clock, HelpCircle,
    Trash2, Calendar, School, Search, X, Check,
    Upload, Paperclip, FileCheck, CheckCircle2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import api, { courtAPI, schoolAPI, commonAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export function FamilyDetailsScreen({ familyId, onBack, onNavigate }) {
    const currentFamilyId = typeof familyId === 'object' ? (familyId?.familyId || familyId?.id) : familyId;

    const [loading, setLoading] = useState(true);
    const [cases, setCases] = useState([]);

    // --- حالات نافذة "إضافة قضية" ---
    const [showCaseModal, setShowCaseModal] = useState(false);
    const [isSubmittingCase, setIsSubmittingCase] = useState(false);
    const [caseForm, setCaseForm] = useState({ caseNumber: '', decisionSummary: '', documentId: null });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');

    // --- حالات نافذة "إضافة طفل" ---
    const [showChildModal, setShowChildModal] = useState(false);
    const [isSubmittingChild, setIsSubmittingChild] = useState(false);
    const [childForm, setChildForm] = useState({ fullName: '', birthDate: '', gender: 'Male', schoolId: '' });
    const [schools, setSchools] = useState([]);
    const [loadingSchools, setLoadingSchools] = useState(false);

    const [data, setData] = useState({ family: null });
    const [schoolMap, setSchoolMap] = useState({});

    // --- حالات البحث عن مدرسة ---
    const [schoolSearch, setSchoolSearch] = useState('');
    const [showSchoolResults, setShowSchoolResults] = useState(false);
    const [selectedSchoolName, setSelectedSchoolName] = useState('');

    const calculateAge = (birthDate) => {
        if (!birthDate) return "--";
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
        return `${age} سنة`;
    };

    const fetchFullData = async () => {
        if (!currentFamilyId) { setLoading(false); return; }
        setLoading(true);

        try {
            const [familyRes, casesRes, schoolsRes] = await Promise.allSettled([
                courtAPI.getFamily(currentFamilyId),
                courtAPI.getCaseByFamily(currentFamilyId),
                schoolAPI.listSchools({ pageSize: 1000 })
            ]);

            if (familyRes.status === 'rejected') throw new Error("Failed to load family data");

            setData({ family: familyRes.value.data });

            if (casesRes.status === 'fulfilled') {
                const casesDataRaw = casesRes.value.data;
                setCases(casesDataRaw.items || (Array.isArray(casesDataRaw) ? casesDataRaw : []));
            }

            if (schoolsRes.status === 'fulfilled') {
                const map = {};
                (schoolsRes.value.data.items || []).forEach(s => {
                    map[s.id] = s;
                });
                setSchoolMap(map);
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء تحميل تفاصيل العائلة.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFullData(); }, [currentFamilyId]);

    const fetchSchools = async (search = '') => {
        setLoadingSchools(true);
        try {
            const res = await schoolAPI.listSchools({ Name: search, pageSize: 50 });
            setSchools(res.data.items || []);
        } catch (error) {
            console.error("Failed to fetch schools", error);
        } finally {
            setLoadingSchools(false);
        }
    };

    // Debounce school search
    useEffect(() => {
        if (!showSchoolResults) return;
        const timer = setTimeout(() => {
            fetchSchools(schoolSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [schoolSearch, showSchoolResults]);

    const handleAddChild = async (e) => {
        e.preventDefault();
        if (!childForm.fullName || !childForm.birthDate) {
            toast.error("يرجى ملء جميع الحقول المطلوبة.");
            return;
        }

        setIsSubmittingChild(true);
        try {
            await courtAPI.addChild(currentFamilyId, {
                ...childForm,
                schoolId: childForm.schoolId || null
            });
            toast.success("تم إضافة الطفل بنجاح!");
            setShowChildModal(false);
            setChildForm({ fullName: '', birthDate: '', gender: 'Male', schoolId: '' });
            fetchFullData();
        } catch (error) {
            toast.error(error.message || "حدث خطأ أثناء إضافة الطفل.");
        } finally {
            setIsSubmittingChild(false);
        }
    };

    const handleRemoveChild = async (childId) => {
        if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الطفل؟")) return;

        try {
            await courtAPI.removeChild(currentFamilyId, childId);
            toast.success("تم حذف الطفل بنجاح!");
            fetchFullData();
        } catch (error) {
            toast.error(error.message || "حدث خطأ أثناء حذف الطفل.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await commonAPI.uploadDocument(formData);
            const docId = res.data; // المخدم يعيد الـ ID مباشرة بناءً على التوثيق
            setCaseForm(prev => ({ ...prev, documentId: docId }));
            setUploadedFileName(file.name);
            toast.success("تم رفع المستند بنجاح!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("فشل رفع المستند.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateCase = async (e) => {
        e.preventDefault();
        setIsSubmittingCase(true);
        try {
            await courtAPI.createCase({
                familyId: currentFamilyId,
                caseNumber: caseForm.caseNumber || null,
                decisionSummary: caseForm.decisionSummary || null,
                documentId: caseForm.documentId || null
            });
            toast.success("تم إنشاء القضية بنجاح!");
            setShowCaseModal(false);
            setCaseForm({ caseNumber: '', decisionSummary: '', documentId: null });
            setUploadedFileName('');
            fetchFullData();
        } catch (error) {
            toast.error("حدث خطأ أثناء إنشاء القضية.");
        } finally {
            setIsSubmittingCase(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" dir="rtl">
            <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" />
            <p className="text-gray-500 font-medium">جاري التحميل...</p>
        </div>
    );

    if (!data.family) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">تعذر تحميل بيانات العائلة</h2>
            <button onClick={onBack} className="border px-4 py-2 rounded-lg hover:bg-gray-100 mt-4 transition-colors">العودة للقائمة</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pb-20" dir="rtl">

            {showCaseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-in zoom-in duration-300 text-right">
                        <button onClick={() => setShowCaseModal(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><Briefcase className="w-6 h-6 text-[#1e3a8a]" /> إضافة قضية جديدة</h2>
                        <p className="text-sm text-gray-500 mb-6">يرجى إدخال تفاصيل القضية لربطها بملف هذه العائلة.</p>

                        <form onSubmit={handleCreateCase} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رقم القضية</label>
                                <input
                                    type="text"
                                    value={caseForm.caseNumber}
                                    onChange={(e) => setCaseForm({ ...caseForm, caseNumber: e.target.value })}
                                    placeholder="مثال: 2026/154"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ملخص القرار / ملاحظات</label>
                                <textarea
                                    value={caseForm.decisionSummary}
                                    onChange={(e) => setCaseForm({ ...caseForm, decisionSummary: e.target.value })}
                                    placeholder="اكتب ملخص قرار المحكمة أو ملاحظات إضافية هنا..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>

                            {/* Document Upload Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">المرفقات (اختياري)</label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${caseForm.documentId ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mb-2" />
                                                <p className="text-sm font-medium text-gray-600">جاري رفع المستند...</p>
                                            </>
                                        ) : caseForm.documentId ? (
                                            <>
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                                    <FileCheck className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 mb-1">تم إرفاق المستند!</p>
                                                <p className="text-xs text-green-600 flex items-center gap-1 font-medium italic">
                                                    <CheckCircle2 className="w-3 h-3" /> {uploadedFileName}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a8a] mb-2">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 mb-1">اضغط لرفع ملف</p>
                                                <p className="text-xs text-gray-500 font-medium">PDF، صور، أو مستندات (بحد أقصى 10 ميجابايت)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="submit" disabled={isSubmittingCase} className="flex-1 bg-[#1e3a8a] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 border-none">
                                    {isSubmittingCase ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} إنشاء القضية
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showChildModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-in zoom-in duration-300 text-right">
                        <button onClick={() => setShowChildModal(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><Users className="w-6 h-6 text-[#1e3a8a]" /> إضافة طفل جديد</h2>
                        <p className="text-sm text-gray-500 mb-6">يرجى إدخال تفاصيل الطفل لإضافته لهذه العائلة.</p>

                        <form onSubmit={handleAddChild} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                                <input
                                    type="text"
                                    required
                                    value={childForm.fullName}
                                    onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
                                    placeholder="أدخل الاسم الكامل"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الميلاد</label>
                                    <div className="relative">
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            value={childForm.birthDate}
                                            onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })}
                                            className="w-full p-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-sans"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">الجنس</label>
                                    <select
                                        value={childForm.gender}
                                        onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                    >
                                        <option value="Male">ذكر</option>
                                        <option value="Female">أنثى</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">المدرسة (اختياري)</label>
                                <div className="relative">
                                    <div className="relative group">
                                        <School className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a8a] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="ابحث عن مدرسة..."
                                            value={showSchoolResults ? schoolSearch : selectedSchoolName}
                                            onFocus={() => {
                                                setShowSchoolResults(true);
                                                if (schools.length === 0) fetchSchools();
                                            }}
                                            onChange={(e) => setSchoolSearch(e.target.value)}
                                            className="w-full p-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                        {showSchoolResults && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSchoolResults(false);
                                                    setSchoolSearch('');
                                                }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-400" />
                                            </button>
                                        )}
                                    </div>

                                    {showSchoolResults && (
                                        <div className="absolute z-[60] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                            {loadingSchools ? (
                                                <div className="p-8 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-[#1e3a8a] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-400">جاري البحث...</p>
                                                </div>
                                            ) : schools.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {schools.map(school => (
                                                        <button
                                                            key={school.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setChildForm({ ...childForm, schoolId: school.id });
                                                                setSelectedSchoolName(school.name);
                                                                setSchoolSearch('');
                                                                setShowSchoolResults(false);
                                                            }}
                                                            className={`w-full text-right p-3 rounded-xl flex items-center justify-between transition-all ${childForm.schoolId === school.id ? 'bg-blue-50 text-[#1e3a8a]' : 'hover:bg-gray-50 text-gray-700'}`}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm">{school.name}</span>
                                                                <span className="text-[10px] opacity-70">{school.address || school.governorate || 'لا توجد معلومات عن الموقع'}</span>
                                                            </div>
                                                            {childForm.schoolId === school.id && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-gray-400">
                                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm italic">لم يتم العثور على مدارس مطابقة لبحثك.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {showSchoolResults && (
                                    <div
                                        className="fixed inset-0 z-[55]"
                                        onClick={() => setShowSchoolResults(false)}
                                    ></div>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="submit" disabled={isSubmittingChild} className="flex-1 bg-[#1e3a8a] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 border-none">
                                    {isSubmittingChild ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} إضافة طفل
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Page Header */}
            <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl mb-8" dir="rtl">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 translate-x-1/3 opacity-50"></div>

                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto text-right">
                    <button onClick={onBack} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border-none">
                        <ChevronLeft className="w-6 h-6 text-white rotate-180" />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            ملف العائلة: {data.family.father?.fullName?.split(' ')[0] || '---'} و {data.family.mother?.fullName?.split(' ')[0] || '---'}
                        </h1>
                        <div className="flex items-center gap-4 text-blue-200 text-sm opacity-90 mt-2">
                            <span className="flex items-center gap-1 font-sans"><Users className="w-4 h-4" /> {data.family.children?.length || 0} أطفال</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-6 space-y-8" dir="rtl">
                {/* 1. Parents Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="p-6 bg-card border-border shadow-sm rounded-2xl overflow-hidden relative text-right">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mt-12 opacity-50"></div>
                        <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4 relative z-10">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><User className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{data.family.father?.fullName || 'غير مسجل'}</h3>
                                <p className="text-xs text-gray-400 font-medium tracking-wider">الأب</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm relative z-10">
                            {[
                                { label: 'الرقم القومي', value: data.family.father?.nationalId, mono: true },
                                { label: 'تاريخ الميلاد', value: data.family.father?.birthDate },
                                { label: 'الجنس', value: data.family.father?.gender === 'Male' ? 'ذكر' : 'أنثى' },
                                { label: 'المهنة', value: data.family.father?.job },
                                { label: 'العنوان', value: data.family.father?.address },
                                { label: 'الهاتف', value: data.family.father?.phone },
                                { label: 'البريد الإلكتروني', value: data.family.father?.email },
                            ].map((field, idx) => (
                                <div key={idx} className={`flex justify-between items-center p-2.5 rounded-xl border border-transparent ${idx % 2 === 0 ? 'bg-gray-50/80 border-gray-100' : ''}`}>
                                    <span className="text-gray-500 font-bold">{field.label}:</span>
                                    <span className={`${field.mono ? 'font-mono text-xs' : 'font-sans'} font-bold text-gray-700`}>{field.value || '---'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border shadow-sm rounded-2xl overflow-hidden relative text-right">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-pink-50 rounded-full -ml-12 -mt-12 opacity-50"></div>
                        <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4 relative z-10">
                            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600"><User className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{data.family.mother?.fullName || 'غير مسجل'}</h3>
                                <p className="text-xs text-gray-400 font-medium tracking-wider">الأم</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm relative z-10">
                            {[
                                { label: 'الرقم القومي', value: data.family.mother?.nationalId, mono: true },
                                { label: 'تاريخ الميلاد', value: data.family.mother?.birthDate },
                                { label: 'الجنس', value: data.family.mother?.gender === 'Male' ? 'ذكر' : 'أنثى' },
                                { label: 'المهنة', value: data.family.mother?.job },
                                { label: 'العنوان', value: data.family.mother?.address },
                                { label: 'الهاتف', value: data.family.mother?.phone },
                                { label: 'البريد الإلكتروني', value: data.family.mother?.email },
                            ].map((field, idx) => (
                                <div key={idx} className={`flex justify-between items-center p-2.5 rounded-xl border border-transparent ${idx % 2 === 0 ? 'bg-pink-50/30 border-pink-100/30' : ''}`}>
                                    <span className="text-gray-500 font-bold">{field.label}:</span>
                                    <span className={`${field.mono ? 'font-mono text-xs' : 'font-sans'} font-bold text-gray-700`}>{field.value || '---'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 2. Children info */}
                <Card className="p-6 bg-card border-border shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 text-right">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <span className="w-2 h-6 bg-[#1e3a8a] rounded-full"></span>
                            الأبناء ({data.family.children?.length || 0})
                        </h3>
                        <button
                            onClick={() => setShowChildModal(true)}
                            className="bg-blue-50 text-[#1e3a8a] px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2 text-sm border-none"
                        >
                            <Plus className="w-4 h-4" /> إضافة طفل
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.family.children?.length > 0 ? data.family.children.map((child, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${child.gender === 'Female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {child.gender === 'Female' ? 'أنثى' : 'ذكر'}
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-gray-800">{child.fullName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{calculateAge(child.birthDate)} • {child.gender === 'Male' ? 'ذكر' : 'أنثى'}</p>
                                        {child.schoolId && schoolMap[child.schoolId] && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-[#1e3a8a] mt-1.5 font-semibold bg-blue-50/50 w-fit px-2 py-0.5 rounded-md border border-blue-100/50">
                                                <School className="w-3.5 h-3.5" />
                                                <span>{schoolMap[child.schoolId].name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveChild(child.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 border-none"
                                    title="حذف الطفل"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed">
                                لم يتم العثور على بيانات أطفال.
                            </div>
                        )}
                    </div>
                </Card>

                {/* 3. Court Cases History Section (REPLACES TABS) */}
                <Card className="p-6 bg-card border-border shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 text-right">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                                <Clock className="w-6 h-6 text-[#1e3a8a]" />
                                سجل القضايا
                            </h3>
                            <Badge className="bg-[#1e3a8a] text-white px-3 py-1 font-sans">{cases.length} إجمالي</Badge>
                        </div>
                        <button onClick={() => setShowCaseModal(true)} className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 border-none">
                            <Plus className="w-5 h-5" /> إضافة قضية جديدة
                        </button>
                    </div>

                    {cases.length > 0 ? (
                        <div className="space-y-4">
                            {cases.map((courtCase, idx) => (
                                <div
                                    key={courtCase.id || idx}
                                    onClick={() => onNavigate('case-details', { caseId: courtCase.id, familyId: currentFamilyId })}
                                    className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e3a8a] shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-lg text-gray-900">رقم القضية: {courtCase.caseNumber || 'غير متوفر'}</span>
                                                    <Badge className={`
                                                        ${courtCase.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                                                        text-[10px] font-bold uppercase tracking-wider
                                                    `}>
                                                        {courtCase.status === 'Open' ? 'مفتوحة' : (courtCase.status || 'حالة غير معروفة')}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 font-sans">
                                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> تاريخ التقديم: {new Date(courtCase.filedAt).toLocaleDateString('ar-EG')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:text-left flex flex-col items-start md:items-end gap-2 shrink-0">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 w-full md:w-64">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ملخص القرار</p>
                                                <p className="text-sm text-gray-700 line-clamp-2 italic">
                                                    {courtCase.decisionSummary || "لم يتم تسجيل ملخص قرار بعد."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HelpCircle className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium text-lg">لا توجد قضايا مسجلة لهذه العائلة حتى الآن.</p>
                            <p className="text-gray-400 text-sm mt-1">اضغط على "إضافة قضية" لتسجيل القضية الأولى.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div >
    );
}