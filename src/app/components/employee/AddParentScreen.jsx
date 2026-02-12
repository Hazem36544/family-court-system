import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Mail, MapPin, IdCard, Save, X, CheckCircle, UserPlus } from 'lucide-react';
// تأكد من المسار: بما أن هذا الملف داخل مجلد employee، فالرجوع خطوة واحدة للوراء يوصلك لمجلد ui
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function AddParentScreen({ onBack }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    email: '',
    parentType: 'father',
    address: '',
    city: 'القاهرة',
    caseId: ''
  });

  const [errors, setErrors] = useState({});

  const cities = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الأقصر',
    'أسوان',
    'بورسعيد',
    'السويس'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الكامل مطلوب';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'رقم البطاقة مطلوب';
    } else if (formData.nationalId.length !== 14) {
      newErrors.nationalId = 'رقم البطاقة يجب أن يكون 14 رقم';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^01[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال غير صحيح';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentials = () => {
    // Generate username from national ID
    const username = `parent_${formData.nationalId}`;
    
    // Generate random password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return { username, password };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate login credentials
      const credentials = generateCredentials();
      setGeneratedCredentials(credentials);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Here you would normally send data to backend
      console.log('Parent data:', formData);
      console.log('Credentials:', credentials);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    onBack();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

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
                  placeholder="12345678901234"
                  maxLength={14}
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
                  placeholder="01012345678"
                  maxLength={11}
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
                  placeholder="مثال: شارع الهرم - الجيزة - بجوار مسجد النور"
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
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يمكنك ربط ولي الأمر بقضية موجودة أو تركه فارغاً
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
                  <li>سيتم إنشاء اسم مستخدم وكلمة مرور تلقائياً لولي الأمر</li>
                  <li>سيتم إرسال بيانات الدخول عبر البريد الإلكتروني ورسالة نصية</li>
                  <li>يمكن لولي الأمر تغيير كلمة المرور من حسابه الشخصي</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
            >
              <Save className="w-5 h-5 ml-2" />
              حفظ وإنشاء الحساب
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
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
          <Card className="w-full max-w-lg bg-card border-border overflow-hidden">
            {/* Modal Header */}
            <div className="bg-green-500 text-white p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">تم إنشاء الحساب بنجاح!</h2>
              <p className="text-sm opacity-90 mt-2">تم إضافة ولي الأمر إلى النظام</p>
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
                  بيانات تسجيل الدخول
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">اسم المستخدم</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.username}
                        readOnly
                        className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
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
                    <label className="block text-xs text-muted-foreground mb-1">كلمة المرور</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.password}
                        readOnly
                        className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
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
                  <span className="font-medium">تنبيه:</span> تم إرسال بيانات الدخول إلى البريد الإلكتروني {formData.email} ورقم الجوال {formData.phone}
                </p>
              </div>

              {/* Close Button */}
              <Button 
                onClick={handleCloseSuccess}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                تم
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}