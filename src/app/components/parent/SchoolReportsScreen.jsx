import React, { useState } from 'react';
import { ChevronLeft, GraduationCap, FileText, AlertCircle, Download, Calendar, TrendingUp } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function SchoolReportsScreen({ onBack }) {
  const [selectedChild, setSelectedChild] = useState(null);

  const schoolReports = [
    {
      childId: '1',
      childName: 'محمد أحمد العلي',
      school: 'مدرسة الأمير فيصل الابتدائية',
      grade: 'الصف الثالث الابتدائي',
      reportDate: '22 يناير 2026',
      reportType: 'تقرير شهري',
      academicPerformance: 'ممتاز',
      performanceColor: 'bg-green-500',
      attendance: '95%',
      attendanceColor: 'text-green-600',
      behavior: 'ممتاز',
      behaviorColor: 'text-green-600',
      subjects: [
        { name: 'الرياضيات', grade: 'A', score: '95/100' },
        { name: 'اللغة العربية', grade: 'A', score: '92/100' },
        { name: 'العلوم', grade: 'B+', score: '88/100' },
        { name: 'التربية الإسلامية', grade: 'A', score: '97/100' },
        { name: 'اللغة الإنجليزية', grade: 'A', score: '94/100' },
      ],
      teacherComments: 'الطالب متفوق ومجتهد، يشارك بفعالية في الأنشطة الصفية ويتعاون مع زملائه. أداؤه مميز في جميع المواد.',
    },
    {
      childId: '2',
      childName: 'سارة أحمد العلي',
      school: 'مدرسة الأميرة نورة للبنات',
      grade: 'الصف الأول الابتدائي',
      reportDate: '18 فبراير 2026',
      reportType: 'تقرير شهري',
      academicPerformance: 'جيد جداً',
      performanceColor: 'bg-blue-500',
      attendance: '98%',
      attendanceColor: 'text-green-600',
      behavior: 'ممتاز',
      behaviorColor: 'text-green-600',
      subjects: [
        { name: 'الرياضيات', grade: 'A', score: '90/100' },
        { name: 'اللغة العربية', grade: 'A', score: '94/100' },
        { name: 'الفنون', grade: 'A', score: '98/100' },
        { name: 'التربية البدنية', grade: 'A', score: '96/100' },
      ],
      teacherComments: 'الطالبة مؤدبة ومتعاونة، تحتاج لمزيد من التركيز في حل المسائل الرياضية. تتميز في الأنشطة الفنية.',
    },
    {
      childId: '3',
      childName: 'عمر أحمد العلي',
      school: 'روضة الطفولة السعيدة',
      grade: 'المستوى الثاني - KG2',
      reportDate: '5 فبراير 2026',
      reportType: 'تقرير تطور',
      academicPerformance: 'جيد',
      performanceColor: 'bg-yellow-500',
      attendance: '92%',
      attendanceColor: 'text-yellow-600',
      behavior: 'جيد',
      behaviorColor: 'text-yellow-600',
      subjects: [
        { name: 'المهارات الحركية', grade: 'ممتاز', score: '' },
        { name: 'المهارات اللغوية', grade: 'جيد', score: '' },
        { name: 'المهارات الاجتماعية', grade: 'جيد جداً', score: '' },
        { name: 'المهارات الإبداعية', grade: 'ممتاز', score: '' },
      ],
      teacherComments: 'الطفل نشيط ومحب للتعلم، يحتاج لمزيد من التشجيع على المشاركة الجماعية. يظهر إبداعاً في الأنشطة الفنية.',
    },
  ];

  const filteredReports = selectedChild 
    ? schoolReports.filter(r => r.childId === selectedChild)
    : schoolReports;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 opacity-90 hover:opacity-100">
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">التقارير المدرسية</h1>
              <p className="text-sm opacity-80">تقارير أداء الأطفال الأكاديمية والسلوكية</p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90">
              <Download className="w-5 h-5 ml-2" />
              تحميل جميع التقارير
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold mb-1">{schoolReports.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي التقارير</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold mb-1">
                  {Math.round(schoolReports.reduce((sum, r) => sum + parseInt(r.attendance), 0) / schoolReports.length)}%
                </p>
                <p className="text-sm text-muted-foreground">متوسط الحضور</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold mb-1">
                  {schoolReports.filter(r => r.performanceColor === 'bg-green-500').length}
                </p>
                <p className="text-sm text-muted-foreground">أداء ممتاز</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold mb-1">يناير 2026</p>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter by Child */}
        <Card className="p-6 bg-card border-border mb-8">
          <div className="flex items-center gap-4">
            <p className="font-medium">تصفية حسب الطفل:</p>
            <div className="flex gap-3">
              <Button
                variant={selectedChild === null ? 'default' : 'outline'}
                onClick={() => setSelectedChild(null)}
                className={selectedChild === null ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                الكل
              </Button>
              {schoolReports.map((report) => (
                <Button
                  key={report.childId}
                  variant={selectedChild === report.childId ? 'default' : 'outline'}
                  onClick={() => setSelectedChild(report.childId)}
                  className={selectedChild === report.childId ? 'bg-primary text-primary-foreground' : 'border-border'}
                >
                  {report.childName.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <Card key={index} className="p-6 bg-card border-border flex flex-col hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{report.childName}</p>
                    <p className="text-sm text-muted-foreground mb-1">{report.school}</p>
                    <p className="text-xs text-muted-foreground">{report.grade}</p>
                  </div>
                </div>
                <Badge className={`${report.performanceColor} text-white text-xs`}>
                  {report.academicPerformance}
                </Badge>
              </div>

              {/* Report Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{report.reportType}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{report.reportDate}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className={`text-xl font-semibold mb-1 ${report.attendanceColor}`}>{report.attendance}</p>
                    <p className="text-xs text-muted-foreground">الحضور</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className={`text-sm font-semibold mb-1 ${report.performanceColor === 'bg-green-500' ? 'text-green-600' : report.performanceColor === 'bg-blue-500' ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {report.academicPerformance}
                    </p>
                    <p className="text-xs text-muted-foreground">الأداء</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className={`text-sm font-semibold mb-1 ${report.behaviorColor}`}>{report.behavior}</p>
                    <p className="text-xs text-muted-foreground">السلوك</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-3">المواد الدراسية:</h4>
                  <div className="space-y-2">
                    {report.subjects.map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-sm">{subject.name}</span>
                        <div className="flex items-center gap-2">
                          {subject.score && (
                            <span className="text-xs text-muted-foreground">{subject.score}</span>
                          )}
                          <Badge className="bg-secondary text-white text-xs">
                            {subject.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Comments */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-800 mb-1 font-semibold">ملاحظات المعلم:</p>
                      <p className="text-xs text-blue-700">{report.teacherComments}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full border-border">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل التقرير الكامل
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <FileText className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">لا توجد تقارير متاحة</p>
            <p className="text-sm text-muted-foreground">لم يتم العثور على تقارير مدرسية لهذا الطفل</p>
          </Card>
        )}
      </div>
    </div>
  );
}