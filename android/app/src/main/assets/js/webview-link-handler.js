/**
 * Hararah App - WebView Bridge & Link Handler
 * ملف مساعدة للتكامل السلس بين واجهة الويب وتطبيق الأندرويد كوتلن (Kotlin)
 */

(function () {
    'use strict';

    const isAndroidApp = () => {
        return Boolean(window.AndroidWebView || navigator.userAgent.includes('HararahApp'));
    };

    const AppBridge = {
        /**
         * فحص ما إذا كان الموقع يعمل داخل تطبيق الأندرويد
         */
        isNativeApp: isAndroidApp(),

        /**
         * فتح التطبيقات الخارجية (واتساب، هاتف، خرائط، بريد، متصفح خارجي)
         * @param {string} type - نوع التطبيق: 'phone', 'whatsapp', 'maps', 'email', 'browser'
         * @param {string} url - الرابط أو رقم الهاتف
         */
        openExternal: function (type, url) {
            if (window.AndroidWebView && typeof window.AndroidWebView.openExternalApp === 'function') {
                window.AndroidWebView.openExternalApp(type, url);
            } else {
                // Fallback للويب العادي
                if (type === 'phone' || type === 'email') {
                    window.location.href = url;
                } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            }
        },

        /**
         * إظهار رسالة Toast سريعة من خلال النظام
         */
        showToast: function (message) {
            if (window.AndroidWebView && typeof window.AndroidWebView.showToast === 'function') {
                window.AndroidWebView.showToast(message);
            } else {
                console.log('Toast:', message);
            }
        },

        /**
         * مشاركة رابط أو نص عبر نافذة المشاركة الأصلية لنظام أندرويد
         */
        share: function (title, text, url) {
            if (window.AndroidWebView && typeof window.AndroidWebView.shareText === 'function') {
                window.AndroidWebView.shareText(title || '', text || '', url || window.location.href);
            } else if (navigator.share) {
                navigator.share({ title, text, url: url || window.location.href }).catch(() => {});
            } else {
                // Fallback نسخ إلى الحافظة
                this.copyToClipboard(url || window.location.href);
                this.showToast('تم نسخ الرابط');
            }
        },

        /**
         * تشغيل اهتزاز لمسي (Haptic Feedback)
         */
        vibrate: function (ms = 50) {
            if (window.AndroidWebView && typeof window.AndroidWebView.vibrate === 'function') {
                window.AndroidWebView.vibrate(ms);
            } else if (navigator.vibrate) {
                navigator.vibrate(ms);
            }
        },

        /**
         * نسخ نص للحافظة
         */
        copyToClipboard: function (text) {
            if (window.AndroidWebView && typeof window.AndroidWebView.copyToClipboard === 'function') {
                window.AndroidWebView.copyToClipboard('Hararah', text);
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            }
        },

        /**
         * التحقق من حالة الإنترنت
         */
        isOnline: function () {
            if (window.AndroidWebView && typeof window.AndroidWebView.isOnline === 'function') {
                return window.AndroidWebView.isOnline();
            }
            return navigator.onLine;
        },

        /**
         * الحصول على إصدار التطبيق
         */
        getVersion: function () {
            if (window.AndroidWebView && typeof window.AndroidWebView.getAppVersion === 'function') {
                return window.AndroidWebView.getAppVersion();
            }
            return 'Web-2.0.2';
        }
    };

    // إتاحة الـ Bridge عالمياً
    window.HararahBridge = AppBridge;

    // إضافة كلاس في الـ body عند العمل داخل التطبيق لتمكين تخصيص الـ CSS إن لزم
    document.addEventListener('DOMContentLoaded', () => {
        if (isAndroidApp()) {
            document.body.classList.add('is-android-app');
        }
    });

})();
