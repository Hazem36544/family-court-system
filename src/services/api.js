console.log("Current API URL:", import.meta.env.VITE_API_URL);
import axios from 'axios';

/**
 * 1. الإعدادات الأساسية
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://wesal.runasp.net';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * 2. Request Interceptor: حقن التوكن (مخصص لنظام محكمة الأسرة)
 */
api.interceptors.request.use(
    (config) => {
        // ✅ التعديل هنا: سحب توكن المحكمة من sessionStorage
        const token = sessionStorage.getItem('wesal_court_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor: معالجة الأخطاء بشكل موحد
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - redirecting to login...");
            // window.location.href = '/login'; 
        }

        const serverError = error.response?.data;
        if (serverError) {
            const message = serverError.detail || serverError.title || "حدث خطأ في الاتصال";
            error.message = message;
        }
        return Promise.reject(error);
    }
);

/**
 * --- [ A. خدمات الهوية - Auth ] ---
 */
export const authAPI = {
    loginVisitCenter: (creds) => api.post('/api/auth/visit-center-staff/sign-in', creds),
    loginCourtStaff: (creds) => api.post('/api/auth/court-staff/sign-in', creds),
    loginFamilyCourt: (creds) => api.post('/api/auth/court/sign-in', creds), // تم التحديث لمطابقة السواجر
    loginSchool: (creds) => api.post('/api/auth/school/sign-in', creds),
    loginSystemAdmin: (creds) => api.post('/api/auth/system-admin/sign-in', creds),
    loginParent: (creds) => api.post('/api/auth/parent/sign-in', creds),
    changePassword: (data) => api.patch('/api/users/change-password', data),

    // جلب المستخدم الحالي
    getCurrentUser: () => {
        // ✅ التعديل هنا: استخدام sessionStorage لاسم الداتا المخصص للمحكمة
        const savedUser = sessionStorage.getItem('wesal_court_user_data');
        return Promise.resolve({ data: savedUser ? JSON.parse(savedUser) : {} });
    }
};

/**
 * --- [ B. خدمات إدارة القضايا والأسر - Court Workflow ] ---
 */
export const courtAPI = {
    // 0. البروفايل (Profile)
    getProfile: () => api.get('/api/court-staff/me'), // تم التحديث

    // 1. الأسرة (Families)
    enrollFamily: (data) => api.post('/api/families', data),
    getFamily: (id) => api.get(`/api/families/${id}`),
    searchFamilies: (params) => api.get('/api/courts/me/families', { params }),

    // 2. أولياء الأمور (Parents)
    getParent: (id) => api.get(`/api/parents/${id}`),
    updateParent: (id, data) => api.put(`/api/parents/${id}`, data),

    // 3. القضايا (Court Cases)
    createCase: (data) => api.post('/api/court-cases', data),
    getCaseByFamily: (familyId) => api.get(`/api/families/${familyId}/court-cases`),
    closeCase: (caseId, notes) => api.patch(`/api/court-cases/${caseId}/close`, { closureNotes: notes }),

    // 4. النفقة (Alimony)
    createAlimony: (data) => api.post('/api/alimony-schedules', data), // تم التحديث
    updateAlimony: (id, data) => api.put(`/api/alimony-schedules/${id}`, data, { params: { alimoneyId: id } }), // تم التحديث
    deleteAlimony: (id) => api.delete(`/api/alimony-schedules/${id}`, { params: { alimoneyId: id } }), // تم التحديث
    getAlimonyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/alimony-schedule`), // تم التحديث

    // 5. الحضانة (Custody)
    createCustody: (data) => api.post('/api/custodies', data),
    updateCustody: (id, data) => api.put(`/api/custodies/${id}`, data),
    deleteCustody: (id) => api.delete(`/api/custodies/${id}`),
    getCustodyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/custodies`),

    // 6. جداول الزيارة (Schedules)
    createSchedule: (data) => api.post('/api/visit-schedules', data), // تم التحديث
    updateSchedule: (id, data) => api.put(`/api/visit-schedules/${id}`, data), // تم التحديث
    deleteSchedule: (id) => api.delete(`/api/visit-schedules/${id}`), // تم التحديث
    getVisitationScheduleByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/visit-schedules`), // تم التحديث

    // 7. المستحقات المالية (Payments Due)
    listPaymentsDueByAlimony: (alimonyId, params) => api.get(`/api/alimony-schedules/${alimonyId}/alimony-dues`, { params }), // تم التحديث
    listPaymentsHistory: (paymentDueId, params) => api.get(`/api/alimony-dues/${paymentDueId}/payments`, { params }), // تم التحديث
    withdrawPayment: (paymentDueId, data) => api.post(`/api/alimony-dues/${paymentDueId}/withdraw`, data), // تم التحديث

    // 8. الأطفال (Children)
    addChild: (familyId, data) => api.post(`/api/families/${familyId}/children`, data),
    removeChild: (familyId, childId) => api.delete(`/api/families/${familyId}/children`, { params: { childId } }),
};

/**
 * --- [ C. خدمات البيانات المساعدة - Lookups ] ---
 */
export const lookupAPI = {
    getVisitationLocations: (params) => api.get('/api/visit-centers', { params }), // تم التحديث
    getLocation: (id) => api.get(`/api/visit-centers/${id}`), // تم التحديث
    createLocation: (data) => api.post('/api/visit-centers', data), // تم التحديث
    updateLocation: (id, data) => api.put(`/api/visit-centers/${id}`, data), // تم التحديث
    deleteLocation: (id) => api.delete(`/api/visit-centers/${id}`), // تم التحديث
};

/**
 * --- [ D. خدمات مركز الرؤية - Visitation Execution ] ---
 */
export const visitationAPI = {
    list: (params) => api.get('/api/visit-sessions', { params }), // تم التحديث
    checkIn: (id, nationalId) => api.patch(`/api/visit-sessions/${id}/check-in`, { nationalId }), // تم التحديث
    complete: (id) => api.patch(`/api/visit-sessions/${id}/check-out`), // تم التحديث (check-out بدلاً من complete)
    setCompanion: (id, nationalId) => api.patch(`/api/visit-sessions/${id}`, { companionNationalId: nationalId }), // تم التحديث
};

/**
 * --- [ E. خدمات المدرسة - Schools ] ---
 */
export const schoolAPI = {
    listSchools: (params) => api.get('/api/schools', { params }),
    registerSchool: (data) => api.post('/api/schools', data),
    listChildren: (params) => api.get('/api/schools/me/children', { params }),
    uploadReport: (formData) => api.post('/api/school-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    listReports: (childId) => api.get(`/api/school-reports/${childId}`),
};

/**
 * --- [ F. الشكاوى - Complaints ] ---
 */
export const complaintsAPI = {
    create: (data) => api.post('/api/complaints', data),
    listMyComplaints: (params) => api.get('/api/court-staff/me/complaints', { params }), // تم التحديث
    updateStatus: (id, data) => api.patch(`/api/complaints/${id}/status`, data),
};

/**
 * --- [ G. التنبيهات والمخالفات - Obligation Alerts ] ---
 */
export const alertsAPI = {
    list: (params) => api.get('/api/court-staff/me/violation-alerts', { params }), // تم التحديث
    updateStatus: (id, data) => api.patch(`/api/violation-alerts/${id}/status`, data), // تم التحديث
};

/**
 * --- [ H. طلبات التعديل - Custody Requests ] ---
 */
export const requestsAPI = {
    list: (params) => api.get('/api/hosting-requests', { params }), // تم التحديث
    process: (id, data) => api.patch(`/api/hosting-requests/${id}/respond`, data), // تم التحديث
};

/**
 * --- [ I. الإشعارات والملفات - Common ] ---
 */
export const commonAPI = {
    // المستندات
    uploadDocument: (formData) => api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDocument: (id) => api.get(`/api/documents/${id}`),
    deleteDocument: (id) => api.delete(`/api/documents/${id}`),

    // الإشعارات
    getUnreadNotificationsCount: () => api.get('/api/notifications/unread-count'),
    listNotifications: (params) => api.get('/api/notifications/me', { params }),
    markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),

    // الأجهزة
    registerDevice: (data) => api.post('/api/notifications/devices', data),
    unregisterDevice: (token) => api.delete(`/api/user-devices/${token}`),
};

export default api;