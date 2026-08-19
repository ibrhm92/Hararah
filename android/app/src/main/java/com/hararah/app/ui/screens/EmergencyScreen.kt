package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hararah.app.data.model.EmergencyContact
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.utils.IntentUtils
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun EmergencyScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }

    val defaultEmergencyList = listOf(
        EmergencyContact("1", "الإسعاف", "123", "طوارئ طبية", "هيئة الإسعاف المصرية"),
        EmergencyContact("2", "الشرطة والنجدة", "122", "أمن وشرطة", "شرطة النجدة"),
        EmergencyContact("3", "المطافئ والدفاع المدني", "180", "حريق وإنقاذ", "قوات الحماية المدنية"),
        EmergencyContact("4", "طوارئ الكهرباء", "121", "كهرباء", "شركة كهرباء البحيرة"),
        EmergencyContact("5", "طوارئ مياه الشرب", "125", "مياه", "شركة مياه الشرب والصرف الصحي"),
        EmergencyContact("6", "طوارئ الغاز الطبيعي", "129", "غاز", "طوارئ الغاز"),
        EmergencyContact("7", "الوحدة الصحية بحرارة", "0450000000", "صحة القرية", "الوحدة الصحية لقرية حرارة")
    )

    val contacts = if (uiState.emergencyContacts.isNotEmpty()) {
        uiState.emergencyContacts
    } else {
        defaultEmergencyList
    }

    val filteredList = contacts.filter { contact ->
        searchQuery.isBlank() ||
                contact.name.contains(searchQuery, ignoreCase = true) ||
                contact.category.contains(searchQuery, ignoreCase = true) ||
                contact.phone.contains(searchQuery)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث عن رقم طوارئ أو خدمة..."
        )

        LazyColumn(
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Info Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AccentRed.copy(alpha = 0.08f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Emergency,
                            contentDescription = null,
                            tint = AccentRed,
                            modifier = Modifier.size(32.dp)
                        )
                        Column {
                            Text(
                                text = "أرقام الطوارئ والخدمات العاجلة",
                                fontWeight = FontWeight.Bold,
                                color = AccentRed,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "اضغط على زر الاتصال للتواصل المباشر في حالات الطوارئ",
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { contact ->
                EmergencyContactCard(contact = contact)
            }
        }
    }
}

@Composable
fun EmergencyContactCard(
    contact: EmergencyContact,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceLight),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(50.dp)
                        .clip(CircleShape)
                        .background(AccentRed.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PhoneInTalk,
                        contentDescription = null,
                        tint = AccentRed,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Column {
                    Text(
                        text = contact.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Text(
                        text = contact.phone,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Secondary
                    )
                    if (contact.description.isNotBlank()) {
                        Text(
                            text = contact.description,
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Big Dial Button
            Button(
                onClick = { IntentUtils.dialPhoneNumber(context, contact.phone) },
                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                shape = RoundedCornerShape(12.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Icon(imageVector = Icons.Default.Phone, contentDescription = "اتصال", modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "اتصال", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
    }
}
