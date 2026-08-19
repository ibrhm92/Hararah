package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.hararah.app.data.model.VillageNews
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.utils.IntentUtils
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun NewsScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("الكل") }

    val categories = listOf("الكل", "تنبيه هام", "مناسبات", "خدمات", "وفيات", "عام")

    val filteredList = uiState.news.filter { news ->
        val matchesSearch = searchQuery.isBlank() ||
                news.title.contains(searchQuery, ignoreCase = true) ||
                news.content.contains(searchQuery, ignoreCase = true)

        val matchesCategory = selectedCategory == "الكل" || news.category.contains(selectedCategory, ignoreCase = true)

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
            placeholder = "ابحث في أخبار وتنبيهات القرية..."
        )

        CategoryFilterRow(
            categories = categories,
            selectedCategory = selectedCategory,
            onSelectCategory = { selectedCategory = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedCategory != "الكل")
                    "لا توجد أخبار مطابقة للبحث"
                else
                    "لا توجد أخبار منشورة حالياً",
                icon = Icons.Default.Newspaper
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { news ->
                    NewsItemCard(news = news)
                }
            }
        }
    }
}

@Composable
fun NewsItemCard(
    news: VillageNews,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val categoryColor = when (news.category) {
        "تنبيه هام" -> AccentRed
        "وفيات" -> Primary
        "مناسبات" -> AccentGreen
        else -> Secondary
    }

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
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = categoryColor.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = news.category.ifBlank { "خبر محلي" },
                        color = categoryColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                if (news.date.isNotBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Schedule, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
                        Text(text = news.date, fontSize = 11.sp, color = TextMuted)
                    }
                }
            }

            Text(
                text = news.title,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            )

            if (news.image_url.isNotBlank()) {
                AsyncImage(
                    model = news.image_url,
                    contentDescription = news.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Text(
                text = news.content,
                style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                lineHeight = 22.sp
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(
                    onClick = {
                        IntentUtils.shareContent(
                            context,
                            title = news.title,
                            text = "${news.title}\n\n${news.content}\n\nتطبيق قرية حرارة"
                        )
                    }
                ) {
                    Icon(imageVector = Icons.Default.Share, contentDescription = "مشاركة", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "مشاركة الخبر", fontSize = 13.sp)
                }
            }
        }
    }
}
