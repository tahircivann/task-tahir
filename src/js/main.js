// Event Tracker Class
class EventTracker {
    constructor() {
        this.initializeTracking();
    }

    initializeTracking() {
        window.addEventListener('load', () => {
            this.track('ad_load');
        });

        window.addEventListener('resize', () => {
            this.track('window_resize');
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_hide');
            }
        });

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
        this.startIntroTimer();
        
        this.eventTracker.track('scene_change:intro');
    }

    startIntroTimer() {
        setTimeout(() => {
            this.changeScene('gallery');
        }, 8000);
    }

    changeScene(sceneName, slideIndex = null) {
        if (!this.scenes[sceneName]) {
            console.error(`Scene "${sceneName}" not found`);
            return;
        }

        this.scenes[this.currentScene].classList.remove('active');
        
        setTimeout(() => {
            this.scenes[sceneName].classList.add('active');
            this.currentScene = sceneName;
            
            this.eventTracker.track(`scene_change:${sceneName}`);
            
            if (sceneName === 'video' && slideIndex) {
                this.positionVideo(slideIndex);
            }
            
            if (sceneName === 'video') {
                this.playVideo();
            }
        }, 300);
    }

    positionVideo(slideIndex) {
        const video = document.getElementById('product-video');
        
        video.classList.remove(
            'position-top-left',
            'position-top-right', 
            'position-bottom-left',
            'position-bottom-right'
        );
        
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

class GalleryManager {
    constructor(sceneManager, eventTracker) {
        this.sceneManager = sceneManager;
        this.eventTracker = eventTracker;
        this.swiper = null;
        
        this.initializeGallery();
        this.setupEventListeners();
    }

    initializeGallery() {
        this.swiper = new Swiper('.gallery-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            centeredSlides: true,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false
            },
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            }
        });
    }

    setupEventListeners() {
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            slide.addEventListener('click', (e) => {
                const slideIndex = parseInt(slide.dataset.slide);
                this.handleSlideClick(slideIndex);
            });
        });

        const ctaButton = document.getElementById('cta-button');
        ctaButton.addEventListener('click', () => {
            this.handleCtaClick();
        });

        const backButton = document.getElementById('back-button');
        backButton.addEventListener('click', () => {
            this.handleBackClick();
        });
    }

    handleSlideClick(slideIndex) {
        this.eventTracker.track(`user_interaction:slide_click:${slideIndex}`);
        
        this.sceneManager.changeScene('video', slideIndex);
    }

    handleCtaClick() {
        this.eventTracker.track('user_interaction:cta_click');
        
        this.sceneManager.changeScene('video', 1);
    }

    handleBackClick() {
        this.sceneManager.changeScene('gallery');
    }
}

class OrientationManager {
    constructor() {
        this.orientationWarning = document.getElementById('orientation-warning');
        this.appContainer = document.getElementById('app');
        
        this.initializeOrientationHandling();
    }

    initializeOrientationHandling() {
        this.checkOrientation();
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
        
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
    }

    checkOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isLandscape && isMobile) {
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

class AnimationManager {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        this.animateIntroScene();
        this.setupHoverAnimations();
    }

    animateIntroScene() {
        const headline = document.querySelector('.scene-intro .headline-image');
        const loadingDots = document.querySelector('.loading-dots');
        
        gsap.set([headline, loadingDots], { opacity: 0, y: 50 });
        
        gsap.timeline()
            .to(headline, { duration: 1, opacity: 1, y: 0, ease: "power2.out" })
            .to(loadingDots, { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3");
    }

    setupHoverAnimations() {
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            slide.addEventListener('mouseenter', () => {
                gsap.to(slide, { duration: 0.3, scale: 1.05, ease: "power2.out" });
            });
            
            slide.addEventListener('mouseleave', () => {
                gsap.to(slide, { duration: 0.3, scale: 1, ease: "power2.out" });
            });
        });

        const ctaButton = document.getElementById('cta-button');
        gsap.to(ctaButton, { 
            duration: 2, 
            scale: 1.05, 
            repeat: -1, 
            yoyo: true, 
            ease: "power2.inOut" 
        });
    }

    animateSceneTransition(fromScene, toScene) {
        gsap.timeline()
            .to(fromScene, { duration: 0.3, opacity: 0, y: -50, ease: "power2.in" })
            .set(toScene, { y: 50 })
            .to(toScene, { duration: 0.5, opacity: 1, y: 0, ease: "power2.out" });
    }
}

class App {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    initializeApp() {
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

const app = new App(); 