import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // التأكد من الحفاظ على مسار المستودع الخاص بك للرفع على GitHub Pages
  base: '/family-court-system/', 
  build: {
    // رفع حد التحذير إلى 1000 كيلوبايت ليتناسب مع حجم المشروع الضخم
    chunkSizeWarningLimit: 1000, 
    
    rollupOptions: {
      output: {
        // تقسيم المكتبات الخارجية (مثل React و Axios) إلى ملف منفصل اسمه vendor
        // هذا يساعد المتصفح على تحميل الأجزاء التي لم تتغير بسرعة من الذاكرة (Cache)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})