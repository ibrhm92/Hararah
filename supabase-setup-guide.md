# دليل إعداد Supabase - Village App

## نظرة عامة
يستخدم تطبيق قرية حرارة **Supabase** كقاعدة بيانات خلفية بدلاً من Google Sheets. Supabase يوفر PostgreSQL قاعدة بيانات متقدمة مع API جاهز و Real-time capabilities.

## المتطلبات
- حساب Supabase (مجاني)
- معرفة أساسية بقواعد البيانات

## خطوة 1: إنشاء مشروع Supabase

### إنشاء الحساب
1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط **"Start your project"**
3. سجل حساب جديد أو سجل دخول

### إنشاء المشروع
1. اضغط **"New Project"**
2. أدخل اسم المشروع: `village-app`
3. اختر قاعدة البيانات: `PostgreSQL`
4. حدد المنطقة الأقرب (مثل: Frankfurt أو London)
5. أنشئ كلمة مرور قوية لقاعدة البيانات
6. اضغط **"Create new project"**

انتظر حتى يتم إنشاء المشروع (يستغرق 2-3 دقائق).

## خطوة 2: إعداد الجداول

### فتح SQL Editor
1. في لوحة تحكم Supabase، اذهب إلى **"SQL Editor"**
2. اضغط **"New query"**

### تنفيذ SQL لإنشاء الجداول
انسخ والصق الكود التالي في SQL Editor واضغط **"Run"**:

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

-- إنشاء جدول الآلات الزراعية
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

-- إنشاء جدول المحلات التجارية
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

-- إنشاء جدول العروض والتخفيضات
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

-- إنشاء جدول الإعلانات المحلية
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

-- إنشاء جدول الأخبار والتنبيهات
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'الإدارة',
  urgent BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول أرقام الطوارئ
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
```

## خطوة 3: تفعيل Row Level Security (RLS)

نفذ الكود التالي لتفعيل الأمان:

```sql
-- تفعيل RLS لجميع الجداول
ALTER TABLE craftsmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للقراءة العامة (يمكن للجميع قراءة البيانات)
CREATE POLICY "Enable read access for all users" ON craftsmen FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON machines FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON shops FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON offers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ads FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON news FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON emergency FOR SELECT USING (true);

-- سياسات للكتابة (للمستخدمين المصرح لهم فقط)
-- يمكن تخصيص هذا حسب احتياجات التطبيق
CREATE POLICY "Enable insert for authenticated users" ON craftsmen FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON machines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON ads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON news FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON emergency FOR INSERT WITH CHECK (true);
```

## خطوة 4: الحصول على مفاتيح API

### مفاتيح Supabase
1. في لوحة التحكم، اذهب إلى **Settings > API**
2. انسخ المعلومات التالية:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...`

### إعداد Vercel Environment Variables
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. افتح مشروعك
3. اذهب إلى **Settings > Environment Variables**
4. أضف المتغيرات التالية:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## خطوة 5: إضافة بيانات تجريبية

### إضافة بيانات أولية
نفذ الكود التالي لإضافة بعض البيانات التجريبية:

```sql
-- إضافة صنايعية تجريبية
INSERT INTO craftsmen (name, specialty, phone, address) VALUES
('أحمد محمد', 'كهربائي', '01012345678', 'قرية حرارة - شارع الجيش'),
('محمد علي', 'سباك', '01087654321', 'قرية حرارة - الميدان'),
('فاطمة حسن', 'نجار', '01156789012', 'قرية حرارة - حي الزهور');

-- إضافة محلات تجريبية
INSERT INTO shops (name, type, phone, hours, password) VALUES
('محل أحمد للمواد الغذائية', 'بقالة', '01011111111', '8:00 - 22:00', 'password123'),
('صيدلية الرحمة', 'صيدلية', '01022222222', '9:00 - 21:00', 'password123');

-- إضافة أرقام طوارئ
INSERT INTO emergency (name, phone, address, icon) VALUES
('مستشفى حرارة المركزي', '122', 'قرية حرارة - المستشفى', 'hospital'),
('إسعاف حرارة', '123', 'قرية حرارة - مركز الإسعاف', 'ambulance'),
('شرطة حرارة', '122', 'قرية حرارة - مركز الشرطة', 'police'),
('إطفاء حرارة', '180', 'قرية حرارة - مركز الإطفاء', 'fire');
```

## خطوة 6: التحقق من الإعداد

### اختبار الاتصال
1. افتح **Supabase Table Editor**
2. تأكد من وجود جميع الجداول
3. تأكد من وجود البيانات التجريبية

### اختبار API
1. في المتصفح، جرب:
   ```
   https://hararah.vercel.app/api/village?action=get&type=craftsmen
   ```
2. يجب أن ترى البيانات التجريبية

## استكشاف الأخطاء

### خطأ: "Table doesn't exist"
- تأكد من تنفيذ جميع أوامر SQL
- تحقق من أسماء الجداول

### خطأ: "RLS policy violation"
- تأكد من تفعيل RLS بشكل صحيح
- تحقق من السياسات

### خطأ: "Environment variables not set"
- تأكد من إضافة المتغيرات في Vercel
- أعد نشر التطبيق بعد إضافة المتغيرات

## الأمان المتقدم

### تفعيل Authentication (اختياري)
إذا كنت تريد نظام مصادقة متقدم:

1. اذهب إلى **Authentication > Settings**
2. فعل **"Enable email confirmations"**
3. أضف المستخدمين من **Authentication > Users**

### تخصيص RLS Policies
يمكنك تخصيص السياسات للسماح للمستخدمين المصرح لهم فقط بالكتابة:

```sql
-- مثال: السماح للإدارة فقط بإضافة الأخبار
CREATE POLICY "Only admins can insert news" ON news
  FOR INSERT WITH CHECK (auth.role() = 'admin');
```

## النسخ الاحتياطي

### تصدير البيانات
- اذهب إلى **Database > Backups**
- اضغط **"Create backup"**

### استعادة البيانات
- في حالة الحاجة، يمكن استعادة النسخ الاحتياطية من نفس القسم

---

## الدعم

إذا واجهت مشاكل:
1. تحقق من [Supabase Documentation](https://supabase.com/docs)
2. تأكد من صحة مفاتيح API
3. تحقق من console logs في Vercel

**تذكر**: Supabase يوفر طبقة مجانية سخية، لكن كن حذراً من التكاليف عند التوسع.