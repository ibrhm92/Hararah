package com.hararah.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.hararah.app.admin.AdminLoginScreen
import com.hararah.app.admin.AdminDashboardScreen
import com.google.firebase.auth.FirebaseAuth

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppEntry() }
    }
    @Composable
    private fun AppEntry() {
        var admin by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
        var loggedIn by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(FirebaseAuth.getInstance().currentUser != null) }
        MaterialTheme {
            if (admin) {
                if (loggedIn) AdminDashboardScreen { FirebaseAuth.getInstance().signOut(); loggedIn=false; admin=false }
                else AdminLoginScreen(onSuccess={ loggedIn=true }, onBack={admin=false})
            } else {
                Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.Center) {
                    Text("قرية حرارة", style=MaterialTheme.typography.headlineLarge)
                    Text("اختر القسم", modifier=Modifier.padding(top=8.dp,bottom=24.dp))
                    Button(onClick={startActivity(Intent(this@MainActivity,WebViewActivity::class.java))}, modifier=Modifier.fillMaxWidth()) { Text("دخول الموقع") }
                    OutlinedButton(onClick={admin=true}, modifier=Modifier.fillMaxWidth().padding(top=12.dp)) { Text("الإدارة") }
                }
            }
        }
    }
}
