// src/utils/errorHandler.js

export const getErrorMessage = (error) => {
    // 1. التأكد من وجود اتصال بالسيرفر (سقوط السيرفر أو انقطاع الإنترنت)
    if (!error.response || error.code === 'ERR_NETWORK') {
        return "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت أو حالة الخادم.";
    }

    const { status, data } = error.response;

    // 2. تجميع نصوص الخطأ للبحث عن الرسائل الإنجليزية الثابتة
    const errorText = String(
        data?.detail || data?.title || data?.message || (typeof data === 'string' ? data : "")
    ).toLowerCase();

    // ✅ اعتراض رسالة الـ Validation الإنجليزية الافتراضية من الباك إند وتحويلها لعربي
    if (errorText.includes("one or more validation errors occurred")) {
        return "بيانات البحث أو الإدخال غير صحيحة، يرجى مراجعة المدخلات.";
    }

    // --- أخطاء تسجيل الدخول والمصادقة ---
    if (errorText.includes("credentials are invalid") || errorText.includes("invalid credentials")) {
        return "بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني أو الرقم القومي وكلمة المرور.";
    }
    if (errorText.includes("locked out") || errorText.includes("lockout")) {
        return "تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة، يرجى المحاولة لاحقاً.";
    }
    if (errorText.includes("temporary password") || errorText.includes("change password")) {
        return "يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول.";
    }
    if (errorText.includes("token expired") || errorText.includes("unauthorized")) {
        return "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.";
    }

    // --- أخطاء إدارة النظام (المدارس، أماكن الزيارة، الموظفين) ---
    if (errorText.includes("already exists") || errorText.includes("conflict") || errorText.includes("taken") || errorText.includes("duplicate")) {
        return "هذا السجل موجود بالفعل! قد يكون البريد الإلكتروني للموظف، أو اسم المدرسة، أو مكان الرؤية مسجلاً مسبقاً في النظام.";
    }
    if (errorText.includes("related data") || errorText.includes("cannot be deleted") || errorText.includes("foreign key") || errorText.includes("in use")) {
        return "لا يمكن الحذف لارتباط هذا العنصر ببيانات أخرى (مثل محاولة حذف مدرسة مسجل بها أطفال، أو مكان رؤية مرتبط بزيارات).";
    }

    // --- أخطاء العمليات الخاصة بالعائلات والنفقات والطلبات ---
    if (errorText.includes("already paid") || errorText.includes("payment completed")) {
        return "تم سداد هذه الدفعة مسبقاً ولا يمكن دفعها مرة أخرى.";
    }
    if (errorText.includes("already responded") || errorText.includes("status cannot be changed")) {
        return "تم الرد على هذا الطلب مسبقاً أو أن الحالة الحالية لا تسمح بالتعديل.";
    }
    if (errorText.includes("not authorized") || errorText.includes("forbidden") || errorText.includes("access denied")) {
        return "ليس لديك الصلاحية لإجراء هذه العملية (مخصصة لإدارة المحكمة أو الموظفين المختصين).";
    }

    // 3. قراءة رسائل الخطأ التفصيلية من الباك إند (Validation Errors من FluentValidation)
    if (data) {
        if (data.errors && typeof data.errors === 'object') {
            const firstErrorKey = Object.keys(data.errors)[0];
            if (Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
                // إرجاع أول رسالة تحقق قادمة من السيرفر (مثل: صيغة البريد خاطئة، أو الحقل مطلوب)
                return data.errors[firstErrorKey][0]; 
            }
        }
    }

    // 4. معالجة أكواد الخطأ الأساسية (Fallbacks)
    if (status === 400) {
        return data?.detail || data?.title || "تأكد من إدخال جميع البيانات المطلوبة بشكل صحيح قبل الحفظ.";
    }
    if (status === 401) {
        return data?.detail || data?.title || "انتهت الجلسة أو يجب تسجيل الدخول أولاً.";
    }
    if (status === 403) {
        return data?.detail || data?.title || "غير مصرح لك بإضافة أو تعديل هذه البيانات.";
    }
    if (status === 404) {
        return data?.detail || data?.title || "العنصر المطلوب غير موجود في النظام (قد يكون تم حذفه).";
    }
    if (status === 409) {
        return data?.detail || data?.title || "لا يمكن إتمام العملية لوجود تعارض في البيانات المدخلة.";
    }
    if (status === 500) {
        return "حدث خطأ داخلي في الخادم أثناء معالجة الطلب، يرجى المحاولة لاحقاً.";
    }

    // 5. عرض الرسالة المخصصة من الباك إند كحل أخير
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;

    // 6. رسالة افتراضية لأي خطأ غير معروف
    return "حدث خطأ غير متوقع، يرجى التحقق والمحاولة مرة أخرى.";
};