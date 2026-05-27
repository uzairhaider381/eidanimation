document.addEventListener('DOMContentLoaded', () => {
  // ── MOBILE DETECTION ──────────────────────────────
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || (window.innerWidth <= 768);

  // Reduce particle counts on mobile for performance
  const STAR_COUNT = isMobile ? 80 : 180;
  const FIREWORK_INTERVAL = isMobile ? 2400 : 1200;
  const INITIAL_BURST = isMobile ? 2 : 4;
  const LANTERN_COUNT = isMobile ? 4 : 8;
  const LANTERN_INTERVAL = isMobile ? 3500 : 2000;
  const EXPLOSION_PARTICLES = isMobile ? 25 : 50;

  // ── STARS & GOLD PARTICLES CANVAS ─────────────────
  const starsC = document.getElementById('stars-canvas');
  const sCtx   = starsC.getContext('2d');
  let stars = [];
  let goldParticles = [];
  const maxGoldParticles = isMobile ? 8 : 16;

  function resizeStars() {
    starsC.width  = window.innerWidth;
    starsC.height = window.innerHeight;
    
    // Initialize stars
    stars = Array.from({length: STAR_COUNT}, () => ({
      x: Math.random() * starsC.width,
      y: Math.random() * starsC.height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      da: (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
    }));

    // Initialize/reset gold particles
    goldParticles = Array.from({length: maxGoldParticles}, () => ({
      x: Math.random() * starsC.width,
      y: Math.random() * starsC.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.7 + 0.3),
      r: Math.random() * 1.8 + 0.8,
      col: Math.random() < 0.5 ? '#f5c842' : '#ffe87c',
      a: Math.random() * 0.8
    }));
  }

  function drawStarsAndParticles() {
    sCtx.clearRect(0, 0, starsC.width, starsC.height);
    
    // Draw twinkling stars using highly optimized rect fill instead of arc pathing
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      sCtx.fillStyle = `rgba(255, 248, 200, ${s.a})`;
      sCtx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    });

    // Update and draw gold particles on the same canvas (removes heavy DOM paint storm)
    goldParticles.forEach(gp => {
      gp.x += gp.vx;
      gp.y += gp.vy;
      
      // Fade near edges
      if (gp.y < 50) {
        gp.a -= 0.01;
      } else if (gp.a < 0.8) {
        gp.a += 0.01;
      }
      
      // Reset if out of screen
      if (gp.y < -10 || gp.a <= 0 || gp.x < 0 || gp.x > starsC.width) {
        gp.x = Math.random() * starsC.width;
        gp.y = starsC.height + 10;
        gp.vx = (Math.random() - 0.5) * 0.3;
        gp.vy = -(Math.random() * 0.7 + 0.3);
        gp.a = 0;
      }
      
      sCtx.fillStyle = gp.col;
      sCtx.globalAlpha = Math.max(0, gp.a);
      sCtx.fillRect(gp.x - gp.r, gp.y - gp.r, gp.r * 2, gp.r * 2);
    });
    sCtx.globalAlpha = 1.0;
    
    requestAnimationFrame(drawStarsAndParticles);
  }

  resizeStars();
  drawStarsAndParticles();

  // ── FIREWORKS ──────────────────────────────────────
  const fwC  = document.getElementById('fireworks-canvas');
  const fCtx = fwC.getContext('2d');
  fwC.width  = window.innerWidth;
  fwC.height = window.innerHeight;

  const COLORS = ['#f5c842','#ffe87c','#00c9b1','#ff8c42','#c9960c','#fff','#ff6bff','#42b8ff'];
  let fireworks = [], particles = [];
  let isFireworksAnimationRunning = false;

  class Firework {
    constructor() {
      this.x    = Math.random() * fwC.width * 0.8 + fwC.width * 0.1;
      this.y    = fwC.height;
      this.tx   = Math.random() * fwC.width * 0.7 + fwC.width * 0.15;
      this.ty   = Math.random() * fwC.height * 0.45 + 60;
      this.spd  = Math.random() * 5 + 10;
      this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.done = false;
      const dx  = this.tx - this.x, dy = this.ty - this.y;
      const d   = Math.sqrt(dx*dx + dy*dy);
      this.vx   = dx / d * this.spd;
      this.vy   = dy / d * this.spd;
      this.trail = [];
    }
    update() {
      this.trail.push({x: this.x, y: this.y});
      if (this.trail.length > 8) this.trail.shift(); // Reduced trail buffer from 14 to 8 for speed
      this.x += this.vx; this.y += this.vy;
      const dx = this.tx - this.x, dy = this.ty - this.y;
      if (Math.sqrt(dx*dx + dy*dy) < this.spd * 1.5) {
        this.done = true;
        this.explode();
      }
    }
    draw() {
      this.trail.forEach((p, i) => {
        const alpha = i / this.trail.length;
        fCtx.beginPath();
        fCtx.arc(p.x, p.y, 1.5 * alpha, 0, Math.PI * 2);
        fCtx.fillStyle = this.col;
        fCtx.globalAlpha = alpha * 0.6;
        fCtx.fill();
      });
      fCtx.globalAlpha = 1;
      fCtx.beginPath();
      fCtx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      fCtx.fillStyle = '#fff';
      fCtx.fill();
    }
    explode() {
      const n = Math.floor(Math.random() * (EXPLOSION_PARTICLES / 2) + EXPLOSION_PARTICLES);
      for (let i = 0; i < n; i++) {
        particles.push(new Particle(this.tx, this.ty, this.col));
      }
    }
  }

  class Particle {
    constructor(x, y, col) {
      this.x   = x; this.y = y;
      const a  = Math.random() * Math.PI * 2;
      const sp = Math.random() * 4 + 1.2;
      this.vx  = Math.cos(a) * sp;
      this.vy  = Math.sin(a) * sp;
      this.col = col;
      this.alpha = 1;
      this.grav  = 0.06;
      this.r     = Math.random() * 2 + 0.8;
      this.decay = Math.random() * 0.016 + 0.014;
    }
    update() {
      this.vx   *= 0.96;
      this.vy   *= 0.96;
      this.vy   += this.grav;
      this.x    += this.vx;
      this.y    += this.vy;
      this.alpha -= this.decay;
    }
    draw() {
      fCtx.beginPath();
      fCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      fCtx.fillStyle = this.col;
      fCtx.globalAlpha = Math.max(0, this.alpha);
      fCtx.fill();
      fCtx.globalAlpha = 1;
    }
  }

  function launchFirework() {
    // Cap simultaneous fireworks to prevent render overload
    if (fireworks.length < (isMobile ? 3 : 6)) {
      fireworks.push(new Firework());
      startFireworksAnimation();
    }
  }

  function startFireworksAnimation() {
    if (!isFireworksAnimationRunning) {
      isFireworksAnimationRunning = true;
      animateFireworks();
    }
  }

  function animateFireworks() {
    fCtx.fillStyle = 'rgba(10,10,26,0.22)';
    fCtx.fillRect(0, 0, fwC.width, fwC.height);

    fireworks = fireworks.filter(f => !f.done);
    fireworks.forEach(f => { f.update(); f.draw(); });

    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => { p.update(); p.draw(); });

    // Performance-Saver: If no active elements, stop requestAnimationFrame loop
    if (fireworks.length === 0 && particles.length === 0) {
      isFireworksAnimationRunning = false;
      fCtx.clearRect(0, 0, fwC.width, fwC.height);
      return;
    }

    requestAnimationFrame(animateFireworks);
  }

  // Auto-launch fireworks
  const autoFireworkInterval = setInterval(launchFirework, FIREWORK_INTERVAL);
  setTimeout(() => {
    for (let i = 0; i < INITIAL_BURST; i++) {
      setTimeout(launchFirework, i * 250);
    }
  }, 500);

  // Click/Tap to launch firework (excluding UI control clicks)
  document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.sidebar')) {
      return;
    }
    launchFirework();
  });

  // Debounced resize to prevent orientation/resize spikes
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeStars();
      fwC.width  = window.innerWidth;
      fwC.height = window.innerHeight;
    }, 150);
  });

  // ── FLOATING LANTERNS ──────────────────────────────
  const lanternColors = ['#f5c842','#ff8c42','#00c9b1','#ff6bff','#c9960c'];
  let activeLanterns = 0;

  function createLantern() {
    if (activeLanterns >= LANTERN_COUNT) return;
    
    activeLanterns++;
    const wrap = document.createElement('div');
    wrap.className = 'lantern-wrap';
    const col = lanternColors[Math.floor(Math.random() * lanternColors.length)];
    wrap.style.left = Math.random() * 92 + 'vw';
    const dur = Math.random() * 8 + 12;
    wrap.style.animationDuration = dur + 's';
    
    // Spread starting points dynamically
    wrap.style.animationDelay = '-' + (Math.random() * dur) + 's';

    const ln = document.createElement('div');
    ln.className = 'lantern';
    ln.style.background = col;
    ln.style.color = col;
    ln.style.animationDuration = (Math.random() * 2 + 2) + 's';

    wrap.appendChild(ln);
    document.body.appendChild(wrap);
    
    setTimeout(() => {
      wrap.remove();
      activeLanterns--;
    }, (dur + 1) * 1000);
  }

  for (let i = 0; i < LANTERN_COUNT; i++) {
    setTimeout(createLantern, i * 800);
  }
  const lanternInterval = setInterval(createLantern, LANTERN_INTERVAL);

  // ── PERSONALIZATION LOGIC ─────────────────────────
  try {
    const sidebar = document.getElementById('personalization-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const generateBtn = document.getElementById('generate-btn');
    const usernameInput = document.getElementById('username-input');
    const shareSection = document.getElementById('share-section');
    const shareUrlInput = document.getElementById('share-url-input');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
    const signature = document.getElementById('sender-signature');

    if (sidebar && toggleBtn && closeBtn && generateBtn && usernameInput && signature) {
      console.log("Personalization system initialized successfully.");

      // Toggle Sidebar
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.remove('open');
      });

      // Close sidebar when clicking outside of it
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
          sidebar.classList.remove('open');
        }
      });

      // Prevent clicks inside the sidebar from closing it or launching fireworks
      sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Update Signature Display
      const updateSignature = (name) => {
        if (name && name.trim() !== '') {
          const sanitizedName = name.trim();
          signature.innerHTML = `from <span>${sanitizedName}</span>`;
          signature.style.display = 'block';
          
          // Auto populate input
          usernameInput.value = sanitizedName;
        } else {
          signature.style.display = 'none';
        }
      };

      // Generate shareable link
      const generateShareLink = (name) => {
        const currentUrl = window.location.href.split('?')[0];
        const shareUrl = `${currentUrl}?name=${encodeURIComponent(name)}`;
        shareUrlInput.value = shareUrl;
        
        // Custom WhatsApp message
        const whatsappMsg = `Eid Mubarak! 🌙✨ ${name} sent you a beautiful animated Eid greeting! Open it here: ${shareUrl}`;
        whatsappShareBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;
        
        shareSection.classList.add('show');
      };

      // Handle Generate Button Click
      generateBtn.addEventListener('click', () => {
        const name = usernameInput.value;
        if (name && name.trim() !== '') {
          updateSignature(name);
          generateShareLink(name.trim());
          
          // Launch a spectacular fireworks burst
          const burstCount = isMobile ? 3 : 6;
          for (let i = 0; i < burstCount; i++) {
            setTimeout(launchFirework, i * 180);
          }
        }
      });

      // Robust copy to clipboard function (works on mobile + file:/// protocol)
      const copyToClipboard = (text, inputEl) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text);
        } else {
          // Fallback for mobile browsers and file:/// protocol
          inputEl.select();
          inputEl.setSelectionRange(0, 99999);
          try {
            const successful = document.execCommand('copy');
            return successful ? Promise.resolve() : Promise.reject(new Error('Copy command failed'));
          } catch (err) {
            return Promise.reject(err);
          }
        }
      };

      // Copy link to clipboard
      copyLinkBtn.addEventListener('click', () => {
        copyToClipboard(shareUrlInput.value, shareUrlInput).then(() => {
          // Temporary visual success state
          const originalText = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '✓';
          copyLinkBtn.style.borderColor = '#25d366';
          copyLinkBtn.style.color = '#25d366';
          setTimeout(() => {
            copyLinkBtn.innerHTML = originalText;
            copyLinkBtn.style.borderColor = '';
            copyLinkBtn.style.color = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy. Please manually select the text and copy it.');
        });
      });

      // Check query param immediately on load
      const urlParams = new URLSearchParams(window.location.search);
      const nameParam = urlParams.get('name');
      if (nameParam) {
        updateSignature(nameParam);
        // Open sidebar automatically so they know they can also create their own
        setTimeout(() => {
          sidebar.classList.add('open');
        }, 1200);
      }
    } else {
      console.error("Personalization elements not found in the DOM.");
    }
  } catch (error) {
    console.error("Error in personalization script:", error);
  }

  // Clear timers on window unload to prevent memory leaks
  window.addEventListener('unload', () => {
    clearInterval(autoFireworkInterval);
    clearInterval(lanternInterval);
  });
});
