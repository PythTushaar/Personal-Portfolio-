/* ═══════════════════════════════════════
   SHARED APP.JS - Tushaar Sapkota CV
═══════════════════════════════════════ */


/* ── SCROLL PROGRESS ── */
const sprog = document.getElementById('sprog');
if (sprog) {
  window.addEventListener('scroll', () => {
    const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    sprog.style.width = Math.min(p, 100) + '%';
  });
}

/* ── NAV SCROLL ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));
}

/* ── ACTIVE NAV LINK ── */
(function() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* ── BACKGROUND CANVAS (LiDAR Point Cloud Terrain) ── */
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  let points = [];
  const gridCount = 35; // 35x35 grid of points
  let angle = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Generate the 3D LiDAR terrain coordinates
  function generateTerrain() {
    points = [];
    const step = 360 / gridCount;
    for (let i = 0; i < gridCount; i++) {
      const x = -180 + i * step;
      for (let j = 0; j < gridCount; j++) {
        const y = -180 + j * step;
        // Complex terrain function (combining sine waves for natural mountain/valley shapes)
        const d = Math.sqrt(x*x + y*y);
        const z = Math.sin(x/35) * Math.cos(y/35) * 35 +
                  Math.cos(x/70) * 15 +
                  Math.sin(d/25) * 12;
        points.push({ x, y, z });
      }
    }
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, W, H);
    
    // Slow yaw rotation angle
    angle += 0.002;
    const cosYaw = Math.cos(angle);
    const sinYaw = Math.sin(angle);
    const cosPitch = Math.cos(0.75); // Fixed perspective tilt
    const sinPitch = Math.sin(0.75);

    // Project and draw point cloud
    points.forEach(p => {
      // 1. Yaw rotation (Z-axis rotation)
      const x1 = p.x * cosYaw - p.y * sinYaw;
      const y1 = p.x * sinYaw + p.y * cosYaw;

      // 2. Pitch rotation (X-axis rotation)
      const y2 = y1 * cosPitch - p.z * sinPitch;
      const z2 = y1 * sinPitch + p.z * cosPitch;

      // 3. Perspective projection
      const dist = 320; // camera distance
      const scale = dist / (dist + z2);
      const canvasX = W / 2 + x1 * scale * 1.8;
      const canvasY = H / 2 + y2 * scale * 1.5;

      // Ensure points lie within screen bounds before rendering
      if (canvasX >= 0 && canvasX <= W && canvasY >= 0 && canvasY <= H) {
        // Color mapping by height (LiDAR style elevation coloring)
        // Normalize height z to [-50, 50] range roughly for color interpolation
        const normZ = Math.max(0, Math.min(1, (p.z + 40) / 80));
        
        // Hue mapping: 220 (blue) for low, 160 (teal/green) for mid, 290 (purple) for peaks
        let hue;
        if (normZ < 0.5) {
          hue = 220 - (normZ * 2) * 60; // blue-to-teal
        } else {
          hue = 160 + ((normZ - 0.5) * 2) * 130; // teal-to-purple
        }

        // Depth/height based opacity: further away points are dimmer
        const alpha = Math.max(0.04, Math.min(0.35, scale * 0.28));
        const size = Math.max(0.8, scale * 1.5);

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 85%, 55%, ${alpha})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(drawCanvas);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  generateTerrain();
  drawCanvas();
}

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold:0.08});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>revObs.observe(el));

/* Stagger delays */
document.querySelectorAll('.skills-grid .skill-category').forEach((el,i)=>el.style.transitionDelay=(i*.1)+'s');
document.querySelectorAll('.projects-grid .project-card').forEach((el,i)=>el.style.transitionDelay=(i*.08)+'s');
document.querySelectorAll('.stat-grid .stat-card').forEach((el,i)=>el.style.transitionDelay=(i*.07)+'s');
