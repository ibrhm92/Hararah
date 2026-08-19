package com.hararah.app.data.repository

import android.net.Uri
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.storage.FirebaseStorage
import com.hararah.app.data.model.*
import kotlinx.coroutines.tasks.await
import java.util.UUID

class HararahRepository {

    private val firestore: FirebaseFirestore by lazy {
        val db = FirebaseFirestore.getInstance()
        try {
            val settings = FirebaseFirestoreSettings.Builder()
                .setPersistenceEnabled(true)
                .build()
            db.firestoreSettings = settings
        } catch (e: Exception) {
            // Settings already configured
        }
        db
    }

    private val storage: FirebaseStorage by lazy {
        FirebaseStorage.getInstance()
    }

    suspend fun getCraftsmen(): List<Craftsman> {
        return try {
            val snapshot = firestore.collection("craftsmen").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Craftsman::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getMachines(): List<Machine> {
        return try {
            val snapshot = firestore.collection("machines").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Machine::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getShops(): List<Shop> {
        return try {
            val snapshot = firestore.collection("shops").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Shop::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getDoctors(): List<Doctor> {
        return try {
            val snapshot = firestore.collection("doctors").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Doctor::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getOffers(): List<Offer> {
        return try {
            val snapshot = firestore.collection("offers").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Offer::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getAds(): List<Ad> {
        return try {
            val snapshot = firestore.collection("ads").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Ad::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getNews(): List<VillageNews> {
        return try {
            val snapshot = firestore.collection("news").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(VillageNews::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getEmergencyContacts(): List<EmergencyContact> {
        return try {
            val snapshot = firestore.collection("emergency").get().await()
            snapshot.documents.mapNotNull { doc ->
                doc.toObject(EmergencyContact::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun submitServiceRequest(request: ServiceRequest): Result<String> {
        return try {
            val docRef = firestore.collection("service_requests").add(request).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadImage(imageUri: Uri): Result<String> {
        return try {
            val filename = "images/${UUID.randomUUID()}.jpg"
            val storageRef = storage.reference.child(filename)
            storageRef.putFile(imageUri).await()
            val downloadUrl = storageRef.downloadUrl.await().toString()
            Result.success(downloadUrl)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
