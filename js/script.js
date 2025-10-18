// Enhanced Slider with Mobile Optimizations
class ResponsiveSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.slider-dot');
        this.prevBtn = document.querySelector('.slider-arrow.prev');
        this.nextBtn = document.querySelector('.slider-arrow.next');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPaused = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.swipeThreshold = 50;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startSlideShow();
        this.updateSliderHeight();
        this.checkReducedMotion();
    }
    
    bindEvents() {
        // Button controls
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        // Dot controls
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch events for mobile
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            sliderContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Pause on hover (desktop only)
        if (window.matchMedia("(hover: hover)").matches && sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => this.pause());
            sliderContainer.addEventListener('mouseleave', () => this.resume());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    showSlide(index) {
        // Remove active class from all slides and dots
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        // Update current slide index
        this.currentSlide = (index + this.slides.length) % this.slides.length;
        
        // Add active class to current slide and dot
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
        
        // Update ARIA attributes for accessibility
        this.updateAccessibility();
    }
    
    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }
    
    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    startSlideShow() {
        if (!this.isPaused && !this.reducedMotion) {
            this.slideInterval = setInterval(() => this.nextSlide(), 5000);
        }
    }
    
    pause() {
        this.isPaused = true;
        clearInterval(this.slideInterval);
    }
    
    resume() {
        this.isPaused = false;
        this.startSlideShow();
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.pause();
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        // Don't auto-resume on mobile to prevent accidental swipes
        if (!window.matchMedia("(max-width: 768px)").matches) {
            this.resume();
        }
    }
    
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > this.swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - previous slide
                this.prevSlide();
            } else {
                // Swipe left - next slide
                this.nextSlide();
            }
        }
    }
    
    handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        } else if (e.key === 'Home') {
            this.goToSlide(0);
        } else if (e.key === 'End') {
            this.goToSlide(this.slides.length - 1);
        }
    }
    
    updateSliderHeight() {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;
        
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('header').offsetHeight;
        
        // Set slider height based on viewport
        slider.style.height = `calc(${viewportHeight}px - ${headerHeight}px)`;
    }
    
    handleResize() {
        this.updateSliderHeight();
        // Restart slideshow on resize to clear any timing issues
        this.pause();
        this.resume();
    }
    
    updateAccessibility() {
        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.currentSlide);
            slide.setAttribute('tabindex', index === this.currentSlide ? '0' : '-1');
        });
        
        this.dots.forEach((dot, index) => {
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        });
    }
    
    checkReducedMotion() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.reducedMotion) {
            this.pause();
        }
    }
}

// Enhanced Gallery with Mobile Optimizations
class ResponsiveGallery {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.activeFilter = 'all';
        this.touchTimer = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupTouchInteractions();
        this.setupAccessibility();
    }
    
    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
            button.addEventListener('keydown', (e) => this.handleFilterKeydown(e));
        });
    }
    
    setupTouchInteractions() {
        // Enhanced touch interactions for mobile
        this.galleryItems.forEach(item => {
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                item.classList.add('touch-active');
                
                // Start timer for long press
                this.touchTimer = setTimeout(() => {
                    this.showOverlay(item);
                }, 500);
            });
            
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                item.classList.remove('touch-active');
                clearTimeout(this.touchTimer);
                
                // Toggle active state for overlay on mobile
                if (window.matchMedia("(hover: none)").matches) {
                    if (item.classList.contains('active')) {
                        this.hideOverlay(item);
                    } else {
                        this.showOverlay(item);
                    }
                }
            });
            
            item.addEventListener('touchmove', (e) => {
                // Cancel long press if user moves finger
                clearTimeout(this.touchTimer);
            });
        });
    }
    
    setupAccessibility() {
        this.filterButtons.forEach((button, index) => {
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active'));
            button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');
        });
        
        this.galleryItems.forEach((item, index) => {
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `View ${item.querySelector('h3')?.textContent || 'image'}`);
        });
    }
    
    handleFilterClick(e) {
        const button = e.currentTarget;
        const filterValue = button.getAttribute('data-filter');
        
        // Update active filter
        this.activeFilter = filterValue;
        
        // Update button states
        this.updateFilterButtons(button);
        
        // Filter items with animation
        this.filterItems(filterValue);
    }
    
    handleFilterKeydown(e) {
        const button = e.currentTarget;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const filterValue = button.getAttribute('data-filter');
            this.activeFilter = filterValue;
            this.updateFilterButtons(button);
            this.filterItems(filterValue);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            this.navigateFilters(button, e.key);
        }
    }
    
    navigateFilters(currentButton, direction) {
        const buttons = Array.from(this.filterButtons);
        const currentIndex = buttons.indexOf(currentButton);
        let nextIndex;
        
        if (direction === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % buttons.length;
        } else {
            nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }
        
        const nextButton = buttons[nextIndex];
        const filterValue = nextButton.getAttribute('data-filter');
        
        this.activeFilter = filterValue;
        this.updateFilterButtons(nextButton);
        this.filterItems(filterValue);
        nextButton.focus();
    }
    
    updateFilterButtons(activeButton) {
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
        activeButton.setAttribute('tabindex', '0');
    }
    
    filterItems(filterValue) {
        let visibleCount = 0;
        
        this.galleryItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filterValue === 'all' || category === filterValue;
            
            // Add delay for staggered animation
            const delay = visibleCount * 100;
            
            if (shouldShow) {
                visibleCount++;
                setTimeout(() => {
                    item.style.display = 'block';
                    // Force reflow for animation
                    item.offsetHeight;
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, delay);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    showOverlay(item) {
        this.galleryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }
    
    hideOverlay(item) {
        item.classList.remove('active');
    }
}

// Enhanced Mobile Menu
class MobileMenu {
    constructor() {
        this.menuButton = document.getElementById('mobile-menu');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = this.navMenu?.querySelectorAll('a') || [];
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.menuButton || !this.navMenu) return;
        
        this.bindEvents();
        this.setupAccessibility();
    }
    
    bindEvents() {
        this.menuButton.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Trap focus within menu when open
        this.navMenu.addEventListener('keydown', (e) => this.trapFocus(e));
    }
    
    setupAccessibility() {
        this.menuButton.setAttribute('aria-expanded', 'false');
        this.menuButton.setAttribute('aria-controls', 'nav-menu');
        this.menuButton.setAttribute('aria-label', 'Open navigation menu');
        
        this.navMenu.setAttribute('aria-hidden', 'true');
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.navMenu.classList.add('show');
        this.isOpen = true;
        
        // Update icon
        const icon = this.menuButton.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-bars', 'fa-times');
        }
        
        // Update accessibility
        this.menuButton.setAttribute('aria-expanded', 'true');
        this.menuButton.setAttribute('aria-label', 'Close navigation menu');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll on mobile
        document.body.style.overflow = 'hidden';
        
        // Move focus to first menu item
        if (this.navLinks.length > 0) {
            setTimeout(() => this.navLinks[0].focus(), 100);
        }
    }
    
    closeMenu() {
        this.navMenu.classList.remove('show');
        this.isOpen = false;
        
        // Update icon
        const icon = this.menuButton.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-times', 'fa-bars');
        }
        
        // Update accessibility
        this.menuButton.setAttribute('aria-expanded', 'false');
        this.menuButton.setAttribute('aria-label', 'Open navigation menu');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to menu button
        this.menuButton.focus();
    }
    
    handleClickOutside(e) {
        if (!this.navMenu.contains(e.target) && !this.menuButton.contains(e.target) && this.isOpen) {
            this.closeMenu();
        }
    }
    
    trapFocus(e) {
        if (e.key === 'Tab' && this.isOpen) {
            const focusableElements = this.navMenu.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
}

// Smooth Scrolling Utility
class SmoothScroller {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleLinkClick(e));
        });
    }
    
    handleLinkClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        // Skip if it's just "#"
        if (href === '#') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            this.scrollToElement(targetElement);
        }
    }
    
    scrollToElement(element) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Form Handler
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Add real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.validateForm(form)) {
            this.showLoadingState(form, true);
            
            // Simulate form submission
            setTimeout(() => {
                this.showSuccessState(form);
                form.reset();
                this.showLoadingState(form, false);
            }, 2000);
        }
    }
    
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous error
        this.clearError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Show error if invalid
        if (!isValid) {
            this.showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    showLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    }
    
    showSuccessState(form) {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Thank you! Your message has been sent successfully.</span>
        `;
        successMessage.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 12px 15px;
            border-radius: 5px;
            margin-top: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        form.appendChild(successMessage);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkElements();
    }
    
    cacheElements() {
        this.animatedElements = document.querySelectorAll('.section, .research-card, .team-member, .publication-item');
    }
    
    bindEvents() {
        // Throttled scroll event
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.checkElements();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial check
        this.checkElements();
    }
    
    checkElements() {
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.85;
        
        this.animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerPoint) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
}

// Performance Optimizer
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.optimizeImages();
        this.setupIntersectionObserver();
        this.detectConnection();
    }
    
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    setupIntersectionObserver() {
        // Lazy load background images for slider
        const slides = document.querySelectorAll('.slide');
        
        const slideObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const slide = entry.target;
                    const bgImage = slide.style.backgroundImage;
                    if (bgImage.includes('data-src')) {
                        slide.style.backgroundImage = bgImage.replace('data-src', 'src');
                    }
                }
            });
        }, { threshold: 0.1 });
        
        slides.forEach(slide => slideObserver.observe(slide));
    }
    
    detectConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.saveData) {
                // Reduce animations and disable autoplay
                document.documentElement.classList.add('save-data');
            }
            
            if (connection.effectiveType.includes('2g') || connection.effectiveType.includes('slow-2g')) {
                // Further optimizations for slow connections
                document.documentElement.classList.add('slow-connection');
            }
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    new ResponsiveSlider();
    new ResponsiveGallery();
    new MobileMenu();
    new SmoothScroller();
    new FormHandler();
    new ScrollAnimations();
    new PerformanceOptimizer();
    
    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Remove loading class from images
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    });
    
    // Handle service worker registration for PWA (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
});

// Export classes for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ResponsiveSlider,
        ResponsiveGallery,
        MobileMenu,
        SmoothScroller,
        FormHandler,
        ScrollAnimations,
        PerformanceOptimizer
    };
}