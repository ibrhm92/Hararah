package com.hararah.app.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import com.hararah.app.ui.theme.*
import com.hararah.app.viewmodel.HararahViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubmitServiceScreen(
    viewModel: HararahViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val serviceTypes = listOf(
        "craftsmen" to "صنايعي / حرفة",
        "shops" to "محل تجاري",
        "doctors" to "عيادة / طبيب",
        "machines" to "آلة زراعية",
        "offers" to "عرض وتخفيض",
        "ads" to "إعلان مبوب"
    )

    var selectedServiceType by remember { mutableStateOf("craftsmen") }
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var details by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var showSuccessDialog by remember { mutableStateOf(false) }

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedImageUri = uri
    }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                onNavigateBack()
            },
            title = { Text(text = "تم إرسال الطلب بنجاح", fontWeight = FontWeight.Bold) },
            text = { Text(text = "شكراً لك! تم استلام بيانات الخدمة وسيتم مراجعتها ونشرها في التطبيق قريباً.") },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Secondary)
                ) {
                    Text(text = "حسناً")
                }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header Info
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Secondary.copy(alpha = 0.08f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = Secondary,
                    modifier = Modifier.size(28.dp)
                )
                Text(
                    text = "أضف بياناتك لتظهر في دليل قرية حرارة ويصل إليها جميع أهالي القرية مجاناً.",
                    color = TextPrimary,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            }
        }

        // 1. Service Type Selector
        Text(
            text = "نوع الخدمة أو النشاط *",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = TextPrimary
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            serviceTypes.take(3).forEach { (typeKey, typeLabel) ->
                val isSelected = selectedServiceType == typeKey
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedServiceType = typeKey },
                    label = { Text(text = typeLabel, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Secondary,
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            serviceTypes.drop(3).forEach { (typeKey, typeLabel) ->
                val isSelected = selectedServiceType == typeKey
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedServiceType = typeKey },
                    label = { Text(text = typeLabel, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Secondary,
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 2. Name Field
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text(text = "الاسم / اسم المحل / اسم الطبيب *") },
            placeholder = { Text(text = "أدخل الاسم بالكامل") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        // 3. Phone Field
        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text(text = "رقم الهاتف / الواتساب *") },
            placeholder = { Text(text = "01xxxxxxxxx") },
            leadingIcon = { Icon(imageVector = Icons.Default.Phone, contentDescription = null) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        // 4. Category / Specialty Field
        OutlinedTextField(
            value = category,
            onValueChange = { category = it },
            label = { Text(text = "التخصص / النشاط / الحرفة") },
            placeholder = { Text(text = "مثال: سباك، سوبر ماركت، باطنة، جرار...") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        // 5. Details / Notes Field
        OutlinedTextField(
            value = details,
            onValueChange = { details = it },
            label = { Text(text = "العنوان والتفاصيل والملاحظات") },
            placeholder = { Text(text = "اكتب عنوانك، مواعيد العمل، أو تفاصيل العرض...") },
            minLines = 3,
            maxLines = 5,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        // 6. Image Picker
        Text(
            text = "صورة الخدمة أو الإعلان (اختياري)",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = TextPrimary
        )

        if (selectedImageUri != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                AsyncImage(
                    model = selectedImageUri,
                    contentDescription = "الصورة المختارة",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                IconButton(
                    onClick = { selectedImageUri = null },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(20.dp))
                ) {
                    Icon(imageVector = Icons.Default.Delete, contentDescription = "حذف", tint = Color.White)
                }
            }
        } else {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clickable { photoPickerLauncher.launch("image/*") },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                border = androidx.compose.foundation.BorderStroke(1.dp, DividerColor)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.AddPhotoAlternate,
                        contentDescription = "اختيار صورة",
                        tint = Secondary,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "اضغط لاختيار صورة من الهاتف",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Submit Button
        Button(
            onClick = {
                if (name.isBlank() || phone.isBlank()) {
                    Toast.makeText(context, "يرجى إدخال الاسم ورقم الهاتف على الأقل", Toast.LENGTH_SHORT).show()
                } else {
                    viewModel.submitServiceRequest(
                        serviceType = selectedServiceType,
                        name = name,
                        phone = phone,
                        category = category,
                        details = details,
                        imageUri = selectedImageUri,
                        onSuccess = {
                            showSuccessDialog = true
                        },
                        onError = { errMsg ->
                            Toast.makeText(context, errMsg, Toast.LENGTH_LONG).show()
                        }
                    )
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Primary),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Icon(imageVector = Icons.Default.Send, contentDescription = "إرسال")
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "إرسال الطلب الآن", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(60.dp))
    }
}
