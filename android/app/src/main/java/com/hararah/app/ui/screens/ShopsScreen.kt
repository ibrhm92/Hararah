package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.hararah.app.data.model.Shop
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun ShopsScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("الكل") }

    val shopCategories = listOf(
        "الكل", "سوبر ماركت", "خضار وفواكه", "جزارة", "أسماك", "دواجن",
        "مخبز وحلواني", "صيدلية", "ملابس وأحذية", "أدوات منزلية", "أجهزة كهربائية",
        "محمول وإلكترونيات", "قطع غيار", "حدايد وبويات", "أعلاف وحبوب", "أخرى"
    )

    val filteredList = uiState.shops.filter { shop ->
        val matchesSearch = searchQuery.isBlank() ||
                shop.name.contains(searchQuery, ignoreCase = true) ||
                shop.category.contains(searchQuery, ignoreCase = true) ||
                shop.address.contains(searchQuery, ignoreCase = true)

        val matchesCategory = selectedCategory == "الكل" || shop.category.contains(selectedCategory, ignoreCase = true)

        matchesSearch && matchesCategory
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث عن محل أو نشاط تجاري..."
        )

        CategoryFilterRow(
            categories = shopCategories,
            selectedCategory = selectedCategory,
            onSelectCategory = { selectedCategory = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedCategory != "الكل")
                    "لا توجد محلات مطابقة للبحث"
                else
                    "لا توجد محلات مسجلة حالياً",
                icon = Icons.Default.Storefront
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { shop ->
                    ShopCard(shop = shop)
                }
            }
        }
    }
}

@Composable
fun ShopCard(
    shop: Shop,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceLight),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (shop.image_url.isNotBlank()) {
                    AsyncImage(
                        model = shop.image_url,
                        contentDescription = shop.name,
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Secondary.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Storefront,
                            contentDescription = null,
                            tint = Secondary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = shop.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Secondary.copy(alpha = 0.1f)
                        ) {
                            Text(
                                text = shop.category.ifBlank { "محل تجاري" },
                                color = Secondary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        if (shop.delivery) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = AccentGreen.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "يوجد توصيل 🛵",
                                    color = AccentGreen,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }

            if (shop.address.isNotBlank()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(text = shop.address, fontSize = 12.sp, color = TextSecondary)
                }
            }

            if (shop.working_hours.isNotBlank()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(text = "مواعيد العمل: ${shop.working_hours}", fontSize = 12.sp, color = TextSecondary)
                }
            }

            ContactActionButtons(
                phone = shop.phone,
                title = "${shop.name} - ${shop.category}"
            )
        }
    }
}
