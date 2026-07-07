  // THEME TOGGLE (Dark/Light Mode)
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('jokiberes-theme', newTheme);
  }

  // Restore saved theme on load (before content renders)
  (function() {
    const savedTheme = localStorage.getItem('jokiberes-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  })();

  // LOADER
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 2000);
  });

  // CURSOR
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
  });
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animRing);
  }
  animRing();
  document.querySelectorAll('a, button, .service-card, .why-card, .faq-q').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.opacity = '0.3'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '0.5'; });
  });

  // NAVBAR
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  function toggleNav() {
    document.getElementById('navLinks').classList.toggle('open');
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
  });

  // SCROLL REVEAL
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  reveals.forEach(r => obs.observe(r));

  // Lightbox
  function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // TESTIMONIAL SLIDER
  const track = document.getElementById('testiTrack');
  const cards = track.querySelectorAll('.testi-card');
  const dotsContainer = document.getElementById('sliderDots');
  let current = 0;
  const total = cards.length;

  // Init dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'dot-indicator' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsContainer.appendChild(d);
  }

  function getCardWidth() {
    return cards[0].offsetWidth + 24;
  }

  function goTo(idx) {
  current = (idx + total) % total;
  const cardWidth = cards[0].offsetWidth + 24;
  const trackWidth = track.parentElement.offsetWidth;
  const maxScroll = track.scrollWidth - trackWidth;
  let offset = current * cardWidth;
  if (offset > maxScroll) offset = maxScroll;
  track.style.transform = `translateX(-${offset}px)`;
  document.querySelectorAll('.dot-indicator').forEach((d, i) => 
    d.classList.toggle('active', i === current)
  );
  }

  function slideTesti(dir) { goTo(current + dir); }
  setInterval(() => slideTesti(1), 5000);

  // FAQ
  function toggleFaq(el) {
    const item = el.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  }

  // FORM SUBMIT
  function submitForm() {
    const name = document.getElementById('fname').value.trim();
    const task = document.getElementById('ftask').value;
    const deadline = document.getElementById('fdeadline').value;
    const notes = document.getElementById('fnotes').value.trim();
    if (!name || !task) { alert('Mohon isi nama dan jenis tugas terlebih dahulu!'); return; }
    const msg = `Halo Jokiberes.id! 👋\n\nSaya mau konsultasi:\n\n• Nama: ${name}\n• Jenis Tugas: ${task}\n• Deadline: ${deadline || 'Belum ditentukan'}\n• Keterangan: ${notes || '-'}\n\nMohon info lebih lanjut, terima kasih!`;
    window.open(`https://wa.me/6285784745749?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // COUNTER ANIMATION
  function animateCount(el, target, suffix='') {
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const val = Math.floor(progress * target);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
