// Global Variables
let currentPage = 'home';
let userData = {};
let appData = {};

// Configuration
const CONFIG = {
    GOOGLE_SCRIPTS_URL: 'YOUR_GOOGLE_SCRIPTS_URL_HERE',
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
    refreshBtn: document.getElementById('refreshBtn'),
    adminLink: document.getElementById('adminLink'),
    shopOwnerLink: document.getElementById('shopOwnerLink')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

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

// Navigation
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
    
    // Admin and shop owner links
    elements.adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('admin');
    });
    
    elements.shopOwnerLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('shop-owner');
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
    } finally {
        hideLoading();
    }
}

// Page Loaders
async function loadCraftsmenPage() {
    const craftsmen = await getData('craftsmen');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-tools"></i> الصنايعية والخدمات</h2>
            <button class="btn btn-primary" onclick="showAddCraftsmanForm()">
                <i class="fas fa-plus"></i> إضافة صنايعي
            </button>
        </div>
        
        <div class="filters">
            <select id="craftsmanFilter" class="form-control">
                <option value="">جميع التخصصات</option>
                <option value="كهربائي">كهربائي</option>
                <option value="سباك">سباك</option>
                <option value="نجار">نجار</option>
                <option value="حداد">حداد</option>
                <option value="فني أجهزة">فني أجهزة</option>
                <option value="ميكانيكي زراعي">ميكانيكي زراعي</option>
            </select>
        </div>
        
        <div class="craftsmen-list">
            ${craftsmen.map(craftsman => `
                <div class="card">
                    <div class="card-body">
                        <h4>${craftsman.name}</h4>
                        <p><strong>التخصص:</strong> ${craftsman.specialty}</p>
                        <p><strong>رقم الهاتف:</strong> <a href="tel:${craftsman.phone}">${craftsman.phone}</a></p>
                        ${craftsman.notes ? `<p><strong>ملاحظات:</strong> ${craftsman.notes}</p>` : ''}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="callPhone('${craftsman.phone}')">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadMachinesPage() {
    const machines = await getData('machines');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-tractor"></i> أصحاب الآلات الزراعية</h2>
            <button class="btn btn-primary" onclick="showAddMachineForm()">
                <i class="fas fa-plus"></i> إضافة آلة
            </button>
        </div>
        
        <div class="filters">
            <select id="machineFilter" class="form-control">
                <option value="">جميع الآلات</option>
                <option value="جرار">جرار</option>
                <option value="حصادة">حصادة</option>
                <option value="ماكينة ري">ماكينة ري</option>
                <option value="دراس">دراس</option>
                <option value="عربات نقل">عربات نقل</option>
            </select>
        </div>
        
        <div class="machines-list">
            ${machines.map(machine => `
                <div class="card">
                    <div class="card-body">
                        <h4>${machine.name}</h4>
                        <p><strong>نوع المعدة:</strong> ${machine.type}</p>
                        <p><strong>رقم الهاتف:</strong> <a href="tel:${machine.phone}">${machine.phone}</a></p>
                        <p><strong>حالة التوفر:</strong> 
                            <span class="badge ${machine.available ? 'badge-success' : 'badge-warning'}">
                                ${machine.available ? 'متاح' : 'مشغول'}
                            </span>
                        </p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="callPhone('${machine.phone}')">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadShopsPage() {
    const shops = await getData('shops');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-store"></i> المحلات التجارية</h2>
            <button class="btn btn-primary" onclick="showAddShopForm()">
                <i class="fas fa-plus"></i> إضافة محل
            </button>
        </div>
        
        <div class="filters">
            <select id="shopFilter" class="form-control">
                <option value="">جميع المحلات</option>
                <option value="بقالة">بقالة</option>
                <option value="صيدلية">صيدلية</option>
                <option value="مخبز">مخبز</option>
                <option value="أعلاف">أعلاف</option>
                <option value="أدوات زراعية">أدوات زراعية</option>
                <option value="حلاق">حلاق</option>
            </select>
        </div>
        
        <div class="shops-list">
            ${shops.map(shop => `
                <div class="card">
                    <div class="card-body">
                        <h4>${shop.name}</h4>
                        <p><strong>النوع:</strong> ${shop.type}</p>
                        <p><strong>رقم الهاتف:</strong> <a href="tel:${shop.phone}">${shop.phone}</a></p>
                        <p><strong>مواعيد العمل:</strong> ${shop.hours}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="callPhone('${shop.phone}')">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadOffersPage() {
    const offers = await getData('offers');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-tags"></i> العروض والتخفيضات</h2>
        </div>
        
        <div class="offers-list">
            ${offers.filter(offer => offer.approved).map(offer => `
                <div class="card">
                    <div class="card-header">
                        <h4>${offer.shopName}</h4>
                        <span class="badge badge-success">${offer.discount}% خصم</span>
                    </div>
                    <div class="card-body">
                        <p><strong>العرض:</strong> ${offer.description}</p>
                        <p><strong>المدة:</strong> ${offer.duration}</p>
                        <p><strong>رقم الهاتف:</strong> <a href="tel:${offer.phone}">${offer.phone}</a></p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="callPhone('${offer.phone}')">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadAdsPage() {
    const ads = await getData('ads');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-bullhorn"></i> الإعلانات المحلية</h2>
            <button class="btn btn-primary" onclick="showAddAdForm()">
                <i class="fas fa-plus"></i> إضافة إعلان
            </button>
        </div>
        
        <div class="ads-list">
            ${ads.filter(ad => ad.approved).map(ad => `
                <div class="card">
                    <div class="card-body">
                        <h4>${ad.title}</h4>
                        <p>${ad.description}</p>
                        <p><strong>النوع:</strong> ${ad.type}</p>
                        <p><strong>رقم الهاتف:</strong> <a href="tel:${ad.phone}">${ad.phone}</a></p>
                        <p><strong>التاريخ:</strong> ${new Date(ad.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="callPhone('${ad.phone}')">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadEmergencyPage() {
    const emergency = await getData('emergency');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-phone-alt"></i> أرقام الطوارئ والخدمات العامة</h2>
        </div>
        
        <div class="emergency-list">
            ${emergency.map(service => `
                <div class="card emergency-card">
                    <div class="card-body">
                        <h4><i class="${service.icon}"></i> ${service.name}</h4>
                        <p><strong>رقم الطوارئ:</strong> 
                            <a href="tel:${service.phone}" class="emergency-phone">${service.phone}</a>
                        </p>
                        ${service.address ? `<p><strong>العنوان:</strong> ${service.address}</p>` : ''}
                        ${service.notes ? `<p><strong>ملاحظات:</strong> ${service.notes}</p>` : ''}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-danger" onclick="callPhone('${service.phone}')">
                            <i class="fas fa-phone-alt"></i> طوارئ
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadNewsPage() {
    const news = await getData('news');
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-newspaper"></i> الأخبار والتنبيهات</h2>
        </div>
        
        <div class="news-list">
            ${news.map(item => `
                <div class="card ${item.urgent ? 'urgent-news' : ''}">
                    <div class="card-header">
                        <h4>${item.title}</h4>
                        ${item.urgent ? '<span class="badge badge-danger">عاجل</span>' : ''}
                    </div>
                    <div class="card-body">
                        <p>${item.content}</p>
                        <p><strong>التاريخ:</strong> ${new Date(item.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadAddServicePage() {
    return `
        <div class="page-header">
            <h2><i class="fas fa-plus-circle"></i> إضافة خدمة</h2>
        </div>
        
        <div class="add-service-form">
            <div class="form-group">
                <label>نوع الخدمة:</label>
                <select id="serviceType" class="form-control" onchange="showServiceForm()">
                    <option value="">اختر نوع الخدمة</option>
                    <option value="craftsman">صنايعي</option>
                    <option value="machine">آلة زراعية</option>
                    <option value="shop">محل تجاري</option>
                    <option value="ad">إعلان محلي</option>
                </select>
            </div>
            
            <div id="serviceFormContainer"></div>
        </div>
    `;
}

async function loadAdminPage() {
    // Check if user is admin
    if (!isAdmin()) {
        return '<div class="alert alert-danger">غير مصرح لك بالوصول إلى هذه الصفحة</div>';
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
        
        // Fetch from Google Sheets
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPTS_URL}?action=get&type=${type}`);
        const data = await response.json();
        
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
        const response = await fetch(CONFIG.GOOGLE_SCRIPTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save',
                type: type,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear cache
            clearCache(type);
            showSuccess('تم حفظ البيانات بنجاح');
            return true;
        } else {
            showError(result.message || 'حدث خطأ أثناء حفظ البيانات');
            return false;
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showError('حدث خطأ أثناء حفظ البيانات');
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
    // Simple admin check - in production, use proper authentication
    return localStorage.getItem('isAdmin') === 'true';
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
        
        elements.latestNewsList.innerHTML = latestNews.map(item => `
            <div class="news-item">
                <h4>${item.title}</h4>
                <div class="news-date">${new Date(item.date).toLocaleDateString('ar-EG')}</div>
                <p>${item.content.substring(0, 100)}...</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading initial data:', error);
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
