# دليل Firebase للاتصال بقاعدة البيانات
## شرح مفصل للمبتدئين

---

## 📋 محتويات الدليل

1. [مقدمة عن Firebase](#مقدمة-عن-firebase)
2. [إعداد الاتصال](#إعداد-الاتصال)
3. [العمليات الأساسية](#العمليات-الأساسية)
4. [شرح الكود بالتفصيل](#شرح-الكود-بالتفصيل)
5. [أمثلة عملية](#أمثلة-عملية)
6. [نصائح هامة](#نصائح-هامة)

---

## 🚀 مقدمة عن Firebase

**Firebase** هي خدمة من Google توفر قاعدة بيانات سحابية (Cloud Database) يمكن الوصول إليها من أي جهاز.

### لماذا نستخدم Firebase؟
- **مجانية** للاستخدام الشخصي
- **سهلة** في التعامل
- **سريعة** في الوصول للبيانات
- **متاحة** من أي مكان
- **تدعم** التطبيقات الحديثة

---

## 🔧 إعداد الاتصال

### 1. إعداد المشروع في Firebase Console
```javascript
// معلومات الاتصال (تكون في ملف firebase-config.js)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
```

### 2. تهيئة Firebase
```javascript
// في ملف script-firebase-fixed.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

---

## 📊 العمليات الأساسية

### 1. **الحفظ (Save)**
```javascript
// حفظ بيانات جديدة
async function saveData(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log("تم الحفظ بنجاح:", docRef.id);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("خطأ في الحفظ:", error);
        throw error;
    }
}
```

### 2. **الجلب (Get/Read)**
```javascript
// جلب كل البيانات من مجموعة
async function getData(collectionName) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (error) {
        console.error("خطأ في الجلب:", error);
        return [];
    }
}

// جلب بيانات محددة بالمعرف
async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("المستند غير موجود");
            return null;
        }
    } catch (error) {
        console.error("خطأ في جلب المستند:", error);
        return null;
    }
}
```

### 3. **التحديث (Update)**
```javascript
// تحديث بيانات موجودة
async function updateData(collectionName, docId, newData) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, newData);
        console.log("تم التحديث بنجاح");
        return true;
    } catch (error) {
        console.error("خطأ في التحديث:", error);
        return false;
    }
}
```

### 4. **الحذف (Delete)**
```javascript
// حذف مستند
async function deleteData(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        console.log("تم الحذف بنجاح");
        return true;
    } catch (error) {
        console.error("خطأ في الحذف:", error);
        return false;
    }
}
```

---

## 🔍 شرح الكود بالتفصيل

### مفهوم المجموعات (Collections) والمستندات (Documents)

```
قاعدة البيانات (Database)
├── doctors (مجموعة)
│   ├── doc1 (مستند)
│   ├── doc2 (مستند)
│   └── doc3 (مستند)
├── shops (مجموعة)
│   ├── doc1 (مستند)
│   └── doc2 (مستند)
└── pending_requests (مجموعة)
    ├── doc1 (مستند)
    └── doc2 (مستند)
```

### شرح الدوال المستخدمة في المشروع

#### 1. دالة الحفظ
```javascript
async function saveServiceRequest(formData) {
    // إضافة بيانات إضافية
    const pendingData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        submittedBy: {
            name: currentUser?.name || 'مجهول',
            phone: currentUser?.phone || '',
            email: currentUser?.email || ''
        }
    };
    
    // حفظ في قاعدة البيانات
    await window.saveData('pending_requests', pendingData);
}
```

**شرح:**
- `...formData` = نسخ كل البيانات من الفورم
- `submittedAt` = وقت التقديم
- `status: 'pending'` = الحالة الابتدائية
- `submittedBy` = بيانات مقدم الطلب
- `window.saveData` = دالة الحفظ العامة

#### 2. دالة الجلب مع الكاش
```javascript
async function getData(collectionName, useCache = true) {
    const cacheKey = `firebase_${collectionName}`;
    
    // التحقق من الكاش أولاً
    if (useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            console.log(`Using cached data for ${collectionName}`);
            return data;
        }
    }
    
    // جلب من Firebase
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        
        // حفظ في الكاش
        if (useCache) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}
```

**شرح:**
- `localStorage` = ذاكرة المتصفح المؤقتة
- `useCache` = خيار استخدام الكاش أو لا
- `JSON.parse` = تحويل النص إلى كائن JavaScript
- `JSON.stringify` = تحويل الكائن إلى نص

#### 3. دالة التصفية المتقدمة
```javascript
async function getFilteredData(collectionName, filters = {}) {
    try {
        let q = collection(db, collectionName);
        
        // إضافة شروط التصفية
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }
        
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        
        if (filters.orderBy) {
            q = query(q, orderBy(filters.orderBy, 'desc'));
        }
        
        if (filters.limit) {
            q = query(q, limit(filters.limit));
        }
        
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        
        return data;
    } catch (error) {
        console.error('Error in filtered query:', error);
        return [];
    }
}
```

---

## 💡 أمثلة عملية

### مثال 1: حفظ طلب جديد
```javascript
// بيانات طلب عيادة جديدة
const doctorRequest = {
    name: "د. أحمد محمد",
    phone: "01234567890",
    specialty: "قلب",
    address: "القاهرة، مصر",
    type: "doctor",
    status: "pending"
};

// حفظ الطلب
await saveData('pending_requests', doctorRequest);
```

### مثال 2: جلب الطلبات المعلقة
```javascript
// جلب كل الطلبات المعلقة
const pendingRequests = await getFilteredData('pending_requests', {
    status: 'pending',
    orderBy: 'submittedAt'
});

console.log('الطلبات المعلقة:', pendingRequests);
```

### مثال 3: تحديث حالة طلب
```javascript
// تحديث طلب من معلق إلى موافق
const requestId = 'abc123';
await updateData('pending_requests', requestId, {
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: new Date().toISOString()
});
```

### مثال 4: حذف طلب
```javascript
// حذف طلب محدد
const requestId = 'abc123';
await deleteData('pending_requests', requestId);
```

---

## 🎯 فكرة عمل الطلبات في المشروع

### 1. تقديم الطلب
```javascript
// المستخدم يملأ الفورم
// البيانات تحفظ في pending_requests
// الحالة: pending
```

### 2. مراجعة الإدارة
```javascript
// الإدارة ترى الطلبات المعلقة فقط
// يمكن القبول أو الرفض
```

### 3. القبول
```javascript
// تحديث الحالة إلى approved
// نسخ البيانات إلى المجموعة الرئيسية (doctors, shops, etc.)
// إزالة من pending_requests
```

### 4. الرفض
```javascript
// تحديث الحالة إلى rejected
// لا يتم النسخ للمجموعات الرئيسية
```

---

## ⚠️ نصائح هامة

### 1. **معالجة الأخطاء**
```javascript
try {
    const result = await saveData('collection', data);
    console.log('نجاح:', result);
} catch (error) {
    console.error('فشل:', error);
    // عرض رسالة للمستخدم
    alert('حدث خطأ، يرجى المحاولة مرة أخرى');
}
```

### 2. **التحقق من البيانات**
```javascript
function validateDoctorData(data) {
    if (!data.name || data.name.trim() === '') {
        return 'الاسم مطلوب';
    }
    if (!data.phone || data.phone.trim() === '') {
        return 'رقم الهاتف مطلوب';
    }
    if (!data.specialty || data.specialty.trim() === '') {
        return 'التخصص مطلوب';
    }
    return null; // لا يوجد خطأ
}
```

### 3. **تحسين الأداء**
```javascript
// استخدام الكاش للبيانات التي لا تتغير كثيرا
const staticData = await getData('doctors', true); // مع كاش

// عدم استخدام الكاش للبيانات التي تتغير باستمرار
const dynamicData = await getData('pending_requests', false); // بدون كاش
```

### 4. **أمان البيانات**
```javascript
// لا تحفظ معلومات حساسة في المتصفح
// استخدم قواعد الأمان في Firebase
// تحقق من صلاحيات المستخدم قبل العمليات
```

---

## 🔗 روابط مفيدة

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Reference](https://firebase.google.com/docs/firestore)
- [JavaScript Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

---

## 📞 للدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من اتصال الإنترنت
2. تأكد من إعدادات Firebase
3. راقب رسائل الخطأ في Console
4. تأكد من صلاحيات الوصول في Firebase Console

---

**ملاحظة:** هذا الدليل مخصص للمبتدئين ويشرح الأساسيات. يمكنك تطوير الكود وإضافة ميزات متقدمة حسب الحاجة.
