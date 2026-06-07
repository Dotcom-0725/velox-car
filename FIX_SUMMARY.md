# 🚨 إصلاح عاجل: OCR لا يعمل في الإنتاج

## المشكلة
بعد رفع الموقع، نظام OCR لا يستخرج المعلومات من CIN والpermis.

## ✅ الحل (دقيقتان فقط)

### الخطوة 1: أضف المتغير في منصة الاستضافة

#### 🟢 Vercel
```
1. Vercel Dashboard → مشروعك
2. Settings → Environment Variables
3. Add New:
   Name:  VITE_OCR_SPACE_API_KEY
   Value: K82835046388957
   ✅ Production  ✅ Preview  ✅ Development
4. Save
5. Deployments → ... → Redeploy
```

#### 🔵 Netlify
```
1. Netlify Dashboard → موقعك
2. Site settings → Environment variables
3. Add a variable:
   Key:   VITE_OCR_SPACE_API_KEY
   Value: K82835046388957
4. Save
5. Trigger deploy
```

### الخطوة 2: تحقق من العمل

افتح Console المتصفح (F12)، يجب أن ترى:
```
🔑 OCR API Key configured: true
📝 Using API Key: K8283504...
```

### الخطوة 3: جرّب

1. اضغط "📷 Scanner CIN"
2. ارفع صورة CIN واضحة
3. يجب أن تظهر البيانات المستخرجة تلقائياً

## 🐛 إذا لم يعمل

### تحقق من Console (F12)

| الرسالة | المعنى | الحل |
|---------|--------|------|
| `OCR API Key configured: false` | المفتاح غير موجود | أضفه في لوحة تحكم الاستضافة |
| `Unauthorized` | المفتاح خاطئ | تحقق من النسخ |
| `limit reached` | تجاوز الحد اليومي | انتظر 24 ساعة |
| `No text extracted` | صورة غير واضحة | استخدم صورة أفضل |

## 📋 لماذا هذه المشكلة؟

- ملف `.env.local` يعمل **محلياً فقط** على جهازك
- عند الرفع على الإنترنت، **لا يتم رفع** `.env.local` لأسباب أمنية
- يجب إضافة المتغيرات في **لوحة تحكم الاستضافة** (Vercel/Netlify/etc.)

## 📚 وثائق إضافية

- `README_OCR_FIX.md` - دليل سريع
- `docs/PRODUCTION_SETUP.md` - دليل شامل
- `docs/QUICK_START.md` - خطوات التكامل

## ✅ Checklist

- [ ] أضفت `VITE_OCR_SPACE_API_KEY` في لوحة تحكم الاستضافة
- [ ] القيمة: `K82835046388957`
- [ ] أعدت النشر (Redeploy)
- [ ] Console يظهر: `OCR API Key configured: true`
- [ ] نجح Scan CIN
- [ ] نجح Scan Permis

---

**المشكلة شائعة جداً** - 90% من المطورين يواجهونها عند أول نشر!
