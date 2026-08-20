package com.hararah.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.*
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class WebViewActivity : ComponentActivity() {
    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var lastBackPress = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen(); super.onCreate(savedInstanceState)
        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(-1, -1)
            settings.apply { javaScriptEnabled=true; domStorageEnabled=true; databaseEnabled=true; allowFileAccess=true; allowContentAccess=true; builtInZoomControls=false; displayZoomControls=false; useWideViewPort=true; loadWithOverviewMode=false; mediaPlaybackRequiresUserGesture=false; cacheMode=WebSettings.LOAD_DEFAULT; userAgentString="$userAgentString${Constants.USER_AGENT_SUFFIX}" }
            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
            webViewClient = object: WebViewClient() {
                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) { if(request?.isForMainFrame==true) Toast.makeText(this@WebViewActivity,"تعذر تحميل الموقع. تحقق من اتصال الإنترنت.",Toast.LENGTH_LONG).show(); super.onReceivedError(view,request,error) }
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = handleUrl(request.url)
            }
            webChromeClient = object: WebChromeClient() {
                override fun onShowFileChooser(v: WebView?, callback: ValueCallback<Array<Uri>>?, params: FileChooserParams?): Boolean {
                    filePathCallback?.onReceiveValue(null); filePathCallback=callback
                    val intent=params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply { type="image/*" }
                    intent.addCategory(Intent.CATEGORY_OPENABLE); intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params?.mode==FileChooserParams.MODE_OPEN_MULTIPLE)
                    return try { startActivityForResult(intent,1001); true } catch(_: ActivityNotFoundException) { filePathCallback?.onReceiveValue(null); filePathCallback=null; false }
                }
            }
        }
        setContentView(webView)
        if(savedInstanceState==null) webView.loadUrl(intent.getStringExtra("url") ?: Constants.BASE_URL) else webView.restoreState(savedInstanceState)
        onBackPressedDispatcher.addCallback(this,object: OnBackPressedCallback(true){ override fun handleOnBackPressed(){ if(webView.canGoBack()) webView.goBack() else finish() } })
    }
    private fun handleUrl(uri: Uri): Boolean {
        val scheme=uri.scheme?.lowercase(); val host=uri.host?.lowercase()
        if(scheme=="http"||scheme=="https") { if(Constants.ALLOWED_DOMAINS.any{host==it||host?.endsWith(".$it")==true}) return false; return try{startActivity(Intent(Intent.ACTION_VIEW,uri));true}catch(_:Exception){false} }
        if(scheme in listOf("tel","mailto","geo","whatsapp")) return try{startActivity(Intent(Intent.ACTION_VIEW,uri));true}catch(_:Exception){false}
        return false
    }
    @Deprecated("WebView file chooser compatibility") override fun onActivityResult(requestCode:Int,resultCode:Int,data:Intent?){ if(requestCode==1001){filePathCallback?.onReceiveValue(if(resultCode==RESULT_OK) WebChromeClient.FileChooserParams.parseResult(resultCode,data) else null);filePathCallback=null};super.onActivityResult(requestCode,resultCode,data) }
    override fun onSaveInstanceState(outState:Bundle){webView.saveState(outState);super.onSaveInstanceState(outState)}
    override fun onDestroy(){filePathCallback?.onReceiveValue(null);webView.stopLoading();webView.destroy();super.onDestroy()}
}
