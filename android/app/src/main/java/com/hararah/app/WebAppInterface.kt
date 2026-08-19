package com.hararah.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast
import java.net.URLEncoder

class WebAppInterface(private val activity: MainActivity) {

    /**
     * فتح التطبيقات الخارجية (واتساب، الهاتف، الخرائط، البريد، المتصفح الخارجي)
     * متوافق مع الاستدعاء الموجود في script-firebase-fixed.js
     */
    @JavascriptInterface
    fun openExternalApp(type: String?, url: String?) {
        if (url.isNullOrBlank()) return

        activity.runOnUiThread {
            try {
                when (type?.lowercase()) {
                    "phone", "tel" -> {
                        val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                            data = if (url.startsWith("tel:")) Uri.parse(url) else Uri.parse("tel:$url")
                        }
                        activity.startActivity(dialIntent)
                    }

                    "whatsapp" -> {
                        openWhatsApp(url)
                    }

                    "maps", "geo" -> {
                        val mapIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                            setPackage("com.google.android.apps.maps")
                        }
                        if (mapIntent.resolveActivity(activity.packageManager) != null) {
                            activity.startActivity(mapIntent)
                        } else {
                            // Fallback to standard browser view
                            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        }
                    }

                    "email", "mailto" -> {
                        val emailIntent = Intent(Intent.ACTION_SENDTO).apply {
                            data = if (url.startsWith("mailto:")) Uri.parse(url) else Uri.parse("mailto:$url")
                        }
                        activity.startActivity(emailIntent)
                    }

                    "browser", "external" -> {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        activity.startActivity(browserIntent)
                    }

                    else -> {
                        val genericIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        activity.startActivity(genericIntent)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showToast(activity.getString(R.string.app_not_available))
            }
        }
    }

    /**
     * معالجة فتح واتساب مباشرة سواء كان رقماً أو رابطاً
     */
    private fun openWhatsApp(target: String) {
        try {
            val finalUrl = when {
                target.startsWith("https://wa.me/") || target.startsWith("https://api.whatsapp.com/") -> target
                target.startsWith("whatsapp://") -> target
                else -> {
                    val cleanPhone = target.replace(Regex("[^0-9+]"), "")
                    "https://wa.me/$cleanPhone"
                }
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(finalUrl)
                setPackage("com.whatsapp")
            }

            // Check if WhatsApp is installed
            if (intent.resolveActivity(activity.packageManager) != null) {
                activity.startActivity(intent)
            } else {
                // Try WhatsApp Business
                intent.setPackage("com.whatsapp.w4b")
                if (intent.resolveActivity(activity.packageManager) != null) {
                    activity.startActivity(intent)
                } else {
                    // Fallback to browser
                    val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(finalUrl))
                    activity.startActivity(webIntent)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            showToast(activity.getString(R.string.whatsapp_not_installed))
        }
    }

    /**
     * إظهار إشعار Toast محلي على الشاشة
     */
    @JavascriptInterface
    fun showToast(message: String?) {
        if (message.isNullOrBlank()) return
        activity.runOnUiThread {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * مشاركة نصوص وروابط عبر نافذة المشاركة الأصلية لنظام أندرويد
     */
    @JavascriptInterface
    fun shareText(title: String?, text: String?, url: String?) {
        activity.runOnUiThread {
            try {
                val fullText = buildString {
                    if (!title.isNullOrBlank()) appendLine(title)
                    if (!text.isNullOrBlank()) appendLine(text)
                    if (!url.isNullOrBlank()) appendLine(url)
                }.trim()

                val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TEXT, fullText)
                    if (!title.isNullOrBlank()) {
                        putExtra(Intent.EXTRA_SUBJECT, title)
                    }
                    type = "text/plain"
                }
                val shareIntent = Intent.createChooser(sendIntent, title ?: "مشاركة")
                activity.startActivity(shareIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * تشغيل اهتزاز خفيف (Haptic Feedback)
     */
    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            val duration = if (durationMs in 1..2000) durationMs else 100L
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager =
                    activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(
                        VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    vibrator?.vibrate(duration)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * نسخ نص إلى الحافظة
     */
    @JavascriptInterface
    fun copyToClipboard(label: String?, text: String?) {
        if (text.isNullOrBlank()) return
        activity.runOnUiThread {
            try {
                val clipboard =
                    activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText(label ?: "Copied Text", text)
                clipboard.setPrimaryClip(clip)
                showToast("تم النسخ إلى الحافظة")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * فحص حالة الإنترنت من داخل كود JavaScript
     */
    @JavascriptInterface
    fun isOnline(): Boolean {
        return NetworkUtils.isNetworkAvailable(activity)
    }

    /**
     * الحصول على رقم إصدار التطبيق
     */
    @JavascriptInterface
    fun getAppVersion(): String {
        return try {
            val pInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
            pInfo.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }
}
