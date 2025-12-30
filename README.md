# قرية حرارة - تطبيق خدمات القرية الذكية

تطبيق ويب متكامل لخدمة القرى الريفية المصرية، مصمم ليكون بسيطاً وسريعاً وفعالاً على الموبايل مع دعم PWA.

## 🌟 المميزات الرئيسية

### 📱 واجهة المستخدم
- **تصميم متجاوب** يعمل بكفاءة على جميع الأجهزة
- **واجهة بسيطة** مناسبة لكبار السن
- **دعم كامل للغة العربية** مع RTL
- **PWA جاهز** للتحويل إلى تطبيق موبايل
- **عمل بدون إنترنت** للبيانات الأساسية

### 🏘️ الخدمات المتوفرة
1. **دليل الصنايعية والخدمات** (كهربائي، سباك، نجار، إلخ)
2. **دليل أصحاب الآلات الزراعية** (جرار، حصادة، ماكينة ري، إلخ)
3. **دليل المحلات التجارية** (بقالة، صيدلية، مخبز، إلخ)
4. **العروض والتخفيضات** المعتمدة من الإدارة
5. **الإعلانات المحلية** (بيع، شراء، وظائف، مواشي)
6. **الأخبار والتنبيهات** العاجلة
7. **أرقام الطوارئ** والخدمات العامة
8. **إضافة خدمات جديدة**

### 👥 لوحات التحكم
- **لوحة تحكم الإدارة** لإدارة جميع الأقسام والموافقات
- **لوحة أصحاب المحلات** لإدارة العروض والمعلومات

## 🏗️ بنية المشروع

```
قرية حرارة/
├── index.html                 # الصفحة الرئيسية
├── styles.css                 # تنسيقات CSS
├── script.js                  # JavaScript الرئيسي
├── api-config.js              # إعدادات API والاتصال
├── sw.js                      # Service Worker لـ PWA
├── manifest.json              # ملف PWA
├── vercel.json                # إعدادات النشر على Vercel
├── pages/
│   ├── admin.html             # لوحة تحكم الإدارة
│   └── shop-owner.html        # لوحة أصحاب المحلات
├── google-apps-script.js      # كود Google Apps Script API
├── google-sheets-setup.md     # تصميم قاعدة البيانات
└── README.md                  # هذا الملف
```

## 🚀 التقنيات المستخدمة

### الواجهة الأمامية
- **HTML5** مع دعم PWA
- **CSS3** مع تصميم متجاوب
- **JavaScript (ES6+)**
- **Font Awesome** للأيقونات
- **Google Fonts** (Tajawal)

### الخلفية
- **Supabase** كقاعدة بيانات و Backend
- **PostgreSQL** قاعدة البيانات المتقدمة
- **RESTful API** مع Real-time capabilities
- **Row Level Security** للأمان المتقدم

### النشر
- **Vercel** للاستضافة (أو أي استضافة static)
- **PWA** للتطبيق الموبايل
- **Service Worker** للعمل بدون إنترنت

## 📋 المتطلبات

### قبل البدء
1. حساب Google لإنشاء Google Sheets
2. حساب Vercel للاستضافة
3. متصفح حديث يدعم PWA

### المتطلبات التقنية
- لا حاجة لخادم أو قاعدة بيانات تقليدية
- يعمل على أي استضافة تدعم ملفات ثابتة
- متوافق مع جميع المتصفحات الحديثة

## 🔧 خطوات التثبيت

### 1. إعداد Supabase
📖 **اقرأ الدليل التفصيلي**: [supabase-setup-guide.md](supabase-setup-guide.md)

**الخطوات السريعة:**
1. أنشئ حساب على [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى **Settings > API** واحصل على:
   - **Project URL**
   - **anon/public key**
4. أضف المتغيرات البيئية في Vercel:
   - `SUPABASE_URL=your_project_url`
   - `SUPABASE_ANON_KEY=your_anon_key`
5. نفذ SQL التالي في **Supabase SQL Editor** لإنشاء الجداول:

```sql
-- إنشاء جدول الصنايعية
CREATE TABLE craftsmen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'نشط',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الآلات
CREATE TABLE machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  notes TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المحلات
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  address TEXT,
  password TEXT,
  registeredAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'نشط'
);

-- إنشاء جدول العروض
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopName TEXT NOT NULL,
  shopPhone TEXT NOT NULL,
  description TEXT NOT NULL,
  discount TEXT NOT NULL,
  duration TEXT NOT NULL,
  phone TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإعلانات
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الأخبار
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'الإدارة',
  urgent BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الطوارئ
CREATE TABLE emergency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  icon TEXT DEFAULT 'emergency',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS (Row Level Security)
ALTER TABLE craftsmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للقراءة العامة
CREATE POLICY "Enable read access for all users" ON craftsmen FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON machines FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON shops FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON offers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ads FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON news FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON emergency FOR SELECT USING (true);

-- إنشاء سياسات للكتابة (للمستخدمين المصرح لهم فقط)
-- يمكن تخصيص هذا حسب احتياجات التطبيق
```

### 2. إعداد Google Apps Script
1. من Google Sheets، اذهب إلى Extensions > Apps Script
2. الصق كود `google-apps-script.js`
3. غيّر `SPREADSHEET_ID` لمعرف الـ Spreadsheet الخاص بك
4. انشر كـ Web App واحصل على الـ URL

### 3. إعداد المشروع
1. استنسخ المشروع أو حمّل الملفات
2. **انتقل إلى Google Apps Script:**
   - اذهب إلى [Google Apps Script](https://script.google.com)
   - أنشئ مشروع جديد
   - الصق كود `google-apps-script.js`
   - **غيّر SPREADSHEET_ID في السطر 5** لمعرف الجدول الخاص بك
   - احفظ المشروع
3. **نشر التطبيق:**
   - اضغط "Deploy" > "New deployment"
   - اختر نوع "Web app"
   - في "Execute as" اختر "Me"
   - في "Who has access" اختر "Anyone"
   - اضغط "Deploy" وانسخ الـ URL
4. **تحديث إعدادات API:**
   - افتح `api-config.js`
   - استبدل `BASE_URL` بالـ URL الذي نسخته من الخطوة السابقة
5. حمّل الملفات إلى Vercel أو أي استضافة

### 4. النشر على Vercel
1. سجل دخولك في [Vercel](https://vercel.com)
2. اربط حساب GitHub أو حمّل الملفات يدوياً
3. أضف متغير البيئة `GOOGLE_SCRIPTS_URL` مع URL الـ API
4. انشر المشروع

## ⚙️ الإعدادات

### إعدادات API
في `api-config.js`، غيّر:
```javascript
BASE_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec'
```

### إعدادات Google Apps Script
في `google-apps-script.js`، غيّر:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

### بيانات الاعتماد الافتراضية
- **Admin**: username: `admin`, password: `admin123`
- **يمكن تغييرها من Google Apps Script**

## 🔧 إصلاح مشاكل API

### 🚨 إذا ظهرت رسالة "فشل الاتصال بالخادم"
**اقرأ الحل السريع**: [quick-fix-api.md](quick-fix-api.md)

### 🚨 إذا ظهرت رسالة CORS
**اقرأ إصلاح CORS**: [cors-fix.md](cors-fix.md)

**الأسباب الشائعة:**
- لم يتم تحديث رابط Google Apps Script في `api-config.js`
- لم يتم نشر Apps Script كـ Web App
- لم يتم مشاركة Google Sheets مع Apps Script
- مشاكل CORS مع GET requests

## 🧪 اختبار النظام

### اختبار API
قبل البدء، اختبر اتصال النظام بقاعدة البيانات:
1. افتح `test-api.html` في المتصفح
2. جرب استرجاع البيانات (جلب الصنايعية/المحلات/العروض)
3. جرب حفظ بيانات تجريبية
4. جرب تسجيل الدخول والتسجيل
5. تأكد من عدم وجود أخطاء في Console

## 🌐 التجريب والنشر

### 🔸 التجريب المحلي
**يمكن تشغيل التطبيق محلياً** للاختبار الأولي:

```bash
# باستخدام Python (إذا كان مثبتاً)
python -m http.server 8000

# أو باستخدام Node.js
npx http-server -p 8000

# أو باستخدام PHP
php -S localhost:8000

# أو استخدم Live Server في VS Code
```

**ملاحظة مهمة**: التطبيق يحتاج Google Apps Script API ليعمل بالكامل. يمكنك:
- اختبار الواجهة المحلية
- استخدام `test-api.html` لاختبار API
- لكن الوظائف الكاملة تحتاج نشر API

### 🔸 النشر على Vercel (موصى به)
1. أنشئ حساب على [Vercel](https://vercel.com)
2. اربط حسابك مع GitHub
3. ارفع المشروع إلى GitHub
4. انشر من Vercel
5. احصل على الرابط العام

### 🔸 بدائل النشر
- **Netlify**: مجاني وسهل الاستخدام
- **GitHub Pages**: مجاني للمشاريع العامة
- **Firebase Hosting**: جيد للتطبيقات الكبيرة

## 📱 استخدام التطبيق

### للمستخدمين العاديين
1. افتح الرابط من المتصفح
2. تصفح الخدمات المتاحة
3. اتصل مباشرة بالصنايعية أو المحلات
4. شاهد العروض والإعلانات المعتمدة

### لأصحاب المحلات
1. اذهب إلى صفحة "أصحاب المحلات"
2. سجل معلومات محلك
3. أضف عروضك للموافقة
4. تابع حالة العروض

### للإدارة
1. اذهب إلى صفحة "لوحة التحكم"
2. سجل دخولك ببيانات Admin
3. إدارة جميع الأقسام
4. موافقة على الإعلانات والعروض
5. نشر الأخبار والتنبيهات

## 🔒 الأمان

### حماية البيانات
- Google Sheets محمي بإعدادات الوصول
- API محمي بـ CORS و Rate Limiting
- لا يتم تخزين بيانات حساسة في المتصفح

### صلاحيات المستخدمين
- **المستخدمون العاديون**: قراءة فقط
- **أصحاب المحلات**: إدارة عروضهم فقط
- **الإدارة**: صلاحيات كاملة

## 🚀 التحسينات المستقبلية

### الميزات المخطط لها
- [ ] نظام إشعارات فوري
- [ ] تقييمات ومراجعات
- [ ] خريطة تفاعلية للخدمات
- [ ] نظام حجوزات
- [ ] دفعات إلكترونية
- [ ] تقارير وإحصائيات متقدمة

### التحسينات التقنية
- [ ] تحسين الأداء والتحميل
- [ ] دعم لغات أخرى
- [ ] تحسين SEO
- [ ] نظام نسخ احتياطي تلقائي

## 🛠️ الصيانة

### صيانة دورية
1. **نسخ احتياطي** لبيانات Google Sheets أسبوعياً
2. **تنظيف البيانات** القديمة شهرياً
3. **مراجعة الأداء** ربع سنوية
4. **تحديث الأمان** عند الحاجة

### استكشاف الأخطاء
- **مشاكل الاتصال**: تحقق من URL الـ API
- **بطء التحميل**: نظف الكاش وضغط الصور
- **مشاكل العرض**: تحقق من دعم المتصفح

## 📞 الدعم

### للتواصل والمساعدة
- **البريد الإلكتروني**: support@village-app.com
- **الهاتف**: +20xxxxxxxxx
- **الوثائق**: [رابط التوثيق](https://docs.village-app.com)

### المجتمع
- **فيسبوك**: [رابط الصفحة](https://facebook.com/village-app)
- **تليجرام**: [رابط القناة](https://t.me/village-app)

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - يمكنك استخدامه وتعديله وتوزيعه بحرية.

## 🙏 الشكر والتقدير

- **مجتمع القرية** على الدعم والمساهمة
- **Google** لتوفير الأدوات المجانية
- **Vercel** للاستضافة المجانية
- **Font Awesome** للأيقونات الرائعة

---

**ملاحظة**: هذا المشروع مفتوح المصدر ومتاح للجميع للمساهمة والتطوير.
