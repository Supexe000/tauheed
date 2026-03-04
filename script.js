document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------
    // CINEMATIC INTRO (Landing Hero)
    // ------------------------------------------------------------------
    const introOverlay = document.getElementById('intro-overlay');
    const landingHero = document.getElementById('landingHero');
    const skipBtn = document.getElementById('skip-intro');
    const introPlayBtn = document.getElementById('intro-play-btn');

    // Lock Scroll Initially
    if (introOverlay) {
        document.body.style.overflow = 'hidden';
    }

    const finishIntro = () => {
        if (!introOverlay) return;

        // Check if already finished to avoid double triggers
        if (introOverlay.classList.contains('hidden')) return;

        // Fade Out
        introOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Unlock Scroll

        // Pause Video to save resources
        setTimeout(() => {
            if (landingHero) landingHero.pause();
            introOverlay.remove(); // Cleanup DOM

            ScrollTrigger.refresh();

            // Ensure Intro Video (Background) Plays
            const introVideo = document.getElementById('introVideo');
            if (introVideo) {
                introVideo.play().catch(() => { });
            }
        }, 800);
    };

    if (landingHero) {
        landingHero.addEventListener('ended', finishIntro);

        const playPromise = landingHero.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Autoplay started
            }).catch(error => {
                console.log('Landing Hero autoplay prevented. Showing play button.');
                if (introPlayBtn) {
                    introPlayBtn.style.display = 'flex';
                    introPlayBtn.addEventListener('click', () => {
                        landingHero.play();
                        introPlayBtn.style.display = 'none';
                    });
                }
            });
        }
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', finishIntro);
    }

    // Fallback Safety Net (15 seconds max for intro)
    setTimeout(finishIntro, 15000);

    // ------------------------------------------------------------------
    // CONFIGURATION
    // ------------------------------------------------------------------
    const IS_DESKTOP = window.matchMedia('(min-width: 1025px)').matches;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ------------------------------------------------------------------
    // CUSTOM CURSOR
    // ------------------------------------------------------------------
    const cursor = document.querySelector('.custom-cursor');
    const cursorText = document.querySelector('.cursor-text');

    let isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    window.addEventListener('resize', () => {
        isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    const animateCursor = () => {
        if (isDesktop && cursor) {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const handleHover = (e) => {
        if (!isDesktop) return;

        const target = e.target;
        const interactive = target.closest('a, button, input, select, textarea, .filter-btn, .category-card');

        let newText = 'HIRE ME';
        let isHovered = false;

        if (interactive) {
            isHovered = true;

            if (target.closest('.video-card')) newText = 'WATCH';
            else if (target.closest('.graphic-card')) newText = 'VIEW';
            else if (target.closest('.social-link')) newText = 'FOLLOW';
            else if (target.closest('#submitBtn')) newText = 'SEND';
            else if (target.closest('.category-card')) newText = 'OPEN';
            else if (target.closest('.pricing-btn')) newText = 'SELECT';
            else if (target.closest('#skip-intro')) newText = 'SKIP';
            else if (target.closest('.intro-fallback-play')) newText = 'PLAY';
            else if (target.closest('.profile-link-btn')) newText = 'OPEN';
            else if (target.closest('#menuBtn')) newText = 'MENU';
            else if (target.closest('.menu-link')) newText = 'GO';
            else if (target.closest('input, textarea')) newText = 'TYPE';
            else newText = 'CLICK';
        }

        if (isHovered) {
            cursor.classList.add('hovered');
        } else {
            cursor.classList.remove('hovered');
        }

        if (cursorText && cursorText.textContent !== newText) {
            cursorText.textContent = newText;
        }
    };

    document.body.addEventListener('mouseover', handleHover);

    if (cursor) {
        cursor.addEventListener('click', () => {
            if (!isDesktop) {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
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

            setTimeout(() => {
                btn.innerHTML = '<span>Sent!</span> <i class="fa-solid fa-check"></i>';
                btn.style.backgroundColor = '#4CAF50';

                appointmentForm.reset();

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
    // CATEGORY SLIDERS – smooth continuous pixel scroll
    // ------------------------------------------------------------------
    function makeCatSlider(trackId, prevId, nextId, pxPerSec) {
        const track = document.getElementById(trackId);
        const prev = document.getElementById(prevId);
        const next = document.getElementById(nextId);
        if (!track) return;

        let paused = false;
        let rafId;
        let lastTime = null;
        const speed = pxPerSec || 60; // px per second

        function step(ts) {
            if (!lastTime) lastTime = ts;
            const dt = ts - lastTime;
            lastTime = ts;

            if (!paused) {
                track.scrollLeft += (speed * dt) / 1000;

                // Seamless loop: when we've scrolled past the mid-point (cloned set), reset
                if (track.scrollLeft >= track.scrollWidth / 2) {
                    track.scrollLeft = 0;
                }
            }
            rafId = requestAnimationFrame(step);
        }

        // Clone all children for seamless infinite loop
        const origChildren = Array.from(track.children);
        origChildren.forEach(child => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        rafId = requestAnimationFrame(step);

        // Pause on hover (desktop)
        track.addEventListener('mouseenter', () => { paused = true; });
        track.addEventListener('mouseleave', () => { paused = false; lastTime = null; });

        // Touch swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            paused = true;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchmove', e => {
            const dx = touchStartX - e.touches[0].clientX;
            track.scrollLeft += dx * 0.4;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', () => {
            paused = false;
            lastTime = null;
        }, { passive: true });

        // Arrow buttons — jump one card width
        const jumpCard = (dir) => {
            const card = track.querySelector('.pf-card');
            const btw = track.querySelector('.btw-stat-card');
            const itemW = (card || btw) ? (card || btw).offsetWidth + 20 : 320;
            track.scrollLeft += dir * itemW;
        };
        if (prev) prev.addEventListener('click', () => jumpCard(-1));
        if (next) next.addEventListener('click', () => jumpCard(1));
    }

    // Initialise all 6 category sliders
    makeCatSlider('track-vid', 'prev-vid', 'next-vid', 55);
    makeCatSlider('track-reels', 'prev-reels', 'next-reels', 45);
    makeCatSlider('track-logo', 'prev-logo', 'next-logo', 50);
    makeCatSlider('track-thumb', 'prev-thumb', 'next-thumb', 50);
    makeCatSlider('track-wed', 'prev-wed', 'next-wed', 40);
    makeCatSlider('track-btw', 'prev-btw', 'next-btw', 48);


    // ------------------------------------------------------------------
    // YOUTUBE LIGHTBOX
    // ------------------------------------------------------------------
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.pf-play-btn');
        if (!btn) return;
        e.stopPropagation();
        const ytId = btn.getAttribute('data-yt');
        if (!ytId) return;

        const lb = document.createElement('div');
        lb.className = 'yt-lightbox';
        lb.innerHTML = `
            <button class="yt-close" aria-label="Close">&times;</button>
            <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0"
                allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';

        const close = () => {
            lb.remove();
            document.body.style.overflow = '';
        };
        lb.querySelector('.yt-close').addEventListener('click', close);
        lb.addEventListener('click', (ev) => { if (ev.target === lb) close(); });
        document.addEventListener('keydown', function esc(ev) {
            if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });
    });

    // ------------------------------------------------------------------
    // IMAGE LIGHTBOX (expand buttons)
    // ------------------------------------------------------------------
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.pf-expand-btn');
        if (!btn) return;
        e.stopPropagation();

        const card = btn.closest('.pf-card');
        if (!card) return;
        const img = card.querySelector('img');
        if (!img) return;

        const lb = document.createElement('div');
        lb.className = 'img-lightbox';
        lb.innerHTML = `
            <button class="yt-close" aria-label="Close">&times;</button>
            <img src="${img.src}" alt="${img.alt}">`;
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';

        const close = () => {
            lb.remove();
            document.body.style.overflow = '';
        };
        lb.querySelector('.yt-close').addEventListener('click', close);
        lb.addEventListener('click', (ev) => { if (ev.target === lb) close(); });
        document.addEventListener('keydown', function esc(ev) {
            if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });
    });





    // ------------------------------------------------------------------
    // RIPPLE EFFECT (Mobile)
    // ------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        if (!isTouch) return;

        const target = e.target.closest('button, .submit-btn, .social-link, .nav-links a');
        if (target) {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
            if (getComputedStyle(target).overflow !== 'hidden') target.style.overflow = 'hidden';

            target.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    });

    // ------------------------------------------------------------------
    // GSAP ANIMATIONS
    // ------------------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.from(heroTitle.children, {
            y: 50, opacity: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out'
        });
        gsap.from('.hero-subtitle', {
            y: 30, opacity: 0, duration: 1, delay: 0.4, ease: 'power3.out'
        });
        gsap.from('.category-card', {
            y: 40, opacity: 0, duration: 0.8, delay: 0.6, stagger: 0.15, ease: 'power3.out'
        });
    }

    // Page Header Animation
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.from(pageHeader.children, {
            y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out'
        });
    }

    // Grid Animation
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
        gsap.from(projectCards, {
            y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.project-grid', start: 'top 85%' }
        });
    }


    // Services Section Animation
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        gsap.from(servicesSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: servicesSection, start: 'top 82%' },
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
        gsap.fromTo(
            servicesSection.querySelectorAll('.svc-card'),
            { opacity: 0, y: 40 },
            {
                scrollTrigger: { trigger: servicesSection, start: 'top 75%' },
                opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: 'power3.out'
            }
        );
    }

    // Pricing Animation
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        gsap.from(pricingSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: pricingSection, start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });

        const pricingCards = pricingSection.querySelectorAll('.pricing-card');
        pricingCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                y: 50, opacity: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
            });
        });
    }

    // Experience Animation
    const expSection = document.getElementById('experience');
    if (expSection) {
        gsap.from(expSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: expSection, start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
        gsap.from(expSection.querySelectorAll('.timeline-item'), {
            scrollTrigger: { trigger: expSection, start: 'top 75%' },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
        });
    }

    // Testimonials Animation
    const testSection = document.getElementById('testimonials');
    if (testSection) {
        gsap.from(testSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: testSection, start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
        const testimonials = testSection.querySelectorAll('.testimonial-card');
        gsap.from(testimonials, {
            scrollTrigger: { trigger: testSection, start: 'top 75%' },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
        });
    }




    // Appointment Form Animation
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        gsap.from(contactSection.querySelector('.section-header'), {
            scrollTrigger: { trigger: contactSection, start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
        gsap.from('.appointment-form', {
            scrollTrigger: { trigger: '#contact', start: 'top 70%' },
            y: 50, opacity: 0, duration: 0.9, ease: 'power3.out'
        });
        gsap.to('.social-link', {
            scrollTrigger: { trigger: '.social-toggles', start: 'top 90%' },
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)'
        });
    }

    // ------------------------------------------------------------------
    // FILTERING LOGIC
    // ------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const cards = document.querySelectorAll('.project-card');

                gsap.to(cards, {
                    scale: 0.95, opacity: 0, duration: 0.3,
                    onComplete: () => {
                        cards.forEach(card => {
                            card.style.display =
                                (filterValue === 'all' || card.getAttribute('data-category') === filterValue)
                                    ? 'block' : 'none';
                        });
                        ScrollTrigger.refresh();
                        const visible = Array.from(cards).filter(c => c.style.display !== 'none');
                        gsap.fromTo(visible,
                            { scale: 0.95, opacity: 0, y: 20 },
                            { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
                        );
                    }
                });
            });
        });
    }

    // ------------------------------------------------------------------
    // BACKGROUND LOGOS (Monochrome Creative Suite)
    // ------------------------------------------------------------------
    const logoContainer = document.getElementById('logo-container');
    if (logoContainer) {
        const icons = [
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm3 3h2.5c2.5 0 3.5 1.5 3.5 3.5S11.5 14 9 14H8v3H6V7zm2 2v3h1c1 0 1.5-.5 1.5-1.5S10 9 9 9H8zm5 4c-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5 1.5-.5 1.5-1.5v-.5h2v.5c0 2-1.5 3-3.5 3s-3.5-1-3.5-3 1-3 3-3c.5 0 1 .1 1.5.3V14c-.5-.2-1-.2-1.5-.2z"/></svg>',
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm5 12l-.5 1.5H8l3.5-10h1l3.5 10h-2.5l-.5-1.5h-2zm1-3l.5-2 .5 2h-1zm6-3h2v2h-2v2.5h-2V14h2v-2z"/></svg>',
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 12c0 1.657 1.343 3 3 3h3v-3H9a3 3 0 01-3-3z"/><path d="M12 12h3a3 3 0 010 6 3 3 0 01-3-3v-3z"/><path d="M6 6c0 1.657 1.343 3 3 3h3V6c0-1.657-1.343-3-3-3S6 4.343 6 6z"/><path d="M12 6h3c1.657 0 3 1.343 3 3s-1.343 3-3 3h-3V6z"/><path d="M12 21a3 3 0 110-6 3 3 0 010 6z"/><path d="M6 18c0 1.657 1.343 3 3 3v-3H6z"/></svg>',
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 2v16h16V4H6zm3 3h2.5c2.5 0 3.5 1.5 3.5 3.5S11.5 14 9 14H8v3H6V7zm2 2v3h1c1 0 1.5-.5 1.5-1.5S10 9 9 9H8zm6 3h1v1h-1v4h-2v-5h1.5l.5-1V9z"/></svg>',
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-2.3v-4.4l4-2.3 4 2.3v4.4l-4 2.3z"/></svg>'
        ];

        const generateLogos = () => {
            const fragment = document.createDocumentFragment();
            const isMobile = window.innerWidth <= 768;
            const count = isMobile ? 5 : 12;

            logoContainer.innerHTML = '';

            for (let i = 0; i < count; i++) {
                const div = document.createElement('div');
                div.className = 'floating-logo';
                div.innerHTML = icons[i % icons.length];

                const size = Math.random() * 80 + 100;
                div.style.width = `${size}px`;
                div.style.height = `${size}px`;
                div.style.left = `${Math.random() * 95}vw`;
                div.style.top = `${Math.random() * 90}vh`;
                div.style.opacity = Math.random() * 0.04 + 0.08;
                div.style.color = 'rgba(255, 255, 255, 0.8)';
                div.style.position = 'absolute';
                div.style.pointerEvents = 'none';
                div.style.zIndex = '0';
                div.style.transformStyle = 'preserve-3d';

                if (Math.random() > 0.5) div.style.filter = 'blur(1px)';

                fragment.appendChild(div);

                gsap.to(div, {
                    y: 'random(-40, 40)',
                    x: 'random(-20, 20)',
                    rotationX: 'random(-15, 15)',
                    rotationY: 'random(-15, 15)',
                    rotation: 'random(-10, 10)',
                    duration: 'random(10, 15)',
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true
                });
            }
            logoContainer.appendChild(fragment);
        };

        setTimeout(generateLogos, 100);
    }

    // ------------------------------------------------------------------
    // HERO VIDEO (Silent Background)
    // ------------------------------------------------------------------
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playbackRate = 0.8;
    }

    // ------------------------------------------------------------------
    // FULLSCREEN OVERLAY MENU
    // ------------------------------------------------------------------
    const menuBtn = document.getElementById('menuBtn');
    const menuClose = document.getElementById('menuClose');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    const menuLinks = document.querySelectorAll('.menu-link');

    const openMenu = () => {
        if (!fullscreenMenu) return;
        fullscreenMenu.classList.add('is-open');
        fullscreenMenu.setAttribute('aria-hidden', 'false');
        if (menuBtn) menuBtn.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (!fullscreenMenu) return;
        fullscreenMenu.classList.remove('is-open');
        fullscreenMenu.setAttribute('aria-hidden', 'true');
        if (menuBtn) menuBtn.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Menu link click — smooth scroll or navigate
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeMenu();
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) {
                        if (typeof lenis !== 'undefined' && lenis) {
                            lenis.scrollTo(target, { offset: -80, duration: 1.2 });
                        } else {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }, 220);
            } else {
                // External link (profile pages) — let navigate naturally
                closeMenu();
            }
        });
    });

    // Active section highlight via IntersectionObserver
    const sectionIds = ['hero', 'cat-video', 'cat-reels', 'cat-logo', 'cat-thumb', 'cat-wedding', 'cat-btw', 'services', 'about-tauheed', 'about-salman', 'about-zain', 'about-hamza', 'experience', 'contact'];
    const observerOptions = { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                menuLinks.forEach(link => {
                    const linkSection = link.getAttribute('data-section');
                    link.classList.toggle('active-section', linkSection === id);
                });
            }
        });
    }, observerOptions);

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    // ------------------------------------------------------------------
    // MEMBER ABOUT SECTIONS — Fade-in-up animations
    // ------------------------------------------------------------------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.member-about-section').forEach(section => {
            const targets = section.querySelectorAll('.fade-in-up');
            targets.forEach((el, i) => {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: i * 0.15,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none',
                    }
                });
            });
        });

    }

    // ------------------------------------------------------------------
    // BEHIND THE SCENE: BEFORE/AFTER SLIDER & FADE-IN
    // ------------------------------------------------------------------
    const baContainer = document.querySelector('.ba-slider-container');
    if (baContainer) {
        const overlayWrapper = baContainer.querySelector('.ba-image-overlay-wrapper');
        const handle = baContainer.querySelector('.ba-slider-handle');

        let isDragging = false;
        let rAF = null;
        let currentPercent = 50;

        const updateSliderDOM = () => {
            overlayWrapper.style.clipPath = `polygon(0 0, ${currentPercent}% 0, ${currentPercent}% 100%, 0 100%)`;
            handle.style.transform = `translate3d(${currentPercent}%, 0, 0)`;
            rAF = null;
        };

        const setSliderPos = (e) => {
            const rect = baContainer.getBoundingClientRect();
            let clientX = e.clientX;
            // Handle touch events
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            }
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width)); // Clamp between 0 and width
            currentPercent = (x / rect.width) * 100;

            if (!rAF) {
                rAF = requestAnimationFrame(updateSliderDOM);
            }
        };

        const startDrag = (e) => {
            isDragging = true;
            overlayWrapper.classList.remove('smooth-transition');
            handle.classList.remove('smooth-transition');
            setSliderPos(e);
            document.body.style.userSelect = 'none'; // Prevent text selection
        };

        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
                overlayWrapper.classList.add('smooth-transition');
                handle.classList.add('smooth-transition');
            }
        };

        // Mouse Events
        baContainer.addEventListener('mousedown', startDrag);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            setSliderPos(e);
        }, { passive: true });

        // Touch Events
        baContainer.addEventListener('touchstart', startDrag, { passive: true });
        window.addEventListener('touchend', stopDrag, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            // touch-action: pan-y in CSS ensures scrolling instead of reflow where possible
            setSliderPos(e);
        }, { passive: true });

        // Intersection Observer for .bts-fade-in
        const btsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    btsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('.bts-fade-in').forEach(el => {
            btsObserver.observe(el);
        });
    }

});
