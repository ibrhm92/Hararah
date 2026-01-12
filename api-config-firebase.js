// Firebase Configuration - إعدادات Firebase
// Import Firebase modules - استيراد وحدات Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase Configuration - إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAh5R1TODbL_0xCdg7Nr93ypOozePFb86Q",
  authDomain: "hararah-34d17.firebaseapp.com",
  projectId: "hararah-34d17",
  storageBucket: "hararah-34d17.firebasestorage.app",
  messagingSenderId: "953969843610",
  appId: "1:953969843610:web:53b5b1789f4fd547b36e23",
  measurementId: "G-DEL89WT7VX"
};

// Initialize Firebase - تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// API Configuration - إعدادات API
const API_CONFIG = {
    BASE_URL: `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes - 5 دقائق
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
        APPROVE_OFFER: 'offers',
        APPROVE_AD: 'ads',
        ADMIN_LOGIN: 'users',
        SHOP_OWNER_LOGIN: 'users',
        SHOP_OWNER_REGISTER: 'users'
    }
};

// Firebase API Client - عميل Firebase API
class FirebaseApiClient {
    constructor() {
        this.db = db;
        this.config = API_CONFIG;
    }

    // Get all documents from collection - جلب جميع الوثائق من مجموعة
    async getCollection(collectionName) {
        try {
            const collectionRef = collection(this.db, collectionName);
            const querySnapshot = await getDocs(collectionRef);
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return documents;
        } catch (error) {
            console.error(`Error getting collection ${collectionName}:`, error);
            throw error;
        }
    }

    // Get document by ID - جلب وثيقة بالمعرف
    async getDocument(collectionName, docId) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            const docSnapshot = await getDoc(docRef);
            
            if (docSnapshot.exists()) {
                return {
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                };
            } else {
                throw new Error('Document not found');
            }
        } catch (error) {
            console.error(`Error getting document ${docId} from ${collectionName}:`, error);
            throw error;
        }
    }

    // Add document to collection - إضافة وثيقة إلى مجموعة
    async addDocument(collectionName, data) {
        try {
            const collectionRef = collection(this.db, collectionName);
            const docRef = await addDoc(collectionRef, {
                ...data,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });
            
            return {
                id: docRef.id,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error adding document to ${collectionName}:`, error);
            throw error;
        }
    }

    // Update document - تحديث وثيقة
    async updateDocument(collectionName, docId, data) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                updated_at: serverTimestamp()
            });
            
            return {
                id: docId,
                ...data,
                updated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error updating document ${docId} in ${collectionName}:`, error);
            throw error;
        }
    }

    // Delete document - حذف وثيقة
    async deleteDocument(collectionName, docId) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
            throw error;
        }
    }

    // Query documents with conditions - استعلام الوثائق بشروط
    async queryDocuments(collectionName, conditions = [], orderByField = null, limitCount = null) {
        try {
            let q = collection(this.db, collectionName);
            
            // Add where conditions - إضافة شروط where
            conditions.forEach(condition => {
                const { field, operator, value } = condition;
                q = query(q, where(field, operator, value));
            });
            
            // Add order by - إضافة ترتيب
            if (orderByField) {
                q = query(q, orderBy(orderByField, 'desc'));
            }
            
            // Add limit - إضافة حد
            if (limitCount) {
                q = query(q, limit(limitCount));
            }
            
            const querySnapshot = await getDocs(q);
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return documents;
        } catch (error) {
            console.error(`Error querying documents from ${collectionName}:`, error);
            throw error;
        }
    }

    // Search documents - البحث في الوثائق
    async searchDocuments(collectionName, searchTerm, searchFields = []) {
        try {
            const collectionRef = collection(this.db, collectionName);
            const querySnapshot = await getDocs(collectionRef);
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                const docData = {
                    id: doc.id,
                    ...doc.data()
                };
                
                // Check if search term matches any field - التحقق من تطبيق مصطلح البحث مع أي حقل
                const matches = searchFields.some(field => {
                    const fieldValue = docData[field];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
                
                if (matches) {
                    documents.push(docData);
                }
            });
            
            return documents;
        } catch (error) {
            console.error(`Error searching documents in ${collectionName}:`, error);
            throw error;
        }
    }

    // Get collection statistics - جلب إحصائيات المجموعة
    async getCollectionStats(collectionName) {
        try {
            const collectionRef = collection(this.db, collectionName);
            const querySnapshot = await getDocs(collectionRef);
            return querySnapshot.size;
        } catch (error) {
            console.error(`Error getting stats for ${collectionName}:`, error);
            return 0;
        }
    }

    // Get pending items - جلب العناصر المعلقة
    async getPendingItems(collectionName) {
        try {
            return await this.queryDocuments(collectionName, [
                { field: 'approved', operator: '==', value: false }
            ]);
        } catch (error) {
            console.error(`Error getting pending items from ${collectionName}:`, error);
            return [];
        }
    }

    // Approve item - موافقة على عنصر
    async approveItem(collectionName, docId, approved = true) {
        try {
            return await this.updateDocument(collectionName, docId, { approved });
        } catch (error) {
            console.error(`Error approving item ${docId} in ${collectionName}:`, error);
            throw error;
        }
    }
}

// Create Firebase API client - إنشاء عميل Firebase API
const firebaseClient = new FirebaseApiClient();

// Export for use in other modules - تصدير للاستخدام في الوحدات الأخرى
export { 
    app, 
    db, 
    analytics, 
    firebaseClient, 
    API_CONFIG, 
    firebaseConfig 
};
