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
import com.hararah.app.ui.components.HararahTopBar
import com.hararah.app.ui.screens.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahViewModel

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    object Home : BottomNavItem("home", "الرئيسية", Icons.Default.Home)
    object Craftsmen : BottomNavItem("craftsmen", "الصنايعية", Icons.Default.Build)
    object Shops : BottomNavItem("shops", "المحلات", Icons.Default.Storefront)
    object Doctors : BottomNavItem("doctors", "العيادات", Icons.Default.MedicalServices)
    object News : BottomNavItem("news", "الأخبار", Icons.Default.Newspaper)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(
    viewModel: HararahViewModel = viewModel()
) {
    val navController = rememberNavController()
    val uiState by viewModel.uiState.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "home"

    val bottomNavItems = listOf(
        BottomNavItem.Home,
        BottomNavItem.Craftsmen,
        BottomNavItem.Shops,
        BottomNavItem.Doctors,
        BottomNavItem.News
    )

    val currentTitle = when (currentRoute) {
        "home" -> "قرية حرارة"
        "craftsmen" -> "الصنايعية والخدمات"
        "shops" -> "المحلات التجارية"
        "doctors" -> "الأطباء والعيادات"
        "machines" -> "الآلات الزراعية"
        "offers" -> "العروض والتخفيضات"
        "ads" -> "الإعلانات المحلية"
        "news" -> "الأخبار والتنبيهات"
        "emergency" -> "أرقام الطوارئ"
        "submit_service" -> "تقديم طلب خدمة"
        else -> "قرية حرارة"
    }

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        topBar = {
            HararahTopBar(
                title = currentTitle,
                subtitle = if (currentRoute == "home") "خدمات القرية الذكية" else "قرية حرارة",
                onRefresh = { viewModel.refreshData() }
            )
        },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = SurfaceLight,
                    tonalElevation = 8.dp
                ) {
                    bottomNavItems.forEach { item ->
                        val isSelected = currentRoute == item.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.title
                                )
                            },
                            label = {
                                Text(
                                    text = item.title,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 11.sp
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Secondary,
                                selectedTextColor = Secondary,
                                indicatorColor = Secondary.copy(alpha = 0.15f),
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )
                    }
                }
            }
        },
        floatingActionButton = {
            if (currentRoute != "submit_service") {
                ExtendedFloatingActionButton(
                    onClick = { navController.navigate("submit_service") },
                    containerColor = Secondary,
                    contentColor = Color.White,
                    shape = RoundedCornerShape(16.dp),
                    elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp)
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = "أضف خدمتك")
                    Text(text = " أضف خدمتك", fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") {
                HomeScreen(
                    uiState = uiState,
                    onNavigateToRoute = { route -> navController.navigate(route) }
                )
            }
            composable("craftsmen") {
                CraftsmenScreen(uiState = uiState)
            }
            composable("shops") {
                ShopsScreen(uiState = uiState)
            }
            composable("doctors") {
                DoctorsScreen(uiState = uiState)
            }
            composable("machines") {
                MachinesScreen(uiState = uiState)
            }
            composable("offers") {
                OffersScreen(uiState = uiState)
            }
            composable("ads") {
                AdsScreen(uiState = uiState)
            }
            composable("news") {
                NewsScreen(uiState = uiState)
            }
            composable("emergency") {
                EmergencyScreen(uiState = uiState)
            }
            composable("submit_service") {
                SubmitServiceScreen(
                    viewModel = viewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}
