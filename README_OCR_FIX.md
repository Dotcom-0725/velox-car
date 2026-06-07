# 🔧 إصلاح مشكلة OCR في الإنتاج

## المشكلة
بعد رفع الموقع على الإنترنت، نظام OCR لا يستخرج المعلومات من CIN والpermis.

## السبب
ملف `.env.local` لا يتم رفعه مع الكود. يجب إضافة المتغير في لوحة تحكم الاستضافة.

## ✅ الحل السريع (دقيقتان)

### إذا كنت تستخدم Vercel:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك
3. **Settings** → **Environment Variables**
4. اضغط **Add New**
5. أضف:
   ```
   Name: VITE_OCR_SPACE_API_KEY
   Value: K82835046388957
   Environment: ✅ Production ✅ Preview ✅ Development
   ```
6. اضغط **Save**
7. اذهب إلى **Deployments** → **...** → **Redeploy**

### إذا كنت تستخدم Netlify:

1. اذهب إلى: https://app.netlify.com
2. اختر موقعك
3. **Site settings** → **Environment variables**
4. اضغط **Add a variable**
5. أضف:
   ```
   Key: VITE_OCR_SPACE_API_KEY
   Value: K82835046388957
   ```
6. اضغط **Save**
7. أعد النشر

## 🧪 التحقق من الإصلاح

### 1. افتح Console المتصفح (F12)
يجب أن ترى:
```
🔑 OCR API Key configured: true
📝 Using API Key: K8283504...
```

### 2. جرّب Scan CIN
- اضغط "📷 Scanner CIN"
- ارفع صورة واضحة
- يجب أن تظهر البيانات المستخرجة

## 📄 الوثائق الكاملة

- **دليل الإنتاج:** `docs/PRODUCTION_SETUP.md`
- **دليل شامل:** `docs/OCR_SETUP.md`
- **دليل سريع:** `docs/QUICK_START.md`

## 🐛 إذا استمرت المشكلة

### تحقق من Console المتصفح (F12 → Console)

ابحث عن رسائل الخطأ:

| الخطأ | السبب | الحل |
|------|------|------|
| `OCR API Key configured: false` | المفتاح غير موجود | أضفه في لوحة تحكم الاستضافة |
| `Unauthorized` | المفتاح خاطئ | تحقق من نسخه بشكل صحيح |
| `Free key has reached its limit` | تجاوز الحد اليومي | انتظر 24 ساعة |
| `No text extracted` | صورة غير واضحة | استخدم صورة أفضل |

### تحقق من Network tab (F12 → Network)

1. جرّب Scan CIN
2. ابحث عن طلب لـ `api.ocr.space`
3. تحقق من:
   - **Status:** يجب أن يكون 200
   - **Response:** يجب أن يحتوي على النص المستخرج

## 📞 الدعم

إذا استمرت المشكلة:

1. افتح Console (F12)
2. انسخ رسائل الخطأ
3. اذهب إلى Network tab
4. انسخ Response من طلب OCR.Space
5. راجع: `docs/PRODUCTION_SETUP.md`

## 🎯 Checklist

- [ ] أضفت المتغير في لوحة تحكم الاستضافة
- [ ] أعدت النشر (Redeploy)
- [ ] Console يظهر: `OCR API Key configured: true`
- [ ] جرّبت Scan CIN بنجاح
- [ ] جرّبت Scan Permis بنجاح

---

**ملاحظة:** ملف `.env.local` يعمل فقط على جهازك المحلي. للإنتاج، يجب استخدام لوحة تحكم الاستضافة.
