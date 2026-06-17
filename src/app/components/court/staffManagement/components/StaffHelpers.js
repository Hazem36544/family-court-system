export const rolesTranslation = {
  "SettlementSpecialist": "أخصائي تسوية",
  "CaseClerk": "كاتب قضايا",
  "ComplianceMonitor": "مراقب التزام",
  "CourtAdmin": "مدير المحكمة"
};

export const rolesOptions = [
  { value: 'SettlementSpecialist', label: 'أخصائي تسوية' },
  { value: 'CaseClerk', label: 'كاتب قضايا' },
  { value: 'ComplianceMonitor', label: 'مراقب التزام' }
];

export const filterOptions = [
  { value: 'all', label: 'جميع الموظفين' },
  { value: 'SettlementSpecialist', label: 'أخصائي تسوية' },
  { value: 'CaseClerk', label: 'كاتب قضايا' },
  { value: 'ComplianceMonitor', label: 'مراقب التزام' }
];

export const getStaffTheme = (role) => {
  switch (role) {
    case 'SettlementSpecialist':
      return { 
        bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconHoverBg: 'hover:bg-blue-50',
        text: 'text-blue-600', darkText: 'text-blue-900', hoverText: 'group-hover:text-blue-700', 
        borderColor: 'border-blue-100', hoverBorder: 'hover:border-blue-300', headerBg: 'bg-[#1e3a8a]',
        badgeBg: 'bg-blue-50', badgeText: 'text-[#1e3a8a]', badgeBorder: 'border-blue-100'
      };
    case 'CaseClerk': 
      return { 
        bg: 'bg-green-50', iconBg: 'bg-green-100', iconHoverBg: 'hover:bg-green-50',
        text: 'text-green-600', darkText: 'text-green-900', hoverText: 'group-hover:text-green-700', 
        borderColor: 'border-green-100', hoverBorder: 'hover:border-green-300', headerBg: 'bg-green-600',
        badgeBg: 'bg-green-50', badgeText: 'text-green-700', badgeBorder: 'border-green-200'
      };
    case 'ComplianceMonitor':
      return { 
        bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconHoverBg: 'hover:bg-purple-50',
        text: 'text-purple-600', darkText: 'text-purple-900', hoverText: 'group-hover:text-purple-700', 
        borderColor: 'border-purple-100', hoverBorder: 'hover:border-purple-300', headerBg: 'bg-purple-600',
        badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', badgeBorder: 'border-purple-200'
      };
    default:
      return { 
        bg: 'bg-gray-50', iconBg: 'bg-gray-100', iconHoverBg: 'hover:bg-gray-50',
        text: 'text-gray-600', darkText: 'text-gray-900', hoverText: 'group-hover:text-gray-700', 
        borderColor: 'border-gray-100', hoverBorder: 'hover:border-gray-300', headerBg: 'bg-[#1e3a8a]',
        badgeBg: 'bg-gray-50', badgeText: 'text-gray-700', badgeBorder: 'border-gray-200'
      };
  }
};

export const validateFullName = (name) => {
  if (!name) return false;
  const words = name.trim().split(/\s+/);
  return words.length >= 4;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const mobileRegex = /^01[0125]\d{8}$/;
  if (!mobileRegex.test(phone)) return "رقم الهاتف يجب أن يبدأ بـ 010, 011, 012, أو 015 ومكون من 11 رقم";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "البريد الإلكتروني مطلوب"; 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "صيغة البريد الإلكتروني غير صحيحة";
  return null;
};