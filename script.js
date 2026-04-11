// ============================================
// SUPABASE BACKEND - YOUR CONFIGURATION
// Website: L.C WebCraft Studios
// ============================================

// YOUR SUPABASE CREDENTIALS (already filled in)
const SUPABASE_URL = "https://jrwkhnpscmhitdhnxcyi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2tobnBzY21oaXRkaG54Y3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjE0MDMsImV4cCI6MjA5MTQ5NzQwM30.S4jCniownSiXcCz87Ps40nGDb7fgie_6KfFvaEWHDbE";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'M1u0HvRv7XEb9WKqb';
const EMAILJS_SERVICE_ID = 'service_56pmxz8';
const EMAILJS_TEMPLATE_ID = 'template_jwfva8q';
const YOUR_EMAIL = 'chitsurosnet@outlook.com';

// Payment Links
const PAYMENT_LINKS = {
    'Basic Hosting': 'https://paystack.shop/pay/q1ag4exr21',
    'Standard Hosting': 'https://paystack.shop/pay/w33epb-pkr',
    'Premium Hosting': 'https://paystack.shop/pay/t4n8nia17t'
};

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();
    
    return {
        id: session.user.id,
        email: session.user.email,
        name: userProfile?.name || session.user.email,
        role: userProfile?.role || 'user'
    };
}

async function signup(name, email, password) {
    try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { name: name }
            }
        });
        
        if (signUpError) throw signUpError;
        
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the profile
        let retries = 3;
        let userProfile = null;
        while (retries > 0 && !userProfile) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authData.user.id)
                .single();
            if (data) userProfile = data;
            if (!userProfile) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries--;
            }
        }
        
        return { 
            success: true, 
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: userProfile?.name || name,
                role: userProfile?.role || 'user'
            }
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .single();
        
        return { 
            success: true, 
            user: {
                id: data.user.id,
                email: data.user.email,
                name: userProfile?.name || data.user.email,
                role: userProfile?.role || 'user'
            }
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('lcwebcraft_current_user');
    location.reload();
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

async function createSubscription(userId, planName, amount, paymentMethod = 'paystack') {
    // First, get the user's internal ID from the users table
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();
    
    if (!userData) throw new Error('User not found');
    
    const startDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    // Deactivate existing active subscriptions
    await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userData.id)
        .eq('status', 'active');
    
    const newSubscription = {
        id: 'sub_' + Date.now(),
        user_id: userData.id,
        plan: planName,
        amount: amount,
        status: 'active',
        start_date: startDate.toISOString(),
        next_billing_date: nextBillingDate.toISOString(),
        payment_method: paymentMethod,
        created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('subscriptions').insert(newSubscription);
    if (error) throw error;
    
    await addBillingRecord(userData.id, planName, amount, startDate.toISOString(), nextBillingDate.toISOString());
    return newSubscription;
}

async function addBillingRecord(userId, planName, amount, billingDate, nextBillingDate) {
    const newRecord = {
        id: 'bill_' + Date.now(),
        user_id: userId,
        plan: planName,
        amount: amount,
        billing_date: billingDate,
        next_billing_date: nextBillingDate,
        status: 'paid',
        created_at: new Date().toISOString()
    };
    await supabase.from('billing_records').insert(newRecord);
}

async function getUserSubscriptionByAuthId(authId) {
    // First get the internal user ID
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authId)
        .single();
    
    if (!userData) return null;
    
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .maybeSingle();
    
    return data;
}

async function getUserBillingHistoryByAuthId(authId) {
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authId)
        .single();
    
    if (!userData) return [];
    
    const { data, error } = await supabase
        .from('billing_records')
        .select('*')
        .eq('user_id', userData.id)
        .order('billing_date', { ascending: false });
    
    return data || [];
}

async function getAllUsersForAdmin() {
    const { data: profiles } = await supabase.from('users').select('*');
    const { data: subscriptions } = await supabase.from('subscriptions').select('*');
    const { data: billingRecords } = await supabase.from('billing_records').select('*');
    
    return (profiles || []).map(profile => {
        const userSub = (subscriptions || []).find(s => s.user_id === profile.id && s.status === 'active');
        const userBills = (billingRecords || []).filter(b => b.user_id === profile.id);
        const totalPaid = userBills.reduce((sum, bill) => sum + bill.amount, 0);
        
        return {
            ...profile,
            subscription: userSub,
            totalPaid: totalPaid,
            billCount: userBills.length
        };
    }).filter(u => u.role !== 'admin');
}

// ============================================
// SUBSCRIBE TO PLAN
// ============================================

async function subscribeToPlan(planName, amount) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        showNotification('Please login or sign up to subscribe!', true);
        openLoginModal();
        return;
    }
    
    sessionStorage.setItem('pending_subscription', JSON.stringify({
        plan: planName,
        amount: amount,
        userId: currentUser.id
    }));
    
    const paymentModal = document.getElementById('paymentModal');
    const paymentPlanInfo = document.getElementById('paymentPlanInfo');
    const paystackLink = document.getElementById('paystackLink');
    
    paymentPlanInfo.textContent = `${planName} - R${amount}/month`;
    paystackLink.href = PAYMENT_LINKS[planName] || '#';
    
    paymentModal.style.display = 'flex';
}

async function completeSubscription(planName, amount, userId) {
    try {
        await createSubscription(userId, planName, amount, 'paystack');
        showNotification(`Successfully subscribed to ${planName}!`, false);
        
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.style.display === 'flex') {
            await updateDashboardDisplay();
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showNotification('Error creating subscription: ' + error.message, true);
    }
}

// ============================================
// DASHBOARD DISPLAY
// ============================================

async function updateDashboardDisplay() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    
    const subscription = await getUserSubscriptionByAuthId(currentUser.id);
    const billingHistory = await getUserBillingHistoryByAuthId(currentUser.id);
    
    const userPlanSpan = document.getElementById('userPlan');
    const userStatusSpan = document.getElementById('userStatus');
    const nextBillingSpan = document.getElementById('nextBilling');
    const billingAmountSpan = document.getElementById('billingAmount');
    
    if (subscription) {
        userPlanSpan.textContent = subscription.plan;
        userStatusSpan.textContent = 'Active';
        userStatusSpan.className = 'status-active';
        nextBillingSpan.textContent = new Date(subscription.next_billing_date).toLocaleDateString();
        billingAmountSpan.textContent = `R${subscription.amount}/month`;
    } else {
        userPlanSpan.textContent = 'No active subscription';
        userStatusSpan.textContent = 'Inactive';
        userStatusSpan.className = 'status-inactive';
        nextBillingSpan.textContent = 'Not subscribed';
        billingAmountSpan.textContent = 'R0';
    }
    
    const billingHistoryList = document.getElementById('billingHistoryList');
    if (billingHistory.length === 0) {
        billingHistoryList.innerHTML = '<p class="no-data">No billing records found.</p>';
    } else {
        billingHistoryList.innerHTML = billingHistory.map(record => `
            <div class="billing-item">
                <div><strong>${record.plan}</strong></div>
                <div>R${record.amount}</div>
                <div>${new Date(record.billing_date).toLocaleDateString()}</div>
                <div><span class="status-active">Paid</span></div>
            </div>
        `).join('');
    }
    
    document.getElementById('dashboardUserName').textContent = `Welcome back, ${currentUser.name}!`;
    
    const adminTabBtn = document.getElementById('adminTabBtn');
    if (currentUser.role === 'admin') {
        adminTabBtn.style.display = 'block';
        await updateAdminDashboard();
    } else {
        adminTabBtn.style.display = 'none';
    }
}

async function updateAdminDashboard() {
    const users = await getAllUsersForAdmin();
    const adminUsersList = document.getElementById('adminUsersList');
    
    if (users.length === 0) {
        adminUsersList.innerHTML = '<p class="no-data">No users found.</p>';
    } else {
        adminUsersList.innerHTML = users.map(user => `
            <div class="admin-user-card">
                <h4>${user.name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Subscription:</strong> ${user.subscription ? user.subscription.plan : 'None'}</p>
                <p><strong>Status:</strong> ${user.subscription ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>'}</p>
                <p><strong>Next Billing:</strong> ${user.subscription ? new Date(user.subscription.next_billing_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Total Paid:</strong> R${user.totalPaid}</p>
                <p><strong>Billing Records:</strong> ${user.billCount}</p>
                <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');
    }
}

function showTab(tabName) {
    const tabs = ['subscription', 'billing', 'settings', 'admin'];
    tabs.forEach(tab => {
        const tabElement = document.getElementById(`${tab}Tab`);
        const btnElement = document.querySelector(`.tab-btn[onclick="showTab('${tab}')"]`);
        if (tabElement) tabElement.classList.remove('active');
        if (btnElement) btnElement.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    const activeBtn = document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`);
    if (activeTab) activeTab.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function openSignupModal() { document.getElementById('signupModal').style.display = 'flex'; }
function closeSignupModal() { document.getElementById('signupModal').style.display = 'none'; }
async function openDashboard() { await updateDashboardDisplay(); document.getElementById('dashboardModal').style.display = 'flex'; }
function closeDashboard() { document.getElementById('dashboardModal').style.display = 'none'; }
function closePaymentModal() { document.getElementById('paymentModal').style.display = 'none'; sessionStorage.removeItem('pending_subscription'); }
function switchToSignup() { closeLoginModal(); openSignupModal(); }
function switchToLogin() { closeSignupModal(); openLoginModal(); }
async function logoutUser() { await logout(); }

function checkPendingSubscription() {
    const pending = sessionStorage.getItem('pending_subscription');
    if (pending) {
        const { plan, amount, userId } = JSON.parse(pending);
        sessionStorage.removeItem('pending_subscription');
        setTimeout(() => {
            if (confirm(`Payment for ${plan} completed? Click OK to activate subscription.`)) {
                completeSubscription(plan, amount, userId);
            }
        }, 500);
    }
}

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
        font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    if (localStorage.getItem('lc-webcraft-theme') === 'dark') body.classList.add('dark-theme');
    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        localStorage.setItem('lc-webcraft-theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
        showNotification(body.classList.contains('dark-theme') ? 'Dark mode 🌙' : 'Light mode ☀️');
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    hamburger?.addEventListener('click', () => { 
        hamburger.classList.toggle('active'); 
        navMenu?.classList.toggle('active'); 
    });
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => { 
            hamburger?.classList.remove('active'); 
            navMenu?.classList.remove('active'); 
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) { 
                e.preventDefault(); 
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); 
            }
        });
    });
    
    // Account button
    const userAccountBtn = document.getElementById('userAccountBtn');
    userAccountBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentUser = await getCurrentUser();
        currentUser ? openDashboard() : openLoginModal();
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const result = await login(email, password);
        if (result.success) {
            closeLoginModal();
            showNotification(`Welcome back, ${result.user.name}!`);
            openDashboard();
        } else {
            showNotification(result.message, true);
        }
    });
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    signupForm?.addEventListener('submit', async (e) => {
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
        
        const result = await signup(name, email, password);
        if (result.success) {
            closeSignupModal();
            showNotification(`Welcome to L.C WebCraft Studios, ${name}!`);
            openDashboard();
        } else {
            showNotification(result.message, true);
        }
    });
    
    // Quote form submission
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
                name, email, phone, message, 
                reply_to: email 
            })
            .then(() => { 
                showNotification('Quote request sent! We\'ll reply within 24h.'); 
                quoteForm.reset(); 
            })
            .catch(() => { 
                showNotification('Failed to send. Please email us directly.', true); 
            });
        } else {
            window.open(`mailto:${YOUR_EMAIL}?subject=Quote Request&body=Name: ${name}%0AEmail: ${email}%0APhone: ${phone}%0AMessage: ${message}`);
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => { 
        if (e.target.classList.contains('modal')) e.target.style.display = 'none'; 
    });
    
    // Check for pending subscription
    checkPendingSubscription();
    
    // Check if user is already logged in (from previous session)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
            const user = await getCurrentUser();
            if (user) console.log('✅ Already logged in as:', user.email);
        }
    });
});

// Make functions globally accessible
window.subscribeToPlan = subscribeToPlan;
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