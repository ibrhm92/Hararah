# إصلاح مشكلة API بسرعة 🚀

## المشكلة الحالية
خطأ CORS: `"Access to fetch... has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource"`

هذا يحدث لأن Google Apps Script لا يتعامل مع OPTIONS requests (preflight) بشكل صحيح عند إرسال headers مع GET requests.

## السبب
لم يتم تحديث رابط Google Apps Script API في `api-config.js`.

## الحل السريع

### الخطوة 1: تحقق من Google Apps Script
1. اذهب إلى [script.google.com](https://script.google.com)
2. افتح مشروع "قرية حرارة API"
3. اضغط **Deploy** > **New deployment**
4. اختر **Web app**
5. في "Execute as" اختر **Me**
6. في "Who has access" اختر **Anyone**
7. اضغط **Deploy**
8. **انسخ الرابط** الذي يظهر

### الخطوة 2: تحديث api-config.js
1. افتح ملف `api-config.js`
2. ابحث عن:
   ```javascript
   BASE_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
   ```
3. استبدل `YOUR_DEPLOYMENT_ID` بالرقم من الرابط المنسوخ
4. مثال:
   ```javascript
   BASE_URL: 'https://script.google.com/macros/s/AKfycbx1hvx36P4YuSvVUbLgXK99pHH-AVZzdiQ4KWBQzQ_Vo0W9szE4UTrx4iMCWhcFif8d/exec'
   ```

### الخطوة 3: إعادة رفع الملفات
1. ارفع الملف المُحدث `api-config.js` إلى Vercel/GitHub
2. انتظر حتى ينشر التطبيق الجديد

### الخطوة 4: الاختبار
1. افتح التطبيق على Vercel
2. افتح Developer Tools (F12) > Console
3. تحقق من عدم وجود تحذيرات حمراء
4. جرب حفظ بيانات جديدة

## استكشاف الأخطاء

### إذا استمر الخطأ:
1. **تحقق من Console**:
   - افتح F12 > Console
   - ابحث عن رسائل الخطأ باللون الأحمر
   - ستجد الـ URL المرسل

2. **تحقق من Google Sheets**:
   - تأكد من أن الأوراق موجودة: Craftsmen, Machines, Shops, Offers, Ads, News, Emergency
   - تأكد من أن العناوين مطابقة تماماً
   - تأكد من مشاركة الجدول مع Apps Script

3. **تحقق من النشر**:
   - اذهب إلى Apps Script > Deploy > Manage deployments
   - تأكد من أن آخر نشر نشط

## الاختبار السريع

افتح `test-api.html` محلياً أو على Vercel وجرب:
- ✅ جلب الصنايعية
- ✅ جلب المحلات
- ✅ حفظ بيانات تجريبية

## تحتاج مساعدة؟
إذا لم تعمل الحلول أعلاه:
1. شارك لقطة شاشة من Console
2. شارك رابط Apps Script الذي نسخته
3. تحقق من أن جميع الخطوات تمت بدقة

**🎯 الهدف**: جعل التطبيق يعمل بالكامل مع حفظ واسترجاع البيانات من Google Sheets!