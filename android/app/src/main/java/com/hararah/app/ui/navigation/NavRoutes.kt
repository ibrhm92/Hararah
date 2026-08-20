package com.hararah.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.hararah.app.ui.screens.*

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    data object Home : Screen("home", "الرئيسية", Icons.Default.Home)
    data object News : Screen("news", "الأخبار", Icons.Default.Newspaper)
    data object Services : Screen("services", "الخدمات", Icons.Default.MiscellaneousServices)
    data object Emergency : Screen("emergency", "الطوارئ", Icons.Default.Emergency)
    data object More : Screen("more", "المزيد", Icons.Default.Menu)
}

@Composable
fun HararahNavigation(navController: NavHostController = rememberNavController()) {
    val items = listOf(Screen.Home, Screen.News, Screen.Services, Screen.Emergency, Screen.More)
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title, fontSize = 11.sp) }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Home.route) { HomeScreen(navController) }
            composable(Screen.News.route) { NewsScreen(navController) }
            composable(Screen.Services.route) { ServicesScreen(navController) }
            composable(Screen.Emergency.route) { EmergencyScreen(navController) }
            composable(Screen.More.route) { MoreScreen(navController) }
        }
    }
}
