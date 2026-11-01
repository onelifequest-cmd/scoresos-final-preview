/**
 * Score OS — Dark Dot Swarm Preview
 * Three.js particle swarm that forms SCORE OS → 580 → 760 → BUILT TO FUND,
 * Slot-mounted hero with light bloom, cursor magnetism, scroll morphs.
 * Preview only. Illustrative / CROA-safe.
 */
import * as THREE from 'three';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

const FEATURES = [
  { name: 'Credit Monitoring', desc: 'Real-time 3-bureau credit monitoring built in, so you and your clients always know the score.', num: 3, suffix: ' bureaus' },
  { name: 'Agency CRM', desc: 'Manage leads, clients, documents, and notes in one command center built for high-volume agencies.', num: 1, suffix: ' command center' },
  { name: 'Marketing', desc: 'Built-in marketing tools to capture leads and turn them into signed, paying clients.', num: 1, suffix: ' growth engine' },
  { name: 'Free Website', desc: 'A professional, conversion-ready website included free — your agency online and taking leads in minutes.', num: 1, suffix: ' site included' },
  { name: '3-Bureau Tracking', desc: 'Track disputes across Equifax, Experian, and TransUnion on one live scoreboard — no more spreadsheets.', num: 3, suffix: ' bureaus live' },
  { name: 'AI Dispute Engine', desc: 'Maxine reads each credit report and drafts unique, non-templated letters the bureaus can\'t auto-reject.', num: 1, suffix: ' Maxine AI' },
  { name: 'White-Label Portal', desc: 'Your logo, your colors, your brand. Clients log into a premium portal that looks like you built it yourself.', num: 100, suffix: '% your brand' },
  { name: '2-Way Messaging', desc: 'Secure two-way chat keeps every client conversation inside the platform, off your personal phone.', num: 2, suffix: '-way chat' },
  { name: 'Booking Calendar', desc: 'Let clients book consultations around the clock with a built-in scheduling calendar.', num: 24, suffix: '/7 booking' },
  { name: 'Mentorship', desc: 'Learn from operators who\'ve scaled — ongoing mentorship to help you grow your agency faster.', num: 1, suffix: ' mentorship path' },
  { name: 'Community', desc: 'Join a private community of credit repair owners leveling up and sharing wins together.', num: 1, suffix: ' private community' },
  { name: 'Training Videos', desc: 'A full library of training videos to onboard fast and master every play in the platform.', num: 1, suffix: ' training library' },
  { name: 'Support System', desc: 'A built-in support system so you\'re never stuck — real help exactly when you need it.', num: 1, suffix: ' support system' },
  { name: 'Tons of Automations', desc: 'Smart automations handle the busywork — follow-ups, progress updates, and reminders on autopilot.', num: 1, suffix: ' autopilot' },
];

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 720;
const COUNT = reduced ? 700 : (isMobile ? 4500 : 14000);

/* ---------- Shape sampling ---------- */
function samplePixels(drawFn, count, worldW = 11, worldH = 4.2) {
  const W = 640;
  const H = 280;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  drawFn(ctx, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;
  const hits = [];
  const step = isMobile ? 3 : 2;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4] > 140) {
        hits.push([
          ((x / W) - 0.5) * worldW,
          -((y / H) - 0.5) * worldH,
        ]);
      }
    }
  }
  if (!hits.length) {
    for (let i = 0; i < count; i++) {
      hits.push([(Math.random() - 0.5) * worldW, (Math.random() - 0.5) * worldH]);
    }
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = hits[(i * 97 + (i * 13) % hits.length) % hits.length];
    const j = i * 3;
    out[j] = p[0] + (Math.random() - 0.5) * 0.04;
    out[j + 1] = p[1] + (Math.random() - 0.5) * 0.04;
    out[j + 2] = (Math.random() - 0.5) * 0.55;
  }
  return out;
}

function textDraw(text, size = 92, tracking = 0) {
  return (ctx, W, H) => {
    ctx.font = `800 ${size}px Syne, Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (tracking) {
      const chars = [...text];
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
      let x = W / 2 - total / 2;
      chars.forEach((ch, i) => {
        ctx.fillText(ch, x + widths[i] / 2, H / 2);
        x += widths[i] + tracking;
      });
    } else {
      ctx.fillText(text, W / 2, H / 2);
    }
  };
}

function gaugeDraw(ctx, W, H) {
  ctx.translate(W / 2, H / 2 + 10);
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 0, 95, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, 0, 60, Math.PI * 0.75, Math.PI * 1.85);
  ctx.stroke();
  ctx.font = '800 54px Syne, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('760', 0, 8);
}

function chartDraw(ctx, W, H) {
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  const pts = [[40, 220], [100, 200], [160, 190], [220, 150], [280, 145], [340, 100], [400, 95], [460, 55], [520, 48], [580, 28]];
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  pts.forEach(([x, y], i) => {
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function skylineDraw(ctx, W, H) {
  const bars = [70, 110, 150, 200, 130, 170];
  const gap = 18;
  const bw = (W - gap * (bars.length + 1)) / bars.length;
  bars.forEach((h, i) => {
    const x = gap + i * (bw + gap);
    const y = H - 30 - h;
    ctx.fillRect(x, y, bw, h);
  });
}

/* ---------- Swarm engine ---------- */
const canvas = document.getElementById('swarm-canvas');
const slot = document.getElementById('wave-swarm-slot');
const root = slot;
const labelEl = document.getElementById('formation-label');
const tagEl = document.getElementById('formation-tag');

function slotSize() {
  const w = Math.max(320, slot?.clientWidth || canvas?.clientWidth || 640);
  const h = Math.max(240, slot?.clientHeight || canvas?.clientHeight || 360);
  return { w, h };
}

function initSwarm() {
  if (!canvas || !slot) return;
  if (reduced) {
    if (tagEl) tagEl.textContent = 'Demo · static frame (reduced motion)';
    if (labelEl) labelEl.textContent = 'SCORE OS';
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  const { w: sw0, h: sh0 } = slotSize();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
  renderer.setSize(sw0, sh0, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, sw0 / sh0, 0.1, 80);
  camera.position.set(0, 0.15, 9.2);

  const mouse = new THREE.Vector2(10, 10); // offscreen until first move
  const mouseSmooth = new THREE.Vector2(10, 10);
  const mouseWorld = new THREE.Vector3();
  let hasPointer = false;

  function setPointer(clientX, clientY) {
    hasPointer = true;
    const r = slot.getBoundingClientRect();
    const x = (clientX - r.left) / Math.max(1, r.width);
    const y = (clientY - r.top) / Math.max(1, r.height);
    mouse.x = x * 2 - 1;
    mouse.y = -(y * 2 - 1);
  }
  slot.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
  slot.addEventListener('pointerenter', (e) => setPointer(e.clientX, e.clientY), { passive: true });
  slot.addEventListener('touchmove', (e) => {
    if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  const formations = {
    wordmark: samplePixels(textDraw('SCORE OS', isMobile ? 64 : 96, isMobile ? 4 : 10), COUNT, isMobile ? 8.2 : 12, isMobile ? 2.8 : 3.6),
    scoreLow: samplePixels(textDraw('580', isMobile ? 120 : 150), COUNT, 8.5, 4.2),
    scoreHigh: samplePixels(textDraw('760', isMobile ? 120 : 150), COUNT, 8.5, 4.2),
    funded: samplePixels(textDraw(isMobile ? 'BUILT TO FUND' : 'BUILT TO FUND', isMobile ? 42 : 68, isMobile ? 2 : 6), COUNT, isMobile ? 9.2 : 13.2, isMobile ? 2.6 : 3.4),
    gauge: samplePixels(gaugeDraw, COUNT, 8.5, 5.2),
    chart: samplePixels(chartDraw, COUNT, 11, 5),
    skyline: samplePixels(skylineDraw, COUNT, 11, 5),
    cloud: (() => {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const j = i * 3;
        const r = Math.pow(Math.random(), 0.55) * 4.8;
        const th = Math.random() * Math.PI * 2;
        const ph = (Math.random() - 0.5) * Math.PI;
        a[j] = Math.cos(th) * Math.cos(ph) * r;
        a[j + 1] = Math.sin(ph) * r * 0.55;
        a[j + 2] = Math.sin(th) * Math.cos(ph) * r * 0.7;
      }
      return a;
    })(),
  };

  const positions = new Float32Array(COUNT * 3);
  const targets = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);

  const green = new THREE.Color('#2fd46a');
  const gold = new THREE.Color('#f0c94a');
  const white = new THREE.Color('#eef7f1');

  for (let i = 0; i < COUNT; i++) {
    const j = i * 3;
    positions[j] = (Math.random() - 0.5) * 16;
    positions[j + 1] = (Math.random() - 0.5) * 9;
    positions[j + 2] = (Math.random() - 0.5) * 6;
    targets[j] = formations.cloud[j];
    targets[j + 1] = formations.cloud[j + 1];
    targets[j + 2] = formations.cloud[j + 2];
    seeds[i] = Math.random();
    const pick = seeds[i];
    const c = pick > 0.78 ? gold : pick > 0.22 ? green : white;
    colors[j] = c.r; colors[j + 1] = c.g; colors[j + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uSize: { value: isMobile ? 32 : 48 },
    },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSize;
      varying float vAlpha;
      varying vec3 vColor;
      void main(){
        vColor = color;
        vec3 p = position;
        // tiny idle shimmer so formed words feel alive
        p.x += sin(uTime * 1.3 + aSeed * 6.28) * 0.012;
        p.y += cos(uTime * 1.1 + aSeed * 4.1) * 0.012;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = max(1.0, -mv.z);
        gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.85) / dist;
        vAlpha = 0.55 + aSeed * 0.45;
      }
    `,
    fragmentShader: /* glsl */`
      varying float vAlpha;
      varying vec3 vColor;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float r = length(uv);
        if (r > 0.5) discard;
        float core = smoothstep(0.5, 0.0, r);
        float glow = exp(-r * 5.6) * 0.95;
        float a = vAlpha * (core * 0.95 + glow * 0.35);
        gl_FragColor = vec4(vColor * (0.75 + glow), a);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let composer = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(slot.clientWidth || 640, slot.clientHeight || 360),
      isMobile ? 0.22 : 0.32,
      0.4,
      0.28,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch (err) {
    console.warn('Bloom unavailable, falling back to raw renderer', err);
    composer = null;
  }

  function setFormation(key, label, tag) {
    const src = formations[key] || formations.cloud;
    for (let i = 0; i < COUNT * 3; i++) targets[i] = src[i];
    if (labelEl && label != null) labelEl.textContent = label;
    if (tagEl && tag) tagEl.textContent = tag;
  }

  // Hero sequence: cloud → SCORE OS → 580 → 760 → BUILT TO FUND → loop gently
  const heroSequence = [
    { key: 'cloud', label: 'SCORE OS', tag: 'Demo · move your cursor through the swarm', hold: 0.7 },
    { key: 'wordmark', label: 'SCORE OS', tag: 'Demo · SCORE OS wordmark', hold: 3.2 },
    { key: 'cloud', label: 'SCORE OS', tag: 'Demo · swarm dissolving', hold: 0.5 },
    { key: 'scoreLow', label: '580', tag: 'Demo climb · sample start · not a result', hold: 2.3 },
    { key: 'scoreHigh', label: '760', tag: 'Demo climb · sample destination · not a guarantee', hold: 2.6 },
    { key: 'cloud', label: '760', tag: 'Demo · swarm dissolving', hold: 0.5 },
    { key: 'funded', label: 'BUILT TO FUND', tag: 'Demo · CROA-safe · no funding promise', hold: 3.2 },
  ];
  let seqIndex = 0;
  let seqTimer = 0;
  let heroMode = true;
  setFormation(heroSequence[0].key, heroSequence[0].label, heroSequence[0].tag);

  window.__swarmForce = (key, label, tag) => {
    heroMode = false;
    setFormation(key, label || key.toUpperCase(), tag || 'Demo · illustrative');
  };
  window.__swarmHero = () => {
    heroMode = true;
    seqIndex = 0;
    seqTimer = 0;
    setFormation(heroSequence[0].key, heroSequence[0].label, heroSequence[0].tag);
  };

  // Scroll morphs override hero loop when past hero
  const sectionKeys = [
    { id: 'scoreboard', key: 'gauge', label: '760', tag: 'Scoreboard · demo gauge · illustrative' },
    { id: 'arsenal', key: 'chart', label: 'ARSENAL', tag: 'Rising progress chart · sample UI' },
    { id: 'funding', key: 'skyline', label: 'CAPITAL', tag: 'Funding skyline · not an offer' },
    { id: 'pricing', key: 'wordmark', label: 'SCORE OS', tag: 'Pricing · Agency $199 · DIY $49.99' },
  ];
  let activeSection = null;

  function updateScrollFormation() {
    const y = window.scrollY;
    const heroH = Math.max(400, window.innerHeight * 0.85);
    if (y < heroH * 0.55) {
      if (!heroMode) {
        heroMode = true;
        seqIndex = 0;
        seqTimer = 0;
        setFormation(heroSequence[0].key, heroSequence[0].label, heroSequence[0].tag);
      }
      activeSection = null;
      return;
    }
    heroMode = false;
    let chosen = null;
    for (const s of sectionKeys) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.65 && r.bottom > window.innerHeight * 0.2) {
        chosen = s;
      }
    }
    if (chosen && chosen.id !== activeSection) {
      activeSection = chosen.id;
      setFormation(chosen.key, chosen.label, chosen.tag);
    }
  }
  window.addEventListener('scroll', updateScrollFormation, { passive: true });

  const posAttr = geo.getAttribute('position');
  const lerpBase = isMobile ? 0.14 : 0.11;
  const repelR = isMobile ? 1.4 : 1.9;
  const repelForce = isMobile ? 0.12 : 0.16;

  function onResize() {
    const { w, h } = slotSize();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    mat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(slot);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    mouseSmooth.lerp(mouse, 0.12);
    // Project pointer into approx world plane at z=0
    mouseWorld.set(mouseSmooth.x * 5.8, mouseSmooth.y * 3.2, 0);

    if (heroMode) {
      seqTimer += dt;
      const cur = heroSequence[seqIndex];
      if (seqTimer > cur.hold) {
        seqTimer = 0;
        seqIndex = (seqIndex + 1) % heroSequence.length;
        const next = heroSequence[seqIndex];
        setFormation(next.key, next.label, next.tag);
      }
    }

    // Fast lerp-to-target + magnetic cursor swirl (keeps 60fps on soft GL)
    const ease = 1 - Math.pow(1 - lerpBase, dt * 60);
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      let px = positions[j];
      let py = positions[j + 1];
      let pz = positions[j + 2];
      const tx = targets[j];
      const ty = targets[j + 1];
      const tz = targets[j + 2];
      px += (tx - px) * ease;
      py += (ty - py) * ease;
      pz += (tz - pz) * ease;
      if (hasPointer) {
        const dx = px - mouseWorld.x;
        const dy = py - mouseWorld.y;
        const d = Math.sqrt(dx * dx + dy * dy + 0.0001);
        if (d < repelR) {
          const f = (1 - d / repelR) * repelForce;
          px += (dx / d) * f + (-dy / d) * f * 0.7;
          py += (dy / d) * f + (dx / d) * f * 0.7;
        }
      }
      // residual swirl velocity for fluid feel
      px += velocities[j];
      py += velocities[j + 1];
      velocities[j] *= 0.86;
      velocities[j + 1] *= 0.86;
      if (hasPointer) {
        const dx = px - mouseWorld.x;
        const dy = py - mouseWorld.y;
        const d = Math.sqrt(dx * dx + dy * dy + 0.0001);
        if (d < repelR) {
          const f = (1 - d / repelR) * 0.035;
          velocities[j] += (-dy / d) * f;
          velocities[j + 1] += (dx / d) * f;
        }
      }
      positions[j] = px;
      positions[j + 1] = py;
      positions[j + 2] = pz;
    }
    posAttr.needsUpdate = true;

    mat.uniforms.uTime.value = t;
    camera.position.x = mouseSmooth.x * 0.25;
    camera.position.y = 0.15 + mouseSmooth.y * 0.12;
    camera.lookAt(0, 0.05, 0);

    if (composer) composer.render();
    else renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

initSwarm();
