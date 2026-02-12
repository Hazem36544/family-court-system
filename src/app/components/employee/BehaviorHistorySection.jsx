import React from 'react';
import { Calendar, ChevronDown, ChevronUp, GraduationCap, MessageCircle } from 'lucide-react';
// تأكد من مسار Badge الصحيح
import { Badge } from '../ui/badge'; 

export function BehaviorHistorySection({
  // childName, // ❌ تم الحذف لأنه غير مستخدم ويسبب خطأ
  showHistory,
  setShowHistory,
  expandedYear,
  setExpandedYear,
  years,
}) {
  const getBehaviorColor = (behavior) => {
    if (behavior === 'ممتاز') return 'bg-green-500 text-white text-xs';
    if (behavior === 'جيد جداً') return 'bg-blue-500 text-white text-xs';
    if (behavior === 'جيد') return 'bg-yellow-500 text-white text-xs';
    return 'bg-orange-500 text-white text-xs';
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
                  <Badge className={yearData.overallColor}>{yearData.overallRating}</Badge>
                  {expandedYear === yearData.year ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expandedYear === yearData.year && (
                <div className="p-3 space-y-2 bg-card">
                  {yearData.months.map((month, monthIndex) => (
                    <div key={monthIndex} className="bg-muted/20 border border-border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{month.month}</span>
                        <Badge className={getBehaviorColor(month.behavior)}>
                          {month.behavior}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-xs">
                          <span className="text-muted-foreground">الأكاديمي: </span>
                          <span className="font-bold">{month.academic}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">الحضور: </span>
                          <span className="font-bold">{month.attendance}</span>
                        </div>
                      </div>
                      
                      {/* General Notes */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        <p className="text-xs text-blue-900 leading-relaxed">{month.notes}</p>
                      </div>

                      {/* Behavior Notes */}
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
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}