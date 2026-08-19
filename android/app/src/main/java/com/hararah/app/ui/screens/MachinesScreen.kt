package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Agriculture
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
import com.hararah.app.data.model.Machine
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun MachinesScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("الكل") }

    val machineTypes = listOf(
        "الكل", "جرار زراعي", "حاصدة", "عزاقة", "ماكينة رش", "مقطورة",
        "بذور", "دراسة", "ماكينة ري", "لودر", "أخرى"
    )

    val filteredList = uiState.machines.filter { machine ->
        val matchesSearch = searchQuery.isBlank() ||
                machine.name.contains(searchQuery, ignoreCase = true) ||
                machine.type.contains(searchQuery, ignoreCase = true) ||
                machine.notes.contains(searchQuery, ignoreCase = true)

        val matchesType = selectedType == "الكل" || machine.type.contains(selectedType, ignoreCase = true)

        matchesSearch && matchesType
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث عن آلة أو صاحب معدة..."
        )

        CategoryFilterRow(
            categories = machineTypes,
            selectedCategory = selectedType,
            onSelectCategory = { selectedType = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedType != "الكل")
                    "لا توجد معدات مطابقة للبحث"
                else
                    "لا توجد آلات زراعية مسجلة حالياً",
                icon = Icons.Default.Agriculture
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { machine ->
                    MachineCard(machine = machine)
                }
            }
        }
    }
}

@Composable
fun MachineCard(
    machine: Machine,
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
                if (machine.image_url.isNotBlank()) {
                    AsyncImage(
                        model = machine.image_url,
                        contentDescription = machine.name,
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(AccentOrange.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Agriculture,
                            contentDescription = null,
                            tint = AccentOrange,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = machine.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = AccentOrange.copy(alpha = 0.12f)
                    ) {
                        Text(
                            text = machine.type.ifBlank { "معدة زراعية" },
                            color = AccentOrange,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            if (machine.price.isNotBlank()) {
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
                        text = "السعر: ${machine.price}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentGreen
                    )
                }
            }

            if (machine.notes.isNotBlank()) {
                Text(
                    text = machine.notes,
                    style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                    lineHeight = 18.sp
                )
            }

            ContactActionButtons(
                phone = machine.phone,
                title = "${machine.name} - ${machine.type}"
            )
        }
    }
}
