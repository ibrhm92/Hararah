package com.hararah.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.JsResult
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.hararah.app.databinding.ActivityMainBinding
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    // File Chooser & Camera Variables
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Back Press Double Tap Timer
    private var lastBackPressTime = 0L

    // Network Callback
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    // Activity Result Launcher for Camera/Gallery Image Picker
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null

        if (result.resultCode == Activity.RESULT_OK) {
            val dataString = result.data?.dataString
            val clipData = result.data?.clipData

            if (clipData != null) {
                // Multiple files chosen
                results = Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else if (dataString != null) {
                // Single file chosen from gallery
                results = arrayOf(Uri.parse(dataString))
            } else if (cameraImageUri != null) {
                // Photo taken from camera
                val file = File(cameraImageUri?.path ?: "")
                if (file.exists() && file.length() > 0 || cameraImageUri != null) {
                    results = arrayOf(cameraImageUri!!)
                }
            }
        }

        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    // Permission Launcher for Notifications (Android 13+)
    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            // Permission denied - user can still use the app
        }
    }

    // Permission Launcher for Camera
    private val requestCameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            launchFileChooser()
        } else {
            Toast.makeText(this, R.string.camera_permission_needed, Toast.LENGTH_SHORT).show()
            launchGalleryChooserOnly()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. Splash Screen
        val splashScreen = installSplashScreen()

        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 2. Setup WebView and UI
        setupWebView()
        setupSwipeRefresh()
        setupErrorView()
        setupBackPressedHandler()
        requestNotificationPermission()

        // 3. Handle Initial URL (Deep links or Push notifications)
        val initialUrl = extractTargetUrl(intent) ?: Constants.BASE_URL
        loadPage(initialUrl)

        // 4. Register Network State Listener
        registerNetworkMonitoring()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val targetUrl = extractTargetUrl(intent)
        if (!targetUrl.isNullOrBlank()) {
            loadPage(targetUrl)
        }
    }

    /**
     * استخراج الرابط المستهدف من الـ Intent (سواء كان إشعار أو deep link)
     */
    private fun extractTargetUrl(intent: Intent?): String? {
        if (intent == null) return null

        // From Firebase notification extra
        val extraUrl = intent.getStringExtra("EXTRA_TARGET_URL")
        if (!extraUrl.isNullOrBlank()) {
            return if (extraUrl.startsWith("http")) {
                extraUrl
            } else {
                "${Constants.BASE_URL}/${extraUrl.trimStart('/')}"
            }
        }

        // From Deep Link URI
        intent.data?.let { uri ->
            return uri.toString()
        }

        return null
    }

    /**
     * إعداد كامل للـ WebView وإضافة الجسر البرمجي مع JavaScript
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings: WebSettings = binding.webView.settings

        // Enable JavaScript & Local Storage (Essential for Firebase and SPA)
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true

        // Viewport & Scaling
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.setSupportZoom(false)
        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false

        // File & Content Access
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true

        // Mixed Content (HTTPS + HTTP Assets)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        // Caching Strategy
        webSettings.cacheMode = if (NetworkUtils.isNetworkAvailable(this)) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // Custom User-Agent
        val defaultUserAgent = webSettings.userAgentString
        webSettings.userAgentString = "$defaultUserAgent${Constants.USER_AGENT_SUFFIX}"

        // Cookies
        CookieManager.getInstance().setAcceptCookie(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(binding.webView, true)
        }

        // Add JavaScript Interface (@JavascriptInterface WebAppInterface)
        binding.webView.addJavascriptInterface(
            WebAppInterface(this),
            Constants.JS_INTERFACE_NAME
        )

        // Custom WebViewClient
        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val uri = request?.url ?: return false
                val urlString = uri.toString()
                return handleUrlNavigation(urlString)
            }

            @Suppress("DEPRECATION")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url == null) return false
                return handleUrlNavigation(url)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
                binding.errorView.root.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefreshLayout.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showErrorView()
                }
            }
        }

        // Custom WebChromeClient
        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                binding.progressBar.progress = newProgress
                if (newProgress >= 100) {
                    binding.progressBar.visibility = View.GONE
                } else {
                    binding.progressBar.visibility = View.VISIBLE
                }
            }

            // Support File Chooser & Camera photo upload (<input type="file">)
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                // Check camera permission
                if (ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.CAMERA
                    ) == PackageManager.PERMISSION_GRANTED
                ) {
                    launchFileChooser()
                } else {
                    requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                }

                return true
            }

            // Material JS Alert Dialog
            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                MaterialAlertDialogBuilder(this@MainActivity)
                    .setTitle(R.string.app_name)
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setCancelable(false)
                    .show()
                return true
            }

            // Material JS Confirm Dialog
            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                MaterialAlertDialogBuilder(this@MainActivity)
                    .setTitle(R.string.app_name)
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result?.cancel() }
                    .setCancelable(false)
                    .show()
                return true
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }
        }
    }

    /**
     * معالجة الروابط والتوجيه الذكي (واتساب، هاتف، خرائط، بريد، متصفح خارجي)
     */
    private fun handleUrlNavigation(url: String): Boolean {
        try {
            // 1. Phone Dial Intent (tel:)
            if (url.startsWith("tel:")) {
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                startActivity(intent)
                return true
            }

            // 2. WhatsApp Direct Intent
            if (url.startsWith("whatsapp:") || url.contains("wa.me") || url.contains("api.whatsapp.com")) {
                val cleanUrl = if (url.startsWith("whatsapp://")) {
                    url
                } else {
                    val uri = Uri.parse(url)
                    val phone = uri.lastPathSegment ?: ""
                    "https://wa.me/$phone"
                }
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(cleanUrl))
                intent.setPackage("com.whatsapp")
                if (intent.resolveActivity(packageManager) != null) {
                    startActivity(intent)
                } else {
                    // Try WhatsApp Business or open in browser
                    intent.setPackage("com.whatsapp.w4b")
                    if (intent.resolveActivity(packageManager) != null) {
                        startActivity(intent)
                    } else {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(cleanUrl)))
                    }
                }
                return true
            }

            // 3. Email (mailto:)
            if (url.startsWith("mailto:")) {
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(url))
                startActivity(intent)
                return true
            }

            // 4. Google Maps / Geo
            if (url.startsWith("geo:") || url.contains("maps.google.com") || url.contains("goo.gl/maps")) {
                val mapIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                mapIntent.setPackage("com.google.android.apps.maps")
                if (mapIntent.resolveActivity(packageManager) != null) {
                    startActivity(mapIntent)
                } else {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }
                return true
            }

            // 5. Internal App Navigation (within allowed domains or local assets)
            val uri = Uri.parse(url)
            val host = uri.host
            val isInternal = host != null && Constants.ALLOWED_DOMAINS.any { host.contains(it) }
            val isAsset = url.startsWith("file:///android_asset")

            if (isInternal || isAsset || url.startsWith("#") || url.startsWith("/")) {
                return false // Let WebView load it internally
            }

            // 6. External Links -> Open in System Browser
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(browserIntent)
            return true

        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, R.string.app_not_available, Toast.LENGTH_SHORT).show()
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    /**
     * إطلاق نافذة اختيار الصور مع دعم التقاط صورة بالكاميرا والمعرض
     */
    private fun launchFileChooser() {
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        val photoFile = createImageFile()
        if (photoFile != null) {
            cameraImageUri = FileProvider.getUriForFile(
                this,
                "${applicationContext.packageName}.fileprovider",
                photoFile
            )
            cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
        }

        val galleryIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
        }

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, galleryIntent)
            putExtra(Intent.EXTRA_TITLE, getString(R.string.choose_image_source))
            if (photoFile != null) {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cameraIntent))
            }
        }

        fileChooserLauncher.launch(chooserIntent)
    }

    private fun launchGalleryChooserOnly() {
        val galleryIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
        }
        fileChooserLauncher.launch(Intent.createChooser(galleryIntent, getString(R.string.choose_image_source)))
    }

    private fun createImageFile(): File? {
        return try {
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            File.createTempFile("HARARAH_${timeStamp}_", ".jpg", storageDir)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * إعداد السحب للتحديث (Pull-to-refresh)
     */
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeColors(
            ContextCompat.getColor(this, R.color.secondary),
            ContextCompat.getColor(this, R.color.primary)
        )
        binding.swipeRefreshLayout.setOnRefreshListener {
            if (NetworkUtils.isNetworkAvailable(this)) {
                binding.webView.reload()
            } else {
                binding.swipeRefreshLayout.isRefreshing = false
                showErrorView()
            }
        }

        // Disable swipe refresh when scrolling down inside webview
        binding.webView.viewTreeObserver.addOnScrollChangedListener {
            binding.swipeRefreshLayout.isEnabled = (binding.webView.scrollY == 0)
        }
    }

    /**
     * إعداد واجهة الخطأ عند انقطاع الإنترنت
     */
    private fun setupErrorView() {
        binding.errorView.btnRetry.setOnClickListener {
            if (NetworkUtils.isNetworkAvailable(this)) {
                binding.errorView.root.visibility = View.GONE
                binding.webView.reload()
            } else {
                Toast.makeText(this, R.string.no_internet_title, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showErrorView() {
        binding.errorView.root.visibility = View.VISIBLE
        binding.progressBar.visibility = View.GONE
        binding.swipeRefreshLayout.isRefreshing = false
    }

    /**
     * معالجة زر الرجوع الحديثة (OnBackPressedCallback)
     */
    private fun setupBackPressedHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    val currentTime = System.currentTimeMillis()
                    if (currentTime - lastBackPressTime < Constants.BACK_PRESS_EXIT_INTERVAL) {
                        finish()
                    } else {
                        lastBackPressTime = currentTime
                        Toast.makeText(
                            this@MainActivity,
                            R.string.press_again_to_exit,
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        })
    }

    /**
     * تحميل الصفحة في الـ WebView مع فحص الاتصال
     */
    private fun loadPage(url: String) {
        if (NetworkUtils.isNetworkAvailable(this) || url.startsWith("file:///")) {
            binding.errorView.root.visibility = View.GONE
            binding.webView.loadUrl(url)
        } else {
            showErrorView()
        }
    }

    /**
     * طلب إذن الإشعارات لأجهزة Android 13 (Tiramisu) فما فوق
     */
    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    /**
     * مراقبة حالة الشبكة وإعادة التحميل التلقائي فور عودة الإنترنت
     */
    private fun registerNetworkMonitoring() {
        networkCallback = NetworkUtils.registerNetworkCallback(
            this,
            onNetworkAvailable = {
                runOnUiThread {
                    if (binding.errorView.root.visibility == View.VISIBLE) {
                        binding.errorView.root.visibility = View.GONE
                        binding.webView.reload()
                    }
                }
            },
            onNetworkLost = {
                // Optional handling when network lost
            }
        )
    }

    override fun onDestroy() {
        networkCallback?.let { NetworkUtils.unregisterNetworkCallback(this, it) }
        binding.webView.destroy()
        super.onDestroy()
    }
}
