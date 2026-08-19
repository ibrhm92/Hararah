package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
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
import com.hararah.app.data.model.Craftsman
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun CraftsmenScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCraft by remember { mutableStateOf("الكل") }

    val craftCategories = listOf(
        "الكل", "سباك", "كهربائي", "نجار", "حداد", "نقاش",
        "بناء", "مبلط", "جبس بورد", "ألوميتال", "تكييف وتبريد",
        "فني دش", "تصليح أجهزة منزلية", "أخرى"
    )

    val filteredList = uiState.craftsmen.filter { craftsman ->
        val matchesSearch = searchQuery.isBlank() ||
                craftsman.name.contains(searchQuery, ignoreCase = true) ||
                craftsman.craft.contains(searchQuery, ignoreCase = true) ||
                craftsman.notes.contains(searchQuery, ignoreCase = true)

        val matchesCategory = selectedCraft == "الكل" || craftsman.craft.contains(selectedCraft, ignoreCase = true)

        matchesSearch && matchesCategory
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        // Search Bar
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث عن صنايعي أو حرفة..."
        )

        // Filter Categories
        CategoryFilterRow(
            categories = craftCategories,
            selectedCategory = selectedCraft,
            onSelectCategory = { selectedCraft = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedCraft != "الكل")
                    "لا توجد نتائج مطابقة للبحث"
                else
                    "لا يوجد صنايعية مسجلين حالياً",
                icon = Icons.Default.Build
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { craftsman ->
                    CraftsmanCard(craftsman = craftsman)
                }
            }
        }
    }
}

@Composable
fun CraftsmanCard(
    craftsman: Craftsman,
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
                // Avatar / Image
                if (craftsman.image_url.isNotBlank()) {
                    AsyncImage(
                        model = craftsman.image_url,
                        contentDescription = craftsman.name,
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Primary.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = Primary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                // Name & Craft
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = craftsman.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Secondary.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = craftsman.craft.ifBlank { "خدمات عامة" },
                            color = Secondary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            // Description / Notes
            if (craftsman.notes.isNotBlank()) {
                Text(
                    text = craftsman.notes,
                    style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                    lineHeight = 18.sp
                )
            }

            // Address
            if (craftsman.address.isNotBlank()) {
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
                    Text(
                        text = craftsman.address,
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            // Action Buttons
            ContactActionButtons(
                phone = craftsman.phone,
                whatsapp = craftsman.whatsapp,
                title = "${craftsman.name} - ${craftsman.craft}"
            )
        }
    }
}
