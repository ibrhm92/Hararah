package com.hararah.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.hararah.app.ui.screens.AdminScreen

private const val ADMIN_ROUTE = "admin"

@Composable
fun HararahNavigation(navController: NavHostController = rememberNavController()) {
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = navController.currentDestination?.route == ADMIN_ROUTE,
                    onClick = {
                        navController.navigate(ADMIN_ROUTE) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = "الإدارة") },
                    label = { Text("الإدارة") }
                )
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = ADMIN_ROUTE,
            modifier = Modifier.padding(padding)
        ) {
            composable(ADMIN_ROUTE) { AdminScreen() }
        }
    }
}
