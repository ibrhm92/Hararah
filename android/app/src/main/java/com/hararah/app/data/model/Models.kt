package com.hararah.app.data.model

data class Craftsman(
    val id: String = "",
    val name: String = "",
    val craft: String = "",
    val phone: String = "",
    val whatsapp: String = "",
    val address: String = "",
    val notes: String = "",
    val experience: String = "",
    val image_url: String = "",
    val approved: Boolean = true
)

data class Machine(
    val id: String = "",
    val name: String = "",
    val type: String = "",
    val phone: String = "",
    val price: String = "",
    val notes: String = "",
    val image_url: String = ""
)

data class Shop(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val phone: String = "",
    val address: String = "",
    val working_hours: String = "",
    val delivery: Boolean = false,
    val image_url: String = ""
)

data class Doctor(
    val id: String = "",
    val name: String = "",
    val specialty: String = "",
    val phone: String = "",
    val address: String = "",
    val working_hours: String = "",
    val notes: String = "",
    val image_url: String = ""
)

data class Offer(
    val id: String = "",
    val shop_name: String = "",
    val description: String = "",
    val phone: String = "",
    val discount: String = "",
    val start_date: String = "",
    val end_date: String = "",
    val image_url: String = "",
    val approved: Boolean = true
)

data class Ad(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val phone: String = "",
    val category: String = "",
    val price: String = "",
    val image_url: String = "",
    val approved: Boolean = true
)

data class VillageNews(
    val id: String = "",
    val title: String = "",
    val content: String = "",
    val category: String = "",
    val date: String = "",
    val image_url: String = ""
)

data class EmergencyContact(
    val id: String = "",
    val name: String = "",
    val phone: String = "",
    val category: String = "",
    val description: String = ""
)

data class ServiceRequest(
    val id: String = "",
    val service_type: String = "",
    val name: String = "",
    val phone: String = "",
    val category: String = "",
    val details: String = "",
    val image_url: String = "",
    val created_at: String = "",
    val status: String = "pending"
)
