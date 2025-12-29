// API Configuration for Village App
// This file contains the configuration for connecting to Google Apps Script API

// API Configuration
const API_CONFIG = {
    // Replace this with your actual Google Apps Script Web App URL
    BASE_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
    
    // Request timeout in milliseconds
    TIMEOUT: 30000,
    
    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Cache configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Endpoints
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
        
        DELETE_CRAFTSMAN: 'craftsmen',
        DELETE_MACHINE: 'machines',
        DELETE_SHOP: 'shops',
        DELETE_OFFER: 'offers',
        DELETE_AD: 'ads',
        DELETE_NEWS: 'news',
        DELETE_EMERGENCY: 'emergency',
        
        APPROVE_OFFER: 'offers',
        APPROVE_AD: 'ads',
        
        ADMIN_LOGIN: 'admin',
        SHOP_OWNER_LOGIN: 'shop-owner',
        SHOP_OWNER_REGISTER: 'shop-owner'
    }
};

// API Client Class
class ApiClient {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.cache = new Map();
    }

    // Generic request method
    async request(action, type, data = null, params = {}) {
        const cacheKey = `${action}_${type}_${JSON.stringify(params)}`;
        
        // Check cache for GET requests
        if (action === 'get' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < API_CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        const url = new URL(this.baseUrl);
        url.searchParams.append('action', action);
        url.searchParams.append('type', type);
        
        // Add additional parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

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

        try {
            const response = await this.fetchWithRetry(url.toString(), options);
            const result = await response.json();

            if (result.success) {
                // Cache successful GET requests
                if (action === 'get') {
                    this.cache.set(cacheKey, {
                        data: result.data,
                        timestamp: Date.now()
                    });
                }
                return result.data;
            } else {
                throw new Error(result.error || 'Request failed');
            }
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Fetch with retry logic
    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                console.warn(`Retrying request (attempt ${attempt + 1}):`, error.message);
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }

    // Clear cache
    clearCache(type = null) {
        if (type) {
            for (const key of this.cache.keys()) {
                if (key.includes(type)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // GET methods
    async getCraftsmen(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_CRAFTSMEN, null, params);
    }

    async getMachines(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_MACHINES, null, params);
    }

    async getShops(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_SHOPS, null, params);
    }

    async getOffers(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_OFFERS, null, params);
    }

    async getAds(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_ADS, null, params);
    }

    async getNews(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_NEWS, null, params);
    }

    async getEmergency(params = {}) {
        return this.request('get', API_CONFIG.ENDPOINTS.GET_EMERGENCY, null, params);
    }

    // SAVE methods
    async saveCraftsman(data) {
        this.clearCache('craftsmen');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_CRAFTSMAN, data);
    }

    async saveMachine(data) {
        this.clearCache('machines');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_MACHINE, data);
    }

    async saveShop(data) {
        this.clearCache('shops');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_SHOP, data);
    }

    async saveOffer(data) {
        this.clearCache('offers');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_OFFER, data);
    }

    async saveAd(data) {
        this.clearCache('ads');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_AD, data);
    }

    async saveNews(data) {
        this.clearCache('news');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_NEWS, data);
    }

    async saveEmergency(data) {
        this.clearCache('emergency');
        return this.request('save', API_CONFIG.ENDPOINTS.SAVE_EMERGENCY, data);
    }

    // UPDATE methods
    async updateCraftsman(id, data) {
        this.clearCache('craftsmen');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_CRAFTSMAN, data, { id });
    }

    async updateMachine(id, data) {
        this.clearCache('machines');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_MACHINE, data, { id });
    }

    async updateShop(id, data) {
        this.clearCache('shops');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_SHOP, data, { id });
    }

    async updateOffer(id, data) {
        this.clearCache('offers');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_OFFER, data, { id });
    }

    async updateAd(id, data) {
        this.clearCache('ads');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_AD, data, { id });
    }

    async updateNews(id, data) {
        this.clearCache('news');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_NEWS, data, { id });
    }

    async updateEmergency(id, data) {
        this.clearCache('emergency');
        return this.request('update', API_CONFIG.ENDPOINTS.UPDATE_EMERGENCY, data, { id });
    }

    // DELETE methods
    async deleteCraftsman(id) {
        this.clearCache('craftsmen');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_CRAFTSMAN, null, { id });
    }

    async deleteMachine(id) {
        this.clearCache('machines');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_MACHINE, null, { id });
    }

    async deleteShop(id) {
        this.clearCache('shops');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_SHOP, null, { id });
    }

    async deleteOffer(id) {
        this.clearCache('offers');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_OFFER, null, { id });
    }

    async deleteAd(id) {
        this.clearCache('ads');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_AD, null, { id });
    }

    async deleteNews(id) {
        this.clearCache('news');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_NEWS, null, { id });
    }

    async deleteEmergency(id) {
        this.clearCache('emergency');
        return this.request('delete', API_CONFIG.ENDPOINTS.DELETE_EMERGENCY, null, { id });
    }

    // APPROVE methods
    async approveOffer(id, approve = true) {
        this.clearCache('offers');
        return this.request('approve', API_CONFIG.ENDPOINTS.APPROVE_OFFER, null, { id, approve });
    }

    async approveAd(id, approve = true) {
        this.clearCache('ads');
        return this.request('approve', API_CONFIG.ENDPOINTS.APPROVE_AD, null, { id, approve });
    }

    // AUTH methods
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

// Create global API client instance
const apiClient = new ApiClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, ApiClient, apiClient };
} else {
    window.API_CONFIG = API_CONFIG;
    window.ApiClient = ApiClient;
    window.apiClient = apiClient;
}

// Utility functions for error handling
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

// Function to update API URL
function updateApiUrl(newUrl) {
    API_CONFIG.BASE_URL = newUrl;
    apiClient.baseUrl = newUrl;
    localStorage.setItem('village_api_url', newUrl);
}

// Function to load API URL from localStorage
function loadApiUrl() {
    const savedUrl = localStorage.getItem('village_api_url');
    if (savedUrl) {
        updateApiUrl(savedUrl);
    }
}

// Initialize API URL on load
loadApiUrl();

// Export utility functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports.handleApiError = handleApiError;
    module.exports.updateApiUrl = updateApiUrl;
    module.exports.loadApiUrl = loadApiUrl;
} else {
    window.handleApiError = handleApiError;
    window.updateApiUrl = updateApiUrl;
    window.loadApiUrl = loadApiUrl;
}
