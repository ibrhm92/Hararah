# إصلاح مشكلة CORS - حفظ البيانات ✅

## المشكلة
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 'https://hararah.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## السبب
Google Apps Script لا يتعامل مع OPTIONS requests (preflight) عند إرسال headers مع GET requests.

## الحل
**فصل الطلبات**:
- **GET requests** للقراءة (بدون headers لتجنب CORS)
- **POST requests** للكتابة (مع JSON body)

## الخطوات

### 1. إعادة نشر Google Apps Script
1. اذهب إلى [script.google.com](https://script.google.com)
2. افتح مشروع "قرية حرارة API"
3. **تأكد من وجود الكود المُحدث** (يتعامل مع POST و GET)
4. اضغط **Deploy** > **New deployment**
5. اختر **Web app**
6. اضغط **Deploy**

### 2. رفع الملفات المُحدثة
```bash
git add .
git commit -m "Fix CORS with separate GET/POST handling"
git push origin main
```

### 3. الاختبار
1. افتح التطبيق على Vercel
2. افتح Developer Tools (F12) > Console
3. جرب حفظ بيانات جديدة
4. تحقق من عدم وجود أخطاء CORS

### فحص النجاح
```javascript
// في Console يجب أن ترى:
🔗 GET API Request: https://script.google.com/macros/s/.../exec?action=get&type=craftsmen
📡 Response status: 200

🔗 POST API Request: https://script.google.com/macros/s/.../exec
📤 Request data: { action: 'save', type: 'craftsmen', data: {...} }
📡 Response status: 200
```

**🎉 الآن يعمل حفظ البيانات بدون مشاكل CORS!**