// Event Tracker Class
class EventTracker {
    constructor() {
        this.initializeTracking();
    }

    initializeTracking() {
        // Track page load
        window.addEventListener('load', () => {
            this.track('ad_load');
        });

        // Track window resize
        window.addEventListener('resize', () => {
            this.track('window_resize');
        });

        // Track page hide/visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_hide');
            }
        });

        // Track page unload as backup
        window.addEventListener('beforeunload', () => {
            this.track('page_hide');
        });
    }

    track(eventName, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = data 
            ? `[${timestamp}] ${eventName}: ${JSON.stringify(data)}`
            : `[${timestamp}] ${eventName}`;
        
        console.log(logMessage);
    }
}

// Scene Manager Class
class SceneManager {
    constructor() {
        this.currentScene = 'intro';
        this.scenes = {
            intro: document.getElementById('scene-intro'),
            gallery: document.getElementById('scene-gallery'),
            video: document.getElementById('scene-video')
        };
        this.eventTracker = new EventTracker();
        
        this.initializeScenes();
    }

    initializeScenes() {
        // Start intro scene timer
        this.startIntroTimer();
        
        // Track initial scene
        this.eventTracker.track('scene_change:intro');
    }

    startIntroTimer() {
        // Auto-transition to gallery after 8 seconds
        setTimeout(() => {
            this.changeScene('gallery');
        }, 8000);
    }

    changeScene(sceneName, slideIndex = null) {
        if (!this.scenes[sceneName]) {
            console.error(`Scene "${sceneName}" not found`);
            return;
        }

        // Hide current scene with animation
        this.scenes[this.currentScene].classList.remove('active');
        
        // Show new scene after transition
        setTimeout(() => {
            this.scenes[sceneName].classList.add('active');
            this.currentScene = sceneName;
            
            // Track scene change
            this.eventTracker.track(`scene_change:${sceneName}`);
            
            // Handle video scene positioning
            if (sceneName === 'video' && slideIndex) {
                this.positionVideo(slideIndex);
            }
            
            // Handle video autoplay
            if (sceneName === 'video') {
                this.playVideo();
            }
        }, 300);
    }

    positionVideo(slideIndex) {
        const video = document.getElementById('product-video');
        
        // Remove all position classes
        video.classList.remove(
            'position-top-left',
            'position-top-right', 
            'position-bottom-left',
            'position-bottom-right'
        );
        
        // Add appropriate position class
        const positions = {
            1: 'position-top-left',
            2: 'position-top-right',
            3: 'position-bottom-left',
            4: 'position-bottom-right'
        };
        
        if (positions[slideIndex]) {
            video.classList.add(positions[slideIndex]);
        }
    }

    playVideo() {
        const video = document.getElementById('product-video');
        video.play().catch(error => {
            console.log('Video autoplay failed:', error);
        });
    }
}

// Gallery Manager Class
class GalleryManager {
    constructor(sceneManager, eventTracker) {
        this.sceneManager = sceneManager;
        this.eventTracker = eventTracker;
        this.swiper = null;
        
        this.initializeGallery();
        this.setupEventListeners();
    }

    initializeGallery() {
        // Initialize Swiper
        this.swiper = new Swiper('.gallery-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            centeredSlides: true,
            loop: false, // Disabled loop mode since we only have 4 slides
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            speed: 600,
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 10
                },
                768: {
                    slidesPerView: 1,
                    spaceBetween: 20
                }
            }
        });
    }

    setupEventListeners() {
        // Handle slide clicks
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            slide.addEventListener('click', (e) => {
                const slideIndex = parseInt(slide.dataset.slide);
                this.handleSlideClick(slideIndex);
            });
        });

        // Handle CTA button click
        const ctaButton = document.getElementById('cta-button');
        ctaButton.addEventListener('click', () => {
            this.handleCtaClick();
        });

        // Handle back button click
        const backButton = document.getElementById('back-button');
        backButton.addEventListener('click', () => {
            this.handleBackClick();
        });
    }

    handleSlideClick(slideIndex) {
        // Track user interaction
        this.eventTracker.track(`user_interaction:slide_click:${slideIndex}`);
        
        // Change to video scene with positioning
        this.sceneManager.changeScene('video', slideIndex);
    }

    handleCtaClick() {
        // Track CTA click
        this.eventTracker.track('user_interaction:cta_click');
        
        // Transition to video scene
        this.sceneManager.changeScene('video', 1);
    }

    handleBackClick() {
        // Return to gallery scene
        this.sceneManager.changeScene('gallery');
    }
}

// Orientation Manager Class
class OrientationManager {
    constructor() {
        this.orientationWarning = document.getElementById('orientation-warning');
        this.appContainer = document.getElementById('app');
        
        this.initializeOrientationHandling();
    }

    initializeOrientationHandling() {
        // Check orientation on load
        this.checkOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
        
        // Listen for resize events as backup
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
    }

    checkOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isLandscape && isMobile && window.innerWidth < 1024) {
            this.showOrientationWarning();
        } else {
            this.hideOrientationWarning();
        }
    }

    showOrientationWarning() {
        this.orientationWarning.classList.add('show');
        this.appContainer.style.display = 'none';
    }

    hideOrientationWarning() {
        this.orientationWarning.classList.remove('show');
        this.appContainer.style.display = 'block';
    }
}

// Animation Manager Class
class AnimationManager {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        // Animate intro scene elements
        this.animateIntroScene();
        
        // Set up other animations
        this.setupHoverAnimations();
    }

    animateIntroScene() {
        // Use .headline-text instead of .headline-image
        const headline = document.querySelector('.scene-intro .headline-text');
        const loadingDots = document.querySelector('.loading-dots');
        
        // Initial state
        gsap.set([headline, loadingDots], { opacity: 0, y: 50 });
        
        // Animate in
        gsap.timeline()
            .to(headline, { duration: 1, opacity: 1, y: 0, ease: "power2.out" })
            .to(loadingDots, { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3");
    }

    setupHoverAnimations() {
        // Animate gallery slides on hover
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            slide.addEventListener('mouseenter', () => {
                // Animate .product-image inside the slide
                const product = slide.querySelector('.product-image');
                if (product) {
                    gsap.to(product, { duration: 0.3, scale: 1.1, rotationY: 10, ease: "power2.out" });
                }
            });
            
            slide.addEventListener('mouseleave', () => {
                const product = slide.querySelector('.product-image');
                if (product) {
                    gsap.to(product, { duration: 0.3, scale: 1, rotationY: 0, ease: "power2.out" });
                }
            });
        });

        // Animate CTA button
        const ctaButton = document.getElementById('cta-button');
        if (ctaButton) {
            gsap.to(ctaButton, { 
                duration: 2, 
                scale: 1.05, 
                repeat: -1, 
                yoyo: true, 
                ease: "power2.inOut" 
            });
        }
    }

    animateSceneTransition(fromScene, toScene) {
        // Scene transition animation
        gsap.timeline()
            .to(fromScene, { duration: 0.3, opacity: 0, y: -50, ease: "power2.in" })
            .set(toScene, { y: 50 })
            .to(toScene, { duration: 0.5, opacity: 1, y: 0, ease: "power2.out" });
    }
}

// Main Application Class
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM and external libraries to load
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });

        // Fallback for cases where DOMContentLoaded already fired
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Initialize all managers
        this.orientationManager = new OrientationManager();
        this.sceneManager = new SceneManager();
        this.galleryManager = new GalleryManager(
            this.sceneManager, 
            this.sceneManager.eventTracker
        );
        this.animationManager = new AnimationManager();
        
        console.log('🚀 Product Showcase App initialized successfully');
    }
}

// Initialize the application
const app = new App();