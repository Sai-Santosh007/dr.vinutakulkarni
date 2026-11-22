/**
 * DR. VINUTA KULKARNI - OPHTHALMIC PORTFOLIO
 * Core Interactions, Navigation & Appointment Form
 * Consolidated 2-Section Structure Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year in Footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Sticky Header Scroll Effect & Transparent-to-Solid Transition
  const header = document.getElementById('header');
  function updateHeaderState() {
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  // 3. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      if (header) header.classList.toggle('nav-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking any nav link
    const navLinks = navMenu.querySelectorAll('.nav-link, .nav-mobile-cta a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (header) header.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Smooth Scrolling for all Internal Navigation Links
  let currentScrollAnimation = null;

  function customSmoothScroll(targetPosition, onComplete) {
    if (currentScrollAnimation) {
      cancelAnimationFrame(currentScrollAnimation);
      currentScrollAnimation = null;
    }

    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    if (Math.abs(distance) < 2) {
      window.scrollTo(0, targetPosition);
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const duration = Math.min(800, Math.max(450, Math.abs(distance) * 0.35));
    let startTime = null;
    let isCancelled = false;

    // Smooth cubic easing (acceleration then deceleration)
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Cancel animation if user manually scrolls with wheel or touch
    function cancelOnUserInteraction() {
      isCancelled = true;
      if (currentScrollAnimation) {
        cancelAnimationFrame(currentScrollAnimation);
        currentScrollAnimation = null;
      }
      cleanupListeners();
    }

    function cleanupListeners() {
      window.removeEventListener('wheel', cancelOnUserInteraction);
      window.removeEventListener('touchmove', cancelOnUserInteraction);
    }

    window.addEventListener('wheel', cancelOnUserInteraction, { passive: true });
    window.addEventListener('touchmove', cancelOnUserInteraction, { passive: true });

    // Temporarily disable native smooth behavior so frames don't fight native interpolation
    const rootEl = document.documentElement;
    const originalScrollBehavior = rootEl.style.scrollBehavior;
    rootEl.style.scrollBehavior = 'auto';

    function step(currentTime) {
      if (isCancelled) {
        rootEl.style.scrollBehavior = originalScrollBehavior;
        return;
      }

      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, Math.round(startPosition + distance * ease));

      if (timeElapsed < duration) {
        currentScrollAnimation = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetPosition);
        currentScrollAnimation = null;
        cleanupListeners();
        rootEl.style.scrollBehavior = originalScrollBehavior;
        if (typeof onComplete === 'function') onComplete();
      }
    }

    currentScrollAnimation = requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Close mobile menu if open
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          if (header) header.classList.remove('nav-open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }

        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetId === '#home'
          ? 0
          : Math.max(0, targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight);

        customSmoothScroll(targetPosition, () => {
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        });
      }
    });
  });

  // 5. Active Navigation State on Scroll (Intersection-based ScrollSpy)
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-list a[href*='${sectionId}']`);

      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      }
    });
  });

  // 5. Appointment Enquiry Form Handling
  const form = document.getElementById('appointmentForm');
  const statusBox = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  // Set minimum date for appointment to today
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form validation
      const name = document.getElementById('patientName');
      const phone = document.getElementById('contactNumber');
      const location = document.getElementById('preferredLocation');
      const date = document.getElementById('preferredDate');

      let isValid = true;

      // Validate Name
      if (!name.value.trim()) {
        document.getElementById('nameError').classList.add('visible');
        name.classList.add('input-invalid');
        isValid = false;
      } else {
        document.getElementById('nameError').classList.remove('visible');
        name.classList.remove('input-invalid');
      }

      // Validate Phone (simple check: 8 to 15 digits/chars)
      const phoneRegex = /^[0-9+\s-]{8,15}$/;
      if (!phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
        document.getElementById('phoneError').classList.add('visible');
        phone.classList.add('input-invalid');
        isValid = false;
      } else {
        document.getElementById('phoneError').classList.remove('visible');
        phone.classList.remove('input-invalid');
      }

      // Validate Location
      if (!location.value) {
        document.getElementById('locationError').classList.add('visible');
        location.classList.add('input-invalid');
        isValid = false;
      } else {
        document.getElementById('locationError').classList.remove('visible');
        location.classList.remove('input-invalid');
      }

      // Validate Date
      if (!date.value) {
        document.getElementById('dateError').classList.add('visible');
        date.classList.add('input-invalid');
        isValid = false;
      } else {
        document.getElementById('dateError').classList.remove('visible');
        date.classList.remove('input-invalid');
      }

      if (!isValid) return;

      // Submission feedback (Transparent: Not connected to live backend yet)
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Appointment Enquiry';
        
        statusBox.style.display = 'block';
        statusBox.className = 'form-status success';
        statusBox.innerHTML = `
          <strong>Appointment Enquiry Received</strong><br>
          Thank you, <em>${escapeHtml(name.value.trim())}</em>. Your consultation request for <strong>${escapeHtml(location.value)}</strong> has been recorded.<br><br>
          <em>Please note:</em> Prior appointments must be confirmed by the clinic desk. You will be contacted shortly on <strong>${escapeHtml(phone.value.trim())}</strong> to finalize your appointment time. For urgent confirmation, please call <a href="tel:9606089849" style="font-weight:700; text-decoration:underline;">9606089849</a>.
        `;

        form.reset();
      }, 700);
    });
  }

  // 6. Patient Reviews Carousel Controller
  initReviewsCarousel();
});

function initReviewsCarousel() {
  const track = document.getElementById('reviewsCarouselTrack');
  const viewport = document.getElementById('reviewsCarouselViewport');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTO_PLAY_INTERVAL = 5000;

  // Track sizing and navigation metrics
  function getStepSize() {
    const card = cards[0];
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  // Maximum scroll index: at the final review position, the end of the last card aligns with the viewport right edge
  function getMaxIndex() {
    const totalContentWidth = track.scrollWidth;
    const viewportWidth = viewport.clientWidth;
    const step = getStepSize();
    if (step <= 0 || totalContentWidth <= viewportWidth) return 0;
    return Math.max(0, Math.ceil((totalContentWidth - viewportWidth) / step));
  }

  // Render pagination dots
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    const count = maxIdx + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      dot.addEventListener('click', () => {
        goToIndex(i);
        startAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function updateCarouselPosition() {
    const step = getStepSize();
    if (step <= 0) return;
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) {
      currentIndex = maxIdx;
    }

    const totalContentWidth = track.scrollWidth;
    const viewportWidth = viewport.clientWidth;
    const maxTranslate = Math.max(0, totalContentWidth - viewportWidth);

    let shift = 0;
    if (currentIndex === 0) {
      // 1. At the beginning: flush left so first two cards are fully visible,
      // and only a small preview of the third card is shown at the right. No previous preview on the left.
      shift = 0;
    } else if (currentIndex >= maxIdx) {
      // 3. At the final review: scroll all the way to the end so the last review's right edge aligns
      // with viewport right (no gap or extra preview on the right), with previous-card preview on the left.
      shift = maxTranslate;
    } else {
      // 2. In intermediate positions: show previous-card preview on the left
      // and next-card preview on the right.
      // An offset peek (e.g. 50px-60px) gives an intentional glimpse of the preceding card.
      const peekOffset = Math.min(60, Math.round(step * 0.12));
      shift = Math.min(maxTranslate, Math.max(0, (currentIndex * step) - peekOffset));
    }

    track.style.transform = `translateX(-${shift}px)`;
    updateDots();
  }

  function goToIndex(idx) {
    const maxIdx = getMaxIndex();
    if (idx > maxIdx) {
      currentIndex = 0; // Seamless loop to beginning
    } else if (idx < 0) {
      currentIndex = maxIdx; // Seamless loop to end
    } else {
      currentIndex = idx;
    }
    updateCarouselPosition();
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      goToIndex(0);
    } else {
      goToIndex(currentIndex + 1);
    }
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      goToIndex(maxIdx);
    } else {
      goToIndex(currentIndex - 1);
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  // Pause automatic scrolling ONLY when hovering directly over a review card.
  // Hovering over headings, subtitle, margins, or navigation arrows does NOT pause auto-scroll.
  cards.forEach(card => {
    card.addEventListener('mouseenter', stopAutoPlay);
    card.addEventListener('mouseleave', startAutoPlay);
    card.addEventListener('focusin', stopAutoPlay);
    card.addEventListener('focusout', startAutoPlay);
  });

  // Touch Swipe Support (Mobile & Touch Devices)
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  const SWIPE_THRESHOLD = 40;

  viewport.addEventListener('touchstart', (e) => {
    stopAutoPlay();
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Only swipe if movement is predominantly horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    startAutoPlay();
  }, { passive: true });

  // Laptop Trackpad / Mouse Wheel Support:
  // Allows two-finger horizontal or vertical swipe/scroll over the reviews area
  // to smoothly trigger exactly one immediate review card advance per gesture.
  let isWheelThrottled = false;
  let wheelDeltaAccumulator = 0;
  const WHEEL_THRESHOLD = 25; // Sensitivity threshold for intentional two-finger gesture

  viewport.addEventListener('wheel', (e) => {
    // Detect horizontal trackpad swipe or shift-wheel; fall back to vertical scroll if over reviews
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : e.deltaX);

    // If there is significant horizontal swipe, prevent page from erratic back/forward navigation
    if (Math.abs(e.deltaX) > 8) {
      e.preventDefault();
    }

    if (isWheelThrottled) return;

    wheelDeltaAccumulator += delta;

    if (Math.abs(wheelDeltaAccumulator) >= WHEEL_THRESHOLD) {
      isWheelThrottled = true;
      stopAutoPlay();

      if (wheelDeltaAccumulator > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      startAutoPlay();
      wheelDeltaAccumulator = 0;

      // Throttle window so one distinct flick/swipe moves exactly one card
      setTimeout(() => {
        isWheelThrottled = false;
        wheelDeltaAccumulator = 0;
      }, 450);
    }
  }, { passive: false });

  // Handle window resizing (recompute dots and position)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      buildDots();
      const maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) {
        currentIndex = maxIdx;
      }
      updateCarouselPosition();
    }, 150);
  });

  // Initialize
  buildDots();
  updateCarouselPosition();
  startAutoPlay();
}

// Helper: Preset selected clinic when clicking "Select This Location" on clinic cards
window.selectClinic = function(clinicValue) {
  const selectEl = document.getElementById('preferredLocation');
  if (selectEl) {
    selectEl.value = clinicValue;
  }
};

// Helper: Basic sanitization
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
