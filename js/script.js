(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stackQuery = window.matchMedia('(max-width: 600px)');

  /* THEME TOGGLE ------------------------------------------------ */
  var themeToggle = document.getElementById('themeToggle');

  function setThemeLabel() {
    if (!themeToggle) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }

  function toggleTheme() {
    var html = document.documentElement;
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('jokiberes-theme', next);
    setThemeLabel();
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  setThemeLabel();

  /* LOADER ------------------------------------------------------ */
  var loader = document.getElementById('loader');
  var loadStart = Date.now();

  function hideLoader() {
    if (!loader || loader.classList.contains('hidden')) return;
    var wait = reduceMotion ? 0 : Math.max(0, 400 - (Date.now() - loadStart));
    setTimeout(function () { loader.classList.add('hidden'); }, wait);
  }

  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 4000);

  /* NAVBAR ------------------------------------------------------ */
  var navbar = document.getElementById('navbar');
  var navLinks = document.getElementById('navLinks');
  var hamburger = document.getElementById('hamburger');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  if (navLinks && hamburger) {
    hamburger.addEventListener('click', function () {
      setMenu(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (navLinks.classList.contains('open')) {
        setMenu(false);
        hamburger.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('open')) return;
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
    });

    stackQuery.addEventListener('change', function (e) {
      if (!e.matches) setMenu(false);
    });
  }

  /* SCROLL SPY -------------------------------------------------- */
  if (navLinks) {
    var navAnchors = navLinks.querySelectorAll('a[href^="#"]');
    var spySections = [];
    navAnchors.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec) spySections.push({ link: a, section: sec });
    });

    if (spySections.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spySections.forEach(function (item) {
            item.link.classList.toggle('active', item.section === entry.target);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      spySections.forEach(function (item) { spy.observe(item.section); });
    }
  }

  /* SCROLL REVEAL ----------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (r) { obs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  }

  /* COUNTERS ---------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = target * (1 - Math.pow(1 - progress, 3));
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.count[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { countObs.observe(c); });
  }

  /* LIGHTBOX ---------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastTrigger = null;

  function openLightbox(trigger) {
    var img = trigger.querySelector('img');
    if (!img || !lightbox) return;
    lastTrigger = trigger;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || 'Screenshot testimoni';
    lightbox.hidden = false;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
    }, 300);
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.testi-thumb').forEach(function (trigger) {
    trigger.addEventListener('click', function () { openLightbox(trigger); });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* TESTIMONIAL SLIDER ------------------------------------------ */
  var slider = document.getElementById('testiSlider');
  var track = document.getElementById('testiTrack');
  var dotsContainer = document.getElementById('sliderDots');
  var prevBtn = document.getElementById('testiPrev');
  var nextBtn = document.getElementById('testiNext');

  if (slider && track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll('.testi-card'));
    var current = 0;
    var timer = null;

    function isStacked() { return stackQuery.matches; }

    function buildDots() {
      dotsContainer.innerHTML = '';
      cards.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot-indicator' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Tampilkan testimoni ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i, true); });
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      var dots = dotsContainer.children;
      for (var i = 0; i < dots.length; i++) {
        var active = i === current;
        dots[i].classList.toggle('active', active);
        dots[i].setAttribute('aria-current', active ? 'true' : 'false');
      }
    }

    function goTo(index, userAction) {
      if (isStacked() || !cards.length) {
        current = 0;
        track.style.transform = '';
        updateDots();
        return;
      }
      var total = cards.length;
      current = ((index % total) + total) % total;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
      var offset = current * (cards[0].offsetWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
      if (userAction) restartAuto();
    }

    function startAuto() {
      if (reduceMotion || isStacked() || timer) return;
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    function stopAuto() {
      clearInterval(timer);
      timer = null;
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }

    buildDots();
    goTo(0);
    startAuto();

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    slider.addEventListener('focusin', stopAuto);
    slider.addEventListener('focusout', startAuto);

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, true); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    window.addEventListener('resize', function () { goTo(current); });
    stackQuery.addEventListener('change', function () { goTo(0); });

    slider.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('aria-live', 'polite');
  }

  /* FAQ --------------------------------------------------------- */
  var faqButtons = document.querySelectorAll('.faq-q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('active');
        var q = i.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* CONTACT FORM ------------------------------------------------ */
  var form = document.getElementById('consultForm');
  var deadlineInput = document.getElementById('fdeadline');

  if (deadlineInput) {
    var today = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    deadlineInput.min = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = document.getElementById('fname').value.trim();
      var task = document.getElementById('ftask').value;
      var deadline = document.getElementById('fdeadline').value;
      var notes = document.getElementById('fnotes').value.trim();
      var msg = 'Halo Jokiberes.id! 👋\n\nSaya mau konsultasi:\n\n• Nama: ' + name +
        '\n• Jenis Tugas: ' + task +
        '\n• Deadline: ' + (deadline || 'Belum ditentukan') +
        '\n• Keterangan: ' + (notes || '-') +
        '\n\nMohon info lebih lanjut, terima kasih!';
      window.open('https://wa.me/6285784745749?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }
})();
