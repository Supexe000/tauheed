document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------
    // CONFIGURATION
    // ------------------------------------------------------------------
    const IS_DESKTOP = window.matchMedia("(min-width: 1025px)").matches;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ------------------------------------------------------------------
    // CUSTOM CURSOR
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // CUSTOM CURSOR
    // ------------------------------------------------------------------
    const cursor = document.querySelector('.custom-cursor');
    const cursorText = document.querySelector('.cursor-text');

    // State
    let isDesktop = window.matchMedia("(min-width: 1025px)").matches;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    // Update state on resize
    window.addEventListener('resize', () => {
        isDesktop = window.matchMedia("(min-width: 1025px)").matches;
    });

    // Mouse Move Tracker
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // Animation Loop (Smooth Follow)
    const animateCursor = () => {
        if (isDesktop && cursor) {
            // Lerp for smooth movement
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;

            // Apply transform (Desktop only)
            // CSS handles -50% -50% via transform, but here we overwrite it for performance.
            // We append translate(-50%, -50%) to maintain centering.
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover Interaction & Text Change
    const handleHover = (e) => {
        if (!isDesktop) return; // Ignore on mobile

        const target = e.target;
        // Check for interactive elements
        const interactive = target.closest('a, button, input, select, textarea, .filter-btn, .category-card');

        let newText = "HIRE ME";
        let isHovered = false;

        if (interactive) {
            isHovered = true;

            // Specific Contexts
            if (target.closest('.video-card')) newText = "WATCH";
            else if (target.closest('.graphic-card')) newText = "VIEW";
            else if (target.closest('.social-link')) newText = "FOLLOW";
            else if (target.closest('#submitBtn')) newText = "SEND";
            else if (target.closest('.category-card')) newText = "OPEN";
            else if (target.closest('input, textarea')) newText = "TYPE";
            else newText = "CLICK";
        }

        // Update Classes
        if (isHovered) {
            cursor.classList.add('hovered');
        } else {
            cursor.classList.remove('hovered');
        }

        // Update Text
        if (cursorText && cursorText.textContent !== newText) {
            cursorText.textContent = newText;
        }
    };

    document.body.addEventListener('mouseover', handleHover);

    // Mobile: Click to Action
    if (cursor) {
        cursor.addEventListener('click', () => {
            // Only active on mobile (CSS controls visibility/position)
            if (!isDesktop) {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    // Try Lenis scroll if available, else native
                    if (typeof lenis !== 'undefined' && lenis) {
                        lenis.scrollTo(contactSection);
                    } else {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }

    // ------------------------------------------------------------------
    // CONTACT FORM HANDLING
    // ------------------------------------------------------------------
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = document.getElementById('submitBtn');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            // Simulate API Request
            setTimeout(() => {
                btn.innerHTML = '<span>Sent!</span> <i class="fa-solid fa-check"></i>';
                btn.style.backgroundColor = '#4CAF50';

                // Use a non-blocking UI update instead of alert if possible, but alert is requested/simple
                // A better approach is replacing the button text which we did.
                // Reset form
                appointmentForm.reset();

                // Restore button
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // ------------------------------------------------------------------
    // SMOOTH SCROLL (Lenis)
    // ------------------------------------------------------------------
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ------------------------------------------------------------------
    // RIPPLE EFFECT (Mobile)
    // ------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        // Only trigger on interactive elements that overflow hidden isn't an issue for
        // Or specific classes. Let's make it general but safe.
        if (!isTouch) return;

        const target = e.target.closest('button, .submit-btn, .social-link, .nav-links a');
        if (target) {
            const rect = target.getBoundingClientRect();
            // Approximating click pos relative to element if possible, or center
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // We need to ensure the target can display the ripple
            if (getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            if (getComputedStyle(target).overflow !== 'hidden') {
                target.style.overflow = 'hidden';
            }

            target.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });

    // ------------------------------------------------------------------
    // GSAP ANIMATIONS
    // ------------------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animation (Fade + Slide Up)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.from(heroTitle.children, {
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out"
        });

        gsap.from('.hero-subtitle', {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.4,
            ease: "power3.out"
        });

        gsap.from('.category-card', {
            y: 40,
            opacity: 0,
            duration: 0.8,
            delay: 0.6,
            stagger: 0.15,
            ease: "power3.out"
        });
    }

    // Page Header Animation
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.from(pageHeader.children, {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        });
    }

    // Grid Animation
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
        gsap.from(projectCards, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.project-grid',
                start: "top 85%"
            }
        });
    }

    // Services Animation
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        gsap.from(servicesSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: servicesSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        const cards = servicesSection.querySelectorAll('.service-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: "top 85%" },
                y: 50, opacity: 0, duration: 0.8, delay: i * 0.2, ease: "power3.out"
            });

            // Stagger list items
            gsap.from(card.querySelectorAll('li'), {
                scrollTrigger: { trigger: card, start: "top 85%" },
                x: -10, opacity: 0, duration: 0.5, stagger: 0.08, delay: 0.4 + (i * 0.2), ease: "power2.out"
            });
        });
    }

    // Pricing Animation
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        gsap.from(pricingSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: pricingSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        const pricingCards = pricingSection.querySelectorAll('.pricing-card');
        pricingCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: "top 85%" },
                y: 50, opacity: 0, duration: 0.8, delay: i * 0.15, ease: "power3.out"
            });
        });
    }

    // About Animation
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        gsap.from(aboutSection.querySelector('.about-content'), {
            scrollTrigger: { trigger: aboutSection, start: "top 75%" },
            x: -50, opacity: 0, duration: 1, ease: "power3.out"
        });
        gsap.from(aboutSection.querySelector('.about-visual'), {
            scrollTrigger: { trigger: aboutSection, start: "top 75%" },
            x: 50, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out"
        });
    }

    // Experience Animation
    const expSection = document.getElementById('experience');
    if (expSection) {
        gsap.from(expSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: expSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        gsap.from(expSection.querySelectorAll('.timeline-item'), {
            scrollTrigger: { trigger: expSection, start: "top 75%" },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });
    }

    // Testimonials Animation (Staggered)
    const testSection = document.getElementById('testimonials');
    if (testSection) {
        gsap.from(testSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: testSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        const testimonials = testSection.querySelectorAll('.testimonial-card');
        gsap.from(testimonials, {
            scrollTrigger: { trigger: testSection, start: "top 75%" },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2, /* 0.2s difference per item */
            ease: "power3.out"
        });
    }

    // Featured Carousel Animation
    const carouselSection = document.getElementById('featured-carousel');
    if (carouselSection) {
        gsap.from(carouselSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: carouselSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        gsap.from(carouselSection.querySelector('.carousel-wrapper'), {
            scrollTrigger: { trigger: carouselSection, start: "top 75%" },
            opacity: 0, y: 30, duration: 1, ease: "power3.out"
        });
    }

    // Appointment Form Animation
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        gsap.from(contactSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: contactSection, start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        });

        gsap.from('.appointment-form', {
            scrollTrigger: { trigger: '#contact', start: "top 70%" },
            y: 50,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out"
        });

        // Social Toggles Entrance
        gsap.to('.social-link', {
            scrollTrigger: { trigger: '.social-toggles', start: "top 90%" },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }

    // ------------------------------------------------------------------
    // FILTERING LOGIC
    // ------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Active Class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const projectCards = document.querySelectorAll('.project-card');

                // Animate Out
                gsap.to(projectCards, {
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        projectCards.forEach(card => {
                            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });

                        // Re-trigger layout (needed for some browsers)
                        ScrollTrigger.refresh();

                        // Animate In Visible Cards
                        const visibleCards = Array.from(projectCards).filter(c => c.style.display !== 'none');
                        gsap.fromTo(visibleCards,
                            { scale: 0.95, opacity: 0, y: 20 },
                            { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                        );
                    }
                });
            });
        });
    }

    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // CAROUSEL LOGIC (Compact Native Scroll)
    // ------------------------------------------------------------------
    const track = document.getElementById('track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track && prevBtn && nextBtn) {
        // Scroll amount: width of one card + gap (approx 300px)
        // We can dynamically get it from the first card
        const getScrollAmount = () => {
            const card = track.querySelector('.carousel-card');
            return card ? card.offsetWidth + 20 : 300;
        };

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        // Optional: Auto-scroll that just nudges or resets?
        // For "Compact Row", usually manual scroll is preferred. 
        // User asked for "Horizontal scroll smooth". Native is best.
        // "Optional infinite loop" - Native scroll doesn't loop easily. 
        // We will stick to finite smooth scroll which is standard for "Featured Work" rows (like Netflix/YouTube).
    }

    // ------------------------------------------------------------------
    // BACKGROUND LOGOS (Re-use existing logic)
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // BACKGROUND LOGOS (Creative Software)
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // BACKGROUND LOGOS (Monochrome Creative Suite)
    // ------------------------------------------------------------------
    const logoContainer = document.getElementById('logo-container');
    if (logoContainer) {
        // Simple monochrome SVGs (fill="currentColor" to inherit opacity/color)
        const icons = [
            // Adobe Photoshop (Ps)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm3 3h2.5c2.5 0 3.5 1.5 3.5 3.5S11.5 14 9 14H8v3H6V7zm2 2v3h1c1 0 1.5-.5 1.5-1.5S10 9 9 9H8zm5 4c-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5 1.5-.5 1.5-1.5v-.5h2v.5c0 2-1.5 3-3.5 3s-3.5-1-3.5-3 1-3 3-3c.5 0 1 .1 1.5.3V14c-.5-.2-1-.2-1.5-.2z"/></svg>',

            // Adobe Illustrator (Ai)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm5 12l-.5 1.5H8l3.5-10h1l3.5 10h-2.5l-.5-1.5h-2zm1-3l.5-2 .5 2h-1zm6-3h2v2h-2v2.5h-2V14h2v-2z"/></svg>',

            // Adobe InDesign (Id)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm3 3h2.2v11H6.5V6.5zm-1.5-.5h2.2v2.2H5V6zm6.5 3c-.9 0-1.5.4-1.8.8-.4.5-.5 1.1-.5 1.7 0 .6.1 1.3.6 1.8.4.5 1.1.9 2 .9.6 0 1.1-.1 1.5-.4v.3h2.2v-7h-2.2v2.2c-.4-.2-.9-.3-1.5-.3h-.3zm.3 1.8c.5 0 .9.2 1.2.6v1.9c-.2.4-.7.7-1.2.7-.5 0-.9-.3-1.1-.8-.2-.4-.2-1-.2-1.5 0-1.1.5-1.7 1.3-1.7h1.6z"/></svg>',

            // Figma (F Shape)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 12c0 1.657 1.343 3 3 3h3v-3H9a3 3 0 01-3-3z"/><path d="M12 12h3a3 3 0 010 6 3 3 0 01-3-3v-3z"/><path d="M6 6c0 1.657 1.343 3 3 3h3V6c0-1.657-1.343-3-3-3S6 4.343 6 6z"/><path d="M12 6h3c1.657 0 3 1.343 3 3s-1.343 3-3 3h-3V6z"/><path d="M12 21a3 3 0 110-6 3 3 0 010 6z"/><path d="M6 18c0 1.657 1.343 3 3 3v-3H6z"/></svg>',

            // Adobe Premiere Pro (Pr)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm3 3h2.5c2.5 0 3.5 1.5 3.5 3.5S11.5 14 9 14H8v3H6V7zm2 2v3h1c1 0 1.5-.5 1.5-1.5S10 9 9 9H8zm6 3h1v1h-1v4h-2v-5h1.5l.5-1V9z"/></svg>',

            // Adobe After Effects (Ae)
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm5 12l-.5 1.5H8l3.5-10h1l3.5 10h-2.5l-.5-1.5h-2zm1-3l.5-2 .5 2h-1zm6 0c.5 0 1 .1 1.5.3V14c-.5-.2-1-.3-1.5-.3-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5c.5 0 1-.1 1.5-.3v1.3c-.5.2-1 .3-1.5.3-2 0-3.5-1-3.5-3s1.5-3 3.5-3c2 0 3.5 1 3.5 3v.5h-5.4c.1 1 .5 1.5 1.5 1.5z"/></svg>',

            // DaVinci Resolve
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-2.3v-4.4l4-2.3 4 2.3v4.4l-4 2.3z"/></svg>'
        ];

        const generateLogos = () => {
            const fragment = document.createDocumentFragment();
            const isMobile = window.innerWidth <= 768;
            const count = isMobile ? 5 : 12; // Fewer logos on mobile

            // Clear previous
            logoContainer.innerHTML = '';

            for (let i = 0; i < count; i++) {
                const div = document.createElement('div');
                div.className = 'floating-logo';
                div.innerHTML = icons[i % icons.length];

                const size = Math.random() * 80 + 100; // 100px - 180px
                div.style.width = `${size}px`;
                div.style.height = `${size}px`;
                div.style.left = `${Math.random() * 95}vw`;
                div.style.top = `${Math.random() * 90}vh`;

                // Opacity 8-12% White
                div.style.opacity = Math.random() * 0.04 + 0.08;
                div.style.color = 'rgba(255, 255, 255, 0.8)'; // Monochrome white base

                div.style.position = 'absolute';
                div.style.pointerEvents = 'none';
                div.style.zIndex = '0';

                // 3D Depth Style
                div.style.transformStyle = 'preserve-3d';
                // Optional: very subtle blur for depth
                if (Math.random() > 0.5) {
                    div.style.filter = 'blur(1px)';
                }

                fragment.appendChild(div);

                gsap.to(div, {
                    y: "random(-40, 40)",
                    x: "random(-20, 20)",
                    rotationX: "random(-15, 15)", // 3D Tilt X
                    rotationY: "random(-15, 15)", // 3D Tilt Y
                    rotation: "random(-10, 10)",
                    duration: "random(10, 15)",   // Slow float
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });
            }
            logoContainer.appendChild(fragment);
        };


        // Init
        setTimeout(generateLogos, 100);
    }

    // ------------------------------------------------------------------
    // HERO VIDEO (Silent Background)
    // ------------------------------------------------------------------
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.muted = true; // Ensure muted
        heroVideo.playbackRate = 0.8; // Cinematic slow motion
    }
});
