package com.hararah.app

object Constants {
    /**
     * رابط الموقع الأساسي للتطبيق.
     * يمكنك استخدام رابط الاستضافة (Firebase Hosting) أو الرابط المحلي للأصول.
     * أمثلة:
     * - "https://hararah-34d17.web.app"
     * - "https://hararah-34d17.firebaseapp.com"
     * - "file:///android_asset/index.html" (إذا كنت تريد تضمين الملفات داخل التطبيق)
     */
    const val BASE_URL = "https://hararah-34d17.web.app"

    /**
     * قائمة النطاقات الداخلية المسموح بتصفحها داخل الـ WebView.
     */
    val ALLOWED_DOMAINS = listOf(
        "hararah-34d17.web.app",
        "hararah-34d17.firebaseapp.com",
        "localhost"
    )

    /**
     * اسم الواجهة البرمجية لـ JavaScript في تطبيق الويب
     */
    const val JS_INTERFACE_NAME = "AndroidWebView"

    /**
     * اللاحقة المضافة لمعرف المتصفح (User Agent) للتعرف على التطبيق من داخل كود الويب
     */
    const val USER_AGENT_SUFFIX = " HararahApp/1.0.0"

    /**
     * إعدادات قناة الإشعارات (Notification Channel)
     */
    const val NOTIFICATION_CHANNEL_ID = "hararah_village_channel"
    const val NOTIFICATION_CHANNEL_NAME = "تنبيهات وأخبار قرية حرارة"
    const val NOTIFICATION_CHANNEL_DESC = "إشعارات الخدمات، المحلات، العروض والأخبار الجديدة"
    const val NOTIFICATION_ID = 1001

    /**
     * زمن مهلة النقر المزدوج للخروج بالمللي ثانية
     */
    const val BACK_PRESS_EXIT_INTERVAL = 2000L
}
