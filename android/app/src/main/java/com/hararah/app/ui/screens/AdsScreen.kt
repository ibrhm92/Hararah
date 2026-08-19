package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Payments
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
import com.hararah.app.data.model.Ad
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun AdsScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("الكل") }

    val adCategories = listOf("الكل", "بيع", "شراء", "إيجار", "وظائف", "مفقودات", "أخرى")

    val filteredList = uiState.ads.filter { ad ->
        val matchesSearch = searchQuery.isBlank() ||
                ad.title.contains(searchQuery, ignoreCase = true) ||
                ad.description.contains(searchQuery, ignoreCase = true) ||
                ad.category.contains(searchQuery, ignoreCase = true)

        val matchesCategory = selectedCategory == "الكل" || ad.category.contains(selectedCategory, ignoreCase = true)

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
            placeholder = "ابحث في الإعلانات المحلية..."
        )

        CategoryFilterRow(
            categories = adCategories,
            selectedCategory = selectedCategory,
            onSelectCategory = { selectedCategory = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedCategory != "الكل")
                    "لا توجد إعلانات مطابقة للبحث"
                else
                    "لا توجد إعلانات مبوبة حالياً",
                icon = Icons.Default.Campaign
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { ad ->
                    AdCard(ad = ad)
                }
            }
        }
    }
}

@Composable
fun AdCard(
    ad: Ad,
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
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ad.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    ),
                    modifier = Modifier.weight(1f)
                )
                if (ad.category.isNotBlank()) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Secondary.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = ad.category,
                            color = Secondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            if (ad.image_url.isNotBlank()) {
                AsyncImage(
                    model = ad.image_url,
                    contentDescription = ad.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Text(
                text = ad.description,
                style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                lineHeight = 20.sp
            )

            if (ad.price.isNotBlank()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Payments,
                        contentDescription = null,
                        tint = AccentGreen,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "السعر: ${ad.price}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentGreen
                    )
                }
            }

            ContactActionButtons(
                phone = ad.phone,
                title = ad.title
            )
        }
    }
}
