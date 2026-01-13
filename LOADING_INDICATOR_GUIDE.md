# دليل مؤشر التحميل - Loading Indicator Guide

## 📋 المحتويات
- [الوصف](#الوصف)
- [الميزات](#الميزات)
- [التنفيذ](#التنفيذ)
- [الاستخدام](#الاستخدام)
- [التخصيص](#التخصيص)

---

## الوصف

تم إضافة مؤشر تحميل شامل (Loading Indicator) لموقع قرية حرارة. عند الضغط على أي رابط أو زر، يظهر مؤشر تحميل يتضمن دوّار دوّار ورسالة "جاري التحميل..." حتى يتم تحميل المحتوى المطلوب.

---

## الميزات

✅ **مؤشر تحميل عام**: يظهر تلقائياً عند الضغط على أي رابط أو زر  
✅ **رسالة واضحة**: تعرض "جاري التحميل..." باللغة العربية  
✅ **دوّار متحرك**: أيقونة تدور لتشير إلى عملية التحميل  
✅ **خلفية شفافة**: خلفية داكنة بنصفية 40% مع blur effect  
✅ **إخفاء تلقائي**: يختفي تلقائياً بعد انتهاء التحميل أو بعد انتظار محدد  
✅ **حركات سلسة**: انتقالات مرئية ناعمة عند الظهور والاختفاء  
✅ **دعم جميع الصفحات**: يعمل في `index.html` و `admin.html`

---

## التنفيذ

### 1. HTML (إضافة العنصر)
تم إضافة div بمعرف `pageLoadingOverlay` في كلا الملفات:

```html
<div id="pageLoadingOverlay" class="page-loading-overlay" style="display: none;">
    <div class="page-loading-spinner">
        <div class="spinner"></div>
        <p>جاري التحميل...</p>
    </div>
</div>
```

### 2. CSS (التنميط)
تم إضافة الأنماط في `styles.css`:

```css
/* Page Loading Overlay */
.page-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: calc(var(--z-modal) - 10);
    backdrop-filter: blur(3px);
    animation: fadeIn 0.2s ease-out;
}

.page-loading-spinner {
    background: white;
    padding: 2rem 3rem;
    border-radius: var(--radius-lg);
    text-align: center;
    box-shadow: var(--shadow-xl);
    animation: slideUp 0.3s ease-out;
}

.page-loading-spinner .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
}
```

### 3. JavaScript (الوظائف)
تم إضافة ثلاث وظائف رئيسية:

#### أ) `showLoadingOverlay()`
```javascript
function showLoadingOverlay() {
    const overlay = document.getElementById('pageLoadingOverlay');
    if (overlay) {
        overlay.classList.remove('hide');
        overlay.classList.add('show');
        overlay.style.display = 'flex';
    }
}
```

#### ب) `hideLoadingOverlay()`
```javascript
function hideLoadingOverlay() {
    const overlay = document.getElementById('pageLoadingOverlay');
    if (overlay) {
        overlay.classList.add('hide');
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}
```

#### ج) `autoHideLoading(duration)`
```javascript
function autoHideLoading(duration = 3000) {
    if (loadingTimer) {
        clearTimeout(loadingTimer);
    }
    loadingTimer = setTimeout(() => {
        hideLoadingOverlay();
    }, duration);
}
```

---

## الاستخدام

### استخدام أساسي

1. **عند الضغط على رابط/زر داخلي**:
   ```javascript
   navigateToPage('craftsmen');  // يظهر مؤشر التحميل تلقائياً
   ```

2. **في وظائف مخصصة**:
   ```javascript
   showLoadingOverlay();  // إظهار المؤشر
   // ... قم بعملية التحميل ...
   hideLoadingOverlay();  // إخفاء المؤشر
   ```

3. **مع انتظار محدد**:
   ```javascript
   showLoadingOverlay();
   autoHideLoading(2000);  // إخفاء تلقائياً بعد ثانيتين
   ```

### أمثلة الاستخدام

#### مثال 1: عند النقر على رابط في القائمة
```html
<a href="#" data-page="craftsmen" class="nav-link">
    <i class="fas fa-tools"></i>
    <span>الصنايعية والخدمات</span>
</a>
<!-- سيظهر المؤشر تلقائياً عند الضغط -->
```

#### مثال 2: عند النقر على زر
```html
<button onclick="loadData()">تحميل البيانات</button>

<script>
function loadData() {
    showLoadingOverlay();
    autoHideLoading(3000);
    // ... بعد التحميل ...
    // hideLoadingOverlay(); // أو الإخفاء اليدوي
}
</script>
```

---

## التخصيص

### تغيير وقت الانتظار
```javascript
autoHideLoading(5000);  // 5 ثواني بدلاً من 3
```

### تغيير الرسالة
في `index.html` أو `admin.html`:
```html
<p>جاري تحميل البيانات...</p>
```

### تغيير الألوان
في `styles.css`:
```css
.page-loading-spinner {
    background: #your-color;
}

.page-loading-spinner .spinner {
    border-top: 4px solid #your-color;
}
```

### تعطيل المؤشر لأزرار معينة
```html
<button class="no-loading">هذا الزر لن يظهر المؤشر</button>
```

---

## الملفات المعدلة

✅ `index.html` - إضافة عنصر HTML  
✅ `admin.html` - إضافة عنصر HTML  
✅ `styles.css` - إضافة أنماط CSS  
✅ `script-firebase-complete.js` - إضافة الوظائف والمعالجات  
✅ `script-firebase-fixed.js` - إضافة الوظائف والمعالجات

---

## ملاحظات تقنية

- **Z-Index**: تم تعيين قيمة `z-index` أعلى من باقي العناصر لضمان ظهور المؤشر فوق كل شيء
- **Backdrop Filter**: استخدام `blur(3px)` لإضفاء تأثير احترافي على الخلفية
- **Animations**: تم استخدام keyframes CSS للحركات السلسة والطبيعية
- **Performance**: تم استخدام `closest()` للتعامل الفعال مع الأحداث المندرجة (event delegation)

---

## دعم المتصفحات

يعمل مع:
- ✅ Chrome/Chromium (88+)
- ✅ Firefox (87+)
- ✅ Safari (14+)
- ✅ Edge (88+)
- ✅ متصفحات الهاتف الذكي الحديثة

---

## الأسئلة الشائعة

**س: هل المؤشر يظهر فقط عند تحميل الصفحات؟**  
ج: لا، يظهر عند الضغط على أي رابط أو زر. لكن يمكن تقييد ذلك بإضافة class `no-loading` على الزر.

**س: كيف أمنع المؤشر من الظهور لزر معين؟**  
ج: أضف class `no-loading` للزر:
```html
<button class="no-loading">لا تظهر مؤشر</button>
```

**س: هل يعمل مع الروابط الخارجية؟**  
ج: لا، المؤشر مخصص للروابط الداخلية فقط (التي لا تبدأ بـ `http` أو `tel` أو `mailto`).

---

## الدعم والتطوير

للمساهمة في تحسين مؤشر التحميل:
1. عدّل الأنماط في `styles.css`
2. عدّل الوظائف في `script-firebase-complete.js` أو `script-firebase-fixed.js`
3. اختبر التعديلات على جميع الصفحات

---

## الإصدار

📅 تم الإنشاء: يناير 2026  
✍️ الحالة: نشط وجاهز للاستخدام
