// API Configuration for Village App - إعدادات API لتطبيق القرية
// This file contains the configuration for connecting to Google Apps Script API
// هذا الملف يحتوي على إعدادات الاتصال بـ Google Apps Script API

// API Configuration - إعدادات API
const API_CONFIG = {
    // IMPORTANT: Replace this with your actual Google Apps Script Web App URL
    // مهم: استبدل هذا بـ URL الفعلي لتطبيق Google Apps Script Web App
    // Get it from: Google Apps Script > Deploy > New deployment > Web app
    BASE_URL: '/api/proxy',
    
    // Request timeout in milliseconds - مهلة الطلب بالمللي ثانية
    TIMEOUT: 30000,
    
    // Retry configuration - إعدادات إعادة المحاولة
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Cache configuration - إعدادات التخزين المؤقت
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes - 5 دقائق
    
    // Endpoints - نقاط النهاية
    ENDPOINTS: {
        GET_CRAFTSMEN: 'craftsmen',
        GET_MACHINES: 'machines',
        GET_SHOPS: 'shops',
        GET_OFFERS: 'offers',
        GET_ADS: 'ads',
        GET_NEWS: 'news',
        GET_EMERGENCY: 'emergency',
        
        SAVE_CRAFTSMAN: 'craftsmen',
        SAVE_MACHINE: 'machines',
        SAVE_SHOP: 'shops',
        SAVE_OFFER: 'offers',
        SAVE_AD: 'ads',
        SAVE_NEWS: 'news',
        SAVE_EMERGENCY: 'emergency',
        
        UPDATE_CRAFTSMAN: 'craftsmen',
        UPDATE_MACHINE: 'machines',
        UPDATE_SHOP: 'shops',
        UPDATE_OFFER: 'offers',
        UPDATE_AD: 'ads',
        UPDATE_NEWS: 'news',
        UPDATE_EMERGENCY: 'emergency',
        
        DELETE_CRAFTSMEN: 'craftsmen',
        DELETE_MACHINE: 'machines',
        DELETE_SHOP: 'shops',
        DELETE_OFFER: 'offers',
        DELETE_AD: 'ads',
        DELETE_NEWS: 'news',
        DELETE_EMERGENCY: 'emergency',
        
        APPROVE_OFFER: 'offers', // الموافقة على العروض
        APPROVE_AD: 'ads', // الموافقة على الإعلانات
        
        ADMIN_LOGIN: 'login', // تسجيل دخول الإدارة
        SHOP_OWNER_LOGIN: 'login', // تسجيل دخول أصحاب المحلات
        SHOP_OWNER_REGISTER: 'register' // تسجيل أصحاب المحلات
    }
};

// API Client Class - فئة عميل API
class ApiClient {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
        this.cacheDuration = API_CONFIG.CACHE_DURATION;
    }

    // Generic request method - طلب عام
    async request(action, type, data = null, params = {}) {
        const url = new URL(this.baseUrl);

        // For GET requests, use URL parameters
        // للطلبات GET، استخدم معلمات URL
        if (action === 'get') {
            url.searchParams.append('action', action);
            url.searchParams.append('type', type);

            // Add additional params - إضافة معلمات إضافية
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            const options = {
                method: 'GET',
                // Remove Content-Type header for GET to avoid CORS preflight
                // إزالة Content-Type header لتجنب CORS preflight
            };

            // Handle caching for GET requests - التعامل مع التخزين المؤقت للطلبات GET
            const cacheKey = `${action}_${type}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            try {
                console.log('🔗 GET API Request:', url.toString());
                const response = await this.fetchWithRetry(url.toString(), options);
                console.log('📡 Response status:', response.status);

                const result = await response.json();
                console.log('📋 API Response:', result);

                // Cache GET requests - تخزين الطلبات GET
                if (result.success) {
                    this.setCachedData(cacheKey, result.data);
                }

                return result;
            } catch (error) {
                console.error('❌ GET API request failed:', error);
                throw error;
            }
        }

        // For POST/PUT/DELETE requests (save, update, delete), use POST with JSON body
        // للطلبات POST/PUT/DELETE، استخدم POST مع JSON body
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                type: type,
                data: data,
                ...params
            })
        };

        // Clear cache for write operations
        if (action === 'save' || action === 'update' || action === 'delete') {
            this.clearCache(type);
        }

        try {
            console.log('🔗 POST API Request:', url.toString());
            console.log('📤 Request data:', { action, type, data, ...params });

            const response = await this.fetchWithRetry(url.toString(), options);
            console.log('📡 Response status:', response.status);

            const result = await response.json();
            console.log('📋 API Response:', result);

            return result;
        } catch (error) {
            console.error('❌ POST API request failed:', error);
            throw error;
        }
    }

    // Fetch with retry and timeout - جلب مع إعادة المحاولة والمهلة
    async fetchWithRetry(url, options, attempt = 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.log(`Retrying request (attempt ${attempt + 1}/${this.retryAttempts})`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            
            throw error;
        }
    }

    // Check if error should be retried - التحقق مما إذا كان يجب إعادة محاولة الخطأ
    shouldRetry(error) {
        return error.name === 'AbortError' || 
               error.name === 'TypeError' || 
               error.message.includes('Failed to fetch');
    }

    // Delay function - وظيفة تأخير
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cache management - إدارة التخزين المؤقت
    getCachedData(key) {
        try {
            const cached = localStorage.getItem(`api_cache_${key}`);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const now = Date.now();
                if (now - timestamp < this.cacheDuration) {
                    return data;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting cached data:', error);
            return null;
        }
    }

    setCachedData(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting cached data:', error);
        }
    }

    clearCache(key) {
        try {
            if (key) {
                localStorage.removeItem(`api_cache_${key}`);
            } else {
                Object.keys(localStorage).forEach(item => {
                    if (item.startsWith('api_cache_')) {
                        localStorage.removeItem(item);
                    }
                });
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    // GET methods - طرق GET
    async getCraftsmen() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_CRAFTSMEN);
    }

    async getMachines() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_MACHINES);
    }

    async getShops() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_SHOPS);
    }

    async getOffers() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_OFFERS);
    }

    async getAds() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_ADS);
    }

    async getNews() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_NEWS);
    }

    async getEmergency() {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_EMERGENCY);
    }

    // SAVE methods - طرق الحفظ
    async saveCraftsman(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_CRAFTSMEN);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_CRAFTSMAN, data);
    }

    async saveMachine(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_MACHINES);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_MACHINE, data);
    }

    async saveShop(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_SHOPS);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_SHOP, data);
    }

    async saveOffer(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_OFFERS);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_OFFER, data);
    }

    async saveAd(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_ADS);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_AD, data);
    }

    async saveNews(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_NEWS);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_NEWS, data);
    }

    async saveEmergency(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_EMERGENCY);
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_EMERGENCY, data);
    }

    // UPDATE methods - طرق التحديث
    async updateCraftsman(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_CRAFTSMEN);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_CRAFTSMAN, data);
    }

    async updateMachine(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_MACHINES);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_MACHINE, data);
    }

    async updateShop(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_SHOPS);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_SHOP, data);
    }

    async updateOffer(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_OFFERS);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_OFFER, data);
    }

    async updateAd(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_ADS);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_AD, data);
    }

    async updateNews(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_NEWS);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_NEWS, data);
    }

    async updateEmergency(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_EMERGENCY);
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_EMERGENCY, data);
    }

    // DELETE methods - طرق الحذف
    async deleteCraftsman(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_CRAFTSMEN);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_CRAFTSMEN, data);
    }

    async deleteMachine(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_MACHINES);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_MACHINE, data);
    }

    async deleteShop(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_SHOPS);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_SHOP, data);
    }

    async deleteOffer(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_OFFERS);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_OFFER, data);
    }

    async deleteAd(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_ADS);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_AD, data);
    }

    async deleteNews(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_NEWS);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_NEWS, data);
    }

    async deleteEmergency(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_EMERGENCY);
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_EMERGENCY, data);
    }

    // APPROVE methods - طرق الموافقة
    async approveOffer(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_OFFERS);
        return this.request('approve', API_CONFIG.ENDPOINTS.APPROVE_OFFER, data);
    }

    async approveAd(data) {
        this.clearCache(API_CONFIG.ENDPOINTS.GET_ADS);
        return this.request('approve', API_CONFIG.ENDPOINTS.APPROVE_AD, data);
    }

    // AUTH methods - طرق المصادقة
    async adminLogin(username, password) {
        return this.request('login', API_CONFIG.ENDPOINTS.ADMIN_LOGIN, null, { 
            username, 
            password, 
            type: 'admin' 
        });
    }

    async shopOwnerLogin(username, password) {
        return this.request('login', API_CONFIG.ENDPOINTS.SHOP_OWNER_LOGIN, null, { 
            username, 
            password, 
            type: 'shop-owner' 
        });
    }

    async shopOwnerRegister(data) {
        return this.request('register', API_CONFIG.ENDPOINTS.SHOP_OWNER_REGISTER, data, { 
            type: 'shop-owner' 
        });
    }
}

// Create global API client instance - إنشاء نسخة عميل API عالمية
const apiClient = new ApiClient();

// Export for use in other modules - التصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, ApiClient, apiClient };
} else {
    window.API_CONFIG = API_CONFIG;
    window.ApiClient = ApiClient;
    window.apiClient = apiClient;
}

// Utility functions for error handling - وظائف مساعدة لمعالجة الأخطاء
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.name === 'AbortError') {
        return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
    } else if (error.message.includes('Failed to fetch')) {
        return 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
    } else if (error.message.includes('Rate limit')) {
        return 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة لاحقاً.';
    } else {
        return error.message || 'حدث خطأ غير متوقع.';
    }
}

// Function to update API URL - وظيفة لتحديث URL الـ API
function updateApiUrl(newUrl) {
    API_CONFIG.BASE_URL = newUrl;
    apiClient.baseUrl = newUrl;
    localStorage.setItem('village_api_url', newUrl);
}

// Function to load API URL from localStorage - وظيفة لتحميل URL الـ API من localStorage
function loadApiUrl() {
    const savedUrl = localStorage.getItem('village_api_url');
    if (savedUrl) {
        updateApiUrl(savedUrl);
    }
}

// Initialize API URL on load - تهيئة URL الـ API عند التحميل
loadApiUrl();

// Check if API URL needs to be configured - التحقق من إعداد URL الـ API
function checkApiConfiguration() {
    if (API_CONFIG.BASE_URL.includes('YOUR_DEPLOYMENT_ID')) {
        console.warn('⚠️  API URL not configured! Please update BASE_URL in api-config.js');
        console.warn('⚠️  لم يتم إعداد URL الـ API! يرجى تحديث BASE_URL في api-config.js');
        console.warn('📖 Read google-setup-guide.md for instructions');
        console.warn('📖 اقرأ google-setup-guide.md للتعليمات');

        // Show warning in the UI if possible
        if (typeof showError === 'function') {
            showError('لم يتم إعداد رابط API. يرجى اتباع تعليمات google-setup-guide.md');
        }
    } else {
        console.log('✅ API URL configured:', API_CONFIG.BASE_URL);
    }
}

checkApiConfiguration();

// Export utility functions - تصدير الوظائف المساعدة
if (typeof module !== 'undefined' && module.exports) {
    module.exports.handleApiError = handleApiError;
    module.exports.updateApiUrl = updateApiUrl;
    module.exports.loadApiUrl = loadApiUrl;
} else {
    window.handleApiError = handleApiError;
    window.updateApiUrl = updateApiUrl;
    window.loadApiUrl = loadApiUrl;
}
