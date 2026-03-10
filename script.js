// Dark Mode Toggle
const initThemeToggle = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('theme-toggle');
    toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute('title', 'Toggle Dark Mode');
    document.body.appendChild(toggleBtn);
    
    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
    });
};
// load JSON data from script.json and apply to page
const siteData = {};

const loadSiteData = async () => {
    try {
        const res = await fetch('script.json');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        Object.assign(siteData, data);
        console.log('Site data loaded:', siteData);
        applySiteData();
    } catch (err) {
        console.error('Failed to load JSON data:', err);
    }
};

const applySiteData = () => {
    // populate stats counters
    if (siteData.stats) {
        const statElems = document.querySelectorAll('.stats .stat h3');
        const keys = ['projects','clients','years','awards'];
        statElems.forEach((el,i) => {
            const key = keys[i];
            if (siteData.stats[key] !== undefined) el.textContent = siteData.stats[key];
        });
    }

    // build services grid dynamically
    const servicesContainer = document.querySelector('.services-grid');
    if (servicesContainer && siteData.services) {
        servicesContainer.innerHTML = '';
        siteData.services.forEach(s => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <img src="${s.image}" alt="${s.title}">
                <h3>${s.title}</h3>
                <p>${s.description}</p>
            `;
            servicesContainer.appendChild(card);
        });
    }

    // build testimonials carousel from JSON
    if (siteData.testimonials && siteData.testimonials.length) {
        const wrapper = document.querySelector('.testimonials-carousel .carousel-wrapper');
        const dotsContainer = document.querySelector('.testimonials-carousel .carousel-dots');
        if (wrapper && dotsContainer) {
            wrapper.innerHTML = '';
            dotsContainer.innerHTML = '';
            siteData.testimonials.forEach((t, idx) => {
                const slide = document.createElement('div');
                slide.className = 'testimonial-slide';
                slide.innerHTML = `<p>"${t.quote}"</p><cite>${t.name}, ${t.company}</cite>`;
                wrapper.appendChild(slide);
                const dot = document.createElement('span');
                dot.className = 'dot' + (idx === 0 ? ' active' : '');
                dot.dataset.slide = idx;
                dotsContainer.appendChild(dot);
            });
        }
    }

    // trigger stats animation now that values are in place
    animateCounters();

    // re‑initialize components that depend on injected content
    initCarousel();
    observeElements();
    lazyLoadImages();
};
// Testimonial Carousel
const initCarousel = () => {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let autoTimer = null;

    if (slides.length === 0) return;

    const showSlide = (n) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[n].classList.add('active');
        dots[n].classList.add('active');
        currentSlide = n;
    };

    const nextSlide = () => {
        showSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    const resetTimer = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(nextSlide, 5000);
    };

    showSlide(0);

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetTimer();
        });
    });

    // Auto-advance carousel every 5 seconds
    if (slides.length > 1) {
        autoTimer = setInterval(nextSlide, 5000);
    }
};

// Newsletter Form Handling
const initNewsletterForm = () => {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            if (email) {
                // Simulate submission
                console.log('Newsletter subscription:', email);
                const submitBtn = form.querySelector('button');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Subscribed! ✓';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
};

// Analytics Integration (Google Analytics simulation)
const initAnalytics = () => {
    // Load Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
    
    // Track page views
    window.addEventListener('load', () => {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_path: window.location.pathname
        });
    });
    
    // Track button clicks
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            gtag('event', 'button_click', {
                button_text: btn.textContent,
                button_class: btn.className
            });
        });
    });
    
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            gtag('event', 'form_submission', {
                form_class: form.className
            });
        });
    });
};

// Enhanced Form Validation
const initFormValidation = () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[name="name"]').value.trim();
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const project = contactForm.querySelector('textarea[name="project"]').value.trim();
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!name) {
                alert('Please enter your name.');
                return;
            }
            
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            if (!project || project.length < 10) {
                alert('Please provide a project description (at least 10 characters).');
                return;
            }
            
            // Form is valid
            console.log('Form validation passed');
            alert('Thank you for your inquiry! We will get back to you within 24 hours.');
            
            // Simulate sending to backend
            const formData = new FormData(contactForm);
            console.log('Submitting form data...');
            
            // Track form submission
            gtag('event', 'contact_form_submit', {
                name: name,
                email: email
            });
            
            contactForm.reset();
        });
    }
};

// Performance Monitoring
const initPerformanceMonitoring = () => {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page load time:', pageLoadTime + 'ms');
        
        // Report to analytics
        gtag('event', 'page_load_time', {
            load_time: pageLoadTime
        });
    });
};

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Track navigation
            gtag('event', 'section_navigation', {
                section: this.getAttribute('href')
            });
        }
    });
});

// Active Navigation Link on Scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        navbar.style.boxShadow = 'none';
    }
});

// Counter Animation for Stats
const animateCounters = () => {
    const stats = document.querySelectorAll('.stat h3');
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                stats.forEach(stat => {
                    const target = parseInt(stat.textContent);
                    if (!isNaN(target)) {
                        animateValue(stat, 0, target, 2000);
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) observer.observe(statsSection);
};

const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.innerHTML = value + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Mobile Menu Toggle
const createMobileMenu = () => {
    const navContainer = document.querySelector('.navbar-container');
    const navMenu = document.querySelector('.nav-menu');
    
    if (window.innerWidth <= 768) {
        if (!document.querySelector('.hamburger-menu')) {
            const hamburger = document.createElement('button');
            hamburger.classList.add('hamburger-menu');
            hamburger.innerHTML = '☰';
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            navContainer.insertBefore(hamburger, navMenu);
        }
    }
};

window.addEventListener('resize', createMobileMenu);
window.addEventListener('load', createMobileMenu);

// Intersection Observer for Fade-In Animation on Scroll
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 1s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.service-card, .studio-item, .article, .testimonial').forEach(element => {
        observer.observe(element);
    });
};

// Scroll to top button
const createScrollToTopButton = () => {
    const button = document.createElement('button');
    button.id = 'scrollToTopBtn';
    button.innerHTML = '↑';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: #d4a574;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: none;
        z-index: 99;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (document.documentElement.scrollTop > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        gtag('event', 'scroll_to_top');
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#e5b589';
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#d4a574';
        button.style.transform = 'scale(1)';
    });
};

// CTA Button Click Handler
document.querySelectorAll('.cta-button, .explore-button').forEach(button => {
    button.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            const offsetTop = contactSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            gtag('event', 'cta_click', {
                button_text: button.textContent
            });
        }
    });
});

// Logo Click to Scroll to Home
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Lazy Loading for Images
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                img.addEventListener('error', () => {
                    console.warn('Failed to load image:', img.src);
                    img.style.opacity = '0.7';
                });
                imageObserver.unobserve(img);
            }
        });
    }, { threshold: 0.1 });
    
    images.forEach(img => {
        img.style.opacity = '1';
        imageObserver.observe(img);
    });
};

// Parallax Effect for Hero Section
const parallaxEffect = () => {
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        if (hero) {
            const scrollY = window.scrollY;
            hero.style.backgroundPosition = `center ${scrollY * 0.5}px`;
        }
    });
};

// Initialize all functions on page load
document.addEventListener('DOMContentLoaded', () => {
    // load external configuration/data first
    loadSiteData();

    initThemeToggle();
    initCarousel();
    initNewsletterForm();
    initAnalytics();
    // animateCounters() will be called after data is applied
    observeElements();
    createScrollToTopButton();
    lazyLoadImages();
    parallaxEffect();
    initFormValidation();
    initPerformanceMonitoring();
    
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Error handling for failed image loads
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.warn('Failed to load image:', e.target.src);
        e.target.style.opacity = '0.5';
    }
}, true);

// Monitor user engagement
const engagement = {
    startTime: Date.now(),
    eventCount: 0,
    trackEvent: function() {
        this.eventCount++;
    }
};

document.addEventListener('click', () => engagement.trackEvent());
document.addEventListener('scroll', () => {
    if (Math.random() < 0.1) engagement.trackEvent(); // Track every 10th scroll
});

window.addEventListener('beforeunload', () => {
    const sessionDuration = (Date.now() - engagement.startTime) / 1000;
    gtag('event', 'session_end', {
        session_duration: sessionDuration,
        events_count: engagement.eventCount
    });
});
