import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Mail, MapPin, IdCard, Calendar, Key, Copy, CheckCircle, Shield, FileText, Users, Edit, Save, X } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ParentDetailsScreen({ parentData, onBack }) {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: parentData.name,
    phone: parentData.phone,
    email: parentData.email,
    city: parentData.city,
    address: parentData.address,
    status: parentData.status
  });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
    console.log('تحديث البيانات:', editedData);
    // تحديث البيانات المعروضة
    Object.assign(parentData, editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // إعادة البيانات للقيم الأصلية
    setEditedData({
      name: parentData.name,
      phone: parentData.phone,
      email: parentData.email,
      city: parentData.city,
      address: parentData.address,
      status: parentData.status
    });
    setIsEditing(false);
  };

  // Mock credentials - في التطبيق الحقيقي سيتم جلبها بشكل آمن من Backend
  const credentials = {
    username: parentData.username,
    // في التطبيق الحقيقي، لن نعرض كلمة المرور الأصلية
    lastPasswordReset: '2024-01-15 10:30 ص'
  };

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
              <p className="text-sm opacity-80 mt-1">{parentData.name}</p>
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
                parentData.parentType === 'father' ? 'bg-primary/10' : 'bg-pink-100'
              }`}>
                <User className={`w-12 h-12 ${
                  parentData.parentType === 'father' ? 'text-primary' : 'text-pink-600'
                }`} />
              </div>
              <h2 className="text-xl mb-2">{parentData.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {parentData.parentType === 'father' ? 'الأب' : 'الأم'}
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  parentData.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {parentData.status === 'active' ? '● نشط' : '● غير نشط'}
                </span>
              </div>
              {parentData.caseId && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">رقم القضية</p>
                  <p className="text-sm font-medium font-mono text-primary">{parentData.caseId}</p>
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
                  <span className="text-muted-foreground">تاريخ التسجيل:</span>
                  <span className="font-medium">{parentData.registrationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">اسم المستخدم:</span>
                  <span className="font-medium font-mono text-xs">{credentials.username}</span>
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
                    جميع البيانات محمية وفقاً لمعايير الأمن السيبراني
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
                {/* الاسم الكامل */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">الاسم الكامل</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      />
                    ) : (
                      <p className="font-medium">{parentData.name}</p>
                    )}
                  </div>
                </div>

                {/* نوع ولي الأمر */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">نوع ولي الأمر</p>
                    <p className="font-medium">{parentData.parentType === 'father' ? 'الأب' : 'الأم'}</p>
                  </div>
                </div>

                {/* رقم البطاقة */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <IdCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">رقم البطاقة الوطنية</p>
                    <p className="font-medium font-mono">{parentData.nationalId}</p>
                  </div>
                </div>

                {/* رقم الجوال */}
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
                      />
                    ) : (
                      <p className="font-medium">{parentData.phone}</p>
                    )}
                  </div>
                </div>

                {/* البريد الإلكتروني */}
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
                      <p className="font-medium">{parentData.email}</p>
                    )}
                  </div>
                </div>

                {/* المدينة */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">المدينة</p>
                    {isEditing ? (
                      <select
                        value={editedData.city}
                        onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      >
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="أسيوط">أسيوط</option>
                        <option value="المنصورة">المنصورة</option>
                      </select>
                    ) : (
                      <p className="font-medium">{parentData.city}</p>
                    )}
                  </div>
                </div>

                {/* الحالة */}
                <div className="flex items-start gap-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">حالة الحساب</p>
                    {isEditing ? (
                      <select
                        value={editedData.status}
                        onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        parentData.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {parentData.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    )}
                  </div>
                </div>

                {/* العنوان التفصيلي */}
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
                      <p className="font-medium">{parentData.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التعديلات
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-border hover:bg-muted"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              )}
            </Card>

            {/* Account Access */}
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
                            value={credentials.username}
                            readOnly
                            className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(credentials.username, 'username')}
                            className="flex items-center gap-2"
                          >
                            {copiedField === 'username' ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">تم</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>نسخ</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <span className="font-medium">ملاحظة أمنية:</span> لا يمكن عرض كلمة المرور الأصلية. يمكنك إعادة تعيين كلمة المرور إذا لزم الأمر.
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p>آخر تعيين لكلمة المرور: {credentials.lastPasswordReset}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    إعادة تعيين كلمة المرور
                  </Button>
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    اضغط على "عرض البيانات" لعرض معلومات الوصول للحساب
                  </p>
                </div>
              )}
            </Card>

            {/* Related Cases */}
            {parentData.caseId && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  القضايا المرتبطة
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-mono text-primary mb-1">{parentData.caseId}</p>
                      <p className="text-sm text-muted-foreground">قضية نفقة وحضانة</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      عرض التفاصيل
                    </Button>
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