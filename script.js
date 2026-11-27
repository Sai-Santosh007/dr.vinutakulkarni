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
    const gap = parseFloat(style.gap) || (window.innerWidth <= 640 ? 12 : 24);
    return card.offsetWidth + gap;
  }

  // Maximum scroll index:
  // On mobile (320px - 640px): each review card is an individual slide (0 to totalCards - 1)
  // On desktop / tablet (> 640px): multi-card stepped scrolling
  function getMaxIndex() {
    if (window.innerWidth <= 640) {
      return totalCards - 1;
    }
    const totalContentWidth = track.scrollWidth;
    const viewportWidth = viewport.clientWidth;
    const step = getStepSize();
    if (step <= 0 || totalContentWidth <= viewportWidth) return 0;
    return Math.max(0, Math.ceil((totalContentWidth - viewportWidth) / step));
  }

  // Mark the active card for focused presentation
  function updateActiveCardClass() {
    cards.forEach((card, idx) => {
      card.classList.toggle('active-card', idx === currentIndex);
    });
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
    const isMobile = window.innerWidth <= 640;
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) {
      currentIndex = maxIdx;
    }

    const totalContentWidth = track.scrollWidth;
    const viewportWidth = viewport.clientWidth;
    const maxTranslate = Math.max(0, totalContentWidth - viewportWidth);

    if (isMobile) {
      let shift = 0;
      const card = cards[currentIndex];
      const cardWidth = card ? card.offsetWidth : 0;
      const cardLeft = card ? card.offsetLeft : 0;

      if (currentIndex === 0) {
        // 1. At the first review: show only the next card's edge on the right
        shift = 0;
      } else if (currentIndex >= totalCards - 1) {
        // 3. At the final review: show only the previous card's edge on the left
        shift = maxTranslate;
      } else {
        // 2. In the middle: centre active review card horizontally with small previews on both sides
        const centerOffset = (viewportWidth - cardWidth) / 2;
        shift = Math.max(0, Math.min(maxTranslate, cardLeft - centerOffset));
      }

      track.style.transform = `translateX(-${shift}px)`;
      updateActiveCardClass();
      updateDots();
      return;
    }

    // Desktop and Tablet layout (> 640px)
    const step = getStepSize();
    if (step <= 0) return;

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
      const peekOffset = Math.min(60, Math.round(step * 0.12));
      shift = Math.min(maxTranslate, Math.max(0, (currentIndex * step) - peekOffset));
    }

    track.style.transform = `translateX(-${shift}px)`;
    updateActiveCardClass();
    updateDots();
    updateButtonStates();
  }

  function updateButtonStates() {
    const maxIdx = getMaxIndex();
    if (prevBtn) {
      const isAtStart = currentIndex <= 0;
      prevBtn.disabled = isAtStart;
      prevBtn.setAttribute('aria-disabled', isAtStart ? 'true' : 'false');
    }
    if (nextBtn) {
      const isAtEnd = currentIndex >= maxIdx;
      nextBtn.disabled = isAtEnd;
      nextBtn.setAttribute('aria-disabled', isAtEnd ? 'true' : 'false');
    }
  }

  function goToIndex(idx) {
    const maxIdx = getMaxIndex();
    // Clamp to boundaries [0, maxIdx]; never loop or jump to opposite side
    if (idx > maxIdx) {
      currentIndex = maxIdx;
    } else if (idx < 0) {
      currentIndex = 0;
    } else {
      currentIndex = idx;
    }
    updateCarouselPosition();
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex < maxIdx) {
      goToIndex(currentIndex + 1);
    } else {
      // Reached the rightmost boundary: stop scrolling naturally without looping
      stopAutoPlay();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
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
  // On mobile (<= 640px), tapping on an adjacent card preview immediately navigates to it.
  cards.forEach((card, idx) => {
    card.addEventListener('mouseenter', stopAutoPlay);
    card.addEventListener('mouseleave', startAutoPlay);
    card.addEventListener('focusin', stopAutoPlay);
    card.addEventListener('focusout', startAutoPlay);
    card.addEventListener('click', () => {
      if (window.innerWidth <= 640 && idx !== currentIndex) {
        goToIndex(idx);
        startAutoPlay();
      }
    });
  });

  // Touch Swipe & Mouse Drag Support
  let isPointerDown = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerEndX = 0;
  let pointerEndY = 0;
  const SWIPE_THRESHOLD = 35;

  // Touch Swipe Support (Mobile & Touch Devices)
  viewport.addEventListener('touchstart', (e) => {
    stopAutoPlay();
    pointerStartX = e.changedTouches[0].clientX;
    pointerStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    pointerEndX = e.changedTouches[0].clientX;
    pointerEndY = e.changedTouches[0].clientY;
    const diffX = pointerEndX - pointerStartX;
    const diffY = pointerEndY - pointerStartY;

    // Only swipe if movement is predominantly horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // Mouse Drag Support (Desktop)
  viewport.addEventListener('mousedown', (e) => {
    // Avoid triggering drag if user clicked interactive elements
    if (e.target.closest('button, a, input, textarea, select')) return;
    isPointerDown = true;
    stopAutoPlay();
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    pointerEndX = e.clientX;
    pointerEndY = e.clientY;
    track.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown) return;
    pointerEndX = e.clientX;
    pointerEndY = e.clientY;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    track.classList.remove('is-dragging');

    const diffX = pointerEndX - pointerStartX;
    const diffY = pointerEndY - pointerStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  });

  // Natural, continuous one-card-at-a-time wheel / trackpad scroll
  // Root cause resolved: Trackpad/wheel momentum streams fire high delta numbers across dozens of events.
  // By analyzing gesture onset, sign change, and momentum decay (derivative inflection):
  // 1. A single scroll gesture (short or large) triggers exactly ONE card advance at gesture onset.
  // 2. Trailing inertia / deceleration within the same stroke is recognized and absorbed (never jumps to the last card).
  // 3. Repeated rapid scrolls or deliberate continuous scrolling each detect new intentional pushes and advance cards sequentially.
  // 4. No mouse movement or gesture reset is ever required.
  let lastWheelTime = 0;
  let prevAbsDelta = 0;
  let gestureActive = false;
  let gestureDecaying = false;
  let gestureDirection = 0;

  viewport.addEventListener('wheel', (e) => {
    // If scrolling vertically inside a scrollable review text (.review-body)
    const scrollableBody = e.target.closest('.review-body');
    if (scrollableBody && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const isScrollable = scrollableBody.scrollHeight > scrollableBody.clientHeight;
      if (isScrollable) {
        const atTop = scrollableBody.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = (scrollableBody.scrollTop + scrollableBody.clientHeight >= scrollableBody.scrollHeight - 1) && e.deltaY > 0;
        if (!atTop && !atBottom) {
          return;
        }
      }
    }

    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const rawDelta = isHorizontal ? e.deltaX : (e.shiftKey ? e.deltaY : e.deltaY);

    if (Math.abs(rawDelta) < 3) return;

    e.preventDefault();
    stopAutoPlay();

    const now = performance.now();
    const timeDelta = now - lastWheelTime;
    lastWheelTime = now;

    const currentSign = rawDelta > 0 ? 1 : -1;
    const absDelta = Math.abs(rawDelta);

    // If gap between events exceeds 80ms, it's a completely new gesture
    if (timeDelta > 80) {
      gestureActive = false;
      gestureDecaying = false;
      prevAbsDelta = 0;
    }

    // Direction reversal immediately begins a new gesture in opposite direction
    if (currentSign !== gestureDirection) {
      gestureActive = false;
      gestureDecaying = false;
      gestureDirection = currentSign;
    }

    // Check for a new user acceleration (subsequent flick during continuous scrolling)
    // If inertia was decaying and delta suddenly spikes up significantly, it's an intentional new stroke
    const isNewIntentionalPush = gestureDecaying && (absDelta > prevAbsDelta * 1.5 && absDelta > 14);

    if (!gestureActive || isNewIntentionalPush) {
      // First event of a gesture (or intentional new stroke during continuous scroll):
      gestureActive = true;
      gestureDecaying = false;
      gestureDirection = currentSign;

      // Advance or move back by strictly ONE card
      if (currentSign > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      // Inside an ongoing momentum stream:
      // Mark as decaying when deltas start dropping
      if (absDelta < prevAbsDelta) {
        gestureDecaying = true;
      }
    }

    prevAbsDelta = absDelta;
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
