// Fixed Firebase Script - سكريبت Firebase مصحح
// Import Firebase client - استيراد عميل Firebase
import { firebaseClient } from './api-config-firebase.js';

// Global variables - متغيرات عالمية
let currentPage = 'home';
let isLoading = false;
let cache = {};
let adminLoggedIn = false;
let loadingTimer = null;
let notifications = [];
let notificationCount = 0;
let lastNewsCheckTime = null;
let newsCheckInterval = null;

// Configuration - إعدادات
const CONFIG = {
    BASE_URL: 'https://firestore.googleapis.com/v1',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes - 5 دقائق
    OFFLINE_MODE: true,
    NEWS_CHECK_INTERVAL: 10000 // 10 seconds - التحقق من الأخبار كل 10 ثواني
};

// =============================================================================
// LOADING FUNCTIONS - وظائف التحميل (جاري التحميل)
// =============================================================================

// Show loading overlay - إظهار مؤشر التحميل
// Show loading overlay - إظهار مؤشر التحميل
function showLoadingOverlay() {
    const overlay = document.getElementById('pageLoadingOverlay');
    if (overlay) {
        overlay.classList.remove('hide');
        overlay.classList.add('show');
        overlay.style.display = 'flex';
    }
}
// Expose to global scope
window.showLoadingOverlay = showLoadingOverlay;

// Hide loading overlay - إخفاء مؤشر التحميل
function hideLoadingOverlay() {
    const overlay = document.getElementById('pageLoadingOverlay');
    if (overlay) {
        overlay.classList.add('hide');
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}
// Expose to global scope
window.hideLoadingOverlay = hideLoadingOverlay;

// Auto hide loading after timeout - إخفاء مؤشر التحميل تلقائياً بعد انتظار
function autoHideLoading(duration = 3000) {
    if (loadingTimer) {
        clearTimeout(loadingTimer);
    }
    loadingTimer = setTimeout(() => {
        hideLoadingOverlay();
    }, duration);
}

// =============================================================================
// NOTIFICATION FUNCTIONS - وظائف الإشعارات
// =============================================================================

// Request notification permission - طلب إذن الإشعارات
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('المتصفح لا يدعم الإشعارات');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    return false;
}

// Send browser notification - إرسال إشعار المتصفح
function sendBrowserNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏘️</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📰</text></svg>',
            tag: 'news-notification',
            requireInteraction: false,
            ...options
        });

        notification.addEventListener('click', () => {
            window.focus();
            navigateToPage('news');
            notification.close();
        });

        return notification;
    }
}

// Add notification to panel - إضافة إشعار للوحة الإشعارات
function addNotification(title, message, type = 'news') {
    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        time: new Date(),
        read: false
    };

    notifications.unshift(notification);
    notificationCount++;
    updateNotificationBadge();
    renderNotifications();
    saveNotificationsToStorage();
}

// Update notification badge - تحديث شارة الإشعارات
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Render notifications - عرض الإشعارات
function renderNotifications() {
    const notificationsList = document.getElementById('notificationsList');

    if (!notificationsList) return;

    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-inbox"></i>
                <p>لا توجد إشعارات حالياً</p>
            </div>
        `;
        return;
    }

    notificationsList.innerHTML = notifications.map(notif => {
        const timeAgo = getTimeAgoArabic(notif.time);
        const icon = notif.type === 'news' ? 'fa-newspaper' : 'fa-bell';

        return `
            <div class="notification-item ${!notif.read ? 'unread' : ''}" onclick="markNotificationAsRead(${notif.id})">
                <div class="notification-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-title">${notif.title}</p>
                    <p class="notification-text">${notif.message}</p>
                    <p class="notification-time">${timeAgo}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Mark notification as read - تحديد الإشعار كمقروء
function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        renderNotifications();
        saveNotificationsToStorage();
    }
}

// Clear all notifications - مسح جميع الإشعارات
function clearAllNotifications() {
    notifications = [];
    notificationCount = 0;
    updateNotificationBadge();
    renderNotifications();
    saveNotificationsToStorage();
}

// Toggle notifications panel - إظهار/إخفاء لوحة الإشعارات
function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.toggle('show');

        if (panel.classList.contains('show')) {
            notifications.forEach(n => n.read = true);
            updateNotificationBadge();
            renderNotifications();
            saveNotificationsToStorage();
        }
    }
}

// Close notifications panel - إغلاق لوحة الإشعارات
function closeNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.remove('show');
    }
}

// Save notifications to localStorage - حفظ الإشعارات
function saveNotificationsToStorage() {
    try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

// Load notifications from localStorage - تحميل الإشعارات
function loadNotificationsFromStorage() {
    try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            notifications = JSON.parse(stored);
            updateNotificationBadge();
            renderNotifications();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Get Arabic time ago - الحصول على الوقت بصيغة عربية
function getTimeAgoArabic(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'الآن';
    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    if (days < 30) return `قبل ${days} يوم`;

    return new Date(date).toLocaleDateString('ar-SA');
}

// Check for new news - التحقق من الأخبار الجديدة
async function checkForNewNews() {
    try {
        const news = await getData('news');

        if (!lastNewsCheckTime) {
            lastNewsCheckTime = Date.now();
            return;
        }

        const newNews = news.filter(item => {
            const itemTime = new Date(item.created_at).getTime();
            return itemTime > lastNewsCheckTime;
        });

        if (newNews.length > 0) {
            // عكس الترتيب لأخذ أحدث خبر أولاً
            newNews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            newNews.forEach(newsItem => {
                const title = newsItem.title || 'خبر جديد';
                const message = newsItem.content?.substring(0, 150) || 'خبر جديد نزل الآن';
                const urgentText = newsItem.urgent ? ' ⚠️ عاجل' : '';

                // إضافة الإشعار لللوحة الداخلية
                addNotification(title + urgentText, message, 'news');

                // إرسال إشعار المتصفح/الهاتف الخارجي
                sendBrowserNotification('📰 ' + title, {
                    body: message,
                    icon: newsItem.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📰</text></svg>',
                    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📰</text></svg>',
                    tag: 'news-' + newsItem.id,
                    requireInteraction: newsItem.urgent || false,
                    vibrate: [200, 100, 200],  // نمط الاهتزاز للهواتف
                    data: {
                        newsId: newsItem.id,
                        newsTitle: title,
                        url: 'news'
                    }
                });
            });

            // تحديث الأخبار على الصفحة الرئيسية إذا كنا عليها
            if (currentPage === 'home' || currentPage === 'news') {
                updateLatestNewsDisplay(news);
            }
        }

        lastNewsCheckTime = Date.now();
    } catch (error) {
        console.error('Error checking for new news:', error);
    }
}

// Update latest news display - تحديث عرض الأخبار
function updateLatestNewsDisplay(allNews) {
    try {
        const latestNewsList = document.getElementById('latestNewsList');

        if (latestNewsList && allNews && allNews.length > 0) {
            // ترتيب الأخبار حسب التاريخ تنازلياً (أحدث أولاً)
            const sortedNews = allNews.sort((a, b) =>
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );

            // أخذ أحدث 3 أخبار
            const latestNews = sortedNews.slice(0, 3);

            // تحديث HTML
            latestNewsList.innerHTML = latestNews.map(item => `
                <div class="news-item ${item.urgent ? 'urgent' : ''}">
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-image">` : ''}
                    <div class="news-content">
                        <h4>${item.title || 'غير محدد'}</h4>
                        <div class="news-date">${item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                        <p>${item.content ? item.content.substring(0, 100) + '...' : 'لا يوجد محتوى'}</p>
                        ${item.author ? `<div class="news-author">بقلم: ${item.author}</div>` : ''}
                    </div>
                </div>
            `).join('');

            // إظهار زر عرض المزيد إذا كان هناك أكثر من 3 أخبار
            const showMoreBtn = document.getElementById('showMoreNews');
            if (showMoreBtn) {
                showMoreBtn.style.display = sortedNews.length > 3 ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error('Error updating latest news display:', error);
    }
}

// Start news monitoring - بدء مراقبة الأخبار
function startNewsMonitoring() {
    if (newsCheckInterval) {
        clearInterval(newsCheckInterval);
    }

    checkForNewNews();
    newsCheckInterval = setInterval(checkForNewNews, CONFIG.NEWS_CHECK_INTERVAL);
}

// Stop news monitoring - إيقاف مراقبة الأخبار
function stopNewsMonitoring() {
    if (newsCheckInterval) {
        clearInterval(newsCheckInterval);
        newsCheckInterval = null;
    }
}

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

        // Special handling for settings singleton
        if (type === 'settings' && Array.isArray(data)) {
            const siteConfig = data.find(d => d.id === 'site_config') || data[0] || {};
            const result = { site_config: siteConfig };
            setCache(type, result);
            return result;
        }

        setCache(type, data);

        // Merge with local data - دمج مع البيانات المحلية
        const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
        const merged = [...data, ...localData.filter(l => !data.find(d => d.id === l.id))];
        return merged;

    } catch (error) {
        console.error('Error fetching data from Firebase:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Try cache as fallback with warning
        const cached = getFromCache(type);
        if (cached && cached.length > 0) {
            console.log('Using cached data as fallback for', type);
            // Show warning about offline mode
            if (!document.querySelector('.offline-warning')) {
                showOfflineWarning();
            }
            return cached;
        }

        // Fallback to localStorage - الرجوع للتخزين المحلي
        const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
        console.log('Using local data for', type, 'count:', localData.length);
        if (localData.length > 0) {
            if (!document.querySelector('.offline-warning')) {
                showOfflineWarning();
            }
        }
        return localData;
    }
}
window.getData = getData;

// Save data to Firebase - حفظ البيانات في Firebase
async function saveData(type, data, id = null) {
    try {
        console.log('Saving data to Firebase for', type, data, id ? `with ID: ${id}` : '');

        let result;
        if (id) {
            // Use setDocument if ID is provided (e.g., singleton settings)
            result = await firebaseClient.setDocument(type, id, data);
        } else {
            // Standard addDocument for collections
            result = await firebaseClient.addDocument(type, data);
        }

        if (result) {
            clearCache(type);
            // Also save to localStorage as backup - حفظ في التخزين المحلي كنسخة احتياطية
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const existingIndex = localData.findIndex(l => l.id === result.id);
            if (existingIndex === -1) {
                localData.push(result);
                localStorage.setItem(`local_${type}`, JSON.stringify(localData));
            }
            showSuccess('تم حفظ البيانات بنجاح');
            return result;
        } else {
            // Fallback to localStorage - الرجوع للتخزين المحلي
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const localItem = { id: Date.now().toString(), ...data, local: true };
            localData.push(localItem);
            localStorage.setItem(`local_${type}`, JSON.stringify(localData));
            clearCache(type);
            showSuccess('تم حفظ البيانات محلياً (بدون قاعدة بيانات)');
            return localItem;
        }
    } catch (error) {
        console.error('Error saving data:', error);
        // Fallback to localStorage - الرجوع للتخزين المحلي
        const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
        const localItem = { id: Date.now().toString(), ...data, local: true };
        localData.push(localItem);
        localStorage.setItem(`local_${type}`, JSON.stringify(localData));
        clearCache(type);
        showSuccess('تم حفظ البيانات محلياً بسبب خطأ في قاعدة البيانات');
        return localItem;
    }
}
window.saveData = saveData;

// Update data in Firebase - تحديث البيانات في Firebase
async function updateData(type, id, data) {
    try {
        console.log('Updating data in Firebase for', type, id, data);
        const result = await firebaseClient.updateDocument(type, id, data);

        if (result) {
            clearCache(type);
            // Update localStorage - تحديث التخزين المحلي
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const index = localData.findIndex(l => l.id === id);
            if (index !== -1) {
                localData[index] = { ...localData[index], ...data };
            } else {
                localData.push({ id, ...data });
            }
            localStorage.setItem(`local_${type}`, JSON.stringify(localData));
            showSuccess('تم تحديث البيانات بنجاح');
            return result;
        } else {
            // Fallback to localStorage - الرجوع للتخزين المحلي
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const index = localData.findIndex(l => l.id === id);
            if (index !== -1) {
                localData[index] = { ...localData[index], ...data };
            } else {
                localData.push({ id, ...data });
            }
            localStorage.setItem(`local_${type}`, JSON.stringify(localData));
            clearCache(type);
            showSuccess('تم تحديث البيانات محلياً (بدون قاعدة بيانات)');
            return { id, ...data };
        }
    } catch (error) {
        console.error('Error updating data:', error);
        // Fallback to localStorage - الرجوع للتخزين المحلي
        const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
        const index = localData.findIndex(l => l.id === id);
        if (index !== -1) {
            localData[index] = { ...localData[index], ...data };
        } else {
            localData.push({ id, ...data });
        }
        localStorage.setItem(`local_${type}`, JSON.stringify(localData));
        clearCache(type);
        showSuccess('تم تحديث البيانات محلياً بسبب خطأ في قاعدة البيانات');
        return { id, ...data };
    }
}
window.updateData = updateData;

// Delete data from Firebase - حذف البيانات من Firebase
async function deleteData(type, id) {
    try {
        console.log('Deleting data from Firebase for', type, id);
        const result = await firebaseClient.deleteDocument(type, id);

        if (result) {
            clearCache(type);
            // Delete from localStorage - حذف من التخزين المحلي
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const filtered = localData.filter(l => l.id !== id);
            localStorage.setItem(`local_${type}`, JSON.stringify(filtered));
            showSuccess('تم حذف البيانات بنجاح');
            return true;
        } else {
            // Fallback to localStorage - الرجوع للتخزين المحلي
            const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
            const filtered = localData.filter(l => l.id !== id);
            localStorage.setItem(`local_${type}`, JSON.stringify(filtered));
            clearCache(type);
            showSuccess('تم حذف البيانات محلياً (بدون قاعدة بيانات)');
            return true;
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        // Fallback to localStorage - الرجوع للتخزين المحلي
        const localData = JSON.parse(localStorage.getItem(`local_${type}`) || '[]');
        const filtered = localData.filter(l => l.id !== id);
        localStorage.setItem(`local_${type}`, JSON.stringify(filtered));
        clearCache(type);
        showSuccess('تم حذف البيانات محلياً بسبب خطأ في قاعدة البيانات');
        return true;
    }
}
window.deleteData = deleteData;

// =============================================================================
// UTILITY FUNCTIONS - وظائف مساعدة
// =============================================================================

// Format Egyptian phone number for WhatsApp - تنسيق رقم الهاتف المصري لواتساب
function formatEgyptianWhatsApp(phone) {
    if (!phone) return '';

    // Remove all non-digit characters - إزالة جميع الأحرف غير الرقمية
    let digits = phone.replace(/\D/g, '');

    // If number starts with 0, remove it (Egyptian local format) - إذا بدأ الرقم بـ 0، إزالته
    if (digits.startsWith('0')) {
        digits = digits.substring(1);
    }

    // If number already has country code (20 followed by valid length), use as is
    // إذا بدأ الرقم بـ 20 مع الطول الصحيح (كود الدولة موجود بالفعل)، استخدمه كما هو
    if (digits.startsWith('20') && digits.length >= 12) {
        return digits;
    }

    // Add Egyptian country code (+20) - إضافة كود مصر
    return '20' + digits;
}

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

// Show offline warning - عرض تحذير العمل دون اتصال
function showOfflineWarning() {
    if (document.querySelector('.offline-warning')) return;

    const warning = document.createElement('div');
    warning.className = 'offline-warning alert alert-warning';
    warning.innerHTML = `
        <i class="fas fa-wifi-slash"></i>
        <strong>وضع دون اتصال:</strong> يتم عرض البيانات المحفوظة سابقاً. قد لا تكون محدثة.
        <button onclick="this.parentElement.remove()" class="btn-close" style="float: left; margin-left: 10px;">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Insert after header
    const header = document.querySelector('.header');
    if (header) {
        header.insertAdjacentElement('afterend', warning);
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (warning.parentElement) {
            warning.remove();
        }
    }, 10000);
}

// =============================================================================
// PAGE LOADING FUNCTIONS - وظائف تحميل الصفحات
// =============================================================================

// Navigate to page - التنقل بين الصفحات
function navigateToPage(page) {
    // Show loading overlay - إظهار مؤشر التحميل
    showLoadingOverlay();
    autoHideLoading(5000);

    currentPage = page;

    // Hide all pages - إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page - إظهار الصفحة المستهدفة
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        hideLoadingOverlay();
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
        hideLoadingOverlay();
        return;
    }

    try {
        // First try to load the HTML file
        const htmlFilePath = `pages/${page}.html`;
        try {
            const response = await fetch(htmlFilePath);
            if (response.ok) {
                const htmlContent = await response.text();
                // Extract the body content from the HTML file
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const bodyContent = doc.body.innerHTML;
                pageContent.innerHTML = bodyContent;

                // Initialize page-specific functionality if needed
                initializePageFunctionality(page);
                hideLoadingOverlay();
                return;
            }
        } catch (error) {
            console.log(`Could not load ${htmlFilePath}, falling back to dynamic generation`);
        }

        // Fallback to dynamic generation if HTML file doesn't exist
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
                // Redirect to admin page - التوجيه لصفحة الإدارة
                window.location.href = 'pages/admin.html';
                return;
            case 'doctors':
                await loadDoctorsData();
                break;
            default:
                pageContent.innerHTML = '<div class="text-center"><h3>الصفحة غير موجودة</h3></div>';
        }

        // Hide loading overlay after content is loaded - إخفاء مؤشر التحميل
        hideLoadingOverlay();

    } catch (error) {
        console.error('Error loading page:', error);
        pageContent.innerHTML = '<div class="text-center"><h3>حدث خطأ في تحميل الصفحة</h3></div>';
        hideLoadingOverlay();
    }
}

// Initialize page-specific functionality - تهيئة وظائف الصفحة المحددة
function initializePageFunctionality(page) {
    switch (page) {
        case 'craftsmen':
            initializeCraftsmenPage();
            break;
        case 'machines':
            initializeMachinesPage();
            break;
        case 'shops':
            initializeShopsPage();
            break;
        case 'offers':
            initializeOffersPage();
            break;
        case 'ads':
            initializeAdsPage();
            break;
        case 'news':
            initializeNewsPage();
            break;
        case 'emergency':
            initializeEmergencyPage();
            break;
        case 'add-service':
            initializeAddServicePage();
            break;
        case 'doctors':
            initializeDoctorsPage();
            break;
    }
}

// Initialize doctors page - تهيئة صفحة الأطباء
function initializeDoctorsPage() {
    loadDoctorsData();
}

// Initialize craftsmen page - تهيئة صفحة الصنايعية
function initializeCraftsmenPage() {
    // Load craftsmen data
    loadCraftsmenData();

    // Setup search functionality
    const searchInput = document.getElementById('craftsmenSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterCraftsmen);
    }

    // Setup filter functionality
    const filterSelect = document.getElementById('craftsmenFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterCraftsmen);
    }
}

// Initialize machines page - تهيئة صفحة الآلات
function initializeMachinesPage() {
    loadMachinesData();
    const searchInput = document.getElementById('machinesSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterMachines);
    }
}

// Initialize shops page - تهيئة صفحة المحلات
function initializeShopsPage() {
    loadShopsData();
    const searchInput = document.getElementById('shopsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterShops);
    }
}

// Initialize offers page - تهيئة صفحة العروض
function initializeOffersPage() {
    loadOffersData();
}

// Initialize ads page - تهيئة صفحة الإعلانات
function initializeAdsPage() {
    loadAdsData();
}

// Initialize news page - تهيئة صفحة الأخبار
function initializeNewsPage() {
    loadNewsData();
}

// Initialize emergency page - تهيئة صفحة الطوارئ
function initializeEmergencyPage() {
    loadEmergencyData();
}

// Initialize add-service page - تهيئة صفحة إضافة خدمة
function initializeAddServicePage() {
    setupAddServiceForm();
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
                        <option value="نقاش">نقاش</option>
                        <option value="مبلط">مبلط</option>
                        <option value="سباكة">سباكة</option>
                        <option value="تكييف">تكييف</option>
                        <option value="أخرى">أخرى</option>
                    </select>
                </div>
            </div>
            <div class="craftsmen-list">
                ${craftsmen.length > 0 ? craftsmen.map(craftsman => `
                    <div class="craftsman-card">
                        <div class="craftsman-header">
                            <h3>${craftsman.name || 'غير محدد'}</h3>
                            <span class="status-badge status-${(craftsman.status || 'متاح').toLowerCase().replace(' ', '-')}">
                                ${craftsman.status || 'متاح'}
                            </span>
                        </div>
                        <div class="craftsman-details">
                            <div class="detail-item">
                                <i class="fas fa-tools"></i>
                                <span>${craftsman.specialty || 'بدون تخصص'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-phone"></i>
                                <span>${craftsman.phone || 'لا يوجد'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${craftsman.address || 'لا يوجد'}</span>
                            </div>
                            ${craftsman.notes ? `
                            <div class="detail-item">
                                <i class="fas fa-sticky-note"></i>
                                <span>${craftsman.notes}</span>
                            </div>
                            ` : ''}
                        </div>
                        <div class="craftsman-actions">
                            <a href="tel:${craftsman.phone}" class="btn btn-primary">
                                <i class="fas fa-phone"></i> اتصال
                            </a>
                            <a href="https://wa.me/${formatEgyptianWhatsApp(craftsman.phone)}" target="_blank" rel="noopener noreferrer" class="btn btn-success">
                                <i class="fab fa-whatsapp"></i> واتس
                            </a>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fas fa-tools"></i><h3>لا توجد صنايعية حالياً</h3><p>سيتم إضافة الصنايعية قريباً</p></div>'}
            </div>
        </div>
    `;

    // Add CSS for mobile responsiveness
    const style = document.createElement('style');
    style.textContent = `
        .craftsmen-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1rem;
            padding: 1rem;
        }

        .craftsman-card {
            background: var(--surface, #fff);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            border: 1px solid var(--border-color, #e0e0e0);
        }

        .craftsman-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }

        .craftsman-header {
            background: linear-gradient(135deg, var(--primary-color, #2c3e50), var(--primary-dark, #1a252f));
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .craftsman-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .status-badge {
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-متاح { background: #28a745; color: white; }
        .status-مشغول { background: #ffc107; color: #000; }
        .status-غير-متاح { background: #dc3545; color: white; }

        .craftsman-details {
            padding: 1rem;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary, #333);
            font-size: 0.95rem;
        }

        .detail-item:last-child {
            margin-bottom: 0;
        }

        .detail-item i {
            width: 18px;
            color: var(--primary-color, #2c3e50);
            opacity: 0.8;
        }

        .craftsman-actions {
            padding: 1rem;
            border-top: 1px solid var(--border-color, #e0e0e0);
            background: var(--surface-alt, #f8f9fa);
        }

        .craftsman-actions .btn {
            width: 100%;
            text-align: center;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }

        .craftsman-actions .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-muted, #6c757d);
        }

        .empty-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-secondary, #495057);
        }

        .empty-state p {
            font-size: 1rem;
            margin: 0;
        }

        @media (max-width: 768px) {
            .craftsmen-list {
                grid-template-columns: 1fr;
                padding: 0.5rem;
                gap: 0.75rem;
            }

            .craftsman-card {
                border-radius: 8px;
            }

            .craftsman-header {
                padding: 0.875rem;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .craftsman-header h3 {
                font-size: 1.1rem;
            }

            .status-badge {
                font-size: 0.8rem;
                padding: 0.25rem 0.5rem;
            }

            .craftsman-details {
                padding: 0.875rem;
            }

            .detail-item {
                font-size: 0.9rem;
                gap: 0.5rem;
            }

            .craftsman-actions {
                padding: 0.875rem;
            }

            .empty-state {
                padding: 2rem 1rem;
            }

            .empty-state i {
                font-size: 3rem;
            }

            .empty-state h3 {
                font-size: 1.25rem;
            }
        }

        @media (max-width: 480px) {
            .craftsmen-list {
                padding: 0.25rem;
            }

            .craftsman-header {
                padding: 0.75rem;
            }

            .craftsman-details {
                padding: 0.75rem;
            }

            .craftsman-actions {
                padding: 0.75rem;
            }
        }
    `;

    // Add search and filter functionality
    const searchInput = document.getElementById('craftsmenSearch');
    const filterSelect = document.getElementById('craftsmenFilter');

    function filterCraftsmen() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filterValue = filterSelect ? filterSelect.value : '';
        const cards = document.querySelectorAll('.craftsman-card');

        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const specialtyElement = card.querySelector('.detail-item i.fa-tools');
            const specialty = specialtyElement ? specialtyElement.nextElementSibling.textContent.toLowerCase() : '';

            const matchesSearch = name.includes(searchTerm) || specialty.includes(searchTerm);
            const matchesFilter = !filterValue || specialty.includes(filterValue.toLowerCase());

            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCraftsmen);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterCraftsmen);
    }

    document.head.appendChild(style);
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

    // Government emergency numbers - أرقام الطوارئ الحكومية
    const governmentEmergency = [
        { name: 'الشرطة', phone: '122', icon: 'shield-alt', address: 'طوارئ الشرطة', notes: 'للطوارئ الأمنية والجرائم' },
        { name: 'الإسعاف', phone: '123', icon: 'ambulance', address: 'طوارئ الإسعاف', notes: 'للحالات الطبية الطارئة' },
        { name: 'الحماية المدنية', phone: '180', icon: 'fire-extinguisher', address: 'إطفاء وحماية مدنية', notes: 'للحرائق والكوارث الطبيعية' },
        { name: 'الكهرباء', phone: '121', icon: 'bolt', address: 'شركة الكهرباء المصرية', notes: 'لأعطال الكهرباء والانقطاعات' },
        { name: 'الغاز الطبيعي', phone: '129', icon: 'fire', address: 'شركة الغاز الطبيعي', notes: 'لأعطال الغاز وتسربات' },
        { name: 'المياه', phone: '125', icon: 'tint', address: 'شركة مياه الشرب والصرف الصحي', notes: 'لأعطال المياه والصرف الصحي' },
        { name: 'التليفونات', phone: '144', icon: 'phone', address: 'الشركة المصرية للاتصالات', notes: 'لأعطال الهاتف الثابت' },
        { name: 'الطوارئ السياحية', phone: '126', icon: 'plane', address: 'غرفة عمليات السياحة', notes: 'للمساعدة السياحية' }
    ];

    const allEmergency = [...governmentEmergency, ...emergency];
    const pageContent = document.getElementById('pageContent');

    if (!pageContent) return;

    pageContent.innerHTML = `
        <div class="page emergency-page active">
            <div class="page-header">
                <h2><i class="fas fa-phone-alt"></i> أرقام الطوارئ</h2>
            </div>
            <div class="emergency-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <p>في حالة الطوارئ، اتصل بالرقم المناسب فوراً</p>
            </div>
            <div class="emergency-grid">
                ${allEmergency.map(item => `
                    <div class="emergency-card">
                        <div class="emergency-icon">
                            <i class="fas fa-${item.icon || 'phone-alt'}"></i>
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

// Register Service Worker - تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = window.location.pathname.includes('/pages/') ? '../js/sw.js' : 'js/sw.js';
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Initialize app - تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function () {
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
    }, 2500);
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

    // Handle refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }
}

// Setup global loading handlers for all links and buttons - إعداد معالجات التحميل العامة
function setupGlobalLoadingHandlers() {
    // All internal links - جميع الروابط الداخلية
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && !link.href.startsWith('tel:') && !link.href.startsWith('mailto:') && !link.href.startsWith('http')) {
            showLoadingOverlay();
            autoHideLoading(5000);
        }
    }, true);

    // All buttons - جميع الأزرار
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && !button.classList.contains('no-loading')) {
            // Check if it's a form submit - التحقق من أن الزر لا ينتمي لنموذج
            if (button.type !== 'submit' && !button.closest('form')) {
                showLoadingOverlay();
                autoHideLoading(2000);
            }
        }
    }, true);
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
                // Sort by created_at descending - ترتيب حسب التاريخ تنازلياً
                const sortedNews = news.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                const latestNews = sortedNews.slice(0, 3);
                latestNewsList.innerHTML = latestNews.map(item => `
                    <div class="news-item ${item.urgent ? 'urgent' : ''}">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-image">` : ''}
                        <div class="news-content">
                            <h4>${item.title || 'غير محدد'}</h4>
                            <div class="news-date">${item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                            <p>${item.content ? item.content.substring(0, 100) + '...' : 'لا يوجد محتوى'}</p>
                            ${item.author ? `<div class="news-author">بقلم: ${item.author}</div>` : ''}
                        </div>
                    </div>
                `).join('');

                // Show more button if more than 3 news
                const showMoreBtn = document.getElementById('showMoreNews');
                if (sortedNews.length > 3) {
                    showMoreBtn.style.display = 'block';
                } else {
                    showMoreBtn.style.display = 'none';
                }
            } else {
                latestNewsList.innerHTML = '<div class="text-center">لا توجد أخبار حالياً</div>';
                const showMoreBtn = document.getElementById('showMoreNews');
                showMoreBtn.style.display = 'none';
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

// Data loading functions - وظائف تحميل البيانات
async function loadCraftsmenData() {
    try {
        const craftsmen = await getData('craftsmen');
        displayCraftsmen(craftsmen);
    } catch (error) {
        console.error('Error loading craftsmen data:', error);
    }
}

async function loadMachinesData() {
    try {
        const machines = await getData('machines');
        displayMachines(machines);
    } catch (error) {
        console.error('Error loading machines data:', error);
    }
}

async function loadShopsData() {
    try {
        const shops = await getData('shops');
        displayShops(shops);
    } catch (error) {
        console.error('Error loading shops data:', error);
    }
}

async function loadOffersData() {
    try {
        const offers = await getData('offers');
        displayOffers(offers);
    } catch (error) {
        console.error('Error loading offers data:', error);
    }
}

async function loadAdsData() {
    try {
        const ads = await getData('ads');
        displayAds(ads);
    } catch (error) {
        console.error('Error loading ads data:', error);
    }
}

async function loadNewsData() {
    try {
        const news = await getData('news');
        displayNews(news);
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

async function loadEmergencyData() {
    try {
        const emergency = await getData('emergency');
        displayEmergency(emergency);
    } catch (error) {
        console.error('Error loading emergency data:', error);
    }
}

// Display functions - وظائف العرض
function displayCraftsmen(craftsmen) {
    const container = document.getElementById('craftsmenList');
    if (container) {
        container.innerHTML = craftsmen.map(craftsman => `
            <div class="craftsman-card">
                <div class="craftsman-info">
                    <h4>${craftsman.name}</h4>
                    <p><i class="fas fa-tools"></i> ${craftsman.profession}</p>
                    <p><i class="fas fa-phone"></i> ${craftsman.phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${craftsman.address}</p>
                </div>
                <div class="craftsman-actions">
                    <a href="tel:${craftsman.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> اتصل
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function displayMachines(machines) {
    const container = document.getElementById('machinesList');
    if (container) {
        container.innerHTML = machines.map(machine => `
            <div class="machine-card">
                <div class="machine-info">
                    <h4>${machine.owner}</h4>
                    <p><i class="fas fa-tractor"></i> ${machine.type}</p>
                    <p><i class="fas fa-phone"></i> ${machine.phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${machine.area}</p>
                </div>
                <div class="machine-actions">
                    <a href="tel:${machine.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> اتصل
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function displayShops(shops) {
    const container = document.getElementById('shopsList');
    if (container) {
        container.innerHTML = shops.map(shop => `
            <div class="shop-card">
                <div class="shop-info">
                    <h4>${shop.name}</h4>
                    <p><i class="fas fa-store"></i> ${shop.type}</p>
                    <p><i class="fas fa-phone"></i> ${shop.phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${shop.address}</p>
                </div>
                <div class="shop-actions">
                    <a href="tel:${shop.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> اتصل
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function displayOffers(offers) {
    const container = document.getElementById('offersList');
    if (container) {
        container.innerHTML = offers.map(offer => `
            <div class="offer-card">
                <div class="offer-info">
                    <h4>${offer.title}</h4>
                    <p><i class="fas fa-store"></i> ${offer.shop}</p>
                    <p><i class="fas fa-tag"></i> ${offer.description}</p>
                    <p><i class="fas fa-calendar"></i> ${offer.date}</p>
                </div>
                <div class="offer-actions">
                    <a href="tel:${offer.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> اتصل
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function displayAds(ads) {
    const container = document.getElementById('adsList');
    if (container) {
        container.innerHTML = ads.map(ad => `
            <div class="ad-card">
                <div class="ad-info">
                    <h4>${ad.title}</h4>
                    <p>${ad.description}</p>
                    <p><i class="fas fa-user"></i> ${ad.contact}</p>
                    <p><i class="fas fa-calendar"></i> ${ad.date}</p>
                </div>
                <div class="ad-actions">
                    <a href="tel:${ad.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> اتصل
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function displayNews(news) {
    const container = document.getElementById('newsList');
    if (container) {
        // Sort news by date (newest first)
        const sortedNews = news.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0);
            const dateB = new Date(b.date || b.createdAt || 0);
            return dateB - dateA;
        });

        container.innerHTML = sortedNews.map(item => `
            <div class="news-card">
                <div class="news-info">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-user"></i> ${item.author}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(item.date || item.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function displayEmergency(emergency) {
    const container = document.getElementById('emergencyList');
    if (container) {
        container.innerHTML = emergency.map(item => `
            <div class="emergency-card">
                <div class="emergency-info">
                    <h4>${item.service}</h4>
                    <p><i class="fas fa-phone"></i> ${item.phone}</p>
                    <p><i class="fas fa-info-circle"></i> ${item.description}</p>
                </div>
                <div class="emergency-actions">
                    <a href="tel:${item.phone}" class="btn btn-danger">
                        <i class="fas fa-phone"></i> طوارئ
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Format date function - تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return 'تاريخ غير محدد';

    try {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ar-EG', options);
    } catch (error) {
        return dateString;
    }
}

// Filter functions - وظائف التصفية
function filterCraftsmen() {
    const searchTerm = document.getElementById('craftsmenSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('craftsmenFilter')?.value || '';
    const cards = document.querySelectorAll('.craftsman-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matchesSearch = text.includes(searchTerm);
        const matchesFilter = !filterValue || text.includes(filterValue);

        card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

function filterMachines() {
    const searchTerm = document.getElementById('machinesSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.machine-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function filterShops() {
    const searchTerm = document.getElementById('shopsSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.shop-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Form setup function - إعداد النموذج
function setupAddServiceForm() {
    const form = document.getElementById('addServiceForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            try {
                await saveData(data.type, data);
                showSuccess('تم إضافة الخدمة بنجاح');
                form.reset();
            } catch (error) {
                showError('حدث خطأ في إضافة الخدمة');
            }
        });
    }
}

// =============================================================================
// EXPORT FUNCTIONS - تصدير الوظائف
// =============================================================================

// Upload image - رفع الصورة
async function uploadImage(file) {
    try {
        return await firebaseClient.uploadImage(file);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Suggestion Functions - وظائف الاقتراحات
function showSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('suggestionForm').reset();
    }
}

// Handle suggestion form submission
async function handleSuggestionSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('sugSubmitBtn');
    const originalBtnText = submitBtn.innerHTML;

    const suggestionData = {
        name: document.getElementById('sugName').value.trim(),
        phone: document.getElementById('sugPhone').value.trim(),
        type: document.getElementById('sugType').value,
        message: document.getElementById('sugMessage').value.trim(),
        createdAt: new Date().toISOString(),
        status: 'جديد'
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

        await saveData('suggestions', suggestionData);

        showSuccess('تم إرسال اقتراحك/شكواك بنجاح. شكراً لك!');
        closeSuggestionModal();
    } catch (error) {
        console.error('Error submitting suggestion:', error);
        showError('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Initialize suggestion form listener
function initializeSuggestionForm() {
    const form = document.getElementById('suggestionForm');
    if (form) {
        form.addEventListener('submit', handleSuggestionSubmit);
    }
}

// Call initialization
document.addEventListener('DOMContentLoaded', initializeSuggestionForm);

// Export functions for use in HTML - تصدير الوظائف للاستخدام في HTML
window.getData = getData;
window.saveData = saveData;
window.updateData = updateData;
window.deleteData = deleteData;
window.uploadImage = uploadImage;
window.navigateToPage = navigateToPage;
window.loadPage = loadPage;
window.showSuccess = showSuccess;
window.showError = showError;
window.showInfo = showInfo;
window.testConnection = testConnection;
window.handleAdminLogin = handleAdminLogin;
window.logoutAdmin = logoutAdmin;
window.showAddCraftsmanForm = showAddCraftsmanForm;
window.formatEgyptianWhatsApp = formatEgyptianWhatsApp;
window.showSuggestionModal = showSuggestionModal;
window.closeSuggestionModal = closeSuggestionModal;

// Export notification functions - تصدير وظائف الإشعارات
// Removed notification functions from global scope

// Export functions - تصدير الوظائف
window.logoutAdmin = logoutAdmin;
window.showAddCraftsmanForm = showAddCraftsmanForm;
window.formatEgyptianWhatsApp = formatEgyptianWhatsApp;

// =============================================================================
// WEBVIEW LINK HANDLER - معالج الروابط للويب فيو
// =============================================================================

// Handle external links for WebView apps
document.addEventListener('DOMContentLoaded', function() {
    // Handle all link clicks
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.href;
        if (!href) return;

        // WhatsApp links
        if (href.includes('wa.me/') || href.includes('web.whatsapp.com')) {
            e.preventDefault();
            openExternalApp('whatsapp', href);
            return;
        }

        // Google Maps links
        if (href.includes('maps.google.com') || href.includes('google.com/maps')) {
            e.preventDefault();
            openExternalApp('maps', href);
            return;
        }

        // Phone links (tel:)
        if (href.startsWith('tel:')) {
            e.preventDefault();
            openExternalApp('phone', href);
            return;
        }

        // Email links (mailto:)
        if (href.startsWith('mailto:')) {
            e.preventDefault();
            openExternalApp('email', href);
            return;
        }

        // External links (open in external browser)
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            e.preventDefault();
            openExternalApp('browser', href);
            return;
        }
    });
});

// Function to open external apps
function openExternalApp(type, url) {
    try {
        // For Android WebView interface
        if (window.AndroidWebView && window.AndroidWebView.openExternalApp) {
            window.AndroidWebView.openExternalApp(type, url);
            return;
        }

        // For iOS WebView
        if (window.webkit && window.webkit.messageHandlers.webView) {
            window.webkit.messageHandlers.webView.postMessage({
                type: 'openExternalApp',
                appType: type,
                url: url
            });
            return;
        }

        // Fallback for regular browsers
        if (type === 'phone' || type === 'email') {
            window.location.href = url;
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    } catch (error) {
        console.error('Error opening external app:', error);
        
        // User-friendly error messages
        const messages = {
            'whatsapp': 'يرجى تثبيت تطبيق واتساب',
            'maps': 'يرجى تثبيت تطبيق خرائط جوجل',
            'phone': 'لا يمكن فتح رقم الهاتف',
            'email': 'لا يمكن فتح تطبيق البريد',
            'browser': 'لا يمكن فتح الرابط الخارجي'
        };
        
        alert(messages[type] || 'لا يمكن فتح الرابط');
    }
}

// Export the function
window.openExternalApp = openExternalApp;
