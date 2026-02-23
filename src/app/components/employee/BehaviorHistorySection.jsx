import React from 'react';
import { Calendar, ChevronDown, ChevronUp, GraduationCap, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/badge'; 

export function BehaviorHistorySection({
  showHistory,
  setShowHistory,
  expandedYear,
  setExpandedYear,
  years = [] // قيمة افتراضية لتجنب الأخطاء عند التحميل
}) {
  
  // دالة تحديد لون السلوك الشهري
  const getBehaviorColor = (behavior) => {
    if (!behavior) return 'bg-gray-100 text-gray-600 text-xs';
    
    // دعم العربية والإنجليزية
    const status = behavior.toLowerCase();
    if (status.includes('ممتاز') || status === 'excellent') return 'bg-green-500 text-white text-xs';
    if (status.includes('جيد جدا') || status === 'very good') return 'bg-blue-500 text-white text-xs';
    if (status.includes('جيد') || status === 'good') return 'bg-yellow-500 text-white text-xs';
    return 'bg-orange-500 text-white text-xs';
  };

  // دالة تحديد لون التقييم السنوي العام
  const getOverallColor = (rating) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    
    const r = rating.toString().toLowerCase();
    if (r.includes('excellent') || r.includes('ممتاز')) return 'bg-green-100 text-green-800 border-green-200';
    if (r.includes('very good') || r.includes('جيد جدا')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (r.includes('good') || r.includes('جيد')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">سجل السلوك الشامل</span>
        </div>
        {showHistory ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600" />
        )}
      </button>

      {showHistory && (
        <div className="mt-4 space-y-3">
          {/* حالة عدم وجود بيانات */}
          {years.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm border border-dashed rounded-lg">
              لا يوجد سجل تاريخي متاح لهذا الطالب.
            </div>
          )}

          {years.map((yearData, yearIndex) => (
            <div key={yearIndex} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedYear(expandedYear === yearData.year ? null : yearData.year)}
                className="w-full flex items-center justify-between bg-muted/30 hover:bg-muted/50 p-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">السنة الدراسية {yearData.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* استخدام الدالة لتحديد اللون بدلاً من الاعتماد على البيانات القادمة */}
                  <Badge className={getOverallColor(yearData.overallRating)}>
                    {yearData.overallRating || 'غير محدد'}
                  </Badge>
                  {expandedYear === yearData.year ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expandedYear === yearData.year && (
                <div className="p-3 space-y-2 bg-card">
                  {yearData.months && yearData.months.length > 0 ? (
                    yearData.months.map((month, monthIndex) => (
                      <div key={monthIndex} className="bg-muted/20 border border-border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{month.month}</span>
                          <Badge className={getBehaviorColor(month.behavior)}>
                            {month.behavior || 'غير محدد'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">الأكاديمي: </span>
                            <span className="font-bold">{month.academic || '-'}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">الحضور: </span>
                            <span className="font-bold">{month.attendance || '-'}</span>
                          </div>
                        </div>
                        
                        {/* General Notes */}
                        {month.notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                            <p className="text-xs text-blue-900 leading-relaxed">{month.notes}</p>
                          </div>
                        )}

                        {/* Behavior Notes (هام جداً للتوافق مع البيانات) */}
                        {month.behaviorNotes && (
                          <div className="bg-purple-50 border border-purple-200 rounded p-2">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-purple-700 mb-1">ملاحظات المعلم على السلوك:</p>
                                <p className="text-xs text-purple-900 leading-relaxed">{month.behaviorNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-gray-400 py-2">لا توجد تفاصيل شهرية لهذه السنة.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}