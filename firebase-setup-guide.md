# 🔥 **دليل إعداد Firebase لقرية حرارة**

## 📋 **المتطلبات الأساسية**

1. **حساب Google**
2. **مشروع Firebase جديد**
3. **تفعيل Firestore Database**

---

## 🚀 **الخطوة 1: إنشاء مشروع Firebase**

### 1.1 **إنشاء المشروع**
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط على "Add project"
3. أدخل اسم المشروع: `harara-village`
4. اختر حساب Google
5. اضغط "Create project"

### 1.2 **تفعيل Firestore**
1. من القائمة الجانبية اختر "Build" → "Firestore Database"
2. اضغط "Create database"
3. اختر "Start in test mode"
4. اختر موقع الخادم (اختر الأقرب لمستخدميك)
5. اضغط "Enable"

---

## ⚙️ **الخطوة 2: إعدادات الأمان**

### 2.1 **قواعد الأمان**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قراءة البيانات للجميع
    match /{document=**} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2025, 1, 1);
    }
  }
}
```

### 2.2 **تحديث القواعد للإنتاج**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // الصنايعية
    match /craftsmen/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // الآلات
    match /machines/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // المحلات
    match /shops/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // العروض
    match /offers/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // الإعلانات
    match /ads/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // الأخبار
    match /news/{docId} {
      allow read: if true;
      allow write: if false;
    }
    
    // الطوارئ
    match /emergency/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 🔑 **الخطوة 3: الحصول على إعدادات المشروع**

### 3.1 **الحصول على إعدادات Firebase**
1. في Firebase Console اضغط على إعدادات المشروع (⚙️)
2. اختر "General"
3. في قسم "Your apps" اضغط على "Web"
4. أدخل اسم التطبيق: "Harara Village"
5. اضغط "Register app"
6. ستحصل على إعدادات Firebase

### 3.2 **مثال الإعدادات**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "harara-village.firebaseapp.com",
    projectId: "harara-village",
    storageBucket: "harara-village.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};
```

---

## 📝 **الخطوة 4: تحديث الكود**

### 4.1 **تحديث api-config-firebase.js**
```javascript
// استبدل هذه القيم بالقيم الحقيقية من مشروعك
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID_HERE",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 4.2 **تحديث index.html**
```html
<script type="module" src="api-config-firebase.js"></script>
<script type="module" src="script-firebase-fixed.js"></script>
```

---

## 🗄️ **الخطوة 5: إنشاء المجموعات (Collections)**

### 5.1 **إنشاء المجموعات يدوياً**
1. في Firestore Database اضغط "Start collection"
2. أدخل اسم المجموعة: `craftsmen`
3. أضف حقول مثل: `name`, `specialty`, `phone`, `address`
4. كرر للمجموعات الأخرى:
   - `machines`
   - `shops`
   - `offers`
   - `ads`
   - `news`
   - `emergency`

### 5.2 **هيكل الحقول المقترح**

#### **craftsmen**
```javascript
{
    name: "أحمد محمد",
    specialty: "نجار",
    phone: "0501234567",
    address: "شارع الملك فهد",
    status: "نشط",
    notes: "متخصص في الأثاث",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
}
```

#### **machines**
```javascript
{
    name: "محمد علي",
    type: "حفار",
    phone: "0507654321",
    available: true,
    notes: "متوفر للعمل الفوري",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
}
```

---

## 🧪 **الخطوة 6: الاختبار**

### 6.1 **إنشاء صفحة اختبار**
```html
<!DOCTYPE html>
<html>
<head>
    <title>اختبار Firebase</title>
</head>
<body>
    <h1>اختبار اتصال Firebase</h1>
    <button onclick="testConnection()">اختبار الاتصال</button>
    <div id="result"></div>
    
    <script type="module">
        import { firebaseClient } from './api-config-firebase.js';
        
        async function testConnection() {
            try {
                const data = await firebaseClient.getCollection('craftsmen');
                document.getElementById('result').innerHTML = 
                    `✅ الاتصال ناجح! عدد الصنايعية: ${data.length}`;
            } catch (error) {
                document.getElementById('result').innerHTML = 
                    `❌ خطأ: ${error.message}`;
            }
        }
        
        window.testConnection = testConnection;
    </script>
</body>
</html>
```

### 6.2 **اختبار العمليات**
```javascript
// اختبار القراءة
const craftsmen = await firebaseClient.getCollection('craftsmen');

// اختبار الإضافة
const newCraftsman = await firebaseClient.addDocument('craftsmen', {
    name: 'اختبار',
    specialty: 'تخصص اختبار',
    phone: '0500000000'
});

// اختبار البحث
const searchResults = await firebaseClient.searchDocuments(
    'craftsmen', 
    'نجار', 
    ['name', 'specialty']
);
```

---

## 🚀 **الخطوة 7: النشر**

### 7.1 **نشر على Vercel**
1. ارفع الكود إلى GitHub
2. في Vercel استورد المشروع
3. أضف متغيرات البيئة:
   - `FIREBASE_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_APP_ID`

### 7.2 **نشر على Firebase Hosting**
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting

# نشر
firebase deploy
```

---

## 🔧 **الخطوة 8: استكمال الوظائف**

### 8.1 **إضافة وظائف الإدارة**
```javascript
// في script-firebase.js
async function loadAdminStats() {
    const stats = {};
    const collections = ['craftsmen', 'machines', 'shops', 'offers', 'ads', 'news', 'emergency'];
    
    for (const collection of collections) {
        stats[collection] = await firebaseClient.getCollectionStats(collection);
    }
    
    return stats;
}

async function approveItem(type, id, approved) {
    return await firebaseClient.approveItem(type, id, approved);
}
```

### 8.2 **إضافة وظائف البحث**
```javascript
async function searchCraftsmen(searchTerm) {
    return await firebaseClient.searchDocuments(
        'craftsmen', 
        searchTerm, 
        ['name', 'specialty', 'address']
    );
}
```

---

## 📊 **الخطوة 9: المراقبة والتحليل**

### 9.1 **تفعيل Google Analytics**
1. في Firebase Console اختر "Build" → "Analytics"
2. اضغط "Set up Analytics"
3. اتبع التعليمات

### 9.2 **مراقبة الأداء**
```javascript
// إضافة مراقبة الأداء
import { getPerformance } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js';

const perf = getPerformance(app);
```

---

## 🎯 **المميزات الجديدة مع Firebase**

### ✅ **المميزات**
- **أمان أفضل** مع قواعد Firestore
- **أداء أسرع** مع CDN عالمي
- **تحليلات متقدمة** مع Google Analytics
- **دعم فوري** مع Realtime Database
- **مصادقة متقدمة** مع Firebase Auth
- **تخزين ملفات** مع Firebase Storage

### 📈 **التحسينات**
- **تخزين مؤقت ذكي**
- **مزامنة فورية**
- **دعم وضع عدم الاتصال**
- **نسخ احتياطي تلقائي**

---

## 🔍 **استكشاف الأخطاء**

### **مشاكل شائعة وحلولها**

#### **1. خطأ في الإعدادات**
```javascript
// تحقق من صحة الإعدادات
console.log(firebaseConfig);
```

#### **2. مشاكل الصلاحيات**
```javascript
// تحقق من قواعد الأمان
// يجب السماح بالقراءة للجميع في البداية
```

#### **3. مشاكل الاتصال**
```javascript
// اختبار الاتصال المباشر
fetch('https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents')
    .then(response => console.log(response.status));
```

---

## 📞 **الدعم الفني**

### **مصادر المساعدة**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

### **تواصل معنا**
- البريد الإلكتروني: support@harara-village.com
- الهاتف: 0500000000

---

**ملاحظة:** هذا الدليل يفترض أن لديك معرفة أساسية بـ JavaScript و HTML. إذا احتجت مساعدة إضافية، لا تتردد في التواصل معنا.
