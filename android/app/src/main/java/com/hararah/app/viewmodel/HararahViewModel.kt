package com.hararah.app.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hararah.app.data.model.*
import com.hararah.app.data.repository.HararahRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HararahUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
    val craftsmen: List<Craftsman> = emptyList(),
    val machines: List<Machine> = emptyList(),
    val shops: List<Shop> = emptyList(),
    val doctors: List<Doctor> = emptyList(),
    val offers: List<Offer> = emptyList(),
    val ads: List<Ad> = emptyList(),
    val news: List<VillageNews> = emptyList(),
    val emergencyContacts: List<EmergencyContact> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "الكل",
    val submitSuccess: Boolean = false,
    val isSubmitting: Boolean = false
)

class HararahViewModel(
    private val repository: HararahRepository = HararahRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(HararahUiState())
    val uiState: StateFlow<HararahUiState> = _uiState.asStateFlow()

    init {
        loadAllData()
    }

    fun loadAllData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val craftsmen = repository.getCraftsmen()
                val machines = repository.getMachines()
                val shops = repository.getShops()
                val doctors = repository.getDoctors()
                val offers = repository.getOffers()
                val ads = repository.getAds()
                val news = repository.getNews()
                val emergency = repository.getEmergencyContacts()

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        craftsmen = craftsmen,
                        machines = machines,
                        shops = shops,
                        doctors = doctors,
                        offers = offers,
                        ads = ads,
                        news = news,
                        emergencyContacts = emergency
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = "تعذر تحميل البيانات، يرجى المحاولة مرة أخرى"
                    )
                }
            }
        }
    }

    fun refreshData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            try {
                val craftsmen = repository.getCraftsmen()
                val machines = repository.getMachines()
                val shops = repository.getShops()
                val doctors = repository.getDoctors()
                val offers = repository.getOffers()
                val ads = repository.getAds()
                val news = repository.getNews()
                val emergency = repository.getEmergencyContacts()

                _uiState.update {
                    it.copy(
                        isRefreshing = false,
                        craftsmen = craftsmen,
                        machines = machines,
                        shops = shops,
                        doctors = doctors,
                        offers = offers,
                        ads = ads,
                        news = news,
                        emergencyContacts = emergency
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isRefreshing = false) }
            }
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun setSelectedCategory(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun submitServiceRequest(
        serviceType: String,
        name: String,
        phone: String,
        category: String,
        details: String,
        imageUri: Uri?,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            try {
                var imageUrl = ""
                if (imageUri != null) {
                    val uploadResult = repository.uploadImage(imageUri)
                    if (uploadResult.isSuccess) {
                        imageUrl = uploadResult.getOrDefault("")
                    }
                }

                val request = ServiceRequest(
                    service_type = serviceType,
                    name = name,
                    phone = phone,
                    category = category,
                    details = details,
                    image_url = imageUrl,
                    created_at = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.getDefault()).format(java.util.Date())
                )

                val result = repository.submitServiceRequest(request)
                if (result.isSuccess) {
                    _uiState.update { it.copy(isSubmitting = false, submitSuccess = true) }
                    onSuccess()
                } else {
                    _uiState.update { it.copy(isSubmitting = false) }
                    onError(result.exceptionOrNull()?.message ?: "حدث خطأ أثناء الإرسال")
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isSubmitting = false) }
                onError(e.message ?: "حدث خطأ غير متوقع")
            }
        }
    }
}
