import React from 'react';

export function LoginLayout({ children }) {
  return (
    <div
      // ✅ الخلطة السحرية للسكرول وحل مشكلة القص
      className="h-screen w-full overflow-y-auto bg-[#F5F5F5]"
      dir="rtl"
      style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}
    >
      <div className="flex min-h-full w-full justify-center px-4 py-10">
        <div className="w-full max-w-[460px] my-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32">
              <img
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt="Family Court Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://placehold.co/128x128/png?text=Wisal'; }}
              />
            </div>
          </div>

          {/* Header Title */}
          <div className="text-center mb-3">
            <h1 className="text-3xl font-black text-[#2c3e50] mb-2 tracking-tight">نظام إدارة محاكم الأسرة</h1>
            <p className="text-sm font-bold text-[#95a5a6] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>بوابة وصال - لم الشمل</p>
          </div>

          {/* Dynamic Content (Forms) */}
          {children}

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-sm text-[#95a5a6] font-bold">
              آمن ومعتمد من قبل وزارة العدل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}