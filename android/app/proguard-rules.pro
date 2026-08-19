# Keep JavascriptInterface methods
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebAppInterface
-keep class com.hararah.app.WebAppInterface {
    <methods>;
}

# Keep Firebase models and services
-keepattributes Signature
-keepattributes InnerClasses
-dontwarn com.google.firebase.**
