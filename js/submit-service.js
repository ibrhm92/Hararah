// Submit Service JavaScript - تقديم طلبات الخدمات
import { firebaseClient } from './api-config-firebase.js';

let selectedServiceType = null;

// Service type configurations
const serviceConfigs = {
    doctor: {
        title: 'تقديم طلب عيادة طبية',
        fields: [
            { name: 'name', label: 'اسم الطبيب/العيادة', type: 'text', required: true },
            {
                name: 'specialty', label: 'التخصص', type: 'select', required: true, options: [
                    'طب عام', 'طب أطفال', 'طب نساء وتوليد', 'طب قلب', 'طب أسنان',
                    'طب عظام', 'طب جلدية', 'طب نفسي', 'طب عيون', 'أنف وأذن وحنجرة',
                    'جراحة عامة', 'جراحة قلب', 'جراحة عظام', 'أشعة', 'تحاليل طبية'
                ]
            },
            { name: 'address', label: 'العنوان', type: 'text', required: true },
            { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, pattern: '01[0125][0-9]{8}' },
            { name: 'whatsapp', label: 'رقم الواتساب', type: 'tel', required: false, pattern: '01[0125][0-9]{8}' },
            { name: 'workingHours', label: 'ساعات العمل', type: 'text', required: false },
            { name: 'notes', label: 'ملاحظات إضافية', type: 'textarea', required: false }
        ]
    },
    shop: {
        title: 'تقديم طلب محل تجاري',
        fields: [
            { name: 'name', label: 'اسم المحل', type: 'text', required: true },
            {
                name: 'shopType', label: 'نشاط المحل', type: 'select', required: true, options: [
                    'بقالة', 'صيدلية', 'مخبز', 'مطعم', 'ملابس', 'خضار وفاكهة',
                    'إلكترونيات', 'أثاث', 'مكتبة', 'محل حلاقي', 'صالون تجميل',
                    'ورشة سيارات', 'مواد بناء', 'أخرى'
                ]
            },
            { name: 'address', label: 'العنوان', type: 'text', required: true },
            { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, pattern: '01[0125][0-9]{8}' },
            { name: 'whatsapp', label: 'رقم الواتساب', type: 'tel', required: false, pattern: '01[0125][0-9]{8}' },
            { name: 'workingHours', label: 'ساعات العمل', type: 'text', required: false },
            { name: 'status', label: 'الحالة', type: 'select', required: false, options: ['مفتوح', 'مغلق'] },
            { name: 'notes', label: 'ملاحظات', type: 'textarea', required: false }
        ]
    },
    craftsman: {
        title: 'تقديم طلب صنايعي',
        fields: [
            { name: 'name', label: 'اسم الصنايعي', type: 'text', required: true },
            {
                name: 'craft', label: 'الحرفة', type: 'select', required: true, options: [
                    'كهربائي', 'سباك', 'نجار', 'حداد', 'ميكانيكي سيارات',
                    'مباني', 'دهان', 'زجاجي', 'مبلط', 'تركيب أثاث',
                    'تصليح ثلاجات', 'تصليح غسالات', 'تصليح تلفزيونات', 'أخرى'
                ]
            },
            { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, pattern: '01[0125][0-9]{8}' },
            { name: 'whatsapp', label: 'رقم الواتساب', type: 'tel', required: false, pattern: '01[0125][0-9]{8}' },
            { name: 'experience', label: 'سنوات الخبرة', type: 'number', required: false },
            { name: 'area', label: 'منطقة العمل', type: 'text', required: false },
            { name: 'notes', label: 'ملاحظات', type: 'textarea', required: false }
        ]
    },
    machine: {
        title: 'تقديم طلب آلة زراعية',
        fields: [
            { name: 'name', label: 'اسم الآلة', type: 'text', required: true },
            {
                name: 'type', label: 'نوع الآلة', type: 'select', required: true, options: [
                    'جرار', 'حفار', 'مقطورة', 'درارة', 'حصادة',
                    'رشاشة', 'نضارة', 'ضاغطة', 'آلة حفر آبار', 'أخرى'
                ]
            },
            { name: 'owner', label: 'اسم المالك', type: 'text', required: true },
            { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, pattern: '01[0125][0-9]{8}' },
            { name: 'whatsapp', label: 'رقم الواتساب', type: 'tel', required: false, pattern: '01[0125][0-9]{8}' },
            { name: 'status', label: 'الحالة', type: 'select', required: false, options: ['متاحة', 'مشغولة', 'غير متاحة'] },
            { name: 'notes', label: 'ملاحظات', type: 'textarea', required: false }
        ]
    }
};

// Validate Egyptian phone number - التحقق من رقم الهاتف المصري
function validateEgyptianPhone(phone) {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
}

// Format WhatsApp number - تنسيق رقم الواتساب
function formatEgyptianWhatsApp(phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
        return cleanPhone;
    }
    return phone;
}

// Select service type
function selectServiceType(type) {
    selectedServiceType = type;
    const config = serviceConfigs[type];

    // Update form title
    document.getElementById('formTitle').textContent = config.title;

    // Generate dynamic fields
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    config.fields.forEach(field => {
        const formGroup = createFormField(field);
        dynamicFields.appendChild(formGroup);
    });

    // Show form section
    document.getElementById('serviceTypeSection').style.display = 'none';
    document.getElementById('formSection').style.display = 'block';

    // Scroll to top of form
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
}
window.selectServiceType = selectServiceType;

// Create form field
function createFormField(field) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label + (field.required ? ' *' : '');
    label.setAttribute('for', field.name);

    let input;
    if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'form-select';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `اختر ${field.label}`;
        input.appendChild(defaultOption);

        field.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            input.appendChild(optionElement);
        });
    } else if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'form-textarea';
        input.rows = 4;
    } else {
        input = document.createElement('input');
        input.type = field.type;
        input.className = 'form-input';
    }

    input.id = field.name;
    input.name = field.name;
    if (field.required) input.required = true;
    input.placeholder = `أدخل ${field.label}`;

    formGroup.appendChild(label);
    formGroup.appendChild(input);

    return formGroup;
}

// Back to service types
function backToServiceTypes() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('serviceTypeSection').style.display = 'block';
    selectedServiceType = null;
    document.getElementById('serviceForm').reset();
}
window.backToServiceTypes = backToServiceTypes;

// Reset form
function resetForm() {
    document.getElementById('successSection').style.display = 'none';
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('serviceTypeSection').style.display = 'block';
    selectedServiceType = null;
    document.getElementById('serviceForm').reset();
}
window.resetForm = resetForm;

// Submit form
document.getElementById('serviceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!selectedServiceType) {
        showError('يرجى اختيار نوع الخدمة أولاً');
        return;
    }

    // Check if Firebase functions are available
    if (!window.saveData || typeof window.saveData !== 'function') {
        showError('النظام لم يتم تحميله بالكامل. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        return;
    }

    // Validate form fields
    if (!validateForm()) {
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التقديم...';
    submitBtn.disabled = true;

    try {
        // Collect form data
        const formData = collectFormData();

        // Save to database
        await saveServiceRequest(formData);

        // Show success message
        showSuccessMessage();

    } catch (error) {
        console.error('Error submitting form:', error);
        if (error.message.includes('Firebase functions not loaded')) {
            showError('النظام لم يتم تحميله بالكامل. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        } else {
            showError('حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
        }
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Validate form fields
function validateForm() {
    let isValid = true;
    const errors = [];

    // Validate submitter info
    const submitterName = document.getElementById('submitterName').value.trim();
    const submitterPhone = document.getElementById('submitterPhone').value.trim();

    if (!submitterName) {
        errors.push('يرجى إدخال اسم مقدم الطلب');
        isValid = false;
    }

    if (!submitterPhone) {
        errors.push('يرجى إدخال رقم هاتف مقدم الطلب');
        isValid = false;
    } else if (!validateEgyptianPhone(submitterPhone)) {
        errors.push('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 ويتكون من 11 رقم');
        isValid = false;
    }

    // Validate service-specific fields
    const config = serviceConfigs[selectedServiceType];
    config.fields.forEach(field => {
        const element = document.getElementById(field.name);

        if (field.required) {
            if (!element || !element.value.trim()) {
                errors.push(`يرجى إدخال ${field.label}`);
                isValid = false;
            }
        }

        // Validate phone numbers
        if (field.type === 'tel' && element && element.value.trim()) {
            if (!validateEgyptianPhone(element.value.trim())) {
                errors.push(`يرجى إدخال ${field.label} صحيح يبدأ بـ 01 ويتكون من 11 رقم`);
                isValid = false;
            }
        }
    });

    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms && !agreeTerms.checked) {
        errors.push('يرجى الموافقة على الشروط والأحكام');
        isValid = false;
    }

    // Show errors if any
    if (!isValid && errors.length > 0) {
        showError(errors.join('<br>'));
    }

    return isValid;
}

// Collect form data
function collectFormData() {
    const config = serviceConfigs[selectedServiceType];
    const formData = {
        type: selectedServiceType,
        status: 'pending',
        submittedBy: {
            name: document.getElementById('submitterName').value.trim(),
            phone: formatEgyptianWhatsApp(document.getElementById('submitterPhone').value),
            email: document.getElementById('submitterEmail').value.trim() || null
        },
        submittedAt: new Date().toISOString(),
        additionalNotes: document.getElementById('additionalNotes').value.trim() || null
    };

    // Collect service-specific fields
    config.fields.forEach(field => {
        const element = document.getElementById(field.name);
        if (element) {
            let value = element.value.trim();

            // Format phone numbers
            if (field.type === 'tel' && value) {
                value = formatEgyptianWhatsApp(value);
            }

            // Only include non-empty values
            if (value) {
                formData[field.name] = value;
            }
        }
    });

    return formData;
}

// Save service request to database
async function saveServiceRequest(formData) {
    // Check if saveData function is available
    if (!window.saveData || typeof window.saveData !== 'function') {
        throw new Error('Firebase functions not loaded. Please refresh the page and try again.');
    }

    const collectionMap = {
        doctor: 'doctors',
        shop: 'shops',
        craftsman: 'craftsmen',
        machine: 'machines'
    };

    const collection = collectionMap[selectedServiceType];

    // Add to pending collection
    const pendingData = {
        ...formData,
        requestType: 'new_service',
        reviewed: false,
        id: generateRequestId()
    };

    try {
        // Save to pending requests ONLY
        // The request will be added to the main collection only after admin approval
        await window.saveData('pending_requests', pendingData);

        console.log('Service request saved successfully to pending queue');
    } catch (error) {
        console.error('Error saving service request:', error);
        throw error;
    }
}

// Generate unique request ID
function generateRequestId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `REQ-${timestamp}-${random}`;
}

// Show success message
function showSuccessMessage() {
    const serviceNames = {
        doctor: 'العيادة الطبية',
        shop: 'المحل التجاري',
        craftsman: 'الصنايعي',
        machine: 'الآلة الزراعية'
    };

    const serviceName = serviceNames[selectedServiceType];
    const message = `تم تقديم طلب إضافة ${serviceName} بنجاح! رقم الطلب: ${generateRequestNumber()}. سيتم مراجعة الطلب خلال 24-48 ساعة وإشعارك بالنتيجة.`;

    document.getElementById('successMessage').textContent = message;
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'block';
}

// Generate request number
function generateRequestNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REQ-${year}${month}${day}-${random}`;
}

// Show error message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Navigation toggle - تبديل القائمة
function toggleMenu() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.toggle('active');
    }
}
window.toggleMenu = toggleMenu;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }, 1000);

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Wait for Firebase functions to be available
    const waitForFirebase = () => {
        if (window.saveData && typeof window.saveData === 'function') {
            console.log('Firebase functions are ready');
        } else {
            console.log('Waiting for Firebase functions...');
            setTimeout(waitForFirebase, 100);
        }
    };
    waitForFirebase();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
