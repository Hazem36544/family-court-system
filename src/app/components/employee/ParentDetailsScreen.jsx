import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Phone, Mail, MapPin, IdCard, Calendar, Key, Copy, CheckCircle, Shield, FileText, Users, Edit, Save, X, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import api, { courtAPI } from '../api'; // استيراد api instance و courtAPI
import { toast } from 'react-hot-toast';

export function ParentDetailsScreen({ parentData, onBack }) {
  // الحالات (States)
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [details, setDetails] = useState(parentData); // البيانات الحالية المعروضة
  const [caseInfo, setCaseInfo] = useState(null); // بيانات القضية المرتبطة
  
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // حالة البيانات المعدلة (للفورم)
  const [editedData, setEditedData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    job: '' // حقل الوظيفة متاح في الـ API
  });

  // 1. جلب البيانات الحديثة عند التحميل
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // أ) جلب تفاصيل الأسرة كاملة لاستخراج بيانات الولي الحديثة
        const familyResponse = await courtAPI.getFamily(parentData.familyId);
        const family = familyResponse.data;
        
        // تحديد هل هذا الأب أم الأم بناءً على الـ ID
        let currentParent = null;
        if (family.father && family.father.id === parentData.id) {
            currentParent = { ...family.father, parentType: 'father' };
        } else if (family.mother && family.mother.id === parentData.id) {
            currentParent = { ...family.mother, parentType: 'mother' };
        }

        if (currentParent) {
            // تحديث البيانات المعروضة
            // ملاحظة: الـ API يرجع العنوان كامل، سنحاول فصل المدينة إذا أمكن أو تركها كما هي
            const addressParts = currentParent.address ? currentParent.address.split('-') : [];
            const city = addressParts.length > 0 ? addressParts[0].trim() : 'غير محدد';

            setDetails({
                ...parentData, // الحفاظ على البيانات القديمة كاحتياط
                ...currentParent, // تحديث بالبيانات الجديدة
                city: city
            });

            // تحديث الفورم بالبيانات الجديدة
            setEditedData({
                email: currentParent.email || '',
                phone: currentParent.phone || '',
                address: currentParent.address || '',
                city: city,
                job: currentParent.job || ''
            });
        }

        // ب) جلب بيانات القضية المرتبطة بالأسرة
        try {
            const caseResponse = await courtAPI.getCaseByFamily(parentData.familyId);
            if (caseResponse.data) {
                setCaseInfo(caseResponse.data);
            }
        } catch (caseError) {
            console.warn("No active case found or error fetching case:", caseError);
            // لا نوقف الصفحة إذا فشل جلب القضية
        }

      } catch (error) {
        console.error("Error fetching details:", error);
        toast.error("تعذر تحميل البيانات الحديثة");
      } finally {
        setIsLoading(false);
      }
    };

    if (parentData && parentData.familyId) {
        fetchData();
    }
  }, [parentData]);


  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 2. حفظ التعديلات
  const handleSave = async () => {
    setIsSaving(true);
    try {
        // تجهيز الـ Payload حسب الـ Swagger
        // PUT /api/parents/{parentId}
        const payload = {
            email: editedData.email,
            phone: editedData.phone,
            address: editedData.address, // نرسل العنوان كاملاً (أو ندمج المدينة معه إذا لزم الأمر)
            job: editedData.job || 'غير محدد'
        };

        // استخدام axios instance مباشرة لأن الدالة قد لا تكون معرفة في courtAPI
        await api.put(`/api/parents/${details.id}`, payload);

        toast.success("تم تحديث البيانات بنجاح");
        
        // تحديث الواجهة
        setDetails(prev => ({
            ...prev,
            ...payload
        }));
        setIsEditing(false);

    } catch (error) {
        console.error("Update failed:", error);
        const msg = error.response?.data?.detail || "فشل التحديث، يرجى التأكد من البيانات";
        toast.error(msg);
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // إعادة البيانات للقيم الأصلية من الـ State
    setEditedData({
      email: details.email || '',
      phone: details.phone || '',
      address: details.address || '',
      city: details.city || '',
      job: details.job || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">جاري تحميل الملف...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" />
            <div>
              <h1 className="text-2xl">تفاصيل ولي الأمر</h1>
              <p className="text-sm opacity-80 mt-1">{details.fullName || details.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="p-6 bg-card border-border text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                details.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'
              }`}>
                <User className={`w-12 h-12 ${
                  details.parentType === 'father' ? 'text-primary' : 'text-pink-600'
                }`} />
              </div>
              <h2 className="text-xl mb-2">{details.fullName || details.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {details.parentType === 'father' ? 'الأب' : 'الأم'}
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  details.status === 'active' || true // نفترض النشاط مؤقتاً لأن الـ API لا يرجعه
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {/* Status field is not in ProfileResponse, defaulting to Active */}
                  ● نشط
                </span>
              </div>
              {caseInfo && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">رقم القضية</p>
                  <p className="text-sm font-medium font-mono text-primary">{caseInfo.caseNumber || '---'}</p>
                </div>
              )}
            </Card>

            {/* Registration Info */}
            <Card className="p-5 bg-card border-border">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                معلومات التسجيل
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الميلاد:</span>
                  <span className="font-medium font-mono">{details.birthDate ? details.birthDate.split('T')[0] : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">اسم المستخدم:</span>
                  {/* اسم المستخدم غالباً هو الرقم القومي في هذا النظام */}
                  <span className="font-medium font-mono text-xs">{details.nationalId}</span>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <Card className="p-5 bg-muted/50 border-border">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">نظام آمن</p>
                  <p className="text-xs text-muted-foreground">
                    جميع البيانات محمية ولا يمكن تعديل الرقم القومي أو الاسم إلا بطلب رسمي.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl flex items-center gap-2">
                  <IdCard className="w-6 h-6 text-primary" />
                  المعلومات الشخصية
                </h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل البيانات
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم الكامل - Read Only */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">الاسم الكامل</p>
                    <p className="font-medium">{details.fullName || details.name}</p>
                    {isEditing && <p className="text-xs text-red-500 mt-1">لا يمكن تعديل الاسم</p>}
                  </div>
                </div>

                {/* نوع ولي الأمر - Read Only */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">نوع ولي الأمر</p>
                    <p className="font-medium">{details.parentType === 'father' ? 'الأب' : 'الأم'}</p>
                  </div>
                </div>

                {/* الرقم القومي - Read Only */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <IdCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">رقم البطاقة الوطنية</p>
                    <p className="font-medium font-mono">{details.nationalId}</p>
                    {isEditing && <p className="text-xs text-red-500 mt-1">لا يمكن تعديل الرقم القومي</p>}
                  </div>
                </div>

                {/* الوظيفة - Editable */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <IdCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">الوظيفة</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.job}
                        onChange={(e) => setEditedData({ ...editedData, job: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                        placeholder="أدخل الوظيفة"
                      />
                    ) : (
                      <p className="font-medium">{details.job || 'غير محدد'}</p>
                    )}
                  </div>
                </div>

                {/* رقم الجوال - Editable */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">رقم الجوال</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                        maxLength={11}
                      />
                    ) : (
                      <p className="font-medium font-mono">{details.phone}</p>
                    )}
                  </div>
                </div>

                {/* البريد الإلكتروني - Editable */}
                <div className="flex items-start gap-4 pb-4 border-b border-border md:col-span-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      />
                    ) : (
                      <p className="font-medium">{details.email}</p>
                    )}
                  </div>
                </div>

                {/* العنوان التفصيلي - Editable */}
                <div className="flex items-start gap-4 pb-4 border-b border-border md:col-span-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">العنوان التفصيلي</p>
                    {isEditing ? (
                      <textarea
                        value={editedData.address}
                        onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                        rows={2}
                      />
                    ) : (
                      <p className="font-medium">{details.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                  >
                    {isSaving ? (
                        <>
                         <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                         جاري الحفظ...
                        </>
                    ) : (
                        <>
                         <Save className="w-4 h-4 ml-2" />
                         حفظ التعديلات
                        </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-border hover:bg-muted"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              )}
            </Card>

            {/* Account Access (Disabled mostly due to API limitations) */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl flex items-center gap-2">
                  <Key className="w-6 h-6 text-primary" />
                  بيانات الوصول للحساب
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {showCredentials ? 'إخفاء' : 'عرض'} البيانات
                </Button>
              </div>

              {showCredentials ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">اسم المستخدم</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={details.nationalId} // Fallback to National ID
                            readOnly
                            className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(details.nationalId, 'username')}
                            className="flex items-center gap-2"
                          >
                             <Copy className="w-4 h-4" />
                             <span>نسخ</span>
                          </Button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <span className="font-medium">ملاحظة:</span> لا يمكن عرض كلمة المرور الحالية لأسباب أمنية.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    معلومات الدخول محمية.
                  </p>
                </div>
              )}
            </Card>

            {/* Related Cases */}
            {caseInfo && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  القضايا المرتبطة
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-mono text-primary mb-1">{caseInfo.caseNumber || 'رقم غير متوفر'}</p>
                      <p className="text-sm text-muted-foreground">تاريخ الفتح: {caseInfo.filedAt ? caseInfo.filedAt.split('T')[0] : '-'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                          {caseInfo.status === 'Active' ? 'قيد التداول' : caseInfo.status}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}