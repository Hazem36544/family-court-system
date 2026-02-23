import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Mail, MapPin, IdCard, Save, X, CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { courtAPI } from '../../../services/api'; // تأكد من مسار الاستيراد الصحيح
import { toast } from 'react-hot-toast';

export function AddParentScreen({ onBack }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    email: '',
    parentType: 'father', // father or mother
    address: '',
    city: 'القاهرة',
    caseId: '' // حقل اختياري
  });

  const [errors, setErrors] = useState({});

  const cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الأقصر', 'أسوان', 'بورسعيد', 'السويس'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // استخراج تاريخ الميلاد من الرقم القومي (مهم جداً للـ Backend)
  const extractBirthDateFromNationalId = (nid) => {
    if (!nid || nid.length !== 14) return new Date().toISOString().split('T')[0];
    const century = nid[0];
    const year = nid.substring(1, 3);
    const month = nid.substring(3, 5);
    const day = nid.substring(5, 7);
    let fullYear = (century === "2" ? "19" : "20") + year;
    return `${fullYear}-${month}-${day}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم الكامل مطلوب';
    if (!formData.nationalId.trim() || formData.nationalId.length !== 14) newErrors.nationalId = 'رقم البطاقة يجب أن يكون 14 رقم';
    if (!formData.phone.trim() || !/^01[0-9]{9}$/.test(formData.phone)) newErrors.phone = 'رقم الجوال غير صحيح';
    // البريد الإلكتروني اختياري في بعض الأنظمة، لكن إذا أدخله يجب أن يكون صحيحاً
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const birthDate = extractBirthDateFromNationalId(formData.nationalId);
      
      // تجهيز كائن الولي (Parent Object)
      const parentData = {
        nationalId: formData.nationalId,
        fullName: formData.name,
        birthDate: birthDate,
        gender: formData.parentType === 'father' ? 'Male' : 'Female',
        job: 'غير محدد', // قيمة افتراضية لتجنب الرفض
        address: `${formData.city} - ${formData.address}`,
        phone: formData.phone,
        email: formData.email || null // إرسال null إذا كان فارغاً
      };

      // هيكل الـ Payload المتوافق مع enrollFamily
      // نرسل الولي المطلوب فقط، والآخر null
      const payload = {
        father: formData.parentType === 'father' ? parentData : null,
        mother: formData.parentType === 'mother' ? parentData : null,
        children: [] // مصفوفة فارغة
      };

      console.log('Sending Payload:', payload);

      const response = await courtAPI.enrollFamily(payload);
      
      // استخراج بيانات الدخول من الرد (Credential Extraction)
      let credentials = null;
      if (formData.parentType === 'father') {
        credentials = response.data.fatherCredential;
      } else {
        credentials = response.data.motherCredential;
      }

      if (credentials) {
        setGeneratedCredentials({
          username: credentials.username,
          password: credentials.temporaryPassword
        });
        setShowSuccessModal(true);
        toast.success("تم إنشاء الحساب بنجاح");
      } else {
        toast.error("تم الحفظ لكن لم يتم استلام بيانات الدخول");
      }

    } catch (error) {
      console.error("Enrollment Error:", error);
      const msg = error.response?.data?.detail || error.response?.data?.title || "فشل إنشاء الحساب. تأكد من أن الرقم القومي غير مسجل مسبقاً.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    onBack(); // العودة للقائمة
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ للحافظة");
  };

  // --- نفس كود الواجهة (JSX) تماماً بدون تغيير ---
  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            <div>
              <h1 className="text-2xl">إضافة حساب ولي أمر</h1>
              <p className="text-sm opacity-80 mt-1">إنشاء حساب جديد للأب أو الأم</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-6 bg-card border-border mb-6">
            <h3 className="text-xl mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              البيانات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  الاسم الكامل <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-background ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="مثال: أحمد محمد عبد الله"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Parent Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  نوع ولي الأمر <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.parentType}
                  onChange={(e) => handleInputChange('parentType', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  disabled={isLoading}
                >
                  <option value="father">الأب</option>
                  <option value="mother">الأم</option>
                </select>
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  رقم البطاقة الوطنية <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value.replace(/\D/g, '').slice(0, 14))}
                  className={`w-full px-4 py-3 border rounded-lg bg-background ${
                    errors.nationalId ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="14 رقم"
                  maxLength={14}
                  disabled={isLoading}
                />
                {errors.nationalId && (
                  <p className="text-destructive text-sm mt-1">{errors.nationalId}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  رقم الجوال <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={`w-full px-4 py-3 border rounded-lg bg-background ${
                    errors.phone ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="01xxxxxxxxx"
                  maxLength={11}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  البريد الإلكتروني <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-background ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  المدينة <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  disabled={isLoading}
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  العنوان التفصيلي <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-background resize-none ${
                    errors.address ? 'border-destructive' : 'border-border'
                  }`}
                  rows={3}
                  placeholder="مثال: شارع الهرم - الجيزة"
                  disabled={isLoading}
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Case ID (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  رقم القضية (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.caseId}
                  onChange={(e) => handleInputChange('caseId', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  placeholder="مثال: CASE-12453"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  * سيتم ربط ولي الأمر بالقضية لاحقاً
                </p>
              </div>
            </div>
          </Card>

          {/* Info Notice */}
          <Card className="p-5 bg-muted/50 border-border mb-6">
            <div className="flex items-start gap-3">
              <IdCard className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">معلومات هامة</p>
                <ul className="text-muted-foreground space-y-1 mr-4 list-disc">
                  <li>سيتم إنشاء اسم مستخدم وكلمة مرور تلقائياً من النظام.</li>
                  <li>يرجى تسليم البيانات لولي الأمر أو طباعتها.</li>
                  <li>تاريخ الميلاد سيتم استخراجه تلقائياً من الرقم القومي.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  حفظ وإنشاء الحساب
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 border-border h-12 text-base"
            >
              <X className="w-5 h-5 ml-2" />
              إلغاء
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-lg bg-card border-border overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-green-500 text-white p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">تم إنشاء الحساب بنجاح!</h2>
              <p className="text-sm opacity-90 mt-2">تم تسجيل البيانات في النظام واستلام بيانات الدخول</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Parent Info */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-3">معلومات ولي الأمر</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النوع:</span>
                    <span className="font-medium">{formData.parentType === 'father' ? 'الأب' : 'الأم'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم البطاقة:</span>
                    <span className="font-medium">{formData.nationalId}</span>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-primary" />
                  بيانات تسجيل الدخول (من النظام)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">اسم المستخدم</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.username}
                        readOnly
                        className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono text-center"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedCredentials.username)}
                      >
                        نسخ
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">كلمة المرور المؤقتة</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.password}
                        readOnly
                        className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono text-center"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedCredentials.password)}
                      >
                        نسخ
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">تنبيه:</span> يرجى حفظ بيانات الدخول هذه وتسليمها للمستخدم، حيث لن تظهر مرة أخرى.
                </p>
              </div>

              {/* Close Button */}
              <Button 
                onClick={handleCloseSuccess}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                تم وإنهاء
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}