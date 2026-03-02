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
const whatsappButton = document.getElementById('whatsappButton');

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'M1u0HvRv7XEb9WKqb';
const EMAILJS_SERVICE_ID = 'service_oe0oh3n';
const EMAILJS_TEMPLATE_ID = 'template_jwfva8q';
const YOUR_EMAIL = 'chitsurosnet@outlook.com';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Set current year in footer
currentYearSpan.textContent = new Date().getFullYear();

// Theme Toggle Functionality
function initializeTheme() {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('lc-webcraft-theme') || 'light';
    
    // Apply the saved theme
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    // Update toggle button state
    updateThemeToggle(savedTheme);
}

function toggleTheme() {
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('lc-webcraft-theme', 'light');
        updateThemeToggle('light');
        showNotification('Light theme activated! ☀️');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('lc-webcraft-theme', 'dark');
        updateThemeToggle('dark');
        showNotification('Dark theme activated! 🌙');
    }
}

function updateThemeToggle(theme) {
    console.log(`Theme changed to: ${theme}`);
}

// Initialize theme on page load
initializeTheme();

// Add event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Show notification function
function showNotification(message, isError = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ef4444' : 'var(--accent-orange)'};
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius);
        z-index: 10000;
        font-weight: 600;
        box-shadow: var(--shadow);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Form Submission with EmailJS
quoteForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || 'Not provided',
        business: document.getElementById('business').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value,
        urgent: document.getElementById('urgent').checked ? 'YES - URGENT!' : 'No',
        timestamp: new Date().toLocaleString('en-ZA', { 
            timeZone: 'Africa/Johannesburg',
            dateStyle: 'full',
            timeStyle: 'long'
        })
    };
    
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        // Prepare template parameters for EmailJS - REMOVED reply_to parameter
        const templateParams = {
            to_email: YOUR_EMAIL,
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            business: formData.business,
            service: formData.service,
            message: formData.message,
            urgent: formData.urgent,
            timestamp: formData.timestamp
            // Removed reply_to parameter to fix Outlook error
        };
        
        console.log('Sending email with params:', templateParams);
        console.log('Using Service ID:', EMAILJS_SERVICE_ID);
        console.log('Using Template ID:', EMAILJS_TEMPLATE_ID);
        
        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        
        // Show success modal
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            successModal.style.display = 'flex';
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
            
            // Reset form
            quoteForm.reset();
            
            // Clear saved draft
            localStorage.removeItem('lc-webcraft-quote-draft');
            
            // Track successful submission
            console.log('Quote request submitted successfully to L.C WebCraft Studios');
            
        }, 1500);
        
    } catch (error) {
        // Handle errors
        console.error('EmailJS Error Details:', error);
        
        loadingSpinner.style.display = 'none';
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Quote Request!';
        
        // Show more specific error message
        let errorMessage = 'Oops! Something went wrong. ';
        
        if (error.text) {
            errorMessage += error.text;
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please try again or contact us directly.';
        }
        
        showNotification(errorMessage, true);
        
        // Fallback: Open mailto as backup
        const mailtoFallback = createMailtoLink(formData);
        window.open(mailtoFallback, '_blank');
    }
});

// Create mailto link as fallback
function createMailtoLink(formData) {
    const subject = `New Quote Request from ${formData.business}`;
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Business: ${formData.business}
Service: ${formData.service}
Urgent: ${formData.urgent}

Message:
${formData.message}

Submitted: ${formData.timestamp}
    `;
    
    return `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// WhatsApp button in modal
if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
        window.open('https://wa.me/2760950954', '_blank');
        successModal.style.display = 'none';
    });
}

// Modal Controls
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        successModal.style.display = 'none';
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
            // Calculate header height for offset
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add WhatsApp click tracking
document.querySelectorAll('a[href*="whatsapp"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('WhatsApp link clicked for L.C WebCraft Studios');
        showNotification('Opening WhatsApp... Say hi! 👋');
    });
});

// Form validation on blur
const formInputs = quoteForm.querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = 'var(--medium-gray)';
        }
    });
    
    // Add focus effect
    input.addEventListener('focus', () => {
        input.style.borderColor = 'var(--accent-orange)';
    });
});

// Add keyboard shortcut for theme toggle (Alt+T)
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 't') {
        toggleTheme();
        showNotification('Theme toggled! You\'re a keyboard ninja! 🥷');
    }
});

// Add CSS for notifications
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

// Set initial state for animation
document.querySelectorAll('.service-card, .purpose-card, .portfolio-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Trigger once on load
window.addEventListener('load', () => {
    animateOnScroll();
    console.log('L.C WebCraft Studios website fully loaded and ready for magic! ✨');
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to L.C WebCraft Studios! Ready for an awesome website? 🚀');
    }, 1000);
});

// Add hover effects to buttons
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-3px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
    });
});

// Form auto-save functionality
let formAutoSaveTimer;
quoteForm.addEventListener('input', () => {
    clearTimeout(formAutoSaveTimer);
    formAutoSaveTimer = setTimeout(() => {
        const formData = new FormData(quoteForm);
        const formObject = Object.fromEntries(formData);
        localStorage.setItem('lc-webcraft-quote-draft', JSON.stringify(formObject));
        console.log('Form draft saved');
    }, 1000);
});

// Load draft on page load
window.addEventListener('load', () => {
    const draft = localStorage.getItem('lc-webcraft-quote-draft');
    if (draft) {
        const formObject = JSON.parse(draft);
        Object.keys(formObject).forEach(key => {
            const element = quoteForm.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = formObject[key];
            }
        });
        console.log('Form draft loaded');
        showNotification('We found your draft! Pick up where you left off. 📝');
    }
});

// Clear draft on successful submission
quoteForm.addEventListener('submit', () => {
    localStorage.removeItem('lc-webcraft-quote-draft');
});
