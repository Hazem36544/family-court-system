import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function NewFamilyScreen({ onBack, onSave, familyData }) {
  const isEditMode = !!familyData;
  
  // معلومات القضية الأساسية
  const [caseNumber, setCaseNumber] = useState(familyData?.id || '');
  const [caseDate, setCaseDate] = useState(familyData?.date || '');
  const [courtLocation, setCourtLocation] = useState(familyData?.courtLocation || '');
  
  // حالة القضية
  const [caseStatus, setCaseStatus] = useState(familyData?.status || 'نشطة');
  
  // جدول الزيارات
  const [visitSchedule, setVisitSchedule] = useState(familyData?.visitSchedule || '');
  const [visitLocation, setVisitLocation] = useState(familyData?.visitLocation || '');
  const [visitNotes, setVisitNotes] = useState(familyData?.visitNotes || '');
  
  // معلومات النفقة
  const [alimonyAmount, setAlimonyAmount] = useState(familyData?.alimonyAmount || '');
  const [alimonyFrequency, setAlimonyFrequency] = useState(familyData?.alimonyFrequency || 'شهري');
  const [alimonyStatus, setAlimonyStatus] = useState(familyData?.alimonyStatus || 'منتظمة');
  
  // تحميل بيانات الأب
  const [fatherName, setFatherName] = useState(familyData?.fatherName || '');
  const [fatherNationalId, setFatherNationalId] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [fatherJob, setFatherJob] = useState('');
  const [fatherAddress, setFatherAddress] = useState('');
  
  // تحميل بيانات الأم
  const [motherName, setMotherName] = useState(familyData?.motherName || '');
  const [motherNationalId, setMotherNationalId] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [motherJob, setMotherJob] = useState('');
  const [motherAddress, setMotherAddress] = useState('');
  
  // تحميل بيانات الأطفال
  const [children, setChildren] = useState(
    isEditMode && familyData?.children > 0
      ? Array.from({ length: familyData.children }, (_, i) => ({
          id: i + 1,
          name: `طفل ${i + 1}`,
          age: '10',
          gender: i % 2 === 0 ? 'ذكر' : 'أنثى',
          custodyDecision: 'الأم',
          school: 'مدرسة النيل الدولية',
          studentCode: `STD-2024-00${i + 1}`,
          schoolCode: 'SCH-CAI-001'
        }))
      : [{ id: 1, name: '', age: '', gender: 'ذكر', custodyDecision: '', school: '', studentCode: '', schoolCode: '' }]
  );

  const addChild = () => {
    setChildren([...children, { id: Date.now(), name: '', age: '', gender: 'ذكر', custodyDecision: '', school: '', studentCode: '', schoolCode: '' }]);
  };

  const removeChild = (id) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const updateChild = (id, field, value) => {
    setChildren(children.map(child =>
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'نشطة':
        return 'bg-secondary text-white';
      case 'قيد المراجعة':
        return 'bg-yellow-500 text-white';
      case 'محفوظة':
        return 'bg-muted text-foreground';
      case 'مغلقة':
        return 'bg-red-500 text-white';
      case 'معلقة':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span>رجوع</span>
          </button>
          <h1 className="text-2xl">
            {isEditMode ? 'تعديل بيانات القضية' : 'إنشاء أسرة جديدة'}
          </h1>
          {isEditMode && familyData?.id && (
            <p className="text-sm opacity-80 mt-1">
              القضية {familyData.id} - {familyData.familyId}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Case Basic Information */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">معلومات القضية الأساسية</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">رقم القضية</label>
              <Input 
                type="text" 
                placeholder="أدخل رقم القضية (مثال: CASE-12453)" 
                className="text-right font-mono" 
                dir="rtl" 
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                disabled={isEditMode}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">تاريخ القضية</label>
              <Input 
                type="date" 
                className="text-right" 
                dir="rtl" 
                value={caseDate}
                onChange={(e) => setCaseDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">موقع المحكمة</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-right"
                dir="rtl"
                value={courtLocation}
                onChange={(e) => setCourtLocation(e.target.value)}
              >
                <option value="">اختر موقع المحكمة</option>
                <option value="محكمة الأسرة - القاهرة">محكمة الأسرة - القاهرة</option>
                <option value="محكمة الأسرة - الجيزة">محكمة الأسرة - الجيزة</option>
                <option value="محكمة الأسرة - الإسكندرية">محكمة الأسرة - الإسكندرية</option>
                <option value="محكمة الأسرة - المنصورة">محكمة الأسرة - المنصورة</option>
                <option value="محكمة الأسرة - طنطا">محكمة الأسرة - طنطا</option>
                <option value="محكمة الأسرة - أسيوط">محكمة الأسرة - أسيوط</option>
                <option value="محكمة الأسرة - المنيا">محكمة الأسرة - المنيا</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Case Status */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">حالة القضية</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">الحالة</label>
              <select 
                className={`w-full h-10 px-3 rounded-lg border-0 text-right font-medium ${getStatusColor(caseStatus)}`}
                dir="rtl"
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value)}
              >
                <option value="نشطة">نشطة</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="محفوظة">محفوظة</option>
                <option value="مغلقة">مغلقة</option>
                <option value="معلقة">معلقة</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Visit Schedule */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">جدول الزيارات</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">مواعيد الزيارة</label>
              <Input 
                type="text" 
                placeholder="مثال: كل جمعة من 2 ظهراً إلى 6 مساءً" 
                className="text-right" 
                dir="rtl" 
                value={visitSchedule}
                onChange={(e) => setVisitSchedule(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">مكان الزيارة</label>
              <Input 
                type="text" 
                placeholder="أدخل مكان الزيارة" 
                className="text-right" 
                dir="rtl" 
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">ملاحظات إضافية</label>
              <textarea 
                placeholder="أدخل أي ملاحظات خاصة بجدول الزيارات" 
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-right min-h-20" 
                dir="rtl" 
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Alimony Information */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">معلومات النفقة</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">مبلغ النفقة (جنيه مصري)</label>
              <Input 
                type="number" 
                placeholder="أدخل مبلغ النفقة" 
                className="text-right" 
                dir="rtl" 
                value={alimonyAmount}
                onChange={(e) => setAlimonyAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">دورية السداد</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-right"
                dir="rtl"
                value={alimonyFrequency}
                onChange={(e) => setAlimonyFrequency(e.target.value)}
              >
                <option value="شهري">شهري</option>
                <option value="ربع سنوي">ربع سنوي</option>
                <option value="نصف سنوي">نصف سنوي</option>
                <option value="سنوي">سنوي</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm">حالة السداد</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-right"
                dir="rtl"
                value={alimonyStatus}
                onChange={(e) => setAlimonyStatus(e.target.value)}
              >
                <option value="منتظمة">منتظمة</option>
                <option value="متأخرة">متأخرة</option>
                <option value="متوقفة">متوقفة</option>
                <option value="غير محددة">غير محددة</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Father Information */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">بيانات الأب</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">الاسم الكامل</label>
              <Input 
                type="text" 
                placeholder="أدخل الاسم الكامل" 
                className="text-right" 
                dir="rtl" 
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">الرقم القومي</label>
              <Input 
                type="text" 
                placeholder="أدخل الرقم القومي" 
                className="text-right" 
                dir="rtl" 
                value={fatherNationalId}
                onChange={(e) => setFatherNationalId(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">رقم الجوال</label>
              <Input 
                type="tel" 
                placeholder="05xxxxxxxx" 
                className="text-right" 
                dir="rtl" 
                value={fatherPhone}
                onChange={(e) => setFatherPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">الوظيفة</label>
              <Input 
                type="text" 
                placeholder="أدخل الوظيفة" 
                className="text-right" 
                dir="rtl" 
                value={fatherJob}
                onChange={(e) => setFatherJob(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">العنوان</label>
              <Input 
                type="text" 
                placeholder="أدخل العنوان" 
                className="text-right" 
                dir="rtl" 
                value={fatherAddress}
                onChange={(e) => setFatherAddress(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Mother Information */}
        <Card className="p-5 bg-card border-border">
          <h3 className="mb-4">بيانات الأم</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">الاسم الكامل</label>
              <Input 
                type="text" 
                placeholder="أدخل الاسم الكامل" 
                className="text-right" 
                dir="rtl" 
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">الرقم القومي</label>
              <Input 
                type="text" 
                placeholder="أدخل الرقم القومي" 
                className="text-right" 
                dir="rtl" 
                value={motherNationalId}
                onChange={(e) => setMotherNationalId(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">رقم الجوال</label>
              <Input 
                type="tel" 
                placeholder="05xxxxxxxx" 
                className="text-right" 
                dir="rtl" 
                value={motherPhone}
                onChange={(e) => setMotherPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">الوظيفة</label>
              <Input 
                type="text" 
                placeholder="أدخل الوظيفة" 
                className="text-right" 
                dir="rtl" 
                value={motherJob}
                onChange={(e) => setMotherJob(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">العنوان</label>
              <Input 
                type="text" 
                placeholder="أدخل العنوان" 
                className="text-right" 
                dir="rtl" 
                value={motherAddress}
                onChange={(e) => setMotherAddress(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Children Information */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3>بيانات الأطفال</h3>
            <Button 
              onClick={addChild}
              variant="outline"
              size="sm"
              className="text-secondary border-secondary"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة طفل
            </Button>
          </div>
          <div className="space-y-4">
            {children.map((child, index) => (
              <div key={child.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">الطفل {index + 1}</span>
                  {children.length > 1 && (
                    <button 
                      onClick={() => removeChild(child.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-sm">الاسم</label>
                    <Input 
                      type="text" 
                      placeholder="اسم الطفل" 
                      className="text-right" 
                      dir="rtl" 
                      value={child.name}
                      onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-2 text-sm">العمر</label>
                      <Input 
                        type="number" 
                        placeholder="العمر" 
                        className="text-right" 
                        dir="rtl" 
                        value={child.age}
                        onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">الجنس</label>
                      <select className="w-full h-10 px-3 rounded-lg border border-border bg-background text-right"
                        value={child.gender}
                        onChange={(e) => updateChild(child.id, 'gender', e.target.value)}
                      >
                        <option>ذكر</option>
                        <option>أنثى</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">قرار الحضانة</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-border bg-background text-right" dir="rtl"
                      value={child.custodyDecision}
                      onChange={(e) => updateChild(child.id, 'custodyDecision', e.target.value)}
                    >
                      <option value="">اختر قرار الحضانة</option>
                      <option value="الأم">الأم</option>
                      <option value="الأب">الأب</option>
                      <option value="مشترك">مشترك</option>
                      <option value="طرف ثالث">طرف ثالث (جد/جدة)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">كود الطالب</label>
                    <Input 
                      type="text" 
                      placeholder="أدخل كود الطالب (مثال: STD-2024-001)" 
                      className="text-right font-mono" 
                      dir="rtl" 
                      value={child.studentCode}
                      onChange={(e) => updateChild(child.id, 'studentCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">المدرسة</label>
                    <Input 
                      type="text" 
                      placeholder="اسم المدرسة" 
                      className="text-right" 
                      dir="rtl" 
                      value={child.school}
                      onChange={(e) => updateChild(child.id, 'school', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">كود المدرسة</label>
                    <Input 
                      type="text" 
                      placeholder="أدخل كود المدرسة (مثال: SCH-CAI-001)" 
                      className="text-right font-mono" 
                      dir="rtl" 
                      value={child.schoolCode}
                      onChange={(e) => updateChild(child.id, 'schoolCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={onSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isEditMode ? 'حفظ التعديلات' : 'حفظ بيانات الأسرة'}
        </Button>
      </div>
    </div>
  );
}