// ============================================
// SIMPLIFIED SCRIPT FOR L.C WEBCRAFT STUDIOS
// ============================================

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const quoteForm = document.getElementById('quoteForm');
const successModal = document.getElementById('successModal');
const closeModalButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
const currentYearSpan = document.getElementById('currentYear');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const loadingSpinner = document.getElementById('loadingSpinner');
const submitButton = document.getElementById('submitButton');

// Chatbot Elements
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotNotification = document.getElementById('chatbotNotification');
const quickQuestions = document.querySelectorAll('.quick-question');

// Email Configuration
const YOUR_EMAIL = 'chitsurosnet@outlook.com';

// ============================================
// 1. BASIC WEBSITE FUNCTIONALITY
// ============================================

// Set current year
currentYearSpan.textContent = new Date().getFullYear();

// Mobile Navigation
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// 2. DARK THEME - SIMPLE FIX
// ============================================

// Check for saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
}

// Theme toggle function
function toggleTheme() {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showNotification(isDark ? 'Dark theme activated! 🌙' : 'Light theme activated! ☀️');
}

// Add event listener
themeToggle.addEventListener('click', toggleTheme);

// ============================================
// 3. SIMPLE CHATBOT - GUARANTEED TO WORK
// ============================================

// Chatbot responses
const chatbotResponses = {
    greetings: [
        "Hello! 👋 I'm L.C WebBot, your website assistant! How can I help you today?",
        "Hi there! Ready to create an amazing website?",
        "Hey! I'm here to help with all your website questions!"
    ],
    services: "We offer: 🎨 Custom Website Design, 🛒 E-Commerce Solutions, 📱 Mobile-First Development, and 🔍 SEO & Performance optimization.",
    pricing: "💰 Pricing: Basic sites from R5,000, Business sites R10,000-R20,000, E-commerce from R20,000+. Want a custom quote?",
    timeline: "⏰ Timeline: Basic sites 1-2 weeks, Business sites 2-3 weeks, E-commerce 3-4 weeks.",
    portfolio: "🎨 Check our portfolio above! We built Bono BeautySkin & Lazarus AI Hub.",
    contact: `📞 Contact: Email ${YOUR_EMAIL}, WhatsApp 076 095 0954, or use the form above!`,
    quote: "💸 Great! Use our quote form above or email us for a detailed estimate!",
    default: "I can help with: services, pricing, timeline, portfolio, or getting a quote. What would you like to know? 🤖"
};

// Simple chatbot function
function getChatbotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        return chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)];
    }
    if (msg.includes('service') || msg.includes('offer') || msg.includes('do you')) {
        return chatbotResponses.services;
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
        return chatbotResponses.pricing;
    }
    if (msg.includes('how long') || msg.includes('time') || msg.includes('timeline')) {
        return chatbotResponses.timeline;
    }
    if (msg.includes('portfolio') || msg.includes('example') || msg.includes('work')) {
        return chatbotResponses.portfolio;
    }
    if (msg.includes('contact') || msg.includes('email') || msg.includes('phone') || msg.includes('whatsapp')) {
        return chatbotResponses.contact;
    }
    if (msg.includes('quote') || msg.includes('estimate') || msg.includes('proposal')) {
        return chatbotResponses.quote;
    }
    
    return chatbotResponses.default;
}

// Add message to chat
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Send message
function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatbotInput.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-typing';
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatbotMessages.appendChild(typingDiv);
    
    // Simulate thinking and response
    setTimeout(() => {
        typingDiv.remove();
        const response = getChatbotResponse(message);
        addMessage(response, false);
    }, 1000 + Math.random() * 1000);
}

// Initialize chatbot
function initializeChatbot() {
    // Add welcome message after delay
    setTimeout(() => {
        addMessage("Hi! I'm L.C WebBot, your website assistant! 🤖 Ask me about services, pricing, or get a quote!", false);
        chatbotNotification.style.display = 'flex';
    }, 2000);
}

// Chatbot event listeners
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.toggle('active');
    chatbotNotification.style.display = 'none';
    if (chatbotContainer.classList.contains('active')) {
        chatbotInput.focus();
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
});

chatbotSend.addEventListener('click', sendChatMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
    }
});

// Quick question buttons
quickQuestions.forEach(button => {
    button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        chatbotInput.value = question;
        sendChatMessage();
    });
});

// ============================================
// 4. FORM SUBMISSION - SIMPLE VERSION
// ============================================

quoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || 'Not provided',
        business: document.getElementById('business').value,
        service: document.getElementById('service').value,
        budget: document.getElementById('budget').value,
        message: document.getElementById('message').value,
        urgent: document.getElementById('urgent').checked ? 'YES - URGENT!' : 'No',
        timestamp: new Date().toLocaleString()
    };
    
    // Show loading
    loadingSpinner.style.display = 'flex';
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Create email content
    const emailContent = `
New Quote Request - L.C WebCraft Studios

Client: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Business: ${formData.business}

Service: ${formData.service}
Budget: ${formData.budget}
Urgent: ${formData.urgent}

Message:
${formData.message}

Sent: ${formData.timestamp}
    `.trim();
    
    // Simulate sending (in real use, this would send to server)
    setTimeout(() => {
        loadingSpinner.style.display = 'none';
        successModal.style.display = 'flex';
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
        
        // Reset form
        quoteForm.reset();
        
        // Show notification
        showNotification('✅ Quote request prepared!');
        
        // Log to console (in real app, this would send email)
        console.log('Email would be sent to:', YOUR_EMAIL);
        console.log('Email content:', emailContent);
        
        // For now, open email client
        const subject = 'New Website Quote Request - L.C WebCraft Studios';
        const body = encodeURIComponent(emailContent);
        setTimeout(() => {
            window.location.href = `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
        }, 500);
        
    }, 2000);
});

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f97316, #ec4899);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Modal controls
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === successModal || e.target === loadingSpinner) {
        successModal.style.display = 'none';
        loadingSpinner.style.display = 'none';
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
        }
    }
});

// ============================================
// 6. INITIALIZE EVERYTHING
// ============================================

window.addEventListener('load', () => {
    console.log('🚀 L.C WebCraft Studios website loaded!');
    
    // Initialize chatbot
    initializeChatbot();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to L.C WebCraft Studios! 🚀');
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt+T for theme toggle
    if (e.altKey && e.key === 't') {
        toggleTheme();
    }
    // Ctrl+Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        if (quoteForm && quoteForm.checkValidity()) {
            quoteForm.dispatchEvent(new Event('submit'));
        }
    }
});