// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

// Global Variables - المتغيرات العامة للتطبيق
let currentPage = 'home';
let userData = {};
let appData = {};

// Configuration - الإعدادات
const CONFIG = {
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes - 5 دقائق
    OFFLINE_MODE: true
};

// DOM Elements - عناصر DOM الرئيسية
const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    mainNav: document.getElementById('mainNav'),
    pageContent: document.getElementById('pageContent'),
    homePage: document.getElementById('homePage'),
    latestNewsList: document.getElementById('latestNewsList'),
    menuBtn: document.getElementById('menuBtn'),
    closeNav: document.getElementById('closeNav'),
    refreshBtn: document.getElementById('refreshBtn')
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

// Initialize App - تهيئة التطبيق عند بدء التشغيل
async function initializeApp() {
    try {
        // Load cached data - تحميل البيانات المخزنة مؤقتاً
        loadCachedData();
        
        // Initialize navigation - تهيئة نظام التنقل
        initializeNavigation();
        
        // Initialize quick actions - تهيئة الإجراءات السريعة
        initializeQuickActions();
        
        // Load initial data - تحميل البيانات الأولية
        await loadInitialData();
        
        // Hide loading screen - إخفاء شاشة التحميل
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
        
        // Initialize PWA - تهيئة تطبيق الويب التقدمي
        initializePWA();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('حدث خطأ أثناء تحميل التطبيق');
    }
}

// =============================================================================
// NAVIGATION SYSTEM
// =============================================================================

// Initialize navigation - تهيئة نظام التنقل بين الصفحات
function initializeNavigation() {
    // Menu toggle - فتح وإغلاق القائمة الجانبية
    elements.menuBtn.addEventListener('click', () => {
        elements.mainNav.classList.add('active');
    });
    
    elements.closeNav.addEventListener('click', () => {
        elements.mainNav.classList.remove('active');
    });
    
    // Navigation links - روابط التنقل الرئيسية
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
            elements.mainNav.classList.remove('active');
        });
    });
}

// Quick Actions - الإجراءات السريعة من الصفحة الرئيسية
function initializeQuickActions() {
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            navigateToPage(page);
        });
    });
}

// Page Navigation - التنقل بين الصفحات
function navigateToPage(page) {
    currentPage = page;
    
    // Close navigation if open - إغلاق القائمة إذا كانت مفتوحة
    elements.mainNav.classList.remove('active');
    
    // Hide all pages - إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page - عرض الصفحة المستهدفة
    if (page === 'home') {
        elements.homePage.classList.add('active');
        elements.pageContent.innerHTML = '';
    } else {
        elements.homePage.classList.remove('active');
        loadPage(page);
    }
    
    // Update active nav link - تحديث الرابط النشط في القائمة
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

// =============================================================================
// PAGE LOADING SYSTEM
// =============================================================================

// Load Page Content - تحميل محتوى الصفحة
async function loadPage(page) {
    showLoading();
    
    try {
        let content = '';
        
        switch(page) {
            case 'craftsmen':
                content = await loadCraftsmenPage();
                break;
            case 'machines':
                content = await loadMachinesPage();
                break;
            case 'shops':
                content = await loadShopsPage();
                break;
            case 'offers':
                content = await loadOffersPage();
                break;
            case 'ads':
                content = await loadAdsPage();
                break;
            case 'emergency':
                content = await loadEmergencyPage();
                break;
            case 'news':
                content = await loadNewsPage();
                break;
            case 'add-service':
                content = await loadAddServicePage();
                break;
            case 'admin':
                content = await loadAdminPage();
                break;
            case 'shop-owner':
                content = await loadShopOwnerPage();
                break;
            default:
                content = '<div class="alert alert-warning">الصفحة المطلوبة غير موجودة</div>';
        }
        
        elements.pageContent.innerHTML = content;
        initializePageScripts(page);
        
    } catch (error) {
        console.error('Error loading page:', error);
        showError('حدث خطأ أثناء تحميل الصفحة');
        elements.pageContent.innerHTML = '<div class="alert alert-danger">حدث خطأ أثناء تحميل الصفحة</div>';
    } finally {
        hideLoading();
    }
}

// =============================================================================
// PAGE CONTENT LOADERS
// =============================================================================

// Load Craftsmen Page - تحميل صفحة الصنايعية
async function loadCraftsmenPage() {
    const craftsmen = await getData('craftsmen');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-tools"></i> الصنايعية والخدمات</h2>
        </div>
        
        <div class="services-grid">
            ${craftsmen.map(craftsman => `
                <div class="service-card">
                    <div class="service-header">
                        <h3>${craftsman.name}</h3>
                        <span class="service-category">${craftsman.category}</span>
                    </div>
                    <div class="service-details">
                        <p><i class="fas fa-phone"></i> ${craftsman.phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${craftsman.address}</p>
                        <p><i class="fas fa-star"></i> ${craftsman.rating || 'لا يوجد تقييم'}</p>
                    </div>
                    <div class="service-actions">
                        <button class="btn btn-primary" onclick="callPhone('${craftsman.phone}')">
                            <i class="fas fa-phone"></i> اتصل
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="add-service-section">
            <h3>أضف خدمة جديدة</h3>
            <div id="craftsmanFormContainer"></div>
        </div>
    `;
}

// =============================================================================
// DATA MANAGEMENT SYSTEM
// =============================================================================

// Data Management - إدارة البيانات مع API والتخزين المؤقت
async function getData(type) {
    try {
        // Try to get from cache first - محاولة جلب البيانات من الكاش أولاً
        const cached = getFromCache(type);
        if (cached) {
            return cached;
        }

        // Fetch from API using apiClient - جلب البيانات من API
        let data;
        switch(type) {
            case 'craftsmen':
                data = await apiClient.getCraftsmen();
                break;
            case 'machines':
                data = await apiClient.getMachines();
                break;
            case 'shops':
                data = await apiClient.getShops();
                break;
            case 'offers':
                data = await apiClient.getOffers();
                break;
            case 'ads':
                data = await apiClient.getAds();
                break;
            case 'news':
                data = await apiClient.getNews();
                break;
            case 'emergency':
                data = await apiClient.getEmergency();
                break;
            default:
                throw new Error(`Unknown data type: ${type}`);
        }

        // Cache the data - تخزين البيانات مؤقتاً
        setCache(type, data);

        return data;

    } catch (error) {
        console.error('Error fetching data:', error);
        // Return cached data if available - إرجاع البيانات المخزنة إذا كانت متوفرة
        return getFromCache(type) || [];
    }
}

async function saveData(type, data) {
    try {
        // Save using apiClient - حفظ البيانات باستخدام apiClient
        let result;
        const singularType = type.slice(0, -1); // Remove 's' from plural

        switch(type) {
            case 'craftsmen':
                result = await apiClient.saveCraftsman(data);
                break;
            case 'machines':
                result = await apiClient.saveMachine(data);
                break;
            case 'shops':
                result = await apiClient.saveShop(data);
                break;
            case 'offers':
                result = await apiClient.saveOffer(data);
                break;
            case 'ads':
                result = await apiClient.saveAd(data);
                break;
            case 'news':
                result = await apiClient.saveNews(data);
                break;
            case 'emergency':
                result = await apiClient.saveEmergency(data);
                break;
            default:
                throw new Error(`Unknown data type: ${type}`);
        }

        if (result) {
            // Clear cache - مسح الكاش
            clearCache(type);
            showSuccess('تم حفظ البيانات بنجاح');
            return true;
        } else {
            showError('حدث خطأ أثناء حفظ البيانات');
            return false;
        }

    } catch (error) {
        console.error('Error saving data:', error);
        const errorMessage = handleApiError(error) || 'حدث خطأ أثناء حفظ البيانات';
        showError(errorMessage);
        return false;
    }
}

// =============================================================================
// CACHE MANAGEMENT SYSTEM
// =============================================================================

// Cache Management - إدارة التخزين المؤقت
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            if (now - timestamp < CONFIG.CACHE_DURATION) {
                return data;
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting cache:', error);
        return null;
    }
}

function setCache(key, data) {
    try {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error setting cache:', error);
    }
}

function clearCache(key) {
    try {
        if (key) {
            localStorage.removeItem(`cache_${key}`);
        } else {
            // Clear all cache - مسح جميع البيانات المخزنة مؤقتاً
            Object.keys(localStorage).forEach(item => {
                if (item.startsWith('cache_')) {
                    localStorage.removeItem(item);
                }
            });
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Show Loading - عرض مؤشر التحميل
function showLoading() {
    let loading = document.getElementById('globalLoading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'globalLoading';
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

// Hide Loading - إخفاء مؤشر التحميل
function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show Success Message - عرض رسالة نجاح
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show Error Message - عرض رسالة خطأ
function showError(message) {
    showNotification(message, 'error');
}

// Show Notification - عرض إشعار
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const iconClass = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    notification.innerHTML = `
        <i class="fas fa-${iconClass[type] || 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Call Phone - إجراء مكالمة هاتفية
function callPhone(phone) {
    window.location.href = `tel:${phone}`;
}

// =============================================================================
// INPUT VALIDATION SYSTEM
// =============================================================================

// Validate Phone Number - التحقق من رقم الهاتف
function validatePhone(phone) {
    const phoneRegex = /^(\+20|0)?1[0-2,5]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Validate Email - التحقق من البريد الإلكتروني
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Required Fields - التحقق من الحقول المطلوبة
function validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        throw new Error(`الحقل ${fieldName} مطلوب`);
    }
    return value.toString().trim();
}

// Validate Form Data - التحقق من بيانات النموذج
function validateFormData(data, requiredFields) {
    const validated = {};

    requiredFields.forEach(field => {
        if (data[field] === undefined || data[field] === null) {
            throw new Error(`الحقل ${field} مطلوب`);
        }
        validated[field] = validateRequired(data[field], field);
    });

    // Additional validations
    if (data.phone && !validatePhone(data.phone)) {
        throw new Error('رقم الهاتف غير صحيح');
    }

    if (data.email && !validateEmail(data.email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
    }

    if (data.password && data.password.length < 6) {
        throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
        throw new Error('كلمات المرور غير متطابقة');
    }

    return { ...data, ...validated };
}

// Show Validation Error - عرض خطأ التحقق
function showValidationError(message) {
    showNotification(message, 'error');
}

// Sanitize Input - تنظيف الإدخال
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

// =============================================================================
// ADMIN AUTHENTICATION
// =============================================================================

function isAdmin() {
    // Check if user is logged in as admin - التحقق من تسجيل دخول الإدارة
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// =============================================================================
// PAGE SCRIPTS INITIALIZATION
// =============================================================================

function initializePageScripts(page) {
    // Initialize page-specific scripts - تهيئة السكربتات الخاصة بكل صفحة
    switch(page) {
        case 'craftsmen':
            initializeCraftsmenPage();
            break;
        case 'machines':
            initializeMachinesPage();
            break;
        case 'shops':
            initializeShopsPage();
            break;
        case 'shop-owner':
            initializeShopOwnerPage();
            break;
        case 'admin':
            initializeAdminPage();
            break;
    }
}

function initializeAdminPage() {
    // Initialize admin login form - تهيئة نموذج تسجيل دخول الإدارة
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        // Simple authentication - مصادقة بسيطة (في الإنتاج، استخدم مصادقة مناسبة)
        if (username === 'admin' && password === '123') {
            localStorage.setItem('adminLoggedIn', 'true');
            showSuccess('تم تسجيل الدخول بنجاح');
            navigateToPage('admin');
        } else {
            showError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        showError('حدث خطأ أثناء تسجيل الدخول');
    }
}

// Load Admin Page - تحميل صفحة الإدارة
async function loadAdminPage() {
    // Check if user is logged in as admin - التحقق من تسجيل دخول الإدارة
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // Show login form - عرض نموذج تسجيل الدخول
        return `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header text-center">
                                <h3><i class="fas fa-shield-alt"></i> تسجيل دخول الإدارة</h3>
                            </div>
                            <div class="card-body">
                                <form id="adminLoginForm">
                                    <div class="mb-3">
                                        <label for="adminUsername" class="form-label">اسم المستخدم</label>
                                        <input type="text" class="form-control" id="adminUsername" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="adminPassword" class="form-label">كلمة المرور</label>
                                        <input type="password" class="form-control" id="adminPassword" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100">
                                        <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Load statistics - تحميل الإحصائيات
    const stats = await loadAdminStats();
    
    // Show admin dashboard - عرض لوحة التحكم
    return `
        <div class="container mt-4">
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h2>
                        <button class="btn btn-danger" onclick="logoutAdmin()">
                            <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Statistics Cards - بطاقات الإحصائيات -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fas fa-users"></i> الصنايعية</h5>
                            <h3>${stats.craftsmen}</h3>
                            <small>إجمالي الصنايعية</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fas fa-tools"></i> الآلات</h5>
                            <h3>${stats.machines}</h3>
                            <small>إجمالي الآلات</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fas fa-store"></i> المحلات</h5>
                            <h3>${stats.shops}</h3>
                            <small>إجمالي المحلات</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fas fa-percentage"></i> العروض</h5>
                            <h3>${stats.offers}</h3>
                            <small>إجمالي العروض</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Management Cards - بطاقات الإدارة -->
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-users fa-2x text-primary mb-2"></i>
                            <h5>الصنايعية</h5>
                            <p class="text-muted small">إدارة الصنايعية والخدمات</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-primary btn-sm" onclick="showAdminCraftsmen()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-success btn-sm" onclick="showAddCraftsmanForm()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-tools fa-2x text-success mb-2"></i>
                            <h5>الآلات</h5>
                            <p class="text-muted small">إدارة الآلات والمعدات</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-success btn-sm" onclick="showAdminMachines()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="showAddMachineForm()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-store fa-2x text-warning mb-2"></i>
                            <h5>المحلات</h5>
                            <p class="text-muted small">إدارة المحلات التجارية</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-warning btn-sm" onclick="showAdminShops()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-success btn-sm" onclick="showAddShopForm()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-percentage fa-2x text-info mb-2"></i>
                            <h5>العروض</h5>
                            <p class="text-muted small">إدارة العروض والخصومات</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-info btn-sm" onclick="showAdminOffers()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="showPendingOffers()">
                                    <i class="fas fa-clock"></i> معلق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-bullhorn fa-2x text-danger mb-2"></i>
                            <h5>الإعلانات</h5>
                            <p class="text-muted small">إدارة الإعلانات العامة</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-danger btn-sm" onclick="showAdminAds()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="showPendingAds()">
                                    <i class="fas fa-clock"></i> معلق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-newspaper fa-2x text-secondary mb-2"></i>
                            <h5>الأخبار</h5>
                            <p class="text-muted small">إدارة الأخبار والإعلانات</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-secondary btn-sm" onclick="showAdminNews()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="showAddNewsForm()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-ambulance fa-2x text-dark mb-2"></i>
                            <h5>الطوارئ</h5>
                            <p class="text-muted small">إدارة أرقام الطوارئ</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-dark btn-sm" onclick="showAdminEmergency()">
                                    <i class="fas fa-eye"></i> عرض
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="showAddEmergencyForm()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center mb-3 management-card">
                        <div class="card-body">
                            <i class="fas fa-cog fa-2x text-primary mb-2"></i>
                            <h5>الإعدادات</h5>
                            <p class="text-muted small">إعدادات النظام</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-primary btn-sm" onclick="showSystemSettings()">
                                    <i class="fas fa-cog"></i> إعدادات
                                </button>
                                <button class="btn btn-info btn-sm" onclick="showSystemLogs()">
                                    <i class="fas fa-list"></i> سجلات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Content Area - منطقة المحتوى -->
            <div class="row mt-4">
                <div class="col-12">
                    <div id="adminContentArea">
                        <div class="card">
                            <div class="card-body text-center">
                                <i class="fas fa-tachometer-alt fa-3x text-muted mb-3"></i>
                                <h4>مرحباً في لوحة التحكم</h4>
                                <p class="text-muted">اختر قسم من الأقسام أعلاه للبدء في الإدارة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// ADMIN MANAGEMENT FUNCTIONS - وظائف إدارة لوحة التحكم
// =============================================================================

// Load admin statistics - تحميل إحصائيات لوحة التحكم
async function loadAdminStats() {
    try {
        const [craftsmen, machines, shops, offers] = await Promise.all([
            getData('craftsmen'),
            getData('machines'),
            getData('shops'),
            getData('offers')
        ]);
        
        return {
            craftsmen: craftsmen.length || 0,
            machines: machines.length || 0,
            shops: shops.length || 0,
            offers: offers.length || 0
        };
    } catch (error) {
        console.error('Error loading admin stats:', error);
        return {
            craftsmen: 0,
            machines: 0,
            shops: 0,
            offers: 0
        };
    }
}

// Show admin craftsmen management - عرض إدارة الصنايعية
async function showAdminCraftsmen() {
    const craftsmen = await getData('craftsmen');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-users"></i> إدارة الصنايعية</h5>
                <button class="btn btn-success btn-sm" onclick="showAddCraftsmanForm()">
                    <i class="fas fa-plus"></i> إضافة صنايعي
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>التخصص</th>
                                <th>الهاتف</th>
                                <th>العنوان</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${craftsmen.map(craftsman => `
                                <tr>
                                    <td>${craftsman.name || '-'}</td>
                                    <td>${craftsman.specialty || craftsman.category || '-'}</td>
                                    <td>${craftsman.phone || '-'}</td>
                                    <td>${craftsman.address || '-'}</td>
                                    <td>
                                        <span class="badge bg-${craftsman.status === 'نشط' ? 'success' : 'secondary'}">
                                            ${craftsman.status || 'نشط'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-primary btn-sm" onclick="editCraftsman('${craftsman.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteCraftsman('${craftsman.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show add craftsman form - عرض نموذج إضافة صنايعي
function showAddCraftsmanForm() {
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-plus"></i> إضافة صنايعي جديد</h5>
            </div>
            <div class="card-body">
                <form id="addCraftsmanForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanName" class="form-label">الاسم *</label>
                                <input type="text" class="form-control" id="craftsmanName" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanSpecialty" class="form-label">التخصص *</label>
                                <input type="text" class="form-control" id="craftsmanSpecialty" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanPhone" class="form-label">الهاتف *</label>
                                <input type="tel" class="form-control" id="craftsmanPhone" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanAddress" class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="craftsmanAddress">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanStatus" class="form-label">الحالة</label>
                                <select class="form-control" id="craftsmanStatus">
                                    <option value="نشط">نشط</option>
                                    <option value="غير نشط">غير نشط</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="craftsmanNotes" class="form-label">ملاحظات</label>
                                <textarea class="form-control" id="craftsmanNotes" rows="1"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" onclick="showAdminCraftsmen()">
                            <i class="fas fa-arrow-right"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add form submit handler - إضافة معالج إرسال النموذج
    document.getElementById('addCraftsmanForm').addEventListener('submit', handleAddCraftsman);
}

// Handle add craftsman - معالجة إضافة صنايعي
async function handleAddCraftsman(e) {
    e.preventDefault();
    
    const craftsmanData = {
        name: document.getElementById('craftsmanName').value,
        specialty: document.getElementById('craftsmanSpecialty').value,
        phone: document.getElementById('craftsmanPhone').value,
        address: document.getElementById('craftsmanAddress').value,
        status: document.getElementById('craftsmanStatus').value,
        notes: document.getElementById('craftsmanNotes').value
    };
    
    if (await saveData('craftsmen', craftsmanData)) {
        showAdminCraftsmen();
    }
}

// Edit craftsman - تعديل صنايعي
function editCraftsman(id) {
    // Implementation for editing craftsman
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete craftsman - حذف صنايعي
async function deleteCraftsman(id) {
    if (confirm('هل أنت متأكد من حذف هذا الصنايعي؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'craftsman',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('craftsmen');
                showSuccess('تم حذف الصنايعي بنجاح');
                showAdminCraftsmen();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting craftsman:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show admin machines management - عرض إدارة الآلات
async function showAdminMachines() {
    const machines = await getData('machines');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-tools"></i> إدارة الآلات</h5>
                <button class="btn btn-success btn-sm" onclick="showAddMachineForm()">
                    <i class="fas fa-plus"></i> إضافة آلة
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>النوع</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${machines.map(machine => `
                                <tr>
                                    <td>${machine.name || '-'}</td>
                                    <td>${machine.type || '-'}</td>
                                    <td>${machine.phone || '-'}</td>
                                    <td>
                                        <span class="badge bg-${machine.available === 'true' || machine.available === true ? 'success' : 'warning'}">
                                            ${machine.available === 'true' || machine.available === true ? 'متاحة' : 'غير متاحة'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-primary btn-sm" onclick="editMachine('${machine.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteMachine('${machine.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show add machine form - عرض نموذج إضافة آلة
function showAddMachineForm() {
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-plus"></i> إضافة آلة جديدة</h5>
            </div>
            <div class="card-body">
                <form id="addMachineForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="machineName" class="form-label">الاسم *</label>
                                <input type="text" class="form-control" id="machineName" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="machineType" class="form-label">النوع *</label>
                                <input type="text" class="form-control" id="machineType" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="machinePhone" class="form-label">الهاتف *</label>
                                <input type="tel" class="form-control" id="machinePhone" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="machineAvailable" class="form-label">الحالة</label>
                                <select class="form-control" id="machineAvailable">
                                    <option value="true">متاحة</option>
                                    <option value="false">غير متاحة</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="machineNotes" class="form-label">ملاحظات</label>
                        <textarea class="form-control" id="machineNotes" rows="2"></textarea>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" onclick="showAdminMachines()">
                            <i class="fas fa-arrow-right"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add form submit handler - إضافة معالج إرسال النموذج
    document.getElementById('addMachineForm').addEventListener('submit', handleAddMachine);
}

// Handle add machine - معالجة إضافة آلة
async function handleAddMachine(e) {
    e.preventDefault();
    
    const machineData = {
        name: document.getElementById('machineName').value,
        type: document.getElementById('machineType').value,
        phone: document.getElementById('machinePhone').value,
        available: document.getElementById('machineAvailable').value,
        notes: document.getElementById('machineNotes').value
    };
    
    if (await saveData('machines', machineData)) {
        showAdminMachines();
    }
}

// Edit machine - تعديل آلة
function editMachine(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete machine - حذف آلة
async function deleteMachine(id) {
    if (confirm('هل أنت متأكد من حذف هذه الآلة؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'machine',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('machines');
                showSuccess('تم حذف الآلة بنجاح');
                showAdminMachines();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting machine:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show info message - عرض رسالة معلومات
function showInfo(message) {
    console.log('Info:', message);
    // In a real implementation, this would show a toast or modal
    // في التطبيق الحقيقي، هذا سيعرض toast أو modal
}

// Logout admin function - وظيفة تسجيل خروج الإدارة
function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    showSuccess('تم تسجيل الخروج بنجاح');
    navigateToPage('home');
}

// Show admin shops management - عرض إدارة المحلات
async function showAdminShops() {
    const shops = await getData('shops');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-store"></i> إدارة المحلات</h5>
                <button class="btn btn-success btn-sm" onclick="showAddShopForm()">
                    <i class="fas fa-plus"></i> إضافة محل
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>النوع</th>
                                <th>الهاتف</th>
                                <th>العنوان</th>
                                <th>ساعات العمل</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shops.map(shop => `
                                <tr>
                                    <td>${shop.name || '-'}</td>
                                    <td>${shop.type || '-'}</td>
                                    <td>${shop.phone || '-'}</td>
                                    <td>${shop.address || '-'}</td>
                                    <td>${shop.hours || '-'}</td>
                                    <td>
                                        <span class="badge bg-${shop.status === 'نشط' ? 'success' : 'secondary'}">
                                            ${shop.status || 'نشط'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-primary btn-sm" onclick="editShop('${shop.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteShop('${shop.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show add shop form - عرض نموذج إضافة محل
function showAddShopForm() {
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-plus"></i> إضافة محل جديد</h5>
            </div>
            <div class="card-body">
                <form id="addShopForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopName" class="form-label">الاسم *</label>
                                <input type="text" class="form-control" id="shopName" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopType" class="form-label">النوع *</label>
                                <input type="text" class="form-control" id="shopType" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopPhone" class="form-label">الهاتف *</label>
                                <input type="tel" class="form-control" id="shopPhone" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopHours" class="form-label">ساعات العمل *</label>
                                <input type="text" class="form-control" id="shopHours" required placeholder="مثال: 9:00 - 5:00">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopAddress" class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="shopAddress">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopStatus" class="form-label">الحالة</label>
                                <select class="form-control" id="shopStatus">
                                    <option value="نشط">نشط</option>
                                    <option value="غير نشط">غير نشط</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopPassword" class="form-label">كلمة المرور</label>
                                <input type="password" class="form-control" id="shopPassword" placeholder="للتسجيل كصاحب محل">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="shopNotes" class="form-label">ملاحظات</label>
                                <textarea class="form-control" id="shopNotes" rows="1"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" onclick="showAdminShops()">
                            <i class="fas fa-arrow-right"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add form submit handler - إضافة معالج إرسال النموذج
    document.getElementById('addShopForm').addEventListener('submit', handleAddShop);
}

// Handle add shop - معالجة إضافة محل
async function handleAddShop(e) {
    e.preventDefault();
    
    const shopData = {
        name: document.getElementById('shopName').value,
        type: document.getElementById('shopType').value,
        phone: document.getElementById('shopPhone').value,
        hours: document.getElementById('shopHours').value,
        address: document.getElementById('shopAddress').value,
        status: document.getElementById('shopStatus').value,
        password: document.getElementById('shopPassword').value,
        notes: document.getElementById('shopNotes').value
    };
    
    if (await saveData('shops', shopData)) {
        showAdminShops();
    }
}

// Edit shop - تعديل محل
function editShop(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete shop - حذف محل
async function deleteShop(id) {
    if (confirm('هل أنت متأكد من حذف هذا المحل؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'shop',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('shops');
                showSuccess('تم حذف المحل بنجاح');
                showAdminShops();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting shop:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show admin offers management - عرض إدارة العروض
async function showAdminOffers() {
    const offers = await getData('offers');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-percentage"></i> إدارة العروض</h5>
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="showPendingOffers()">
                        <i class="fas fa-clock"></i> العروض المعلقة
                    </button>
                    <button class="btn btn-success btn-sm" onclick="showAddOfferForm()">
                        <i class="fas fa-plus"></i> إضافة عرض
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم المحل</th>
                                <th>الوصف</th>
                                <th>الخصم</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${offers.map(offer => `
                                <tr>
                                    <td>${offer.shopName || '-'}</td>
                                    <td>${offer.description || '-'}</td>
                                    <td>
                                        <span class="badge bg-danger">${offer.discount || '-'}</span>
                                    </td>
                                    <td>${offer.phone || '-'}</td>
                                    <td>
                                        <span class="badge bg-${offer.approved === 'true' || offer.approved === true ? 'success' : offer.rejected === 'true' || offer.rejected === true ? 'danger' : 'warning'}">
                                            ${offer.approved === 'true' || offer.approved === true ? 'موافق عليه' : offer.rejected === 'true' || offer.rejected === true ? 'مرفوض' : 'معلق'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            ${!offer.approved && !offer.rejected ? `
                                                <button class="btn btn-success btn-sm" onclick="approveOffer('${offer.id}')">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="rejectOffer('${offer.id}')">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-primary btn-sm" onclick="editOffer('${offer.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteOffer('${offer.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show pending offers - عرض العروض المعلقة
async function showPendingOffers() {
    const offers = await getData('offers');
    const pendingOffers = offers.filter(offer => !offer.approved && !offer.rejected);
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-clock"></i> العروض المعلقة (${pendingOffers.length})</h5>
                <button class="btn btn-info btn-sm" onclick="showAdminOffers()">
                    <i class="fas fa-arrow-right"></i> جميع العروض
                </button>
            </div>
            <div class="card-body">
                ${pendingOffers.length === 0 ? `
                    <div class="text-center text-muted">
                        <i class="fas fa-check-circle fa-3x mb-3"></i>
                        <h5>لا توجد عروض معلقة</h5>
                        <p>جميع العروض تمت مراجعتها</p>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>اسم المحل</th>
                                    <th>الوصف</th>
                                    <th>الخصم</th>
                                    <th>الهاتف</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingOffers.map(offer => `
                                    <tr>
                                        <td>${offer.shopName || '-'}</td>
                                        <td>${offer.description || '-'}</td>
                                        <td>
                                            <span class="badge bg-danger">${offer.discount || '-'}</span>
                                        </td>
                                        <td>${offer.phone || '-'}</td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <button class="btn btn-success btn-sm" onclick="approveOffer('${offer.id}')">
                                                    <i class="fas fa-check"></i> موافقة
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="rejectOffer('${offer.id}')">
                                                    <i class="fas fa-times"></i> رفض
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Approve offer - موافقة على عرض
async function approveOffer(id) {
    try {
        const response = await fetch(CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'approve',
                type: 'offer',
                id: id,
                approve: true
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            clearCache('offers');
            showSuccess('تمت الموافقة على العرض بنجاح');
            showPendingOffers();
        } else {
            showError(result.message || 'حدث خطأ أثناء الموافقة');
        }
    } catch (error) {
        console.error('Error approving offer:', error);
        showError('حدث خطأ أثناء الموافقة');
    }
}

// Reject offer - رفض عرض
async function rejectOffer(id) {
    if (confirm('هل أنت متأكد من رفض هذا العرض؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approve',
                    type: 'offer',
                    id: id,
                    approve: false
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('offers');
                showSuccess('تم رفض العرض بنجاح');
                showPendingOffers();
            } else {
                showError(result.message || 'حدث خطأ أثناء الرفض');
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            showError('حدث خطأ أثناء الرفض');
        }
    }
}

// Edit offer - تعديل عرض
function editOffer(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete offer - حذف عرض
async function deleteOffer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'offer',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('offers');
                showSuccess('تم حذف العرض بنجاح');
                showAdminOffers();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show add offer form - عرض نموذج إضافة عرض
function showAddOfferForm() {
    showInfo('وظيفة إضافة العروض قيد التطوير');
}

// Show admin ads management - عرض إدارة الإعلانات
async function showAdminAds() {
    const ads = await getData('ads');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-bullhorn"></i> إدارة الإعلانات</h5>
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="showPendingAds()">
                        <i class="fas fa-clock"></i> الإعلانات المعلقة
                    </button>
                    <button class="btn btn-success btn-sm" onclick="showAddAdForm()">
                        <i class="fas fa-plus"></i> إضافة إعلان
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>العنوان</th>
                                <th>الوصف</th>
                                <th>النوع</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ads.map(ad => `
                                <tr>
                                    <td>${ad.title || '-'}</td>
                                    <td>${ad.description ? ad.description.substring(0, 50) + '...' : '-'}</td>
                                    <td>
                                        <span class="badge bg-info">${ad.type || '-'}</span>
                                    </td>
                                    <td>${ad.phone || '-'}</td>
                                    <td>
                                        <span class="badge bg-${ad.approved === 'true' || ad.approved === true ? 'success' : ad.rejected === 'true' || ad.rejected === true ? 'danger' : 'warning'}">
                                            ${ad.approved === 'true' || ad.approved === true ? 'موافق عليه' : ad.rejected === 'true' || ad.rejected === true ? 'مرفوض' : 'معلق'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            ${!ad.approved && !ad.rejected ? `
                                                <button class="btn btn-success btn-sm" onclick="approveAd('${ad.id}')">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="rejectAd('${ad.id}')">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-primary btn-sm" onclick="editAd('${ad.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteAd('${ad.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show pending ads - عرض الإعلانات المعلقة
async function showPendingAds() {
    const ads = await getData('ads');
    const pendingAds = ads.filter(ad => !ad.approved && !ad.rejected);
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-clock"></i> الإعلانات المعلقة (${pendingAds.length})</h5>
                <button class="btn btn-info btn-sm" onclick="showAdminAds()">
                    <i class="fas fa-arrow-right"></i> جميع الإعلانات
                </button>
            </div>
            <div class="card-body">
                ${pendingAds.length === 0 ? `
                    <div class="text-center text-muted">
                        <i class="fas fa-check-circle fa-3x mb-3"></i>
                        <h5>لا توجد إعلانات معلقة</h5>
                        <p>جميع الإعلانات تمت مراجعتها</p>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>العنوان</th>
                                    <th>الوصف</th>
                                    <th>النوع</th>
                                    <th>الهاتف</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingAds.map(ad => `
                                    <tr>
                                        <td>${ad.title || '-'}</td>
                                        <td>${ad.description ? ad.description.substring(0, 50) + '...' : '-'}</td>
                                        <td>
                                            <span class="badge bg-info">${ad.type || '-'}</span>
                                        </td>
                                        <td>${ad.phone || '-'}</td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <button class="btn btn-success btn-sm" onclick="approveAd('${ad.id}')">
                                                    <i class="fas fa-check"></i> موافقة
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="rejectAd('${ad.id}')">
                                                    <i class="fas fa-times"></i> رفض
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Approve ad - موافقة على إعلان
async function approveAd(id) {
    try {
        const response = await fetch(CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'approve',
                type: 'ad',
                id: id,
                approve: true
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            clearCache('ads');
            showSuccess('تمت الموافقة على الإعلان بنجاح');
            showPendingAds();
        } else {
            showError(result.message || 'حدث خطأ أثناء الموافقة');
        }
    } catch (error) {
        console.error('Error approving ad:', error);
        showError('حدث خطأ أثناء الموافقة');
    }
}

// Reject ad - رفض إعلان
async function rejectAd(id) {
    if (confirm('هل أنت متأكد من رفض هذا الإعلان؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approve',
                    type: 'ad',
                    id: id,
                    approve: false
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('ads');
                showSuccess('تم رفض الإعلان بنجاح');
                showPendingAds();
            } else {
                showError(result.message || 'حدث خطأ أثناء الرفض');
            }
        } catch (error) {
            console.error('Error rejecting ad:', error);
            showError('حدث خطأ أثناء الرفض');
        }
    }
}

// Edit ad - تعديل إعلان
function editAd(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete ad - حذف إعلان
async function deleteAd(id) {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'ad',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('ads');
                showSuccess('تم حذف الإعلان بنجاح');
                showAdminAds();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting ad:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show add ad form - عرض نموذج إضافة إعلان
function showAddAdForm() {
    showInfo('وظيفة إضافة الإعلانات قيد التطوير');
}

// Show admin news management - عرض إدارة الأخبار
async function showAdminNews() {
    const news = await getData('news');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-newspaper"></i> إدارة الأخبار</h5>
                <button class="btn btn-success btn-sm" onclick="showAddNewsForm()">
                    <i class="fas fa-plus"></i> إضافة خبر
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>العنوان</th>
                                <th>المحتوى</th>
                                <th>الكاتب</th>
                                <th>التاريخ</th>
                                <th>الأهمية</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${news.map(item => `
                                <tr>
                                    <td>${item.title || '-'}</td>
                                    <td>${item.content ? item.content.substring(0, 50) + '...' : '-'}</td>
                                    <td>${item.author || '-'}</td>
                                    <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
                                    <td>
                                        <span class="badge bg-${item.urgent === 'true' || item.urgent === true ? 'danger' : 'secondary'}">
                                            ${item.urgent === 'true' || item.urgent === true ? 'عاجل' : 'عادي'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-primary btn-sm" onclick="editNews('${item.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteNews('${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show add news form - عرض نموذج إضافة خبر
function showAddNewsForm() {
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-plus"></i> إضافة خبر جديد</h5>
            </div>
            <div class="card-body">
                <form id="addNewsForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="newsTitle" class="form-label">العنوان *</label>
                                <input type="text" class="form-control" id="newsTitle" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="newsAuthor" class="form-label">الكاتب</label>
                                <input type="text" class="form-control" id="newsAuthor">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="newsContent" class="form-label">المحتوى *</label>
                        <textarea class="form-control" id="newsContent" rows="5" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="newsUrgent" class="form-label">الأهمية</label>
                                <select class="form-control" id="newsUrgent">
                                    <option value="false">عادي</option>
                                    <option value="true">عاجل</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="newsType" class="form-label">النوع</label>
                                <select class="form-control" id="newsType">
                                    <option value="عام">عام</option>
                                    <option value="إعلان">إعلان</option>
                                    <option value="نشاط">نشاط</option>
                                    <option value="تحذير">تحذير</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" onclick="showAdminNews()">
                            <i class="fas fa-arrow-right"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add form submit handler - إضافة معالج إرسال النموذج
    document.getElementById('addNewsForm').addEventListener('submit', handleAddNews);
}

// Handle add news - معالجة إضافة خبر
async function handleAddNews(e) {
    e.preventDefault();
    
    const newsData = {
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        author: document.getElementById('newsAuthor').value || 'الإدارة',
        urgent: document.getElementById('newsUrgent').value,
        type: document.getElementById('newsType').value
    };
    
    if (await saveData('news', newsData)) {
        showAdminNews();
    }
}

// Edit news - تعديل خبر
function editNews(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete news - حذف خبر
async function deleteNews(id) {
    if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'news',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('news');
                showSuccess('تم حذف الخبر بنجاح');
                showAdminNews();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting news:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// Show admin emergency management - عرض إدارة الطوارئ
async function showAdminEmergency() {
    const emergency = await getData('emergency');
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-ambulance"></i> إدارة الطوارئ</h5>
                <button class="btn btn-success btn-sm" onclick="showAddEmergencyForm()">
                    <i class="fas fa-plus"></i> إضافة رقم طوارئ
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>العنوان</th>
                                <th>النوع</th>
                                <th>ملاحظات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${emergency.map(item => `
                                <tr>
                                    <td>${item.name || '-'}</td>
                                    <td>
                                        <a href="tel:${item.phone}" class="btn btn-sm btn-primary">
                                            <i class="fas fa-phone"></i> ${item.phone || '-'}
                                        </a>
                                    </td>
                                    <td>${item.address || '-'}</td>
                                    <td>
                                        <span class="badge bg-dark">${item.icon || 'emergency'}</span>
                                    </td>
                                    <td>${item.notes ? item.notes.substring(0, 30) + '...' : '-'}</td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-primary btn-sm" onclick="editEmergency('${item.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteEmergency('${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Show add emergency form - عرض نموذج إضافة رقم طوارئ
function showAddEmergencyForm() {
    const contentArea = document.getElementById('adminContentArea');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-plus"></i> إضافة رقم طوارئ جديد</h5>
            </div>
            <div class="card-body">
                <form id="addEmergencyForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="emergencyName" class="form-label">الاسم *</label>
                                <input type="text" class="form-control" id="emergencyName" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="emergencyPhone" class="form-label">الهاتف *</label>
                                <input type="tel" class="form-control" id="emergencyPhone" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="emergencyAddress" class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="emergencyAddress">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="emergencyIcon" class="form-label">النوع</label>
                                <select class="form-control" id="emergencyIcon">
                                    <option value="ambulance">إسعاف</option>
                                    <option value="fire">إطفاء</option>
                                    <option value="police">شرطة</option>
                                    <option value="hospital">مستشفى</option>
                                    <option value="emergency">طوارئ عام</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="emergencyNotes" class="form-label">ملاحظات</label>
                        <textarea class="form-control" id="emergencyNotes" rows="2"></textarea>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" onclick="showAdminEmergency()">
                            <i class="fas fa-arrow-right"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add form submit handler - إضافة معالج إرسال النموذج
    document.getElementById('addEmergencyForm').addEventListener('submit', handleAddEmergency);
}

// Handle add emergency - معالجة إضافة رقم طوارئ
async function handleAddEmergency(e) {
    e.preventDefault();
    
    const emergencyData = {
        name: document.getElementById('emergencyName').value,
        phone: document.getElementById('emergencyPhone').value,
        address: document.getElementById('emergencyAddress').value,
        icon: document.getElementById('emergencyIcon').value,
        notes: document.getElementById('emergencyNotes').value
    };
    
    if (await saveData('emergency', emergencyData)) {
        showAdminEmergency();
    }
}

// Edit emergency - تعديل رقم طوارئ
function editEmergency(id) {
    showInfo('وظيفة التعديل قيد التطوير');
}

// Delete emergency - حذف رقم طوارئ
async function deleteEmergency(id) {
    if (confirm('هل أنت متأكد من حذف هذا الرقم؟')) {
        try {
            const response = await fetch(CONFIG.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    type: 'emergency',
                    id: id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                clearCache('emergency');
                showSuccess('تم حذف الرقم بنجاح');
                showAdminEmergency();
            } else {
                showError(result.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting emergency:', error);
            showError('حدث خطأ أثناء الحذف');
        }
    }
}

// System settings - إعدادات النظام
function showSystemSettings() {
    showInfo('إعدادات النظام قيد التطوير');
}

// System logs - سجلات النظام
function showSystemLogs() {
    showInfo('سجلات النظام قيد التطوير');
}

function initializeShopOwnerPage() {
    // Implementation for shop owner page initialization - تهيئة صفحة أصحاب المحلات
}

// =============================================================================
// INITIAL DATA LOADING
// =============================================================================

// Load Initial Data - تحميل البيانات الأولية
async function loadInitialData() {
    try {
        // Load latest news for homepage - تحميل آخر الأخبار للصفحة الرئيسية
        const news = await getData('news');
        const latestNews = news.slice(0, 3);
        
        if (latestNews.length > 0) {
            elements.latestNewsList.innerHTML = latestNews.map(item => `
                <div class="news-item">
                    <h4>${item.title}</h4>
                    <div class="news-date">${new Date(item.date).toLocaleDateString('ar-EG')}</div>
                    <p>${item.content.substring(0, 150)}...</p>
                </div>
            `).join('');
        } else {
            elements.latestNewsList.innerHTML = `
                <div class="news-item">
                    <h4>لا توجد أخبار حالياً</h4>
                    <div class="news-date">${new Date().toLocaleDateString('ar-EG')}</div>
                    <p>سيتم عرض الأخبار المعتمدة من الإدارة هنا عند إضافتها</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        elements.latestNewsList.innerHTML = `
            <div class="news-item">
                <h4>خطأ في تحميل الأخبار</h4>
                <div class="news-date">${new Date().toLocaleDateString('ar-EG')}</div>
                <p>يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>
        `;
    }
}

// =============================================================================
// CACHED DATA LOADING
// =============================================================================

// Load Cached Data - تحميل البيانات المخزنة مؤقتاً
function loadCachedData() {
    // Load any cached data on startup - تحميل أي بيانات مخزنة عند بدء التشغيل
    const cachedTypes = ['craftsmen', 'machines', 'shops', 'offers', 'ads', 'emergency', 'news'];
    cachedTypes.forEach(type => {
        const cached = getFromCache(type);
        if (cached) {
            appData[type] = cached;
        }
    });
}

// =============================================================================
// PWA INITIALIZATION
// =============================================================================

// Initialize PWA - تهيئة تطبيق الويب التقدمي
function initializePWA() {
    // Check if service worker is supported - التحقق من دعم Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
}

// =============================================================================
// EVENT LISTENERS AND APP STARTUP
// =============================================================================

// Refresh Data - تحديث البيانات
elements.refreshBtn.addEventListener('click', async () => {
    clearCache();
    await loadInitialData();
    showSuccess('تم تحديث البيانات');
});

// Handle online/offline status - التعامل مع حالة الاتصال بالإنترنت
window.addEventListener('online', () => {
    showSuccess('تم الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    showError('انقطع الاتصال بالإنترنت - يعمل التطبيق في وضع عدم الاتصال');
});

// Initialize app when DOM is ready - تهيئة التطبيق عندما يكون DOM جاهزاً
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
