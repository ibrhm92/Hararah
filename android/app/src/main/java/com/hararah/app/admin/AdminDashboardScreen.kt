package com.hararah.app.admin

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth

@Composable
fun AdminDashboardScreen(onLogout: () -> Unit) {
    val auth = FirebaseAuth.getInstance()
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text("لوحة التحكم", style = MaterialTheme.typography.headlineMedium); Text("إدارة قرية حرارة") }
            IconButton(onClick = { auth.signOut(); onLogout() }) { Icon(Icons.Default.Logout, "تسجيل الخروج") }
        }
        Spacer(Modifier.height(24.dp))
        Text("مرحبًا ${auth.currentUser?.email ?: "المدير"}", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(16.dp))
        Text("تم تسجيل الدخول إلى لوحة الإدارة من تطبيق Android.")
        Spacer(Modifier.height(20.dp))
        Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(18.dp)) { Text("الإدارة الأصلية", style = MaterialTheme.typography.titleMedium); Text("يمكن إضافة أقسام الإدارة وربطها مباشرة بـFirestore هنا دون استخدام WebView.", modifier = Modifier.padding(top = 8.dp)) } }
    }
}
