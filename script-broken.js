// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

// Global Variables
let currentPage = 'home';
let userData = {};
let appData = {};

// Update CONFIG to use API_CONFIG
const CONFIG = {
    ...API_CONFIG,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    OFFLINE_MODE: true
};

// DOM Elements
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

// Initialize App
async function initializeApp() {
    try {
        // Load cached data
        loadCachedData();
        
        // Initialize navigation
        initializeNavigation();
        
        // Initialize quick actions
        initializeQuickActions();
        
        // Load initial data
        await loadInitialData();
        
        // Hide loading screen
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
        
        // Initialize PWA
        initializePWA();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('حدث خطأ أثناء تحميل التطبيق');
    }
}

// =============================================================================
// NAVIGATION SYSTEM
// =============================================================================

// Initialize navigation
function initializeNavigation() {
    // Menu toggle
    elements.menuBtn.addEventListener('click', () => {
        elements.mainNav.classList.add('active');
    });
    
    elements.closeNav.addEventListener('click', () => {
        elements.mainNav.classList.remove('active');
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
            elements.mainNav.classList.remove('active');
        });
    });
}

// Quick Actions
function initializeQuickActions() {
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            navigateToPage(page);
        });
    });
}

// Page Navigation
function navigateToPage(page) {
    currentPage = page;
    
    // Close navigation if open
    elements.mainNav.classList.remove('active');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    if (page === 'home') {
        elements.homePage.classList.add('active');
        elements.pageContent.innerHTML = '';
    } else {
        elements.homePage.classList.remove('active');
        loadPage(page);
    }
    
    // Update active nav link
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

// Load Page Content
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

// Load Craftsmen Page
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

// Data Management
async function getData(type) {
    try {
        // Try to get from cache first
        const cached = getFromCache(type);
        if (cached) {
            return cached;
        }
        
        // Fetch from API using apiClient
        const data = await apiClient[`get${type.charAt(0).toUpperCase() + type.slice(1)}`]();
        
        // Cache the data
        setCache(type, data);
        
        return data;
        
    } catch (error) {
        console.error('Error fetching data:', error);
        // Return cached data if available
        return getFromCache(type) || [];
    }
}

async function saveData(type, data) {
    try {
        // Save using apiClient
        const methodName = `save${type.charAt(0).toUpperCase() + type.slice(1).slice(0, -1)}`;
        const result = await apiClient[methodName](data);
        
        if (result) {
            // Clear cache
            clearCache(type);
            showSuccess('تم حفظ البيانات بنجاح');
            return true;
        } else {
            showError('حدث خطأ أثناء حفظ البيانات');
            return false;
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showError(handleApiError(error) || 'حدث خطأ أثناء حفظ البيانات');
        return false;
    }
}

// =============================================================================
// CACHE MANAGEMENT SYSTEM
// =============================================================================

// Cache Management
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
            // Clear all cache
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

// Show Loading
function showLoading() {
    // Implementation for loading indicator
    console.log('Loading...');
}

// Hide Loading
function hideLoading() {
    // Implementation for hiding loading indicator
    console.log('Loading complete');
}

// Show Success Message
function showSuccess(message) {
    // Implementation for success notification
    console.log('Success:', message);
}

// Show Error Message
function showError(message) {
    // Implementation for error notification
    console.error('Error:', message);
}

// Call Phone
function callPhone(phone) {
    window.location.href = `tel:${phone}`;
}

// =============================================================================
// ADMIN AUTHENTICATION
// =============================================================================

function isAdmin() {
    // Check if user is logged in as admin
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// =============================================================================
// PAGE SCRIPTS INITIALIZATION
// =============================================================================

function initializePageScripts(page) {
    // Initialize page-specific scripts
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
        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'admin123') {
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

function initializeCraftsmenPage() {
    const filter = document.getElementById('craftsmanFilter');
    if (filter) {
        filter.addEventListener('change', filterCraftsmen);
    }
}

function initializeMachinesPage() {
    const filter = document.getElementById('machineFilter');
    if (filter) {
        filter.addEventListener('change', filterMachines);
    }
}

function initializeShopsPage() {
    const filter = document.getElementById('shopFilter');
    if (filter) {
        filter.addEventListener('change', filterShops);
    }
}

function initializeShopOwnerPage() {
    // Implementation for shop owner page initialization
}

// =============================================================================
// INITIAL DATA LOADING
// =============================================================================

// Load Initial Data
async function loadInitialData() {
    try {
        // Load latest news for homepage
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

// Load Cached Data
function loadCachedData() {
    // Load any cached data on startup
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

// Initialize PWA
function initializePWA() {
    // Check if service worker is supported
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

// Refresh Data
elements.refreshBtn.addEventListener('click', async () => {
    clearCache();
    await loadInitialData();
    showSuccess('تم تحديث البيانات');
});

// Handle online/offline status
window.addEventListener('online', () => {
    showSuccess('تم الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    showError('انقطع الاتصال بالإنترنت - يعمل التطبيق في وضع عدم الاتصال');
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label>اسم المستخدم:</label>
                        <input type="text" id="adminUsername" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور:</label>
                        <input type="password" id="adminPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">تسجيل الدخول</button>
                </form>
            </div>
        `;
    }
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-cog"></i> لوحة تحكم الإدارة</h2>
        </div>
        
        <div class="admin-dashboard">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>الصنايعية</h3>
                    <span class="stat-number">${(await getData('craftsmen')).length}</span>
                </div>
                <div class="stat-card">
                    <h3>الآلات الزراعية</h3>
                    <span class="stat-number">${(await getData('machines')).length}</span>
                </div>
                <div class="stat-card">
                    <h3>المحلات التجارية</h3>
                    <span class="stat-number">${(await getData('shops')).length}</span>
                </div>
                <div class="stat-card">
                    <h3>الإعلانات المعلقة</h3>
                    <span class="stat-number">${(await getData('ads')).filter(ad => !ad.approved).length}</span>
                </div>
            </div>
            
            <div class="admin-actions">
                <h3>الإجراءات السريعة</h3>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="navigateToPage('craftsmen')">إدارة الصنايعية</button>
                    <button class="btn btn-primary" onclick="navigateToPage('machines')">إدارة الآلات</button>
                    <button class="btn btn-primary" onclick="navigateToPage('shops')">إدارة المحلات</button>
                    <button class="btn btn-warning" onclick="showPendingAds()">مراجعة الإعلانات</button>
                    <button class="btn btn-warning" onclick="showPendingOffers()">مراجعة العروض</button>
                    <button class="btn btn-success" onclick="showAddNewsForm()">إضافة خبر</button>
                </div>
            </div>
        </div>
    `;
}

async function loadShopOwnerPage() {
    return `
        <div class="page-header">
            <h2><i class="fas fa-store"></i> لوحة أصحاب المحلات</h2>
        </div>
        
        <div class="shop-owner-panel">
            <div class="login-section" id="loginSection">
                <h3>تسجيل الدخول</h3>
                <form id="shopOwnerLogin">
                    <div class="form-group">
                        <label>رقم الهاتف:</label>
                        <input type="tel" id="ownerPhone" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور:</label>
                        <input type="password" id="ownerPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">تسجيل الدخول</button>
                </form>
            </div>
            
            <div class="dashboard-section d-none" id="dashboardSection">
                <h3>لوحة التحكم</h3>
                <div class="shop-info">
                    <h4>معلومات المحل</h4>
                    <div id="shopInfoContent"></div>
                </div>
                
                <div class="offers-management">
                    <h4>إدارة العروض</h4>
                    <button class="btn btn-primary" onclick="showAddOfferForm()">إضافة عرض جديد</button>
                    <div id="offersList"></div>
                </div>
            </div>
        </div>
    `;
}

// Data Management
async function getData(type) {
    try {
        // Try to get from cache first
        const cached = getFromCache(type);
        if (cached) {
            return cached;
        }
        
        // Fetch from API using apiClient
        const data = await apiClient[`get${type.charAt(0).toUpperCase() + type.slice(1)}`]();
        
        // Cache the data
        setCache(type, data);
        
        return data;
        
    } catch (error) {
        console.error('Error fetching data:', error);
        // Return cached data if available
        return getFromCache(type) || [];
    }
}

async function saveData(type, data) {
    try {
        // Save using apiClient
        const methodName = `save${type.charAt(0).toUpperCase() + type.slice(1).slice(0, -1)}`;
        const result = await apiClient[methodName](data);
        
        if (result) {
            // Clear cache
            clearCache(type);
            showSuccess('تم حفظ البيانات بنجاح');
            return true;
        } else {
            showError('حدث خطأ أثناء حفظ البيانات');
            return false;
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showError(handleApiError(error) || 'حدث خطأ أثناء حفظ البيانات');
        return false;
    }
}

// Cache Management
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CONFIG.CACHE_DURATION) {
                return data;
            }
        }
    } catch (error) {
        console.error('Error reading from cache:', error);
    }
    return null;
}

function setCache(key, data) {
    try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error writing to cache:', error);
    }
}

function clearCache(key = null) {
    try {
        if (key) {
            localStorage.removeItem(`cache_${key}`);
        } else {
            // Clear all cache
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('cache_')) {
                    localStorage.removeItem(k);
                }
            });
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

// Utility Functions
function showLoading() {
    // Show loading indicator
    const loading = document.createElement('div');
    loading.id = 'pageLoading';
    loading.className = 'page-loading';
    loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('pageLoading');
    if (loading) {
        loading.remove();
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function callPhone(phone) {
    window.location.href = `tel:${phone}`;
}

function isAdmin() {
    // Check if user is logged in as admin
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function initializePageScripts(page) {
    // Initialize page-specific scripts
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
        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'admin123') {
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

function initializeCraftsmenPage() {
    const filter = document.getElementById('craftsmanFilter');
    if (filter) {
        filter.addEventListener('change', filterCraftsmen);
    }
}

function initializeMachinesPage() {
    const filter = document.getElementById('machineFilter');
    if (filter) {
        filter.addEventListener('change', filterMachines);
    }
}

function initializeShopsPage() {
    const filter = document.getElementById('shopFilter');
    if (filter) {
        filter.addEventListener('change', filterShops);
    }
}

function initializeShopOwnerPage() {
    const loginForm = document.getElementById('shopOwnerLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', handleShopOwnerLogin);
    }
}

// Filter Functions
function filterCraftsmen() {
    const filter = document.getElementById('craftsmanFilter').value;
    const cards = document.querySelectorAll('.craftsmen-list .card');
    
    cards.forEach(card => {
        const specialty = card.querySelector('p:nth-child(2)').textContent.replace('التخصص: ', '');
        if (!filter || specialty === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterMachines() {
    const filter = document.getElementById('machineFilter').value;
    const cards = document.querySelectorAll('.machines-list .card');
    
    cards.forEach(card => {
        const type = card.querySelector('p:nth-child(2)').textContent.replace('نوع المعدة: ', '');
        if (!filter || type === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterShops() {
    const filter = document.getElementById('shopFilter').value;
    const cards = document.querySelectorAll('.shops-list .card');
    
    cards.forEach(card => {
        const type = card.querySelector('p:nth-child(2)').textContent.replace('النوع: ', '');
        if (!filter || type === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Form Handlers
function showAddCraftsmanForm() {
    const form = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>إضافة صنايعي جديد</h3>
                    <button onclick="closeModal()">&times;</button>
                </div>
                <form id="addCraftsmanForm">
                    <div class="form-group">
                        <label>الاسم:</label>
                        <input type="text" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>التخصص:</label>
                        <select name="specialty" class="form-control" required>
                            <option value="">اختر التخصص</option>
                            <option value="كهربائي">كهربائي</option>
                            <option value="سباك">سباك</option>
                            <option value="نجار">نجار</option>
                            <option value="حداد">حداد</option>
                            <option value="فني أجهزة">فني أجهزة</option>
                            <option value="ميكانيكي زراعي">ميكانيكي زراعي</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>رقم الهاتف:</label>
                        <input type="tel" name="phone" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>ملاحظات:</label>
                        <textarea name="notes" class="form-control"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" onclick="closeModal()" class="btn btn-outline">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', form);
    document.getElementById('addCraftsmanForm').addEventListener('submit', handleAddCraftsman);
}

async function handleAddCraftsman(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (await saveData('craftsmen', data)) {
        closeModal();
        navigateToPage('craftsmen');
    }
}

// Modal Functions
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load latest news for homepage
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

// Load Cached Data
function loadCachedData() {
    // Load any cached data on startup
    const cachedTypes = ['craftsmen', 'machines', 'shops', 'offers', 'ads', 'emergency', 'news'];
    cachedTypes.forEach(type => {
        const cached = getFromCache(type);
        if (cached) {
            appData[type] = cached;
        }
    });
}

// PWA Initialization
function initializePWA() {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
}

// Refresh Data
elements.refreshBtn.addEventListener('click', async () => {
    clearCache();
    await loadInitialData();
    showSuccess('تم تحديث البيانات');
});

// Handle online/offline status
window.addEventListener('online', () => {
    showSuccess('تم الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    showError('انقطع الاتصال بالإنترنت - يعمل التطبيق في وضع عدم الاتصال');
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
