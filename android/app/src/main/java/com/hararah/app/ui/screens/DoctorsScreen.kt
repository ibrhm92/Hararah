package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import com.hararah.app.data.model.Doctor
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun DoctorsScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedSpecialty by remember { mutableStateOf("الكل") }

    val specialties = listOf(
        "الكل", "باطنة", "أطفال", "أسنان", "عظام", "عيون", "جلدية",
        "نساء وتوليد", "أنف وأذن وحنجرة", "قلب وأوعية دموية",
        "مخ وأعصاب", "علاج طبيعي", "جراحة عامة", "معمل تحاليل", "أخرى"
    )

    val filteredList = uiState.doctors.filter { doctor ->
        val matchesSearch = searchQuery.isBlank() ||
                doctor.name.contains(searchQuery, ignoreCase = true) ||
                doctor.specialty.contains(searchQuery, ignoreCase = true) ||
                doctor.notes.contains(searchQuery, ignoreCase = true)

        val matchesSpecialty = selectedSpecialty == "الكل" || doctor.specialty.contains(selectedSpecialty, ignoreCase = true)

        matchesSearch && matchesSpecialty
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث عن طبيب أو تخصص أو عيادة..."
        )

        CategoryFilterRow(
            categories = specialties,
            selectedCategory = selectedSpecialty,
            onSelectCategory = { selectedSpecialty = it }
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank() || selectedSpecialty != "الكل")
                    "لا توجد عيادات مطابقة للبحث"
                else
                    "لا توجد عيادات مسجلة حالياً",
                icon = Icons.Default.MedicalServices
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { doctor ->
                    DoctorCard(doctor = doctor)
                }
            }
        }
    }
}

@Composable
fun DoctorCard(
    doctor: Doctor,
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
                if (doctor.image_url.isNotBlank()) {
                    AsyncImage(
                        model = doctor.image_url,
                        contentDescription = doctor.name,
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Accent.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.MedicalServices,
                            contentDescription = null,
                            tint = Accent,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = doctor.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Accent.copy(alpha = 0.12f)
                    ) {
                        Text(
                            text = doctor.specialty.ifBlank { "طبيب عام" },
                            color = Accent,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            if (doctor.address.isNotBlank()) {
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
                    Text(text = "عنوان العيادة: ${doctor.address}", fontSize = 12.sp, color = TextSecondary)
                }
            }

            if (doctor.working_hours.isNotBlank()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Event,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(text = "مواعيد وأيام العمل: ${doctor.working_hours}", fontSize = 12.sp, color = TextSecondary)
                }
            }

            if (doctor.notes.isNotBlank()) {
                Text(
                    text = doctor.notes,
                    style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                    lineHeight = 18.sp
                )
            }

            ContactActionButtons(
                phone = doctor.phone,
                title = "${doctor.name} - ${doctor.specialty}"
            )
        }
    }
}
