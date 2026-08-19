package com.hararah.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

object IntentUtils {

    fun dialPhoneNumber(context: Context, phoneNumber: String) {
        if (phoneNumber.isBlank()) return
        try {
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:${phoneNumber.trim()}")
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "تعذر فتح تطبيق الاتصال", Toast.LENGTH_SHORT).show()
        }
    }

    fun openWhatsApp(context: Context, phoneNumber: String, message: String = "") {
        if (phoneNumber.isBlank()) return
        try {
            val cleanPhone = phoneNumber.replace(Regex("[^0-9+]"), "")
            val formattedPhone = if (!cleanPhone.startsWith("+") && !cleanPhone.startsWith("00")) {
                if (cleanPhone.startsWith("0")) "2$cleanPhone" else "20$cleanPhone"
            } else {
                cleanPhone.trimStart('+')
            }

            val url = "https://wa.me/$formattedPhone${if (message.isNotBlank()) "?text=${Uri.encode(message)}" else ""}"
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                setPackage("com.whatsapp")
            }

            if (intent.resolveActivity(context.packageManager) != null) {
                context.startActivity(intent)
            } else {
                intent.setPackage("com.whatsapp.w4b")
                if (intent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(intent)
                } else {
                    // Fallback to browser
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }
            }
        } catch (e: Exception) {
            Toast.makeText(context, "تطبيق واتساب غير مثبت", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareContent(context: Context, title: String, text: String) {
        try {
            val sendIntent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_TITLE, title)
                putExtra(Intent.EXTRA_TEXT, text)
                type = "text/plain"
            }
            context.startActivity(Intent.createChooser(sendIntent, "مشاركة عبر"))
        } catch (e: Exception) {
            Toast.makeText(context, "تعذر المشاركة", Toast.LENGTH_SHORT).show()
        }
    }
}
