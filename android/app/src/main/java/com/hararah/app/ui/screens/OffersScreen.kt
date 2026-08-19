package com.hararah.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.Schedule
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
import com.hararah.app.data.model.Offer
import com.hararah.app.ui.components.*
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahUiState

@Composable
fun OffersScreen(
    uiState: HararahUiState,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }

    val filteredList = uiState.offers.filter { offer ->
        searchQuery.isBlank() ||
                offer.shop_name.contains(searchQuery, ignoreCase = true) ||
                offer.description.contains(searchQuery, ignoreCase = true) ||
                offer.discount.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        HararahSearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "ابحث في العروض والتخفيضات..."
        )

        if (uiState.isLoading) {
            LoadingView()
        } else if (filteredList.isEmpty()) {
            EmptyStateView(
                message = if (searchQuery.isNotBlank())
                    "لا توجد عروض مطابقة للبحث"
                else
                    "لا توجد عروض وتخفيضات نشطة حالياً",
                icon = Icons.Default.LocalOffer
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(filteredList, key = { it.id.ifBlank { it.hashCode().toString() } }) { offer ->
                    OfferDetailCard(offer = offer)
                }
            }
        }
    }
}

@Composable
fun OfferDetailCard(
    offer: Offer,
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
                    text = offer.shop_name,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                )
                if (offer.discount.isNotBlank()) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AccentRed
                    ) {
                        Text(
                            text = "خصم ${offer.discount}",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            if (offer.image_url.isNotBlank()) {
                AsyncImage(
                    model = offer.image_url,
                    contentDescription = offer.shop_name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Text(
                text = offer.description,
                style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                lineHeight = 20.sp
            )

            if (offer.end_date.isNotBlank()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = AccentOrange,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "ساري حتى: ${offer.end_date}",
                        fontSize = 12.sp,
                        color = AccentOrange,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            ContactActionButtons(
                phone = offer.phone,
                title = "عرض من ${offer.shop_name} - ${offer.discount}"
            )
        }
    }
}
