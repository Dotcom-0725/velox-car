# 🔧 حل مشكلة عدم عمل OCR في الإنتاج

## 🐛 المشكلة

بعد رفع الموقع على الإنترنت، نظام OCR لا يعمل ولا يستخرج المعلومات من CIN والpermis.

## 🔍 السبب

ملف `.env.local` **لا يتم رفعه** مع الكود لأسباب أمنية. يجب إضافة المتغيرات في لوحة تحكم منصة الاستضافة.

## ✅ الحل

### الخطوة 1: التحقق من المشكلة

افتح **Console المتصفح** (F12) وابحث عن:

```
🔑 OCR API Key configured: false
```

إذا ظهر `false`، فهذا يعني أن المفتاح غير موجود.

### الخطوة 2: إضافة المتغير في منصة الاستضافة

#### 🟢 Vercel

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك
3. **Settings** → **Environment Variables**
4. اضغط **Add New**
5. أضف:
   - **Name:** `VITE_OCR_SPACE_API_KEY`
   - **Value:** `K82835046388957`
   - **Environment:** Production ✅, Preview ✅, Development ✅
6. اضغط **Save**
7. أعد النشر (Redeploy)

#### 🔵 Netlify

1. اذهب إلى: https://app.netlify.com
2. اختر موقعك
3. **Site settings** → **Environment variables**
4. اضغط **Add a variable**
5. أضف:
   - **Key:** `VITE_OCR_SPACE_API_KEY`
   - **Value:** `K82835046388957`
6. اضغط **Save**
7. أعد النشر (Trigger deploy)

#### 🟠 Railway

1. اذهب إلى: https://railway.app
2. اختر مشروعك
3. **Variables** tab
4. اضغط **New Variable**
5. أضف:
   - **Name:** `VITE_OCR_SPACE_API_KEY`
   - **Value:** `K82835046388957`
6. أعد النشر

#### 🔴 Hostinger/VPS

إذا كنت تستخدم VPS أو استضافة تقليدية:

1. أنشئ ملف `.env.production` في جذر المشروع:
```env
VITE_OCR_SPACE_API_KEY=K82835046388957
```

2. تأكد من أن الملف **غير مدرج** في `.gitignore`
3. أعد بناء المشروع:
```bash
npm run build
```

## 🧪 اختبار العمل

### 1. افتح Console المتصفح (F12)
يجب أن ترى:
```
🔑 OCR API Key configured: true
📝 Using API Key: K8283504...
```

### 2. جرّب Scan CIN
- اضغط على زر "📷 Scanner CIN"
- ارفع صورة CIN واضحة
- يجب أن تظهر البيانات المستخرجة

### 3. إذا لم يعمل
تحقق من:
- [ ] المتغير مضاف في لوحة التحكم
- [] أعدت النشر بعد إضافة المتغير
- [ ] الصورة واضحة وجودة عالية
- [ ] حجم الصورة أقل من 10 MB
- [ ] الصيغة: JPG, PNG, أو PDF

## 🐛 رسائل الخطأ الشائعة

### "OCR.Space API error: Unauthorized"
**السبب:** المفتاح غير صحيح
**الحل:** تحقق من نسخ المفتاح بشكل صحيح

### "OCR processing error: Free key has reached its limit"
**السبب:** تجاوزت الحد المجاني
**الحل:** انتظر 24 ساعة أو استخدم مفتاح آخر

### "No text extracted from image"
**السبب:** صورة غير واضحة
**الحل:**
- استخدم صورة عالية الجودة
- تأكد من إضاءة جيدة
- تجنب الانعكاسات

### "Fichier trop volumineux"
**السبب:** الصورة أكبر من 10 MB
**الحل:** ضغط الصورة

## 🔐 ملاحظات أمنية

⚠️ **مهم جداً:**
- لا تشارك مفتاح API مع أحد
- لا ترفعه على GitHub
- استخدم `.env.local` للتطوير فقط
- استخدم لوحة تحكم الاستضافة للإنتاج

## 📊 مراقبة الاستخدام

تحقق من استهلاكك على:
https://ocr.space/dashboard

الحد المجاني:
- 25,000 طلب/شهر
- 500 طلب/يوم
- 1 MB لكل صورة

## 🚀 حل سريع (Emergency Fix)

إذا كنت بحاجة لحل سريع، يمكنك إضافة المفتاح مباشرة في الكود (غير موصى به):

```typescript
// في src/services/ocr/ocrService.ts
const OCR_SPACE_API_KEY = 'K82835046388957'; // ⚠️ غير آمن!
```

⚠️ **تحذير:** هذا يعرض مفتاحك للسرقة! استخدم لوحة تحكم الاستضافة بدلاً من ذلك.

## ✅ Checklist

- [ ] أضفت المتغير في لوحة تحكم الاستضافة
- [ ] أعدت النشر
- [ ] Console يظهر: `OCR API Key configured: true`
- [ ] جرّبت Scan CIN بنجاح
- [ ] جرّبت Scan Permis بنجاح
- [ ] تحققت من quota على ocr.space/dashboard

## 📞 إذا استمرت المشكلة

1. افتح Console المتصفح (F12)
2. اذهب إلى تبويب **Network**
3. جرّب Scan CIN
4. ابحث عن طلب لـ `api.ocr.space`
5. تحقق من:
   - Status Code (يجب أن يكون 200)
   - Response Body (يحتوي على النص المستخرج)
6. اكتب الخطأ الذي تراه

## 🎯 مثال حي

### Vercel - Screenshots

1. **Settings → Environment Variables**
   ```
   + Add New
   Name: VITE_OCR_SPACE_API_KEY
   Value: K82835046388957
   Environment: [x] Production [x] Preview [x] Development
   ```

2. **اضغط Save**

3. **Deployments → ... → Redeploy**

### بعد النشر

افتح الموقع واضغط F12:
```javascript
console.log(import.meta.env.VITE_OCR_SPACE_API_KEY)
// يجب أن يظهر: "K82835046388957"
```

## 🌟 نصائح للإنتاج

### 1. استخدم مفتاح مدفوع إذا كان الاستهلاك عالي
- Pro Plan: $10/شهر (100,000 طلب)
- Business Plan: $50/شهر (500,000 طلب)

### 2. ضغط الصور قبل الإرسال
```typescript
// استخدم compressorjs
import Compressor from 'compressorjs';

new Compressor(file, {
  quality: 0.8,
  maxWidth: 1920,
  success(result) {
    // أرسل result بدلاً من file
  }
});
```

### 3. Cache النتائج
```typescript
const cache = new Map();

async function extractTextFromImage(file: File) {
  const fileHash = await hashFile(file);
  
  if (cache.has(fileHash)) {
    return cache.get(fileHash);
  }
  
  const text = await callOCRSpace(file);
  cache.set(fileHash, text);
  return text;
}
```

### 4. معالجة الأخطاء
```typescript
try {
  const text = await extractTextFromImage(file);
  // نجح
} catch (error) {
  if (error.message.includes('limit')) {
    // تجاوز الحد - انتظر أو استخدم مفتاح آخر
  } else if (error.message.includes('Unauthorized')) {
    // مفتاح غير صحيح
  }
}
```

## 📚 موارد إضافية

- [OCR.Space Documentation](https://ocr.space/ocrapi)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
