package com.hararah.app

object Constants {
    /**
     * رابط الموقع الرسمي الذي يتم عرضه داخل تطبيق الهاتف.
     * استخدام نفس الـWeb App يضمن تطابق التصميم والوظائف والبيانات مع نسخة الويب.
     */
    const val BASE_URL = "https://hararah-34d17.web.app/"

    /**
     * النطاقات التي يمكن إبقاؤها داخل WebView.
     */
    val ALLOWED_DOMAINS = listOf(
        "hararah-34d17.web.app",
        "hararah-34d17.firebaseapp.com"
    )

    const val JS_INTERFACE_NAME = "AndroidWebView"
    const val USER_AGENT_SUFFIX = " HararahApp/2.0.0"

    const val NOTIFICATION_CHANNEL_ID = "hararah_village_channel"
    const val NOTIFICATION_CHANNEL_NAME = "تنبيهات وأخبار قرية حرارة"
    const val NOTIFICATION_CHANNEL_DESC = "إشعارات الخدمات، المحلات، العروض والأخبار الجديدة"
    const val NOTIFICATION_ID = 1001

    const val BACK_PRESS_EXIT_INTERVAL = 2000L
}
