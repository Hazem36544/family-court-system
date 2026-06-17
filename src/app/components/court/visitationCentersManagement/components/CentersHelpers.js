export const governoratesTranslation = {
  "Cairo": "القاهرة", "Giza": "الجيزة", "Alexandria": "الإسكندرية",
  "Qalyubia": "القليوبية", "Dakahlia": "الدقهلية", "Sharqia": "الشرقية",
  "Gharbia": "الغربية", "Monufia": "المنوفية", "Beheira": "البحيرة",
  "Kafr El Sheikh": "كفر الشيخ", "Damietta": "دمياط", "Port Said": "بورسعيد",
  "Ismailia": "الإسماعيلية", "Suez": "السويس", "North Sinai": "شمال سيناء",
  "South Sinai": "جنوب سيناء", "Red Sea": "البحر الأحمر", "Matrouh": "مطروح",
  "Fayoum": "الفيوم", "Beni Suef": "بني سويف", "Minya": "المنيا",
  "Assiut": "أسيوط", "Sohag": "سوهاج", "Qena": "قنا",
  "Luxor": "الأقصر", "Aswan": "أسوان", "New Valley": "الوادي الجديد"
};

export const validateFullName = (name) => {
  if (!name) return false;
  return name.trim().split(/\s+/).length >= 4;
};

export const validatePhone = (phone, isRequired = true) => {
  if (!phone && !isRequired) return null;
  if (!phone && isRequired) return "رقم التواصل مطلوب";
  if (!/^01[0125]\d{8}$/.test(phone)) return "غير صحيح";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "البريد الإلكتروني مطلوب";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "صيغة غير صحيحة";
  return null;
};