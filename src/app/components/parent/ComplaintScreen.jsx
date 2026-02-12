import React, { useState } from 'react';
import { ChevronLeft, Upload, Send } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function ComplaintScreen({ onBack, onSubmit }) {
  const [selectedType, setSelectedType] = useState('');

  const complaintTypes = [
    'عدم الالتزام بموعد الزيارة',
    'منع الزيارة',
    'عدم دفع النفقة',
    'سوء معاملة الأطفال',
    'عدم الالتزام بقرار المحكمة',
    'أخرى',
  ];

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl">تقديم شكوى</h1>
          <p className="text-sm opacity-80 mt-1">تقديم شكوى جديدة</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-6">
        {/* Important Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة مهمة:</strong> سيتم مراجعة شكواك من قبل موظفي المحكمة خلال 48 ساعة عمل
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Column - Case Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Case Info */}
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">معلومات القضية</h3>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">رقم القضية:</span>
                  <span>CASE-12453</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الطرف الآخر:</span>
                  <span>أحمد محمد العلي</span>
                </div>
              </div>
            </Card>

            {/* Contact Preference */}
            <Card className="p-5 bg-card border-border">
              <h3 className="mb-4">طريقة التواصل المفضلة</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="contact" 
                    value="phone"
                    className="w-4 h-4"
                    defaultChecked
                  />
                  <span>اتصال هاتفي</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="contact" 
                    value="sms"
                    className="w-4 h-4"
                  />
                  <span>رسالة نصية</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="contact" 
                    value="app"
                    className="w-4 h-4"
                  />
                  <span>إشعار في التطبيق</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Left Column - Complaint Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border">
              <h3 className="mb-6 text-xl">تفاصيل الشكوى</h3>
              
              <div className="space-y-6">
                {/* Complaint Type */}
                <div>
                  <label className="block mb-2 font-medium">نوع الشكوى</label>
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-right"
                  >
                    <option value="">اختر نوع الشكوى</option>
                    {complaintTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-medium">وصف الشكوى</label>
                  <textarea 
                    className="w-full h-40 p-3 rounded-lg border border-border bg-background text-right resize-none"
                    placeholder="اكتب تفاصيل الشكوى بشكل واضح ومفصل..."
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    الحد الأدنى 50 حرف
                  </p>
                </div>

                {/* Date of Incident */}
                <div>
                  <label className="block mb-2 font-medium">تاريخ الحادثة</label>
                  <Input 
                    type="date" 
                    className="text-right h-11" 
                    dir="rtl" 
                  />
                </div>

                {/* Upload Documents */}
                <div>
                  <label className="block mb-2 font-medium">المستندات الداعمة (اختياري)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      اضغط لرفع المستندات
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG, PNG (حتى 5 ميجابايت)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={onSubmit}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                >
                  <Send className="w-5 h-5 ml-2" />
                  إرسال الشكوى
                </Button>

                {/* Disclaimer */}
                <p className="text-xs text-center text-muted-foreground">
                  بتقديم هذه الشكوى، أؤكد أن المعلومات المقدمة صحيحة وكاملة
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}