// =============================================
// EMAILJS CONFIGURATION
// =============================================
const EMAILJS_PUBLIC_KEY = 'M1u0HvRv7XEb9WKqb';
const EMAILJS_SERVICE_ID = 'service_56pmxz8';
const EMAILJS_TEMPLATE_ID = 'template_jwfva8q';
const YOUR_EMAIL = 'chitsurosnet@outlook.com';

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

// Initialize EmailJS
(function() {
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            console.log('EmailJS initialized');
        }
    } catch (error) {
        console.error('EmailJS initialization error:', error);
    }
})();

// Mobile Navigation Toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});

// Set current year in footer
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// Theme Toggle Functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('lc-webcraft-theme') || 'light';
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
}

function toggleTheme() {
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('lc-webcraft-theme', 'light');
        showNotification('Light theme activated! ☀️');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('lc-webcraft-theme', 'dark');
        showNotification('Dark theme activated! 🌙');
    }
}

initializeTheme();

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Show notification function
function showNotification(message, isError = false) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ef4444' : '#f97316'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        animation: slideDown 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form Submission with EmailJS
if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || 'Not provided';
        const business = document.getElementById('business')?.value.trim() || '';
        const service = document.getElementById('service')?.value || '';
        const message = document.getElementById('message')?.value.trim() || '';
        const urgent = document.getElementById('urgent')?.checked ? 'YES' : 'NO';
        
        // Validate required fields
        if (!name || !email || !business || !service || !message) {
            showNotification('Please fill in all required fields!', true);
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address!', true);
            return;
        }
        
        // Show loading
        loadingSpinner.style.display = 'flex';
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Prepare template parameters
        const templateParams = {
            to_email: YOUR_EMAIL,
            name: name,
            email: email,
            phone: phone,
            business: business,
            service: service,
            message: message,
            urgent: urgent,
            reply_to: email
        };
        
        console.log('Sending:', templateParams);
        
        // Send email using EmailJS
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
            .then(function(response) {
                console.log('Email sent successfully', response);
                
                // Hide loading
                loadingSpinner.style.display = 'none';
                
                // Show success modal
                if (successModal) {
                    successModal.style.display = 'flex';
                }
                
                // Reset form
                quoteForm.reset();
                
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
                
                showNotification('Quote request sent successfully!');
            })
            .catch(function(error) {
                console.error('Email sending failed:', error);
                
                // Hide loading
                loadingSpinner.style.display = 'none';
                
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
                
                let errorMessage = 'Failed to send. ';
                if (error.status === 401) errorMessage += 'Invalid credentials.';
                else if (error.status === 404) errorMessage += 'Service not found.';
                else errorMessage += 'Please try again or email us directly.';
                
                showNotification(errorMessage, true);
                
                // Fallback: Open mailto
                const mailtoLink = `mailto:${YOUR_EMAIL}?subject=Quote Request from ${business}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0ABusiness: ${business}%0D%0AService: ${service}%0D%0AUrgent: ${urgent}%0D%0A%0D%0AMessage:%0D%0A${message}`;
                window.open(mailtoLink, '_blank');
            });
    });
}

// Modal Controls
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (successModal) {
            successModal.style.display = 'none';
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.style.display = 'none';
    }
    if (e.target === loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add CSS for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
        }
        .notification {
            font-family: 'Poppins', sans-serif;
            z-index: 10000;
        }
    `;
    document.head.appendChild(style);
}

// Animate elements on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .purpose-card, .portfolio-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

document.querySelectorAll('.service-card, .purpose-card, .portfolio-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);

// Load event
window.addEventListener('load', () => {
    animateOnScroll();
    setTimeout(() => {
        showNotification('Welcome to L.C WebCraft Studios! 🚀');
    }, 1000);
});

// Form auto-save
let formAutoSaveTimer;
if (quoteForm) {
    quoteForm.addEventListener('input', () => {
        clearTimeout(formAutoSaveTimer);
        formAutoSaveTimer = setTimeout(() => {
            const formData = new FormData(quoteForm);
            const formObject = {};
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            localStorage.setItem('lc-webcraft-quote-draft', JSON.stringify(formObject));
        }, 1000);
    });
}

// Load draft
window.addEventListener('load', () => {
    const draft = localStorage.getItem('lc-webcraft-quote-draft');
    if (draft && quoteForm) {
        try {
            const formObject = JSON.parse(draft);
            Object.keys(formObject).forEach(key => {
                const element = quoteForm.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formObject[key] === 'on' || formObject[key] === 'YES';
                    } else {
                        element.value = formObject[key];
                    }
                }
            });
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
});
