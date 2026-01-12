// Fixed Firebase Script - سكريبت Firebase مصحح
// Import Firebase client - استيراد عميل Firebase
import { firebaseClient } from './api-config-firebase.js';

// Global variables - متغيرات عالمية
let currentPage = 'home';
let isLoading = false;
let cache = {};
let adminLoggedIn = false;

// Configuration - إعدادات
const CONFIG = {
    BASE_URL: 'https://firestore.googleapis.com/v1',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes - 5 دقائق
    OFFLINE_MODE: true
};

// =============================================================================
// CACHING FUNCTIONS - وظائف التخزين المؤقت
// =============================================================================

// Get data from cache - جلب البيانات من الكاش
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
        console.warn('Cache read error:', error);
    }
    return null;
}

// Set data to cache - حفظ البيانات في الكاش
function setCache(key, data) {
    try {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Cache write error:', error);
    }
}

// Clear cache - مسح الكاش
function clearCache(key = null) {
    if (key) {
        localStorage.removeItem(`cache_${key}`);
    } else {
        Object.keys(localStorage).forEach(cacheKey => {
            if (cacheKey.startsWith('cache_')) {
                localStorage.removeItem(cacheKey);
            }
        });
    }
}

// =============================================================================
// DATA FUNCTIONS - وظائف البيانات (Firebase)
// =============================================================================

// Get data from Firebase - جلب البيانات من Firebase
async function getData(type) {
    try {
        const cached = getFromCache(type);
        if (cached) {
            console.log('Using cached data for', type);
            return cached;
        }

        console.log('Fetching data from Firebase for', type);
        console.log('Current domain:', window.location.origin);
        const data = await firebaseClient.getCollection(type);
        console.log('Successfully fetched data for', type, 'count:', data.length);
        setCache(type, data);
        return data;

    } catch (error) {
        console.error('Error fetching data from Firebase:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        // Try cache as fallback
        const cached = getFromCache(type);
        if (cached) {
            console.log('Using cached data as fallback for', type);
            return cached;
        }
        return [];
    }
}

// Save data to Firebase - حفظ البيانات في Firebase
async function saveData(type, data) {
    try {
        console.log('Saving data to Firebase for', type, data);
        const result = await firebaseClient.addDocument(type, data);
        
        if (result) {
            clearCache(type);
            showSuccess('تم حفظ البيانات بنجاح');
            return true;
        } else {
            showError('فشل حفظ البيانات');
            return false;
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showError('حدث خطأ أثناء حفظ البيانات: ' + error.message);
        return false;
    }
}

// Update data in Firebase - تحديث البيانات في Firebase
async function updateData(type, id, data) {
    try {
        console.log('Updating data in Firebase for', type, id, data);
        const result = await firebaseClient.updateDocument(type, id, data);
        
        if (result) {
            clearCache(type);
            showSuccess('تم تحديث البيانات بنجاح');
            return true;
        } else {
            showError('فشل تحديث البيانات');
            return false;
        }
    } catch (error) {
        console.error('Error updating data:', error);
        showError('حدث خطأ أثناء تحديث البيانات: ' + error.message);
        return false;
    }
}

// Delete data from Firebase - حذف البيانات من Firebase
async function deleteData(type, id) {
    try {
        console.log('Deleting data from Firebase for', type, id);
        const result = await firebaseClient.deleteDocument(type, id);
        
        if (result) {
            clearCache(type);
            showSuccess('تم حذف البيانات بنجاح');
            return true;
        } else {
            showError('فشل حذف البيانات');
            return false;
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        showError('حدث خطأ أثناء حذف البيانات: ' + error.message);
        return false;
    }
}

// =============================================================================
// UTILITY FUNCTIONS - وظائف مساعدة
// =============================================================================

// Show success message - عرض رسالة نجاح
function showSuccess(message) {
    console.log('Success:', message);
    // Create toast notification - إنشاء إشعار منبثق
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast - عرض الإشعار
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds - إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Show error message - عرض رسالة خطأ
function showError(message) {
    console.error('Error:', message);
    // Create toast notification - إنشاء إشعار منبثق
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast - عرض الإشعار
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds - إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Show info message - عرض رسالة معلومات
function showInfo(message) {
    console.info('Info:', message);
    // Create toast notification - إنشاء إشعار منبثق
    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    toast.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast - عرض الإشعار
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds - إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// =============================================================================
// PAGE LOADING FUNCTIONS - وظائف تحميل الصفحات
// =============================================================================

// Navigate to page - التنقل بين الصفحات
function navigateToPage(page) {
    currentPage = page;

    // Hide all pages - إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page - إظهار الصفحة المستهدفة
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        // Load page dynamically - تحميل الصفحة ديناميكياً
        loadPage(page);
    }

    // Scroll to top after page change - التمرير إلى الأعلى بعد تغيير الصفحة
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Close navigation - إغلاق القائمة
    document.getElementById('mainNav').classList.remove('active');

    // Update active nav - تحديث القائمة النشطة
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

// Load page dynamically - تحميل الصفحة ديناميكياً
async function loadPage(page) {
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) {
        console.error('pageContent element not found');
        return;
    }
    
    try {
        switch (page) {
            case 'craftsmen':
                await loadCraftsmenPage();
                break;
            case 'machines':
                await loadMachinesPage();
                break;
            case 'shops':
                await loadShopsPage();
                break;
            case 'offers':
                await loadOffersPage();
                break;
            case 'ads':
                await loadAdsPage();
                break;
            case 'news':
                await loadNewsPage();
                break;
            case 'emergency':
                await loadEmergencyPage();
                break;
            case 'admin':
                await loadAdminPage();
                break;
            case 'add-service':
                await loadAddServicePage();
                break;
            default:
                pageContent.innerHTML = '<div class="text-center"><h3>الصفحة غير موجودة</h3></div>';
        }
    } catch (error) {
        console.error('Error loading page:', error);
        pageContent.innerHTML = '<div class="text-center"><h3>حدث خطأ في تحميل الصفحة</h3></div>';
    }
}

// Load craftsmen page - تحميل صفحة الصنايعية
async function loadCraftsmenPage() {
    const craftsmen = await getData('craftsmen');
    const pageContent = document.getElementById('pageContent');

    if (!pageContent) return;

    pageContent.innerHTML = `
        <div class="page craftsmen-page active">
            <div class="page-header">
                <h2><i class="fas fa-tools"></i> الصنايعية والخدمات</h2>
                <div class="page-actions">
                    <input type="text" id="craftsmenSearch" placeholder="بحث عن صنايعي..." class="form-control">
                    <select id="craftsmenFilter" class="form-control">
                        <option value="">جميع التخصصات</option>
                        <option value="نجار">نجار</option>
                        <option value="كهربائي">كهربائي</option>
                        <option value="سباك">سباك</option>
                        <option value="حداد">حداد</option>
                        <option value="ميكانيكي">ميكانيكي</option>
                    </select>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>التخصص</th>
                            <th>رقم الهاتف</th>
                            <th>العنوان</th>
                            <th>الملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${craftsmen.map(craftsman => `
                            <tr>
                                <td>${craftsman.name || 'غير محدد'}</td>
                                <td><span class="badge bg-primary">${craftsman.specialty || 'بدون تخصص'}</span></td>
                                <td>${craftsman.phone || 'لا يوجد'}</td>
                                <td><i class="fas fa-map-marker-alt"></i> ${craftsman.address || 'لا يوجد'}</td>
                                <td>${craftsman.notes || 'لا توجد ملاحظات'}</td>
                                <td>
                                    <a href="tel:${craftsman.phone}" class="btn btn-primary btn-sm">
                                        <i class="fas fa-phone"></i> اتصال
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load machines page - تحميل صفحة الآلات
async function loadMachinesPage() {
    const machines = await getData('machines');
    const pageContent = document.getElementById('pageContent');

    if (!pageContent) return;

    pageContent.innerHTML = `
        <div class="page machines-page active">
            <div class="page-header">
                <h2><i class="fas fa-tractor"></i> أصحاب الآلات الزراعية</h2>
                <div class="page-actions">
                    <input type="text" id="machinesSearch" placeholder="بحث عن آلة..." class="form-control">
                    <select id="machinesFilter" class="form-control">
                        <option value="">جميع الأنواع</option>
                        <option value="حفار">حفار</option>
                        <option value="رافعة">رافعة</option>
                        <option value="خلاطة">خلاطة</option>
                        <option value="جرار">جرار</option>
                    </select>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>النوع</th>
                            <th>الحالة</th>
                            <th>رقم الهاتف</th>
                            <th>الملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${machines.map(machine => `
                            <tr>
                                <td>${machine.name || 'غير محدد'}</td>
                                <td><i class="fas fa-cogs"></i> ${machine.type || 'غير محدد'}</td>
                                <td><span class="badge bg-${machine.available ? 'success' : 'danger'}">${machine.available ? 'متاحة' : 'غير متاحة'}</span></td>
                                <td>${machine.phone || 'لا يوجد'}</td>
                                <td>${machine.notes || 'لا توجد ملاحظات'}</td>
                                <td>
                                    <a href="tel:${machine.phone}" class="btn btn-primary btn-sm">
                                        <i class="fas fa-phone"></i> اتصال
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load shops page - تحميل صفحة المحلات
async function loadShopsPage() {
    const shops = await getData('shops');
    const pageContent = document.getElementById('pageContent');

    if (!pageContent) return;

    pageContent.innerHTML = `
        <div class="page shops-page active">
            <div class="page-header">
                <h2><i class="fas fa-store"></i> المحلات التجارية</h2>
                <div class="page-actions">
                    <input type="text" id="shopsSearch" placeholder="بحث عن محل..." class="form-control">
                    <select id="shopsFilter" class="form-control">
                        <option value="">جميع الأنواع</option>
                        <option value="مخبز">مخبز</option>
                        <option value="بقالة">بقالة</option>
                        <option value="صيدلية">صيدلية</option>
                        <option value="مطعم">مطعم</option>
                    </select>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>اسم المحل</th>
                            <th>النوع</th>
                            <th>رقم الهاتف</th>
                            <th>العنوان</th>
                            <th>ساعات العمل</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${shops.map(shop => `
                            <tr>
                                <td>${shop.name || 'غير محدد'}</td>
                                <td><span class="badge bg-primary">${shop.type || 'بدون نوع'}</span></td>
                                <td>${shop.phone || 'لا يوجد'}</td>
                                <td><i class="fas fa-map-marker-alt"></i> ${shop.address || 'لا يوجد'}</td>
                                <td><i class="fas fa-clock"></i> ${shop.hours || 'لا يوجد'}</td>
                                <td>
                                    <a href="tel:${shop.phone}" class="btn btn-primary btn-sm">
                                        <i class="fas fa-phone"></i> اتصال
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load offers page - تحميل صفحة العروض
async function loadOffersPage() {
    const offers = await getData('offers');
    const approvedOffers = offers.filter(offer => offer.approved !== false);
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page offers-page active">
            <div class="page-header">
                <h2><i class="fas fa-tags"></i> العروض والتخفيضات</h2>
            </div>
            <div class="offers-grid">
                ${approvedOffers.map(offer => `
                    <div class="offer-card">
                        <div class="offer-header">
                            <h3>${offer.shop_name || 'غير محدد'}</h3>
                            <span class="badge bg-danger">${offer.discount || 'بدون خصم'}</span>
                        </div>
                        <div class="offer-body">
                            <p>${offer.description || 'لا يوجد وصف'}</p>
                            <p><i class="fas fa-phone"></i> ${offer.phone || 'لا يوجد'}</p>
                        </div>
                        <div class="offer-footer">
                            <a href="tel:${offer.phone}" class="btn btn-primary">
                                <i class="fas fa-phone"></i> اتصال
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load ads page - تحميل صفحة الإعلانات
async function loadAdsPage() {
    const ads = await getData('ads');
    const approvedAds = ads.filter(ad => ad.approved !== false);
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page ads-page active">
            <div class="page-header">
                <h2><i class="fas fa-bullhorn"></i> الإعلانات المحلية</h2>
            </div>
            <div class="ads-grid">
                ${approvedAds.map(ad => `
                    <div class="ad-card">
                        <div class="ad-header">
                            <h3>${ad.title || 'غير محدد'}</h3>
                            <span class="badge bg-info">${ad.type || 'عام'}</span>
                        </div>
                        <div class="ad-body">
                            <p>${ad.description ? ad.description.substring(0, 100) + '...' : 'لا يوجد وصف'}</p>
                            <p><i class="fas fa-phone"></i> ${ad.phone || 'لا يوجد'}</p>
                        </div>
                        <div class="ad-footer">
                            <a href="tel:${ad.phone}" class="btn btn-primary">
                                <i class="fas fa-phone"></i> اتصال
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load news page - تحميل صفحة الأخبار
async function loadNewsPage() {
    const news = await getData('news');
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page news-page active">
            <div class="page-header">
                <h2><i class="fas fa-newspaper"></i> الأخبار والتنبيهات</h2>
            </div>
            <div class="news-list">
                ${news.map(item => `
                    <div class="news-card ${item.urgent ? 'urgent' : ''}">
                        <div class="news-header">
                            <h3>${item.title || 'غير محدد'}</h3>
                            <span class="badge bg-${item.urgent ? 'danger' : 'secondary'}">
                                ${item.urgent ? 'عاجل' : 'عادي'}
                            </span>
                        </div>
                        <div class="news-body">
                            <p>${item.content || 'لا يوجد محتوى'}</p>
                            <div class="news-meta">
                                <span><i class="fas fa-user"></i> ${item.author || 'مجهول'}</span>
                                <span><i class="fas fa-calendar"></i> ${item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load emergency page - تحميل صفحة الطوارئ
async function loadEmergencyPage() {
    const emergency = await getData('emergency');
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page emergency-page active">
            <div class="page-header">
                <h2><i class="fas fa-phone-alt"></i> أرقام الطوارئ</h2>
            </div>
            <div class="emergency-grid">
                ${emergency.map(item => `
                    <div class="emergency-card">
                        <div class="emergency-icon">
                            <i class="fas fa-${item.icon === 'ambulance' ? 'ambulance' : item.icon === 'fire' ? 'fire-extinguisher' : item.icon === 'police' ? 'shield-alt' : item.icon === 'hospital' ? 'hospital' : 'phone-alt'}"></i>
                        </div>
                        <div class="emergency-info">
                            <h3>${item.name || 'غير محدد'}</h3>
                            <p>${item.address || 'لا يوجد عنوان'}</p>
                            <p>${item.notes ? item.notes.substring(0, 50) + '...' : 'لا توجد ملاحظات'}</p>
                        </div>
                        <div class="emergency-action">
                            <a href="tel:${item.phone}" class="btn btn-danger btn-lg">
                                <i class="fas fa-phone"></i> ${item.phone || 'لا يوجد'}
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load admin page - تحميل صفحة الإدارة
async function loadAdminPage() {
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    // Check if admin is logged in - التحقق من تسجيل دخول الإدارة
    if (!adminLoggedIn) {
        pageContent.innerHTML = `
            <div class="page admin-page active">
                <div class="admin-login">
                    <div class="login-card">
                        <h2><i class="fas fa-user-shield"></i> تسجيل دخول الإدارة</h2>
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
                                <i class="fas fa-sign-in-alt"></i> دخول
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add form submit handler - إضافة معالج إرسال النموذج
        document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    } else {
        // Show admin dashboard - عرض لوحة تحكم الإدارة
        await loadAdminDashboard();
    }
}

// Load admin dashboard - تحميل لوحة تحكم الإدارة
async function loadAdminDashboard() {
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page admin-page active">
            <div class="admin-header">
                <h2><i class="fas fa-cog"></i> لوحة التحكم</h2>
                <button class="btn btn-danger" onclick="logoutAdmin()">
                    <i class="fas fa-sign-out-alt"></i> تسجيل خروج
                </button>
            </div>
            
            <!-- Content Area - منطقة المحتوى -->
            <div id="adminContentArea">
                <div class="text-center">
                    <i class="fas fa-cog fa-3x mb-3"></i>
                    <h3>مرحباً في لوحة التحكم</h3>
                    <p>لوحة التحكم تعمل بنجاح مع Firebase</p>
                </div>
            </div>
        </div>
    `;
}

// Load add service page - تحميل صفحة إضافة خدمة
async function loadAddServicePage() {
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="page add-service-page active">
            <div class="page-header">
                <h2><i class="fas fa-plus-circle"></i> أضف خدمة جديدة</h2>
            </div>
            <div class="add-service-form">
                <div class="service-types">
                    <div class="service-type-card" onclick="showAddCraftsmanForm()">
                        <i class="fas fa-tools"></i>
                        <h3>إضافة صنايعي</h3>
                        <p>أضف صنايعي جديد للقرية</p>
                    </div>
                    <div class="service-type-card" onclick="showAddMachineForm()">
                        <i class="fas fa-tractor"></i>
                        <h3>إضافة آلة</h3>
                        <p>أضف آلة زراعية جديدة</p>
                    </div>
                    <div class="service-type-card" onclick="showAddShopForm()">
                        <i class="fas fa-store"></i>
                        <h3>إضافة محل</h3>
                        <p>أضف محل تجاري جديد</p>
                    </div>
                    <div class="service-type-card" onclick="showAddOfferForm()">
                        <i class="fas fa-tags"></i>
                        <h3>إضافة عرض</h3>
                        <p>أضف عرض أو تخفيض جديد</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// ADMIN FUNCTIONS - وظائف الإدارة
// =============================================================================

// Handle admin login - معالجة تسجيل دخول الإدارة
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple authentication - مصادقة بسيطة
    if (username === 'admin' && password === '123') {
        adminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        showSuccess('تم تسجيل الدخول بنجاح');
        await loadAdminDashboard();
    } else {
        showError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// Logout admin - تسجيل خروج الإدارة
function logoutAdmin() {
    adminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showSuccess('تم تسجيل الخروج بنجاح');
    navigateToPage('home');
}

// Check admin login status - التحقق من حالة تسجيل دخول الإدارة
function checkAdminLoginStatus() {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    adminLoggedIn = loggedIn === 'true';
}

// =============================================================================
// INITIALIZATION - التهيئة
// =============================================================================

// Initialize app - تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('Harara Village App initialized with Firebase');

    // Check admin login status - التحقق من حالة تسجيل دخول الإدارة
    checkAdminLoginStatus();

    // Initialize navigation - تهيئة التنقل
    initializeNavigation();

    // Load initial data - تحميل البيانات الأولية
    loadInitialData();

    // Test connection in background - اختبار الاتصال في الخلفية
    setTimeout(() => {
        testConnection();
    }, 2000);

    // Hide loading screen after 5 seconds - إخفاء شاشة التحميل بعد 5 ثواني
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 5000);
});

// Test connection - اختبار الاتصال
async function testConnection() {
    try {
        console.log('Testing connection to Firebase...');
        // Don't block UI - لا تمنع الواجهة
        const result = await firebaseClient.getCollection('craftsmen');
        console.log('Connection test successful:', result);
        showSuccess('تم الاتصال بقاعدة بيانات Firebase بنجاح');
    } catch (error) {
        console.error('Connection test failed:', error);
        // Don't show error on startup - لا تظهر خطأ عند بدء التشغيل
        console.warn('Firebase connection failed, app will work with cached data');
    }
}

// Initialize navigation - تهيئة التنقل
function initializeNavigation() {
    // Menu button - زر القائمة
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const mainNav = document.getElementById('mainNav');
            if (mainNav) {
                mainNav.classList.add('active');
            }
        });
    }
    
    // Close navigation - إغلاق التنقل
    const closeNav = document.getElementById('closeNav');
    if (closeNav) {
        closeNav.addEventListener('click', () => {
            const mainNav = document.getElementById('mainNav');
            if (mainNav) {
                mainNav.classList.remove('active');
            }
        });
    }
    
    // Navigation links - روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Action cards - بطاقات الإجراءات
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Refresh button - زر التحديث
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            clearCache();
            loadPage(currentPage);
        });
    }
}

// Load initial data - تحميل البيانات الأولية
async function loadInitialData() {
    try {
        console.log('Loading initial data...');
        
        // Load latest news - تحميل آخر الأخبار
        const news = await getData('news');
        const latestNewsList = document.getElementById('latestNewsList');
        
        if (latestNewsList) {
            if (news.length > 0) {
                const latestNews = news.slice(0, 3);
                latestNewsList.innerHTML = latestNews.map(item => `
                    <div class="news-item ${item.urgent ? 'urgent' : ''}">
                        <h4>${item.title || 'غير محدد'}</h4>
                        <div class="news-date">${item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                        <p>${item.content ? item.content.substring(0, 100) + '...' : 'لا يوجد محتوى'}</p>
                    </div>
                `).join('');
            } else {
                latestNewsList.innerHTML = '<div class="text-center">لا توجد أخبار حالياً</div>';
            }
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        // Don't block UI - لا تمنع الواجهة
        const latestNewsList = document.getElementById('latestNewsList');
        if (latestNewsList) {
            latestNewsList.innerHTML = '<div class="text-center">جاري تحميل الأخبار...</div>';
        }
    }
}

// Placeholder functions for admin forms - وظائف مؤقتة لنماذج الإدارة
function showAddCraftsmanForm() {
    showInfo('نموذج إضافة صنايعي قيد التطوير');
}

function showAddMachineForm() {
    showInfo('نموذج إضافة آلة قيد التطوير');
}

function showAddShopForm() {
    showInfo('نموذج إضافة محل قيد التطوير');
}

function showAddOfferForm() {
    showInfo('نموذج إضافة عرض قيد التطوير');
}

// =============================================================================
// EXPORT FUNCTIONS - تصدير الوظائف
// =============================================================================

// Export functions for use in HTML - تصدير الوظائف للاستخدام في HTML
window.getData = getData;
window.saveData = saveData;
window.updateData = updateData;
window.deleteData = deleteData;
window.navigateToPage = navigateToPage;
window.loadPage = loadPage;
window.showSuccess = showSuccess;
window.showError = showError;
window.showInfo = showInfo;
window.testConnection = testConnection;
window.handleAdminLogin = handleAdminLogin;
window.logoutAdmin = logoutAdmin;
window.showAddCraftsmanForm = showAddCraftsmanForm;
window.showAddMachineForm = showAddMachineForm;
window.showAddShopForm = showAddShopForm;
window.showAddOfferForm = showAddOfferForm;
