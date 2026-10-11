/* ==========================================================================
   ARYAN'S PORTFOLIO - INTERACTIVE JAVASCRIPT ENGINE
   Optimized for Responsiveness, Web Audio, Fiverr Links & Formspree Contact Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCustomCursor();
  initTypewriter();
  initNavbarScroll();
  initThemeToggle();
  initSoundToggle();
  initProjectFilters();
  initSkillBarsObserver();
  initInteractiveTerminal();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. SOUND EFFECTS (Web Audio API Synthesizer - Zero External Assets)
   -------------------------------------------------------------------------- */
let soundEnabled = false;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {
    console.warn("Audio Context init blocked until user gesture", e);
  }
}

function initSoundToggle() {
  const soundBtn = document.getElementById('soundToggle');
  if (!soundBtn) return;
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    soundBtn.setAttribute('title', soundEnabled ? 'Mute Sound' : 'Enable Sound');
    if (soundEnabled) playSound('success');
  });
}

/* --------------------------------------------------------------------------
   2. INTERACTIVE PARTICLE CANVAS WITH TOUCH & MOUSE SUPPORT
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 75);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   3. CUSTOM CURSOR (Active only on non-touch desktop screens)
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const outline = document.querySelector('.custom-cursor-outline');
  if (!dot || !outline) return;

  if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
    return;
  }

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function renderOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;
    requestAnimationFrame(renderOutline);
  }
  renderOutline();

  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .filter-btn, .theme-toggle, .sound-toggle, .feature-card, .project-card, .highlight-item, .hero-skill-badge');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      outline.style.transform = 'translate(-50%, -50%) scale(1.6)';
      outline.style.borderColor = 'var(--accent-secondary)';
      outline.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
      playSound('click');
    });
    el.addEventListener('mouseleave', () => {
      outline.style.transform = 'translate(-50%, -50%) scale(1)';
      outline.style.borderColor = 'rgba(99, 102, 241, 0.5)';
      outline.style.backgroundColor = 'transparent';
    });
  });
}

/* --------------------------------------------------------------------------
   4. TYPEWRITER EFFECT (Aryan Personalization)
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const words = [
    'Full-Stack Developer',
    'Custom Web App Builder',
    'Modern UI/UX Specialist',
    'Python & API Integrator'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let speed = 90;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      speed = 45;
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      speed = 85;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  type();
}

/* --------------------------------------------------------------------------
   5. NAVBAR SCROLL & MOBILE DRAWER TOGGLE
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link indicator
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileToggle && navMenu) {
    const closeMobileMenu = () => {
      navMenu.classList.remove('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
      }
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close when clicking any nav link or mobile button inside
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close when tapping outside the menu on mobile
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. THEME TOGGLE (Dark / Light)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    updateThemeIcon(newTheme);
    playSound('pop');
  });

  function updateThemeIcon(theme) {
    themeBtn.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  }
}

/* --------------------------------------------------------------------------
   7. PROJECT FILTERING
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('pop');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const categoryAttr = card.getAttribute('data-category') || '';
        const categories = categoryAttr.split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.45s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. SKILL BARS ON SCROLL ANIMATION
   -------------------------------------------------------------------------- */
function initSkillBarsObserver() {
  const skillFills = document.querySelectorAll('.skill-fill');
  if (!skillFills.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const targetWidth = fill.getAttribute('data-width');
          fill.style.width = targetWidth;
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.2 }
  );

  skillFills.forEach((fill) => observer.observe(fill));
}

/* --------------------------------------------------------------------------
   9. INTERACTIVE TERMINAL PLAYGROUND (Aryan Persona)
   -------------------------------------------------------------------------- */
function initInteractiveTerminal() {
  const input = document.getElementById('terminalInput');
  const body = document.getElementById('terminalBody');
  if (!input || !body) return;

  const commands = {
    help: 'Available commands: <span class="term-cmd-highlight">about</span>, <span class="term-cmd-highlight">skills</span>, <span class="term-cmd-highlight">projects</span>, <span class="term-cmd-highlight">fiverr</span>, <span class="term-cmd-highlight">contact</span>, <span class="term-cmd-highlight">clear</span>, <span class="term-cmd-highlight">sudo hire</span>',
    about: 'Aryan is a passionate Full-Stack Developer & Custom Web App Builder dedicated to clean code, responsive design, and rapid delivery.',
    skills: 'Core Stack: Web Development, Custom Web Applications, HTML5, CSS3, Modern JavaScript, Python, UI/UX Refactoring, RESTful API Integration.',
    projects: 'Real-World Projects: 1. Secret Chat App (Python, WebSockets, Private Messaging) | 2. Interactive School Platform (Educational Portal, UI/UX) | 3. Custom Developer Portfolio (Responsive Web App, Modern JS).',
    fiverr: 'Fiverr Profile: <a href="http://www.fiverr.com/s/61YLpVR" target="_blank" style="color:#1dbf73;text-decoration:underline;">fiverr.com/s/61YLpVR</a> - Custom web apps, responsive designs & fast delivery!',
    contact: 'Email: notevelyt@gmail.com | Fiverr: fiverr.com/s/61YLpVR | GitHub: github.com/AryanNotFound404 | X: @AryanNotPresent',
    github: 'GitHub Profile: https://github.com/AryanNotFound404',
    twitter: 'X (Twitter): https://x.com/AryanNotPresent',
    'sudo hire': '🚀 Access Granted! Preparing your custom web app for takeoff... Let\'s get in touch or hire me on Fiverr!',
    clear: '__CLEAR__'
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim().toLowerCase();
      if (!val) return;

      playSound('click');

      if (val === 'clear') {
        body.innerHTML = `
          <div class="term-line">Welcome to Aryan's interactive CLI v2.6.0.</div>
          <div class="term-line">Type <span class="term-cmd-highlight">help</span> to view commands or <span class="term-cmd-highlight">sudo hire</span>.</div>
          <div class="terminal-input-row">
            <span class="term-prompt-prefix">aryan@portfolio:~$</span>
            <input type="text" id="terminalInput" class="terminal-input" placeholder="try typing 'fiverr' or 'contact'..." autocomplete="off">
          </div>
        `;
        initInteractiveTerminal();
        return;
      }

      const output = commands[val] || `bash: command not found: ${val}. Type <span class="term-cmd-highlight">help</span> for assistance.`;

      const inputRow = input.parentElement;
      const historyLine = document.createElement('div');
      historyLine.className = 'term-line';
      historyLine.innerHTML = `<span class="term-prompt-prefix">aryan@portfolio:~$</span> ${input.value}`;

      const resLine = document.createElement('div');
      resLine.className = 'term-line';
      resLine.style.color = val === 'sudo hire' ? '#10b981' : (val === 'fiverr' ? '#1dbf73' : '#c9d1d9');
      resLine.innerHTML = output;

      body.insertBefore(historyLine, inputRow);
      body.insertBefore(resLine, inputRow);

      input.value = '';
      body.scrollTop = body.scrollHeight;
    }
  });
}

/* --------------------------------------------------------------------------
   10. CONTACT FORM (Formspree)
   -------------------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbglypae';

function initContactForm() {
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('send-btn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!form || !sendBtn) return;

  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalHtml = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = 'Sending... 🚀';

    playSound('click');

    try {
      // Build JSON payload from the form fields
      const payload = Object.fromEntries(new FormData(form).entries());
      // Formspree conventions: `name` / `email` (email is used as the reply-to address)
      if (payload.from_name) payload.name = payload.from_name;
      if (payload.reply_to) payload.email = payload.reply_to;

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        form.reset();
        if (typeof playSound === 'function') playSound('success');
        showToast('Message sent successfully! Aryan will reply to you at notevelyt@gmail.com.');
      } else {
        throw new Error(`Formspree responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showToast('Message sent! You can also email directly to notevelyt@gmail.com.');
    } finally {
      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalHtml;
      }, 3000);
    }
  });
}
