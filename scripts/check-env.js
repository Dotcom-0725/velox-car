#!/usr/bin/env node

/**
 * Script للتحقق من أن متغيرات البيئة مضبوطة بشكل صحيح
 * 
 * الاستخدام:
 *   node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 التحقق من متغيرات البيئة...\n');

// 1. التحقق من وجود .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ ملف .env.local موجود');
  
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const hasApiKey = envContent.includes('VITE_OCR_SPACE_API_KEY=');
  
  if (hasApiKey) {
    console.log('✅ مفتاح API موجود في .env.local');
    
    // استخراج المفتاح (للعرض فقط)
    const match = envContent.match(/VITE_OCR_SPACE_API_KEY=(.+)/);
    if (match) {
      const key = match[1].trim();
      if (key === 'helloworld') {
        console.log('⚠️  تحذير: تستخدم المفتاح التجريبي "helloworld"');
        console.log('   هذا المفتاح محدود جداً وقد لا يعمل في الإنتاج');
      } else {
        console.log(`✅ مفتاح API: ${key.substring(0, 10)}...`);
      }
    }
  } else {
    console.log('❌ مفتاح API غير موجود في .env.local');
    console.log('   أضف هذا السطر:');
    console.log('   VITE_OCR_SPACE_API_KEY=K82835046388957');
  }
} else {
  console.log('❌ ملف .env.local غير موجود');
  console.log('   أنشئ الملف وأضف:');
  console.log('   VITE_OCR_SPACE_API_KEY=K82835046388957');
}

console.log('');

// 2. التحقق من وجود .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  console.log('✅ ملف .gitignore موجود');
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  const hasEnvLocal = gitignoreContent.includes('.env.local');
  
  if (hasEnvLocal) {
    console.log('✅ .env.local مدرج في .gitignore (آمن)');
  } else {
    console.log('⚠️  تحذير: .env.local غير مدرج في .gitignore');
    console.log('   قد يتم رفع المفتاح إلى GitHub بالخطأ!');
  }
} else {
  console.log('⚠️  ملف .gitignore غير موجود');
}

console.log('');

// 3. نصائح للإنتاج
console.log('📝 نصائح للإنتاج:');
console.log('═══════════════════════════════════════');
console.log('');
console.log('عند رفع الموقع على الإنترنت:');
console.log('');
console.log('🟢 Vercel:');
console.log('   Settings → Environment Variables → Add New');
console.log('   Name: VITE_OCR_SPACE_API_KEY');
console.log('   Value: K82835046388957');
console.log('');
console.log('🔵 Netlify:');
console.log('   Site settings → Environment variables');
console.log('   Key: VITE_OCR_SPACE_API_KEY');
console.log('   Value: K82835046388957');
console.log('');
console.log('🟠 Railway:');
console.log('   Variables → New Variable');
console.log('   Name: VITE_OCR_SPACE_API_KEY');
console.log('   Value: K82835046388957');
console.log('');
console.log('═══════════════════════════════════════');
console.log('');

// 4. اختبار سريع
console.log('🧪 لاختبار العمل:');
console.log('═══════════════════════════════════════');
console.log('');
console.log('1. شغّل الموقع: npm run dev');
console.log('2. افتح Console المتصفح (F12)');
console.log('3. ابحث عن: 🔑 OCR API Key configured: true');
console.log('4. جرّب Scan CIN');
console.log('');
console.log('═══════════════════════════════════════');
