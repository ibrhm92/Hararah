package com.hararah.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.hararah.app.ui.navigation.MainAppScreen
import com.hararah.app.ui.theme.HararahTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        setContent {
            HararahTheme {
                MainAppScreen()
            }
        }
    }
}
