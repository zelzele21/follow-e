/**
 * Follow-E | Expense Tracker
 * Modern PWA Harcama Takip Uygulaması
 * Version: 1.0.0
 */

// ============================================
// CONSTANTS & CONFIG
// ============================================

const APP_CONFIG = {
    name: 'Follow-E',
    version: '1.0.0',
    storageKey: 'followE_expenses',
    themeKey: 'followE_theme',
    notificationKey: 'followE_notification_asked'
};

const CATEGORY_ICONS = {
    fatura: '📄',
    abonelik: '📱',
    kredi: '🏦',
    kira: '🏠',
    sigorta: '🛡️',
    diger: '📦'
};

const CATEGORY_NAMES = {
    fatura: 'Fatura',
    abonelik: 'Abonelik',
    kredi: 'Kredi',
    kira: 'Kira',
    sigorta: 'Sigorta',
    diger: 'Diğer'
};

const REPEAT_NAMES = {
    once: 'Tek Seferlik',
    daily: 'Her Gün',
    weekly: 'Her Hafta',
    biweekly: '2 Haftada Bir',
    triweekly: '3 Haftada Bir',
    monthly: 'Her Ay',
    quarterly: '3 Ayda Bir',
    biannual: '6 Ayda Bir',
    yearly: 'Her Yıl'
};

const PRIORITY_NAMES = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek'
};

// ============================================
// STATE
// ============================================

let expenses = [];
let currentFilter = 'all';
let deleteTargetId = null;
let editTargetId = null;
let deferredPrompt = null;
let scheduledNotifications = new Map();

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Stats
    statActive: document.getElementById('statActive'),
    statMonthly: document.getElementById('statMonthly'),
    statTotal: document.getElementById('statTotal'),
    
    // Advice
    adviceTitle: document.getElementById('adviceTitle'),
    adviceText: document.getElementById('adviceText'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // List
    expenseList: document.getElementById('expenseList'),
    emptyState: document.getElementById('emptyState'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    
    // Form
    expenseForm: document.getElementById('expenseForm'),
    dateInput: document.getElementById('date'),
    addTimeBtn: document.getElementById('addTimeBtn'),
    extraTimesList: document.getElementById('extraTimesList'),
    
    // Modals
    notificationModal: document.getElementById('notificationModal'),
    deleteModal: document.getElementById('deleteModal'),
    editModal: document.getElementById('editModal'),
    
    // Delete Modal
    deleteItemTitle: document.getElementById('deleteItemTitle'),
    deleteCancel: document.getElementById('deleteCancel'),
    deleteConfirm: document.getElementById('deleteConfirm'),
    deleteModalClose: document.getElementById('deleteModalClose'),
    
    // Edit Modal
    editForm: document.getElementById('editForm'),
    editId: document.getElementById('editId'),
    editTitle: document.getElementById('editTitle'),
    editDescription: document.getElementById('editDescription'),
    editAmount: document.getElementById('editAmount'),
    editCategory: document.getElementById('editCategory'),
    editDate: document.getElementById('editDate'),
    editTime: document.getElementById('editTime'),
    editRepeatType: document.getElementById('editRepeatType'),
    editCancel: document.getElementById('editCancel'),
    editSave: document.getElementById('editSave'),
    editModalClose: document.getElementById('editModalClose'),
    
    // Notification Modal
    notificationAllow: document.getElementById('notificationAllow'),
    notificationLater: document.getElementById('notificationLater'),
    notificationModalClose: document.getElementById('notificationModalClose'),
    
    // PWA Banner
    pwaBanner: document.getElementById('pwaBanner'),
    pwaInstallBtn: document.getElementById('pwaInstallBtn'),
    pwaDismissBtn: document.getElementById('pwaDismissBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadExpenses();
    initForm();
    initTabs();
    initFilters();
    initModals();
    initPWA();
    checkNotificationPermission();
    renderExpenses();
    updateStats();
    updateAdvice();
    scheduleAllNotifications();
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem(APP_CONFIG.themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(APP_CONFIG.themeKey)) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(APP_CONFIG.themeKey, newTheme);
    
    showToast(newTheme === 'dark' ? '🌙 Koyu tema aktif' : '☀️ Açık tema aktif');
}

// ============================================
// DATA MANAGEMENT
// ============================================

function loadExpenses() {
    try {
        const data = localStorage.getItem(APP_CONFIG.storageKey);
        expenses = data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading expenses:', e);
        expenses = [];
    }
}

function saveExpenses() {
    try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(expenses));
    } catch (e) {
        console.error('Error saving expenses:', e);
        showToast('Kaydetme hatası!', 'error');
    }
}

function generateId() {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function addExpense(expense) {
    expense.id = generateId();
    expense.createdAt = new Date().toISOString();
    expense.isActive = true;
    expenses.unshift(expense);
    saveExpenses();
    return expense;
}

function updateExpense(id, updates) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() };
        saveExpenses();
        return expenses[index];
    }
    return null;
}

function deleteExpense(id) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses.splice(index, 1);
        saveExpenses();
        return true;
    }
    return false;
}

function toggleExpenseStatus(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        expense.isActive = !expense.isActive;
        expense.updatedAt = new Date().toISOString();
        saveExpenses();
        return expense;
    }
    return null;
}

// ============================================
// TABS
// ============================================

function initTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update buttons
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId + 'Tab');
    });
}

// ============================================
// FILTERS
// ============================================

function initFilters() {
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            renderExpenses();
        });
    });
}

function filterExpenses() {
    if (currentFilter === 'all') {
        return expenses;
    } else if (currentFilter === 'active') {
        return expenses.filter(e => e.isActive);
    } else if (currentFilter === 'inactive') {
        return expenses.filter(e => !e.isActive);
    } else {
        return expenses.filter(e => e.category === currentFilter);
    }
}

// ============================================
// FORM
// ============================================

function initForm() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.value = today;
    
    // Form submit
    elements.expenseForm.addEventListener('submit', handleFormSubmit);
    
    // Extra times
    elements.addTimeBtn.addEventListener('click', addExtraTime);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.expenseForm);
    
    // Collect extra times
    const extraTimes = [];
    elements.extraTimesList.querySelectorAll('input[type="time"]').forEach(input => {
        if (input.value) {
            extraTimes.push(input.value);
        }
    });
    
    const expense = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        amount: parseFloat(formData.get('amount')) || 0,
        category: formData.get('category'),
        date: formData.get('date'),
        time: formData.get('time'),
        extraTimes: extraTimes,
        repeatType: formData.get('repeatType'),
        priority: formData.get('priority') || 'medium'
    };
    
    addExpense(expense);
    
    // Reset form
    elements.expenseForm.reset();
    elements.dateInput.value = new Date().toISOString().split('T')[0];
    elements.extraTimesList.innerHTML = '';
    document.getElementById('priorityMedium').checked = true;
    
    // Update UI
    renderExpenses();
    updateStats();
    updateAdvice();
    scheduleAllNotifications();
    
    // Switch to list tab
    switchTab('list');
    
    showToast('✅ Harcama başarıyla eklendi!', 'success');
}

function addExtraTime() {
    const count = elements.extraTimesList.querySelectorAll('.extra-time-item').length;
    if (count >= 5) {
        showToast('En fazla 5 ek saat ekleyebilirsiniz', 'warning');
        return;
    }
    
    const item = document.createElement('div');
    item.className = 'extra-time-item';
    item.innerHTML = `
        <input type="time" class="form-input" value="12:00">
        <button type="button" class="remove-time-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    elements.extraTimesList.appendChild(item);
}

// ============================================
// RENDERING
// ============================================

function renderExpenses() {
    const filtered = filterExpenses();
    
    if (filtered.length === 0) {
        elements.expenseList.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    elements.expenseList.innerHTML = filtered.map(expense => createExpenseCard(expense)).join('');
}

function createExpenseCard(expense) {
    const categoryIcon = CATEGORY_ICONS[expense.category] || '📦';
    const categoryName = CATEGORY_NAMES[expense.category] || 'Diğer';
    const repeatName = REPEAT_NAMES[expense.repeatType] || 'Tek Seferlik';
    const priorityName = PRIORITY_NAMES[expense.priority] || 'Orta';
    
    const nextDate = getNextOccurrence(expense);
    const formattedDate = formatDate(nextDate);
    const formattedTime = expense.time;
    
    return `
        <div class="expense-card ${expense.isActive ? '' : 'inactive'} priority-${expense.priority}" data-id="${expense.id}">
            <div class="expense-header">
                <div class="expense-info">
                    <div class="expense-title">
                        <span class="category-icon">${categoryIcon}</span>
                        ${escapeHtml(expense.title)}
                    </div>
                    ${expense.description ? `<p class="expense-description">${escapeHtml(expense.description)}</p>` : ''}
                </div>
                <div class="expense-amount">₺${formatNumber(expense.amount)}</div>
            </div>
            
            <div class="expense-meta">
                <span class="category-badge cat-${expense.category}">${categoryName}</span>
                <span class="priority-badge p-${expense.priority}">${priorityName}</span>
                <span class="meta-item">
                    <span class="meta-icon">📅</span>
                    ${formattedDate}
                </span>
                <span class="meta-item">
                    <span class="meta-icon">⏰</span>
                    ${formattedTime}
                </span>
                <span class="meta-item">
                    <span class="meta-icon">🔄</span>
                    ${repeatName}
                </span>
            </div>
            
            <div class="expense-actions">
                <button class="action-btn" onclick="handleEdit('${expense.id}')">
                    <span class="action-icon">✏️</span>
                    Düzenle
                </button>
                <button class="action-btn" onclick="handleToggleStatus('${expense.id}')">
                    <span class="action-icon">${expense.isActive ? '⏸️' : '▶️'}</span>
                    ${expense.isActive ? 'Durdur' : 'Aktif Et'}
                </button>
                <button class="action-btn danger" onclick="handleDelete('${expense.id}')">
                    <span class="action-icon">🗑️</span>
                    Sil
                </button>
            </div>
        </div>
    `;
}

// ============================================
// STATS
// ============================================

function updateStats() {
    const activeExpenses = expenses.filter(e => e.isActive);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Monthly expenses
    const monthlyExpenses = activeExpenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    
    // Total amount for this month
    let totalAmount = 0;
    activeExpenses.forEach(e => {
        const nextDate = getNextOccurrence(e);
        if (nextDate.getMonth() === currentMonth && nextDate.getFullYear() === currentYear) {
            totalAmount += e.amount;
        }
    });
    
    elements.statActive.textContent = activeExpenses.length;
    elements.statMonthly.textContent = monthlyExpenses.length;
    elements.statTotal.textContent = '₺' + formatNumber(totalAmount);
}

// ============================================
// ADVICE
// ============================================

function updateAdvice() {
    const activeExpenses = expenses.filter(e => e.isActive);
    
    if (activeExpenses.length === 0) {
        elements.adviceTitle.textContent = '🚀 Başlayın!';
        elements.adviceText.textContent = 'İlk harcamanızı ekleyerek ödemelerinizi takip etmeye başlayın.';
        return;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Today's expenses
    const todayExpenses = activeExpenses.filter(e => {
        const nextDate = getNextOccurrence(e);
        return nextDate.toDateString() === today.toDateString();
    });
    
    if (todayExpenses.length > 0) {
        const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        elements.adviceTitle.textContent = '⚠️ Bugün Ödeme Var!';
        elements.adviceText.textContent = `${todayExpenses.length} ödeme bugün. Toplam: ₺${formatNumber(total)}`;
        return;
    }
    
    // This week's expenses
    const weekExpenses = activeExpenses.filter(e => {
        const nextDate = getNextOccurrence(e);
        return nextDate >= today && nextDate <= weekEnd;
    });
    
    if (weekExpenses.length > 0) {
        const total = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
        elements.adviceTitle.textContent = '📅 Bu Hafta';
        elements.adviceText.textContent = `${weekExpenses.length} ödeme bu hafta yapılacak. Toplam: ₺${formatNumber(total)}`;
        return;
    }
    
    // This month's expenses
    const monthExpenses = activeExpenses.filter(e => {
        const nextDate = getNextOccurrence(e);
        return nextDate >= today && nextDate <= monthEnd;
    });
    
    if (monthExpenses.length > 0) {
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        elements.adviceTitle.textContent = '🗓️ Bu Ay';
        elements.adviceText.textContent = `${monthExpenses.length} ödeme bu ay içinde. Toplam: ₺${formatNumber(total)}`;
        return;
    }
    
    // High priority expenses
    const highPriority = activeExpenses.filter(e => e.priority === 'high');
    if (highPriority.length > 0) {
        elements.adviceTitle.textContent = '🔴 Yüksek Öncelikli';
        elements.adviceText.textContent = `${highPriority.length} yüksek öncelikli ödemeniz var. Bunları takip etmeyi unutmayın!`;
        return;
    }
    
    elements.adviceTitle.textContent = '✅ Harika!';
    elements.adviceText.textContent = 'Yakın zamanda ödemeniz yok. Tüm ödemeleriniz takip altında.';
}

// ============================================
// MODALS
// ============================================

function initModals() {
    // Delete modal
    elements.deleteCancel.addEventListener('click', closeDeleteModal);
    elements.deleteModalClose.addEventListener('click', closeDeleteModal);
    elements.deleteConfirm.addEventListener('click', confirmDelete);
    
    // Edit modal
    elements.editCancel.addEventListener('click', closeEditModal);
    elements.editModalClose.addEventListener('click', closeEditModal);
    elements.editSave.addEventListener('click', saveEdit);
    
    // Notification modal
    elements.notificationLater.addEventListener('click', closeNotificationModal);
    elements.notificationModalClose.addEventListener('click', closeNotificationModal);
    elements.notificationAllow.addEventListener('click', requestNotificationPermission);
    
    // Close modals on overlay click
    [elements.deleteModal, elements.editModal, elements.notificationModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Delete Modal
function handleDelete(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        deleteTargetId = id;
        elements.deleteItemTitle.textContent = expense.title;
        elements.deleteModal.classList.add('active');
    }
}

function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
    deleteTargetId = null;
}

function confirmDelete() {
    if (deleteTargetId) {
        deleteExpense(deleteTargetId);
        renderExpenses();
        updateStats();
        updateAdvice();
        scheduleAllNotifications();
        closeDeleteModal();
        showToast('🗑️ Harcama silindi', 'success');
    }
}

// Edit Modal
function handleEdit(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        editTargetId = id;
        
        elements.editId.value = expense.id;
        elements.editTitle.value = expense.title;
        elements.editDescription.value = expense.description || '';
        elements.editAmount.value = expense.amount;
        elements.editCategory.value = expense.category;
        elements.editDate.value = expense.date;
        elements.editTime.value = expense.time;
        elements.editRepeatType.value = expense.repeatType;
        
        // Set priority
        document.querySelector(`input[name="editPriority"][value="${expense.priority}"]`).checked = true;
        
        elements.editModal.classList.add('active');
    }
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
    editTargetId = null;
}

function saveEdit() {
    if (editTargetId) {
        const updates = {
            title: elements.editTitle.value.trim(),
            description: elements.editDescription.value.trim(),
            amount: parseFloat(elements.editAmount.value) || 0,
            category: elements.editCategory.value,
            date: elements.editDate.value,
            time: elements.editTime.value,
            repeatType: elements.editRepeatType.value,
            priority: document.querySelector('input[name="editPriority"]:checked').value
        };
        
        updateExpense(editTargetId, updates);
        renderExpenses();
        updateStats();
        updateAdvice();
        scheduleAllNotifications();
        closeEditModal();
        showToast('✅ Harcama güncellendi', 'success');
    }
}

// Toggle Status
function handleToggleStatus(id) {
    const expense = toggleExpenseStatus(id);
    if (expense) {
        renderExpenses();
        updateStats();
        updateAdvice();
        scheduleAllNotifications();
        showToast(expense.isActive ? '▶️ Harcama aktif edildi' : '⏸️ Harcama durduruldu', 'success');
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function checkNotificationPermission() {
    if (!('Notification' in window)) {
        return;
    }
    
    if (Notification.permission === 'default') {
        const asked = localStorage.getItem(APP_CONFIG.notificationKey);
        if (!asked) {
            setTimeout(() => {
                elements.notificationModal.classList.add('active');
            }, 2000);
        }
    }
}

function closeNotificationModal() {
    elements.notificationModal.classList.remove('active');
    localStorage.setItem(APP_CONFIG.notificationKey, 'true');
}

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        closeNotificationModal();
        
        if (permission === 'granted') {
            showToast('🔔 Bildirimler açıldı!', 'success');
            scheduleAllNotifications();
        } else {
            showToast('Bildirimler kapalı', 'warning');
        }
    } catch (e) {
        console.error('Notification permission error:', e);
        closeNotificationModal();
    }
}

function scheduleAllNotifications() {
    // Clear existing scheduled notifications
    scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledNotifications.clear();
    
    if (Notification.permission !== 'granted') {
        return;
    }
    
    const activeExpenses = expenses.filter(e => e.isActive);
    const now = new Date();
    
    activeExpenses.forEach(expense => {
        scheduleNotification(expense, now);
    });
}

function scheduleNotification(expense, now) {
    const nextDate = getNextOccurrence(expense);
    const notificationTime = new Date(nextDate);
    const [hours, minutes] = expense.time.split(':').map(Number);
    notificationTime.setHours(hours, minutes, 0, 0);
    
    const delay = notificationTime.getTime() - now.getTime();
    
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
        const timeoutId = setTimeout(() => {
            showNotification(expense);
        }, delay);
        
        scheduledNotifications.set(expense.id, timeoutId);
    }
    
    // Schedule extra times
    if (expense.extraTimes && expense.extraTimes.length > 0) {
        expense.extraTimes.forEach((time, index) => {
            const extraNotificationTime = new Date(nextDate);
            const [h, m] = time.split(':').map(Number);
            extraNotificationTime.setHours(h, m, 0, 0);
            
            const extraDelay = extraNotificationTime.getTime() - now.getTime();
            
            if (extraDelay > 0 && extraDelay < 24 * 60 * 60 * 1000) {
                const extraTimeoutId = setTimeout(() => {
                    showNotification(expense);
                }, extraDelay);
                
                scheduledNotifications.set(`${expense.id}_extra_${index}`, extraTimeoutId);
            }
        });
    }
}

function showNotification(expense) {
    if (Notification.permission !== 'granted') {
        return;
    }
    
    const icon = CATEGORY_ICONS[expense.category] || '💰';
    const title = `${icon} ${expense.title}`;
    const body = `₺${formatNumber(expense.amount)} ödeme zamanı geldi!`;
    
    try {
        const notification = new Notification(title, {
            body: body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-72.png',
            tag: expense.id,
            vibrate: [200, 100, 200],
            requireInteraction: expense.priority === 'high'
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (e) {
        console.error('Notification error:', e);
    }
}

function getNextOccurrence(expense) {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (expense.repeatType === 'once') {
        return expenseDate;
    }
    
    let nextDate = new Date(expenseDate);
    
    while (nextDate < today) {
        switch (expense.repeatType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'triweekly':
                nextDate.setDate(nextDate.getDate() + 21);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'biannual':
                nextDate.setMonth(nextDate.getMonth() + 6);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            default:
                return expenseDate;
        }
    }
    
    return nextDate;
}

// ============================================
// PWA
// ============================================

function initPWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('SW registered:', registration.scope);
            })
            .catch(error => {
                console.error('SW registration failed:', error);
            });
    }
    
    // Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });
    
    // Installed
    window.addEventListener('appinstalled', () => {
        hideInstallBanner();
        showToast('🎉 Follow-E başarıyla yüklendi!', 'success');
    });
    
    // iOS Install Instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isStandalone) {
        elements.pwaInstallBtn.textContent = 'Nasıl?';
        elements.pwaInstallBtn.addEventListener('click', showIOSInstallInstructions);
    } else {
        elements.pwaInstallBtn.addEventListener('click', installPWA);
    }
    
    elements.pwaDismissBtn.addEventListener('click', hideInstallBanner);
}

function showInstallBanner() {
    setTimeout(() => {
        elements.pwaBanner.classList.add('active');
    }, 3000);
}

function hideInstallBanner() {
    elements.pwaBanner.classList.remove('active');
}

async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            hideInstallBanner();
        }
        
        deferredPrompt = null;
    }
}

function showIOSInstallInstructions() {
    showToast('Safari\'de Paylaş → Ana Ekrana Ekle', 'info');
}

// ============================================
// TOAST
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// UTILITIES
// ============================================

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
}

function formatNumber(num) {
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.handleToggleStatus = handleToggleStatus;
