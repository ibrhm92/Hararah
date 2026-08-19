# 📱 دليل مشروع تطبيق أندرويد كوتلن (Hararah Android Kotlin App)

تم بناء تطبيق أندرويد متكامل واحترافي بلغة **Kotlin** لتشغيل موقع **قرية حرارة** مع دمج إمكانيات النظام الأصلية (Native Features).

---

## 🌟 مميزات التطبيق المدمجة

1. **لغة كوتلن الحديثة (Modern Kotlin & Gradle Kotlin DSL)**:
   - مبني بالكامل على `build.gradle.kts` مع أحدث مكتبات `AndroidX` و `Material Components`.
   - متوافق مع أحدث إصدارات أندرويد (Target SDK 34 / Android 14/15) مع دعم واسع يبدأ من Android 7.0 (API 24).

2. **شاشة بداية حديثة (Modern SplashScreen API)**:
   - استخدام `androidx.core:core-splashscreen` لشاشة افتتاحية سلسة وفورية.

3. **التعامل الذكي مع الروابط والتطبيقات الخارجية**:
   - **واتساب**: فتح محادثات واتساب وتطبيق WhatsApp Business مباشرة عند النقر على روابط واتساب أو أرقام الهواتف.
   - **الاتصال الهاتفي**: فتح واجهة الاتصال فوراً عند النقر على روابط `tel:`.
   - **خرائط جوجل**: فتح تطبيق الخرائط مباشرة لروابط العناوين والمواقع `geo:`.
   - **البريد الإلكتروني**: فتح تطبيق البريد لروابط `mailto:`.
   - **الروابط الخارجية**: فتحها في متصفح النظام للحفاظ على أمان المستخدم.

4. **دعم كامل لرفع الصور والكاميرا (`onShowFileChooser`)**:
   - نافذة اختيار تتيح التقاط صورة جديدة بالكاميرا أو اختيار صور من المعرض/الملفات (مطلوبة لتقديم طلبات الخدمات والإعلانات).
   - إدارة الصلاحيات (`CAMERA`, `READ_MEDIA_IMAGES`) وفق معايير أمان أندرويد الحديثة.

5. **شاشة انقطاع الإنترنت التفاعلية (Offline Screen)**:
   - واجهة مخصصة تظهر عند غياب الاتصال بالإنترنت مع زر "إعادة المحاولة".
   - مراقبة تلقائية للشبكة (`NetworkUtils`) لإعادة تحميل الصفحة فور عودة الاتصال دون تدخل المستخدم.

6. **التحديث بالسحب (Swipe-to-Refresh)**:
   - إمكانية سحب الشاشة لأسفل لتحديث البيانات في أي وقت.

7. **إشعارات فايربيس السحابية (Firebase Cloud Messaging - FCM)**:
   - استقبال إشعارات فورية عن الأخبار والعروض والخدمات الجديدة عبر `MyFirebaseMessagingService`.
   - إنشاء قنوات الإشعارات (Notification Channels) المتوافقة مع أندرويد 8 وما بعده.
   - دعم التوجيه المباشر (Deep Linking) للصفحة المعنية عند الضغط على الإشعار.

8. **جسر التواصل البرمجي (JavaScript Bridge)**:
   - واجهة `window.AndroidWebView` تتيح للموقع استدعاء وظائف أصلية مثل:
     - `showToast(msg)`: عرض تنبيه سريع على شاشة الهاتف.
     - `shareText(title, text, url)`: فتح نافذة المشاركة الأصلية في أندرويد.
     - `vibrate(ms)`: اهتزاز لمسي (Haptic Feedback).
     - `copyToClipboard(label, text)`: نسخ النصوص للحافظة.
     - `isOnline()`: التحقق من اتصال الهاتف بالإنترنت.

9. **التحكم بزر الرجوع (Back Navigation)**:
   - الرجوع بين صفحات الموقع بسلاسة، وفي حال الوصول للرئيسية يتطلب الضغط مرتين للخروج منعاً للإغلاق بالخطأ.

---

## 📁 هيكل مجلد الأندرويد (`android/`)

```
android/
├── build.gradle.kts                 # إعدادات البناء الرئيسية
├── settings.gradle.kts              # إعدادات المشروع والموديولات
├── gradle.properties                # خصائص بيئة Gradle
└── app/
    ├── build.gradle.kts             # إعدادات تطبيق الأندرويد والتبعيات
    ├── proguard-rules.pro           # قواعد حماية وضغط الكود
    └── src/
        └── main/
            ├── AndroidManifest.xml  # ملف البيان والصلاحيات
            ├── java/com/hararah/app/
            │   ├── Constants.kt                   # الإعدادات والثوابت والروابط
            │   ├── MainActivity.kt                # النشاط الرئيسي وإدارة WebView
            │   ├── WebAppInterface.kt             # جسر JavaScript مع Kotlin
            │   ├── MyFirebaseMessagingService.kt  # خدمة الإشعارات السحابية
            │   └── NetworkUtils.kt                # فحص ومراقبة حالة الإنترنت
            └── res/
                ├── drawable/                      # الأيقونات والرسومات المتجهة
                ├── layout/
                │   ├── activity_main.xml          # تصميم الشاشة الرئيسية
                │   └── layout_error_view.xml      # تصميم شاشة انقطاع الإنترنت
                ├── mipmap-anydpi-v26/             # أيقونة التطبيق التكيفية
                ├── values/
                │   ├── colors.xml                 # ألوان التطبيق
                │   ├── strings.xml                # النصوص والترجمات
                │   └── themes.xml                 # ثيم التطبيق وشاشة البداية
                └── xml/
                    ├── file_paths.xml             # مسارات FileProvider لمشاركة الصور
                    ├── network_security_config.xml# إعدادات أمان الشبكة
                    ├── backup_rules.xml           # قواعد النسخ الاحتياطي
                    └── data_extraction_rules.xml  # قواعد استخراج البيانات
```

---

## 🚀 كيفية تشغيل المشروع في Android Studio

### الخطوة 1: فتح المشروع
1. افتح برنامج **Android Studio** (نسخة Hedgehog / Iguana / Jellyfish أو أحدث).
2. اختر **Open** ثم توجه إلى مجلد المشروع واختر مجلد `android`.
3. انتظر حتى يكتمل فحص ومزامنة ملفات Gradle (`Gradle Sync`).

### الخطوة 2: ربط Firebase (ملف `google-services.json`)
1. توجه إلى [Firebase Console](https://console.firebase.google.com/).
2. افتح مشروعك الخاص بقرية حرارة (`hararah-34d17`).
3. اضغط على **Add App** واختر **Android**.
4. أدخل Package Name: `com.hararah.app`.
5. حمّل ملف `google-services.json` وضعه داخل المسار:
   `android/app/google-services.json`

### الخطوة 3: التشغيل والتجربة
1. قم بتوصيل هاتف أندرويد حقيقي عبر USB مع تفعيل `USB Debugging`، أو أنشئ جهازاً افتراضياً (Android Emulator).
2. اضغط على زر **Run** (الأيقونة الخضراء ▶) في أعلى شريط Android Studio.

---

## 🛠️ التخصيص والتعديل

### 1. تغيير رابط الموقع
افتح الملف:
[`android/app/src/main/java/com/hararah/app/Constants.kt`](file:///home/ibrhm/GitHub/Hararah/android/app/src/main/java/com/hararah/app/Constants.kt)
وقم بتعديل `BASE_URL`:
```kotlin
const val BASE_URL = "https://hararah-34d17.web.app"
```

### 2. تغيير اسم التطبيق
افتح الملف:
[`android/app/src/main/res/values/strings.xml`](file:///home/ibrhm/GitHub/Hararah/android/app/src/main/res/values/strings.xml)
وعدل قيمة `app_name`:
```xml
<string name="app_name">قرية حرارة</string>
```

### 3. تغيير ألوان التطبيق
افتح الملف:
[`android/app/src/main/res/values/colors.xml`](file:///home/ibrhm/GitHub/Hararah/android/app/src/main/res/values/colors.xml)

---

## 📦 إنشاء ملف التثبيت النهائي (APK / AAB)

### الطريقة 1: عبر GitHub Actions تلقائياً (بدون الحاجة لتثبيت Android Studio)
تم إعداد Workflow جاهز في [`.github/workflows/build-apk.yml`](file:///.github/workflows/build-apk.yml):
1. عند عمل **Push** لأي كود جديد على فرع `main` أو `master`، سيبدأ البناء تلقائياً.
2. يمكنك أيضاً تشغيله يدوياً:
   - اذهب إلى تبويب **Actions** في صفحة مستودع GitHub الخاص بك.
   - اختر **Build Android APK** من القائمة اليسرى.
   - اضغط على **Run workflow** واختر نوع النسخة (Debug أو Release أو All).
3. بعد انتهاء البناء (يستغرق حوالي دقيقة إلى دقيقتين)، ستجد ملف الـ APK جاهزاً للتحميل باسم **Hararah-Village-APK** أسفل ملخص التشغيل في قسم **Artifacts**.

---

### الطريقة 2: عبر Android Studio يدوياً
1. من القائمة العلوية في Android Studio، اختر:
   `Build` > `Generate Signed Bundle / APK...`
2. اختر:
   - **Android App Bundle (AAB)**: للنشر على متجر Google Play.
   - **APK**: للتوزيع المباشر والتثبيت على الهواتف.
3. اختر مفتاح التوقيع (KeyStore) أو أنشئ مفتاحاً جديداً عبر `Create new...`.
4. اختر وضع البناء **Release** واضغط على **Finish**.
5. ستجد ملف الـ APK النهائي جاهزاً في مجلد `android/app/release/`.

