import React from 'react';
import { Building2, Phone, Mail, MapPin, Navigation } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, isMono, isLtr, className = '' }) => (
    <div className={`bg-[#F8F9FA] p-4 rounded-2xl flex items-center justify-between group hover:border-blue-100 border border-transparent transition-all overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 w-full">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#1e3a8a] group-hover:text-white">
                <Icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-gray-400 font-bold mb-1">{label}</p>
                <p className={`text-base md:text-lg font-bold text-gray-800 tracking-wider truncate max-w-full ${isMono ? 'font-mono' : ''}`} dir={isLtr ? 'ltr' : 'rtl'} title={value}>
                    {value}
                </p>
            </div>
        </div>
    </div>
);

const BasicInfo = ({ displayInfo }) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-8 relative h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-50">
                <h3 className="text-xl font-bold text-gray-800 border-r-4 border-[#1e3a8a] pr-3">المعلومات الأساسية للمحكمة</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <InfoRow icon={Building2} label="اسم المحكمة" value={displayInfo.name} className="sm:col-span-2" />
                <InfoRow icon={Navigation} label="المحافظة" value={displayInfo.governorate} />
                <InfoRow icon={Phone} label="رقم التواصل" value={displayInfo.contactInfo} isMono={true} isLtr={true} />
                <InfoRow icon={Mail} label="البريد الإلكتروني للفرع" value={displayInfo.email} isMono={true} className="sm:col-span-2" />
                <InfoRow icon={MapPin} label="العنوان التفصيلي" value={displayInfo.address} className="sm:col-span-2" />
            </div>
        </div>
    );
};

export default BasicInfo;