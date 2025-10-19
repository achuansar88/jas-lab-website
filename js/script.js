class TabNavigation {
    constructor() {
        this.currentTab = 'home';
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccessibility();
        this.handleResize();
        this.showTab('home');
    }

    bindEvents() {
        // Desktop tab clicks
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.showTab(tabName);
                this.closeMobileDrawer();
            });
        });

        // Mobile drawer item clicks
        document.querySelectorAll('.drawer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.showTab(tabName);
                this.closeMobileDrawer();
            });
        });

        // Footer link clicks
        document.querySelectorAll('.footer-links a[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });

        // Mobile menu button
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.openMobileDrawer();
        });

        // Drawer close button
        document.getElementById('drawer-close').addEventListener('click', () => {
            this.closeMobileDrawer();
        });

        // Drawer overlay click
        document.getElementById('drawer-overlay').addEventListener('click', () => {
            this.closeMobileDrawer();
        });

        // Button with data-tab attribute
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn[data-tab]')) {
                const tabName = e.target.closest('.btn[data-tab]').getAttribute('data-tab');
                this.showTab(tabName);
                this.closeMobileDrawer();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    showTab(tabName) {
        const validTabs = ['home', 'research', 'team', 'publications', 'gallery', 'contact'];
        if (!validTabs.includes(tabName)) return;

        this.currentTab = tabName;

        // Hide all tab contents
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-hidden', 'true');
        });

        // Remove active from nav buttons
        document.querySelectorAll('.nav-tab, .drawer-item').forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-selected', 'false');
        });

        // Show target tab
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.setAttribute('aria-hidden', 'false');
        }

        // Activate related nav items
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(item => {
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');
        });

        // Scroll top
        window.scrollTo(0, 0);

        // Update URL (no reload)
        this.updateURL(tabName);

        // Trigger custom event
        this.onTabChange(tabName);
    }

    updateURL(tabName) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', url);
    }

    onTabChange(tabName) {
        const event = new CustomEvent('tabChange', { detail: { tabName } });
        document.dispatchEvent(event);

        switch (tabName) {
            case 'home':
                if (window.smallSlider) window.smallSlider.startSlideShow();
                break;
            case 'gallery':
                if (window.responsiveGallery) {
                    // Optional refresh
                }
                break;
        }
    }

    openMobileDrawer() {
        const drawer = document.getElementById('mobile-drawer');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Accessibility
        document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
    }

    closeMobileDrawer() {
        const drawer = document.getElementById('mobile-drawer');
        drawer.classList.remove('active');
        document.body.style.overflow = '';

        // Accessibility
        document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // If switching to desktop, close drawer
        if (!this.isMobile && wasMobile) {
            this.closeMobileDrawer();
        }
    }

    handleKeydown(e) {
        // Escape closes mobile drawer
        if (e.key === 'Escape' && document.getElementById('mobile-drawer').classList.contains('active')) {
            this.closeMobileDrawer();
        }

        // Arrow key tab navigation (desktop)
        if (!this.isMobile && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            this.navigateWithArrows(e.key);
        }
    }

    navigateWithArrows(direction) {
        const tabs = Array.from(document.querySelectorAll('.nav-tab'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        let nextIndex;

        if (direction === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        const nextTab = tabs[nextIndex];
        const tabName = nextTab.getAttribute('data-tab');
        this.showTab(tabName);
        nextTab.focus();
    }

    setupAccessibility() {
        // Roles and ARIA mapping
        document.querySelectorAll('.nav-tab, .drawer-item').forEach(item => {
            const tab = item.getAttribute('data-tab');
            item.setAttribute('role', 'tab');
            item.setAttribute('id', `tab-${tab}`);
            item.setAttribute('aria-controls', `${tab}-tab`);
        });

        document.querySelectorAll('.content-tab').forEach(tab => {
            const id = tab.id.replace('-tab', '');
            tab.setAttribute('role', 'tabpanel');
            tab.setAttribute('aria-labelledby', `tab-${id}`);
        });

        const menuBtn = document.getElementById('mobile-menu-btn');
        const drawer = document.getElementById('mobile-drawer');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'mobile-drawer');
        drawer.setAttribute('aria-hidden', 'true');
    }
}

// Small Slider for Home Page
class SmallSlider {
    constructor() {
        this.slides = document.querySelectorAll('.small-slider .slide');
        this.dots = document.querySelectorAll('.small-slider .dot');
        this.prevBtn = document.querySelector('.small-slider .prev');
        this.nextBtn = document.querySelector('.small-slider .next');
        this.currentSlide = 0;
        this.slideInterval = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startSlideShow();
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
        const slider = document.querySelector('.small-slider');
        if (slider) {
            slider.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            slider.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
        
        // Pause on hover (desktop only)
        if (window.matchMedia("(hover: hover)").matches && slider) {
            slider.addEventListener('mouseenter', () => this.pause());
            slider.addEventListener('mouseleave', () => this.resume());
        }
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
        this.slideInterval = setInterval(() => this.nextSlide(), 4000);
    }
    
    pause() {
        clearInterval(this.slideInterval);
    }
    
    resume() {
        this.startSlideShow();
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.pause();
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        this.resume();
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - previous slide
                this.prevSlide();
            } else {
                // Swipe left - next slide
                this.nextSlide();
            }
        }
    }
}

// Lightbox Gallery Class
class LightboxGallery {
    constructor() {
        this.lightbox = null;
        this.currentIndex = 0;
        this.images = [];
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        this.createLightbox();
        this.bindGalleryEvents();
    }
    
    createLightbox() {
        // Create lightbox HTML structure
        const lightboxHTML = `
            <div class="lightbox" id="lightbox">
                <div class="lightbox-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Loading image...</span>
                </div>
                <button class="lightbox-close" aria-label="Close lightbox">
                    <i class="fas fa-times"></i>
                </button>
                <div class="lightbox-counter">
                    <span class="lightbox-current">1</span> / <span class="lightbox-total">0</span>
                </div>
                <div class="lightbox-container">
                    <div class="lightbox-slides">
                        <!-- Slides will be dynamically inserted here -->
                    </div>
                </div>
                <div class="lightbox-nav">
                    <button class="lightbox-prev" aria-label="Previous image">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="lightbox-next" aria-label="Next image">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="lightbox-thumbnails">
                    <!-- Thumbnails will be dynamically inserted here -->
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.lightbox = document.getElementById('lightbox');
        
        this.bindLightboxEvents();
    }
    
    bindGalleryEvents() {
        // Add click event to all gallery items
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(index);
            });
            
            // Add keyboard support for gallery items
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openLightbox(index);
                }
            });
        });
    }
    
    bindLightboxEvents() {
        // Close button
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });
        
        // Navigation buttons
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
            this.prevImage();
        });
        
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
            this.nextImage();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch events for mobile swipe
        this.lightbox.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.lightbox.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Click outside image to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
    }
    
    collectImages() {
        this.images = [];
        document.querySelectorAll('.gallery-item').forEach(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('.gallery-overlay h3')?.textContent || '';
            const description = item.querySelector('.gallery-overlay p')?.textContent || '';
            
            if (img) {
                this.images.push({
                    src: img.src,
                    alt: img.alt,
                    title: title,
                    description: description
                });
            }
        });
    }
    
    openLightbox(index = 0) {
        this.collectImages();
        
        if (this.images.length === 0) return;
        
        this.currentIndex = index;
        this.isOpen = true;
        
        // Show loading state
        this.lightbox.classList.add('loading');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Create slides and thumbnails
        this.createSlides();
        this.createThumbnails();
        
        // Show lightbox with animation
        setTimeout(() => {
            this.lightbox.classList.add('active');
            this.showSlide(this.currentIndex);
            this.lightbox.classList.remove('loading');
        }, 50);
        
        // Update accessibility
        this.updateAccessibility();
    }
    
    closeLightbox() {
        this.isOpen = false;
        this.lightbox.classList.remove('active');
        
        // Allow body scroll
        document.body.style.overflow = '';
        
        // Clear slides and thumbnails after animation
        setTimeout(() => {
            this.clearSlides();
            this.updateAccessibility(false);
        }, 300);
    }
    
    createSlides() {
        const slidesContainer = this.lightbox.querySelector('.lightbox-slides');
        slidesContainer.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const slideHTML = `
                <div class="lightbox-slide" data-index="${index}">
                    <img src="${image.src}" 
                         alt="${image.alt}" 
                         class="lightbox-image"
                         loading="lazy">
                    <div class="lightbox-caption">
                        ${image.title ? `<h3>${image.title}</h3>` : ''}
                        ${image.description ? `<p>${image.description}</p>` : ''}
                    </div>
                </div>
            `;
            slidesContainer.insertAdjacentHTML('beforeend', slideHTML);
        });
    }
    
    createThumbnails() {
        const thumbnailsContainer = this.lightbox.querySelector('.lightbox-thumbnails');
        thumbnailsContainer.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const thumbHTML = `
                <div class="lightbox-thumb" data-index="${index}">
                    <img src="${image.src}" alt="${image.alt}">
                </div>
            `;
            thumbnailsContainer.insertAdjacentHTML('beforeend', thumbHTML);
        });
        
        // Add click events to thumbnails
        thumbnailsContainer.querySelectorAll('.lightbox-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.getAttribute('data-index'));
                this.showSlide(index);
            });
        });
    }
    
    clearSlides() {
        const slidesContainer = this.lightbox.querySelector('.lightbox-slides');
        const thumbnailsContainer = this.lightbox.querySelector('.lightbox-thumbnails');
        slidesContainer.innerHTML = '';
        thumbnailsContainer.innerHTML = '';
    }
    
    showSlide(index) {
        // Validate index
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;
        
        this.currentIndex = index;
        
        // Hide all slides
        const slides = this.lightbox.querySelectorAll('.lightbox-slide');
        const thumbs = this.lightbox.querySelectorAll('.lightbox-thumb');
        
        slides.forEach(slide => slide.classList.remove('active'));
        thumbs.forEach(thumb => thumb.classList.remove('active'));
        
        // Show current slide and thumbnail
        const currentSlide = this.lightbox.querySelector(`.lightbox-slide[data-index="${index}"]`);
        const currentThumb = this.lightbox.querySelector(`.lightbox-thumb[data-index="${index}"]`);
        
        if (currentSlide) {
            currentSlide.classList.add('active');
        }
        
        if (currentThumb) {
            currentThumb.classList.add('active');
            
            // Scroll thumbnail into view
            currentThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
        
        // Update counter
        this.updateCounter();
        
        // Update accessibility
        this.updateAccessibility();
    }
    
    nextImage() {
        this.showSlide(this.currentIndex + 1);
    }
    
    prevImage() {
        this.showSlide(this.currentIndex - 1);
    }
    
    updateCounter() {
        const currentElement = this.lightbox.querySelector('.lightbox-current');
        const totalElement = this.lightbox.querySelector('.lightbox-total');
        
        if (currentElement) {
            currentElement.textContent = this.currentIndex + 1;
        }
        if (totalElement) {
            totalElement.textContent = this.images.length;
        }
    }
    
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        switch(e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                this.prevImage();
                break;
            case 'ArrowRight':
                this.nextImage();
                break;
            case 'Home':
                this.showSlide(0);
                break;
            case 'End':
                this.showSlide(this.images.length - 1);
                break;
        }
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - previous image
                this.prevImage();
            } else {
                // Swipe left - next image
                this.nextImage();
            }
        }
    }
    
    updateAccessibility(open = true) {
        const lightbox = this.lightbox;
        
        if (open) {
            lightbox.setAttribute('aria-hidden', 'false');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-label', 'Image gallery viewer');
        } else {
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.removeAttribute('aria-modal');
            lightbox.removeAttribute('role');
            lightbox.removeAttribute('aria-label');
        }
    }
}

// Enhanced Gallery with Mobile Optimizations
class ResponsiveGallery {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.activeFilter = 'all';
        this.lightbox = new LightboxGallery();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupAccessibility();
        this.enhanceGalleryItems();
        
        // Listen for tab changes
        document.addEventListener('tabChange', (e) => {
            if (e.detail.tabName === 'gallery') {
                // Refresh gallery layout if needed
                setTimeout(() => {
                    this.filterItems(this.activeFilter);
                }, 100);
            }
        });
    }
    
    enhanceGalleryItems() {
        // Add high-resolution data attributes for lightbox
        this.galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                // Store original src as high-res version
                img.setAttribute('data-highres', img.src);
                
                // Add loading attribute for better performance
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
            button.addEventListener('keydown', (e) => this.handleFilterKeydown(e));
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
            item.setAttribute('aria-label', `View ${item.querySelector('h3')?.textContent || 'image'} - Click to open in lightbox`);
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

// Performance Optimizer
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.optimizeImages();
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
    window.tabNavigation = new TabNavigation();
    window.smallSlider = new SmallSlider();
    window.responsiveGallery = new ResponsiveGallery();
    new FormHandler();
    new PerformanceOptimizer();

    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab && window.tabNavigation) {
        window.tabNavigation.showTab(initialTab);
    }

    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) img.classList.add('loaded');
        });
    });
});

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
});