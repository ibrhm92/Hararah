package com.hararah.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hararah.app.ui.theme.*
import com.hararah.app.utils.IntentUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HararahTopBar(
    title: String = "قرية حرارة",
    subtitle: String = "خدمات القرية الذكية",
    onRefresh: () -> Unit = {}
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color.White.copy(alpha = 0.8f)
                    )
                )
            }
        },
        actions = {
            IconButton(onClick = onRefresh) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "تحديث",
                    tint = Color.White
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Primary
        )
    )
}

@Composable
fun HararahSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String = "ابحث بالاسم أو التخصص...",
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        placeholder = { Text(text = placeholder, color = TextMuted, fontSize = 14.sp) },
        leadingIcon = {
            Icon(imageVector = Icons.Default.Search, contentDescription = "بحث", tint = TextSecondary)
        },
        trailingIcon = {
            if (query.isNotBlank()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "مسح", tint = TextSecondary)
                }
            }
        },
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Secondary,
            unfocusedBorderColor = DividerColor,
            focusedContainerColor = SurfaceLight,
            unfocusedContainerColor = SurfaceLight
        ),
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    )
}

@Composable
fun CategoryFilterRow(
    categories: List<String>,
    selectedCategory: String,
    onSelectCategory: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        categories.forEach { category ->
            val isSelected = category == selectedCategory
            FilterChip(
                selected = isSelected,
                onClick = { onSelectCategory(category) },
                label = {
                    Text(
                        text = category,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) Color.White else TextPrimary
                    )
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Secondary,
                    containerColor = SurfaceVariantLight
                ),
                shape = RoundedCornerShape(20.dp),
                border = null
            )
        }
    }
}

@Composable
fun ContactActionButtons(
    phone: String,
    whatsapp: String = "",
    title: String = "",
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Call Button
        if (phone.isNotBlank()) {
            Button(
                onClick = { IntentUtils.dialPhoneNumber(context, phone) },
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(vertical = 10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "اتصال",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "اتصال", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        // WhatsApp Button
        val targetWhatsApp = if (whatsapp.isNotBlank()) whatsapp else phone
        if (targetWhatsApp.isNotBlank()) {
            Button(
                onClick = { IntentUtils.openWhatsApp(context, targetWhatsApp, "السلام عليكم، بخصوص إعلانك في تطبيق قرية حرارة") },
                colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(vertical = 10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = "واتساب",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "واتساب", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        // Share Button
        IconButton(
            onClick = {
                IntentUtils.shareContent(
                    context,
                    title = title.ifBlank { "خدمة في قرية حرارة" },
                    text = "$title\nرقم الهاتف: $phone\nتطبيق خدمات قرية حرارة"
                )
            },
            modifier = Modifier
                .size(42.dp)
                .background(SurfaceVariantLight, RoundedCornerShape(10.dp))
        ) {
            Icon(
                imageVector = Icons.Default.Share,
                contentDescription = "مشاركة",
                tint = TextSecondary,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
fun LoadingView(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            CircularProgressIndicator(color = Secondary)
            Text(text = "جاري تحميل البيانات...", color = TextSecondary, fontSize = 14.sp)
        }
    }
}

@Composable
fun EmptyStateView(
    message: String = "لا توجد عناصر مطابقة للبحث",
    icon: ImageVector = Icons.Default.SearchOff,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(64.dp)
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyLarge,
                color = TextSecondary,
                textAlign = TextAlign.Center
            )
        }
    }
}
