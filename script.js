// ── STARS ──────────────────────────────────────────
const starsC = document.getElementById('stars-canvas');
const sCtx   = starsC.getContext('2d');
let stars = [];

function resizeStars() {
  starsC.width  = window.innerWidth;
  starsC.height = window.innerHeight;
  stars = Array.from({length: 220}, () => ({
    x: Math.random() * starsC.width,
    y: Math.random() * starsC.height,
    r: Math.random() * 1.6 + 0.3,
    a: Math.random(),
    da: (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
  }));
}

function drawStars() {
  sCtx.clearRect(0, 0, starsC.width, starsC.height);
  stars.forEach(s => {
    s.a += s.da;
    if (s.a <= 0 || s.a >= 1) s.da *= -1;
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255,248,200,${s.a})`;
    sCtx.fill();
  });
  requestAnimationFrame(drawStars);
}

resizeStars();
drawStars();
window.addEventListener('resize', resizeStars);

// ── FIREWORKS ──────────────────────────────────────
const fwC  = document.getElementById('fireworks-canvas');
const fCtx = fwC.getContext('2d');
fwC.width  = window.innerWidth;
fwC.height = window.innerHeight;
window.addEventListener('resize', () => {
  fwC.width  = window.innerWidth;
  fwC.height = window.innerHeight;
});

const COLORS = ['#f5c842','#ffe87c','#00c9b1','#ff8c42','#c9960c','#fff','#ff6bff','#42b8ff'];
let fireworks = [], particles = [];

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
    if (this.trail.length > 14) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    const dx = this.tx - this.x, dy = this.ty - this.y;
    if (Math.sqrt(dx*dx + dy*dy) < this.spd * 1.5) {
      this.done = true;
      this.explode();
    }
  }
  explode() {
    const n = Math.floor(Math.random() * 30 + 60);
    for (let i = 0; i < n; i++) {
      particles.push(new Particle(this.tx, this.ty, this.col));
    }
  }
  draw() {
    this.trail.forEach((p, i) => {
      const alpha = i / this.trail.length;
      fCtx.beginPath();
      fCtx.arc(p.x, p.y, 2 * alpha, 0, Math.PI * 2);
      fCtx.fillStyle = this.col;
      fCtx.globalAlpha = alpha * 0.8;
      fCtx.fill();
    });
    fCtx.globalAlpha = 1;
    fCtx.beginPath();
    fCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    fCtx.fillStyle = '#fff';
    fCtx.fill();
  }
}

class Particle {
  constructor(x, y, col) {
    this.x   = x; this.y = y;
    const a  = Math.random() * Math.PI * 2;
    const sp = Math.random() * 5 + 1.5;
    this.vx  = Math.cos(a) * sp;
    this.vy  = Math.sin(a) * sp;
    this.col = col;
    this.alpha = 1;
    this.grav  = 0.07;
    this.r     = Math.random() * 2.5 + 1;
    this.decay = Math.random() * 0.015 + 0.012;
  }
  update() {
    this.vx   *= 0.97;
    this.vy   *= 0.97;
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
  fireworks.push(new Firework());
}

function animateFireworks() {
  fCtx.fillStyle = 'rgba(10,10,26,0.18)';
  fCtx.fillRect(0, 0, fwC.width, fwC.height);

  fireworks = fireworks.filter(f => !f.done);
  fireworks.forEach(f => { f.update(); f.draw(); });

  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => { p.update(); p.draw(); });

  requestAnimationFrame(animateFireworks);
}

animateFireworks();

// Auto-launch fireworks
setInterval(launchFirework, 1100);
setTimeout(() => {
  for (let i = 0; i < 5; i++) setTimeout(launchFirework, i * 220);
}, 600);

// Click to launch
document.addEventListener('click', launchFirework);

// ── FLOATING LANTERNS ──────────────────────────────
const lanternColors = ['#f5c842','#ff8c42','#00c9b1','#ff6bff','#c9960c'];

function createLantern() {
  const wrap = document.createElement('div');
  wrap.className = 'lantern-wrap';
  const col = lanternColors[Math.floor(Math.random() * lanternColors.length)];
  wrap.style.left     = Math.random() * 95 + 'vw';
  const dur = Math.random() * 8 + 10;
  wrap.style.animationDuration = dur + 's';
  wrap.style.animationDelay   = '-' + (Math.random() * dur) + 's';

  const ln = document.createElement('div');
  ln.className = 'lantern';
  ln.style.background = col;
  ln.style.color = col;
  ln.style.animationDuration = (Math.random() * 2 + 2) + 's';

  wrap.appendChild(ln);
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), (dur + 1) * 1000);
}

for (let i = 0; i < 12; i++) setTimeout(createLantern, i * 600);
setInterval(createLantern, 1800);

// ── GOLD PARTICLES ─────────────────────────────────
function createGoldParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 5 + 3;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}vw;
    background:${Math.random() < 0.5 ? '#f5c842' : '#ffe87c'};
    animation-duration:${Math.random() * 6 + 8}s;
    animation-delay:-${Math.random() * 8}s;
    box-shadow: 0 0 6px #f5c842;
  `;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 16000);
}

for (let i = 0; i < 20; i++) setTimeout(createGoldParticle, i * 300);
setInterval(createGoldParticle, 1200);

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
        
        // Launch a spectacular fireworks burst of multiple rockets!
        for (let i = 0; i < 8; i++) {
          setTimeout(launchFirework, i * 150);
        }
      }
    });

    // Robust copy to clipboard function (works on local file:/// protocol too)
    const copyToClipboard = (text, inputEl) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for file:/// protocol and older browsers
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

    // Check query param immediately on load (without waiting for DOMContentLoaded)
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
      updateSignature(nameParam);
      // Open sidebar automatically so they know they can also create their own
      setTimeout(() => {
        sidebar.classList.add('open');
      }, 1500);
    }
  } else {
    console.error("Personalization elements not found in the DOM.");
  }
} catch (error) {
  console.error("Error in personalization script:", error);
}
