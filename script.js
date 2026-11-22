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

  // Helper: Detect whether the appointment section has entered the visible viewport
  function hasReachedAppointmentSection() {
    const section = document.getElementById('appointment');
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < windowHeight;
  }

  function openAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Modal close triggers
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAppointmentModal);
  }

  const appointmentModal = document.getElementById('appointmentModal');
  if (appointmentModal) {
    appointmentModal.addEventListener('click', (e) => {
      if (e.target === appointmentModal) {
        closeAppointmentModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const modal = document.getElementById('appointmentModal');
      if (modal && modal.classList.contains('active')) {
        closeAppointmentModal();
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      // When clicking "Book Appointment" in header/navbar (desktop button or mobile CTA):
      // Only "Book Appointment" buttons trigger the conditional pop-up dialog.
      // "Schedule Appointment" nav link always navigates / smoothly scrolls to the appointment section.
      const isBookAppointmentBtn = this.closest('.site-header') && 
        targetId === '#appointment' && 
        (this.classList.contains('btn-nav-cta') || this.closest('.nav-mobile-cta'));

      if (isBookAppointmentBtn) {
        if (!hasReachedAppointmentSection()) {
          e.preventDefault();

          // Close mobile menu if open
          if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            if (header) header.classList.remove('nav-open');
            if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
          }

          openAppointmentModal();
          return;
        }
      }

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

  // Reusable Appointment Form Controller (Handles In-Page and Modal Forms)
  function setupAppointmentForm(config) {
    const form = document.getElementById(config.formId);
    const statusBox = document.getElementById(config.statusBoxId);
    const dateInput = document.getElementById(config.dateId);

    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById(config.nameId);
      const phone = document.getElementById(config.phoneId);
      const location = document.getElementById(config.locationId);
      const date = document.getElementById(config.dateId);
      const messageField = document.getElementById(config.messageId);

      const nameError = document.getElementById(config.nameErrorId);
      const phoneError = document.getElementById(config.phoneErrorId);
      const locationError = document.getElementById(config.locationErrorId);
      const dateError = document.getElementById(config.dateErrorId);

      let isValid = true;

      // Validate Name
      if (!name || !name.value.trim()) {
        if (nameError) nameError.classList.add('visible');
        if (name) name.classList.add('input-invalid');
        isValid = false;
      } else {
        if (nameError) nameError.classList.remove('visible');
        if (name) name.classList.remove('input-invalid');
      }

      // Validate Phone (simple check: 8 to 15 digits/chars)
      const phoneRegex = /^[0-9+\s-]{8,15}$/;
      if (!phone || !phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
        if (phoneError) phoneError.classList.add('visible');
        if (phone) phone.classList.add('input-invalid');
        isValid = false;
      } else {
        if (phoneError) phoneError.classList.remove('visible');
        if (phone) phone.classList.remove('input-invalid');
      }

      // Validate Location
      if (!location || !location.value) {
        if (locationError) locationError.classList.add('visible');
        if (location) location.classList.add('input-invalid');
        isValid = false;
      } else {
        if (locationError) locationError.classList.remove('visible');
        if (location) location.classList.remove('input-invalid');
      }

      // Validate Date
      if (!date || !date.value) {
        if (dateError) dateError.classList.add('visible');
        if (date) date.classList.add('input-invalid');
        isValid = false;
      } else {
        if (dateError) dateError.classList.remove('visible');
        if (date) date.classList.remove('input-invalid');
      }

      if (!isValid) return;

      // Collect entered appointment details
      const patientName = name.value.trim();
      const contactNumber = phone.value.trim();
      const clinicLocation = location.value;
      const reasonForVisit = messageField ? messageField.value.trim() : '';

      let formattedDate = date.value;
      try {
        const [year, month, day] = date.value.split('-');
        if (year && month && day) {
          const dateObj = new Date(year, month - 1, day);
          formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch (err) {
        formattedDate = date.value;
      }

      // Professional WhatsApp message with each detail on a separate line
      const messageLines = [
        'Hello Dr. Vinuta Kulkarni,',
        '',
        'I would like to request an eye consultation appointment. Here are my details:',
        `• Patient Name: ${patientName}`,
        `• Contact Number: ${contactNumber}`,
        `• Preferred Location: ${clinicLocation}`,
        `• Preferred Date: ${formattedDate}`
      ];

      if (reasonForVisit) {
        messageLines.push(`• Reason for Visit: ${reasonForVisit}`);
      }

      messageLines.push('', 'Please let me know the available consultation slot. Thank you.');

      const fullMessage = messageLines.join('\n');
      const cleanPhone = '919538756063';
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;

      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.className = 'form-status whatsapp-redirect';
        statusBox.innerHTML = `
          <strong>Continue to WhatsApp to send your appointment request</strong>
          <p>Your appointment details have been prepared. Please click the button below to review your message and press <strong>Send</strong> in WhatsApp:</p>
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.42 1.44.54.6.19 1.15.17 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32"/>
            </svg>
            Open in WhatsApp &amp; Send Request
          </a>
          <p class="whatsapp-fallback-note">
            Unable to open WhatsApp? You can call or message the clinic directly at <a href="tel:919538756063"><strong>+91 95387 56063</strong></a>.
          </p>
        `;
      }

      // Automatically open WhatsApp in a new tab/window
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Initialize in-page appointment form
  setupAppointmentForm({
    formId: 'appointmentForm',
    nameId: 'patientName',
    nameErrorId: 'nameError',
    phoneId: 'contactNumber',
    phoneErrorId: 'phoneError',
    locationId: 'preferredLocation',
    locationErrorId: 'locationError',
    dateId: 'preferredDate',
    dateErrorId: 'dateError',
    messageId: 'message',
    statusBoxId: 'formStatus'
  });

  // Initialize modal appointment form
  setupAppointmentForm({
    formId: 'modalAppointmentForm',
    nameId: 'modalPatientName',
    nameErrorId: 'modalNameError',
    phoneId: 'modalContactNumber',
    phoneErrorId: 'modalPhoneError',
    locationId: 'modalPreferredLocation',
    locationErrorId: 'modalLocationError',
    dateId: 'modalPreferredDate',
    dateErrorId: 'modalDateError',
    messageId: 'modalMessage',
    statusBoxId: 'modalFormStatus'
  });

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
  const modalSelectEl = document.getElementById('modalPreferredLocation');
  if (modalSelectEl) {
    modalSelectEl.value = clinicValue;
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
