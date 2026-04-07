// =============================================
// USER AUTHENTICATION & SUBSCRIPTION SYSTEM
// =============================================

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'M1u0HvRv7XEb9WKqb';
const EMAILJS_SERVICE_ID = 'service_56pmxz8';
const EMAILJS_TEMPLATE_ID = 'template_jwfva8q';
const YOUR_EMAIL = 'chitsurosnet@outlook.com';

// Storage Keys
const STORAGE_KEYS = {
    USERS: 'lcwebcraft_users',
    CURRENT_USER: 'lcwebcraft_current_user',
    SUBSCRIPTIONS: 'lcwebcraft_subscriptions',
    BILLING: 'lcwebcraft_billing'
};

// Payment Links
const PAYMENT_LINKS = {
    'Basic Hosting': 'https://paystack.shop/pay/q1ag4exr21',
    'Standard Hosting': 'https://paystack.shop/pay/w33epb-pkr',
    'Premium Hosting': 'https://paystack.shop/pay/t4n8nia17t'
};

// Initialize storage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        // Create admin user
        const adminUser = {
            id: 'admin_001',
            name: 'Administrator',
            email: 'admin@lcwebcraft.co.za',
            password: btoa('admin123'),
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILLING)) {
        localStorage.setItem(STORAGE_KEYS.BILLING, JSON.stringify([]));
    }
}

// Get current user
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Save current user
function saveCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Get all users
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

// Save users
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Get subscriptions
function getSubscriptions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS) || '[]');
}

// Save subscriptions
function saveSubscriptions(subs) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
}

// Get billing records
function getBillingRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLING) || '[]');
}

// Save billing records
function saveBillingRecords(records) {
    localStorage.setItem(STORAGE_KEYS.BILLING, JSON.stringify(records));
}

// Create a new subscription
function createSubscription(userId, planName, amount, paymentMethod = 'paystack') {
    const subscriptions = getSubscriptions();
    const startDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    const newSubscription = {
        id: 'sub_' + Date.now(),
        userId: userId,
        plan: planName,
        amount: amount,
        status: 'active',
        startDate: startDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString()
    };
    
    subscriptions.push(newSubscription);
    saveSubscriptions(subscriptions);
    
    // Add billing record
    addBillingRecord(userId, planName, amount, startDate.toISOString(), nextBillingDate.toISOString());
    
    return newSubscription;
}

// Add billing record
function addBillingRecord(userId, planName, amount, billingDate, nextBillingDate) {
    const records = getBillingRecords();
    const newRecord = {
        id: 'bill_' + Date.now(),
        userId: userId,
        plan: planName,
        amount: amount,
        billingDate: billingDate,
        nextBillingDate: nextBillingDate,
        status: 'paid'
    };
    records.push(newRecord);
    saveBillingRecords(records);
}

// Get user subscription
function getUserSubscription(userId) {
    const subscriptions = getSubscriptions();
    return subscriptions.find(sub => sub.userId === userId && sub.status === 'active');
}

// Get user billing history
function getUserBillingHistory(userId) {
    const records = getBillingRecords();
    return records.filter(record => record.userId === userId).sort((a, b) => 
        new Date(b.billingDate) - new Date(a.billingDate)
    );
}

// Cancel subscription
function cancelSubscription(userId) {
    const subscriptions = getSubscriptions();
    const updatedSubs = subscriptions.map(sub => {
        if (sub.userId === userId && sub.status === 'active') {
            return { ...sub, status: 'cancelled' };
        }
        return sub;
    });
    saveSubscriptions(updatedSubs);
}

// Signup function
function signup(name, email, password) {
    const users = getUsers();
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: btoa(password),
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    saveCurrentUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
}

// Login function
function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (!user) {
        return { success: false, message: 'Invalid email or password!' };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    saveCurrentUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
}

// Logout function
function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    location.reload();
}

// Subscribe to plan
function subscribeToPlan(planName, amount) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login or sign up to subscribe!', true);
        openLoginModal();
        return;
    }
    
    // Store pending subscription info
    sessionStorage.setItem('pending_subscription', JSON.stringify({
        plan: planName,
        amount: amount,
        userId: currentUser.id
    }));
    
    // Open payment modal
    const paymentModal = document.getElementById('paymentModal');
    const paymentPlanInfo = document.getElementById('paymentPlanInfo');
    const paystackLink = document.getElementById('paystackLink');
    
    paymentPlanInfo.textContent = `${planName} - R${amount}/month`;
    paystackLink.href = PAYMENT_LINKS[planName] || '#';
    
    paymentModal.style.display = 'flex';
}

// Complete subscription after payment
function completeSubscription(planName, amount, userId) {
    const existingSub = getUserSubscription(userId);
    if (existingSub) {
        cancelSubscription(userId);
    }
    
    const newSub = createSubscription(userId, planName, amount, 'paystack');
    showNotification(`Successfully subscribed to ${planName}!`, false);
    
    // Update dashboard if open
    const dashboardModal = document.getElementById('dashboardModal');
    if (dashboardModal && dashboardModal.style.display === 'flex') {
        updateDashboardDisplay();
    }
    
    return newSub;
}

// Update dashboard display
function updateDashboardDisplay() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const subscription = getUserSubscription(currentUser.id);
    const billingHistory = getUserBillingHistory(currentUser.id);
    
    // Update subscription tab
    const userPlanSpan = document.getElementById('userPlan');
    const userStatusSpan = document.getElementById('userStatus');
    const nextBillingSpan = document.getElementById('nextBilling');
    const billingAmountSpan = document.getElementById('billingAmount');
    
    if (subscription) {
        userPlanSpan.textContent = subscription.plan;
        userStatusSpan.textContent = 'Active';
        userStatusSpan.className = 'status-active';
        nextBillingSpan.textContent = new Date(subscription.nextBillingDate).toLocaleDateString();
        billingAmountSpan.textContent = `R${subscription.amount}/month`;
    } else {
        userPlanSpan.textContent = 'No active subscription';
        userStatusSpan.textContent = 'Inactive';
        userStatusSpan.className = 'status-inactive';
        nextBillingSpan.textContent = 'Not subscribed';
        billingAmountSpan.textContent = 'R0';
    }
    
    // Update billing history tab
    const billingHistoryList = document.getElementById('billingHistoryList');
    if (billingHistory.length === 0) {
        billingHistoryList.innerHTML = '<p class="no-data">No billing records found.</p>';
    } else {
        billingHistoryList.innerHTML = billingHistory.map(record => `
            <div class="billing-item">
                <div><strong>${record.plan}</strong></div>
                <div>R${record.amount}</div>
                <div>${new Date(record.billingDate).toLocaleDateString()}</div>
                <div><span class="status-active">Paid</span></div>
            </div>
        `).join('');
    }
    
    // Update dashboard user name
    document.getElementById('dashboardUserName').textContent = `Welcome back, ${currentUser.name}!`;
    
    // Show admin tab if user is admin
    const adminTabBtn = document.getElementById('adminTabBtn');
    if (currentUser.role === 'admin') {
        adminTabBtn.style.display = 'block';
        updateAdminDashboard();
    } else {
        adminTabBtn.style.display = 'none';
    }
}

// Update admin dashboard
function updateAdminDashboard() {
    const users = getUsers();
    const subscriptions = getSubscriptions();
    const billingRecords = getBillingRecords();
    
    const adminUsersList = document.getElementById('adminUsersList');
    
    const userData = users.map(user => {
        const userSub = subscriptions.find(sub => sub.userId === user.id);
        const userBills = billingRecords.filter(record => record.userId === user.id);
        const totalPaid = userBills.reduce((sum, bill) => sum + bill.amount, 0);
        
        return {
            ...user,
            subscription: userSub,
            totalPaid: totalPaid,
            billCount: userBills.length
        };
    }).filter(u => u.role !== 'admin');
    
    if (userData.length === 0) {
        adminUsersList.innerHTML = '<p class="no-data">No users found.</p>';
    } else {
        adminUsersList.innerHTML = userData.map(user => `
            <div class="admin-user-card">
                <h4>${user.name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Subscription:</strong> ${user.subscription ? user.subscription.plan : 'None'}</p>
                <p><strong>Status:</strong> ${user.subscription ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>'}</p>
                <p><strong>Next Billing:</strong> ${user.subscription ? new Date(user.subscription.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Total Paid:</strong> R${user.totalPaid}</p>
                <p><strong>Billing Records:</strong> ${user.billCount}</p>
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    }
}

// Show tab in dashboard
function showTab(tabName) {
    const tabs = ['subscription', 'billing', 'settings', 'admin'];
    tabs.forEach(tab => {
        const tabElement = document.getElementById(`${tab}Tab`);
        const btnElement = document.querySelector(`.tab-btn[onclick="showTab('${tab}')"]`);
        if (tabElement) {
            tabElement.classList.remove('active');
        }
        if (btnElement) {
            btnElement.classList.remove('active');
        }
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    const activeBtn = document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`);
    if (activeTab) activeTab.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');
}

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function openDashboard() {
    updateDashboardDisplay();
    document.getElementById('dashboardModal').style.display = 'flex';
}

function closeDashboard() {
    document.getElementById('dashboardModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    sessionStorage.removeItem('pending_subscription');
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

function logoutUser() {
    logout();
}

// Check pending subscription on page load
function checkPendingSubscription() {
    const pending = sessionStorage.getItem('pending_subscription');
    if (pending) {
        const { plan, amount, userId } = JSON.parse(pending);
        // Simulate payment completion - in real scenario, this would be after Paystack callback
        // For demo purposes, we'll complete after user confirms
        sessionStorage.removeItem('pending_subscription');
        
        // Ask user to confirm payment
        setTimeout(() => {
            if (confirm(`Payment for ${plan} completed? Click OK to activate subscription.`)) {
                completeSubscription(plan, amount, userId);
            }
        }, 500);
    }
}

// DOM Elements and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    
    // Set current year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (localStorage.getItem('lc-webcraft-theme') === 'dark') {
        body.classList.add('dark-theme');
    }
    
    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        localStorage.setItem('lc-webcraft-theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
        showNotification(body.classList.contains('dark-theme') ? 'Dark mode 🌙' : 'Light mode ☀️');
    });
    
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu?.classList.toggle('active');
    });
    
    // Account button
    const userAccountBtn = document.getElementById('userAccountBtn');
    userAccountBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const currentUser = getCurrentUser();
        if (currentUser) {
            openDashboard();
        } else {
            openLoginModal();
        }
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const result = login(email, password);
        if (result.success) {
            closeLoginModal();
            showNotification(`Welcome back, ${result.user.name}!`);
            openDashboard();
        } else {
            showNotification(result.message, true);
        }
    });
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', true);
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters!', true);
            return;
        }
        
        const result = signup(name, email, password);
        if (result.success) {
            closeSignupModal();
            showNotification(`Welcome to L.C WebCraft Studios, ${name}!`);
            openDashboard();
        } else {
            showNotification(result.message, true);
        }
    });
    
    // Quote form
    const quoteForm = document.getElementById('quoteForm');
    quoteForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value || 'Not provided';
        const message = document.getElementById('message').value;
        
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: YOUR_EMAIL,
                name: name,
                email: email,
                phone: phone,
                message: message,
                reply_to: email
            }).then(() => {
                showNotification('Quote request sent! We\'ll reply within 24h.');
                quoteForm.reset();
            }).catch(() => {
                showNotification('Failed to send. Please email us directly.', true);
            });
        } else {
            window.open(`mailto:${YOUR_EMAIL}?subject=Quote Request&body=Name: ${name}%0AEmail: ${email}%0APhone: ${phone}%0AMessage: ${message}`);
        }
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Check for pending subscription
    checkPendingSubscription();
    
    // Auto-check for expiring subscriptions (runs daily in background)
    function checkExpiringSubscriptions() {
        const subscriptions = getSubscriptions();
        const today = new Date();
        
        subscriptions.forEach(sub => {
            if (sub.status === 'active') {
                const nextBilling = new Date(sub.nextBillingDate);
                const daysUntilBilling = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilBilling <= 3 && daysUntilBilling > 0) {
                    const user = getUsers().find(u => u.id === sub.userId);
                    if (user) {
                        console.log(`Reminder: ${user.email}'s subscription renews in ${daysUntilBilling} days`);
                    }
                }
            }
        });
    }
    
    checkExpiringSubscriptions();
    setInterval(checkExpiringSubscriptions, 24 * 60 * 60 * 1000); // Check daily
});

// Helper function for notifications
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ef4444' : '#f97316'};
        color: white;
        padding: 12px 24px;
        border-radius: 40px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Make functions globally available
window.subscribeToPlan = subscribeToPlan;
window.completeSubscription = completeSubscription;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.openDashboard = openDashboard;
window.closeDashboard = closeDashboard;
window.closePaymentModal = closePaymentModal;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.logoutUser = logoutUser;
window.showTab = showTab;
