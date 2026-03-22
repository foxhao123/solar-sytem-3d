import * as THREE from 'three';

const W = 512, H = 256;

function makeCtx() {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  return { canvas, ctx: canvas.getContext('2d') };
}

function rng(seed = 42) {
  let s = (seed * 9301 + 49297) | 0;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// ── 太阳：橙黄渐变 + 太阳粒子/黑子 ─────────────────────
export function sunTexture() {
  const { canvas, ctx } = makeCtx();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   '#FFE050');
  grad.addColorStop(0.3, '#FFBB00');
  grad.addColorStop(0.7, '#FF9000');
  grad.addColorStop(1,   '#FFD040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const r = rng(1);
  for (let i = 0; i < 180; i++) {
    const x = r() * W, y = r() * H, rad = r() * 20 + 4;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = r() > 0.55
      ? `rgba(255,210,60,${r() * 0.3 + 0.05})`
      : `rgba(180,70,0,${r() * 0.25 + 0.05})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// ── 水星：中灰 + 陨石坑 ──────────────────────────────────
export function mercuryTexture() {
  const { canvas, ctx } = makeCtx();
  ctx.fillStyle = '#848484';
  ctx.fillRect(0, 0, W, H);
  const r = rng(2);
  for (let i = 0; i < 110; i++) {
    const x = r() * W, y = r() * H, rad = r() * 18 + 2;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = r() > 0.5
      ? `rgba(45,45,45,${r() * 0.5 + 0.1})`
      : `rgba(175,175,175,${r() * 0.3 + 0.05})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// ── 金星：硫磺奶黄 + 横向云带 ───────────────────────────
export function venusTexture() {
  const { canvas, ctx } = makeCtx();
  ctx.fillStyle = '#F0E0A0';
  ctx.fillRect(0, 0, W, H);
  const r = rng(3);
  for (let i = 0; i < 28; i++) {
    const y = r() * H, thickness = r() * 22 + 6;
    const c = r() > 0.5 ? '195,155,85' : '228,200,138';
    const g = ctx.createLinearGradient(0, y - thickness, 0, y + thickness);
    g.addColorStop(0,   `rgba(${c},0)`);
    g.addColorStop(0.5, `rgba(${c},${r() * 0.3 + 0.08})`);
    g.addColorStop(1,   `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, y - thickness, W, thickness * 2);
  }
  return new THREE.CanvasTexture(canvas);
}

// ── 地球：海洋蓝 + 大陆绿棕 + 极冠 + 云 ────────────────
export function earthTexture() {
  const { canvas, ctx } = makeCtx();
  ctx.fillStyle = '#1A6FA8';
  ctx.fillRect(0, 0, W, H);
  const r = rng(4);

  // 大陆形状（近似椭圆）
  const shapes = [
    [110, 85,  44, 52, -0.3],  // 北美
    [148, 168, 24, 40,  0.2],  // 南美
    [258, 82,  22, 28,  0.0],  // 欧洲
    [272, 152, 17, 46,  0.1],  // 非洲
    [335, 78,  62, 52,  0.1],  // 亚洲
    [398, 170, 27, 20,  0.3],  // 澳洲
    [42,  76,  14, 10,  0.0],  // 格陵兰
  ];
  shapes.forEach(([cx, cy, rx, ry, rot]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3A7A2A';
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const ox = (r() - 0.5) * rx * 1.2, oy = (r() - 0.5) * ry * 1.2;
      ctx.beginPath();
      ctx.ellipse(ox, oy, rx * (r() * 0.4 + 0.1), ry * (r() * 0.35 + 0.1), r() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = r() > 0.5 ? '#5A9A3A' : '#7A6A3A';
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });

  // 极冠
  const cap = (y, h) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(225,242,255,0.95)');
    g.addColorStop(1, 'rgba(225,242,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, h);
  };
  cap(0, 24); cap(H, -24);

  // 云层
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r() * 48 + 12);
    g.addColorStop(0, `rgba(255,255,255,${r() * 0.38 + 0.1})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 65, y - 65, 130, 130);
  }
  return new THREE.CanvasTexture(canvas);
}

// ── 火星：铁锈红橙 + 峡谷 + 极冠 ───────────────────────
export function marsTexture() {
  const { canvas, ctx } = makeCtx();
  ctx.fillStyle = '#B84020';
  ctx.fillRect(0, 0, W, H);
  const r = rng(5);
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * H, rad = r() * 30 + 4;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = r() > 0.5
      ? `rgba(65,12,0,${r() * 0.35 + 0.05})`
      : `rgba(215,118,65,${r() * 0.28 + 0.05})`;
    ctx.fill();
  }
  // 水手号峡谷
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = '#5A0E00';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.28, H * 0.48);
  ctx.bezierCurveTo(W * 0.44, H * 0.45, W * 0.6, H * 0.53, W * 0.76, H * 0.5);
  ctx.stroke();
  ctx.restore();
  // 极冠
  const cap = (y, h) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(238,244,255,0.88)');
    g.addColorStop(1, 'rgba(238,244,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, y, W, h);
  };
  cap(0, 16); cap(H, -12);
  return new THREE.CanvasTexture(canvas);
}

// ── 木星：橙棕横带 + 大红斑 ─────────────────────────────
export function jupiterTexture() {
  const { canvas, ctx } = makeCtx();
  const bands = [
    ['#C27A3A', 0.055], ['#EACB92', 0.07], ['#A85C20', 0.05],
    ['#F0D8A2', 0.08],  ['#C88040', 0.06], ['#D8A870', 0.055],
    ['#9E5618', 0.07],  ['#EAC882', 0.065],['#C27A3A', 0.06],
    ['#F2DAA4', 0.08],  ['#B86820', 0.05], ['#E0B870', 0.065],
    ['#C88040', 0.06],  ['#9E5618', 0.055],['#E0B870', 0.055],
    ['#C27A3A', 0.055],
  ];
  const total = bands.reduce((s, [, h]) => s + h, 0);
  let yy = 0;
  bands.forEach(([c, h]) => {
    const bh = (h / total) * H;
    ctx.fillStyle = c;
    ctx.fillRect(0, yy, W, bh + 1);
    yy += bh;
  });
  // 大红斑
  ctx.save();
  ctx.translate(W * 0.62, H * 0.56);
  const grs = ctx.createRadialGradient(0, 0, 3, 0, 0, 28);
  grs.addColorStop(0,   '#DD3311');
  grs.addColorStop(0.55,'#BB2200');
  grs.addColorStop(1,   'rgba(140,25,8,0)');
  ctx.fillStyle = grs;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return new THREE.CanvasTexture(canvas);
}

// ── 土星：稻草金黄横带 ───────────────────────────────────
export function saturnTexture() {
  const { canvas, ctx } = makeCtx();
  const bands = [
    ['#EAD090', 0.07], ['#D4A860', 0.06], ['#F0D898', 0.08],
    ['#C89848', 0.07], ['#EAD080', 0.09], ['#D0A858', 0.06],
    ['#F0E098', 0.08], ['#C89050', 0.07], ['#E8C882', 0.08],
    ['#F0D898', 0.07], ['#D4A860', 0.06], ['#EAD080', 0.08],
  ];
  const total = bands.reduce((s, [, h]) => s + h, 0);
  let yy = 0;
  bands.forEach(([c, h]) => {
    const bh = (h / total) * H;
    ctx.fillStyle = c;
    ctx.fillRect(0, yy, W, bh + 1);
    yy += bh;
  });
  return new THREE.CanvasTexture(canvas);
}

// ── 天王星：淡青绿渐变 + 极淡雾霾 ──────────────────────
export function uranusTexture() {
  const { canvas, ctx } = makeCtx();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   '#88E4DC');
  grad.addColorStop(0.4, '#7ADFD4');
  grad.addColorStop(0.7, '#6CD8CC');
  grad.addColorStop(1,   '#5CCFC4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const r = rng(8);
  for (let i = 0; i < 12; i++) {
    const y = r() * H;
    const g = ctx.createLinearGradient(0, y - 10, 0, y + 10);
    g.addColorStop(0,   'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(255,255,255,${r() * 0.07 + 0.02})`);
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 10, W, 20);
  }
  return new THREE.CanvasTexture(canvas);
}

// ── 海王星：钴蓝 + 风暴带 + 大暗斑 ─────────────────────
export function neptuneTexture() {
  const { canvas, ctx } = makeCtx();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   '#1A4AAA');
  grad.addColorStop(0.4, '#2255CC');
  grad.addColorStop(0.8, '#1A44BB');
  grad.addColorStop(1,   '#0E2888');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const r = rng(9);
  for (let i = 0; i < 16; i++) {
    const y = r() * H;
    const g = ctx.createLinearGradient(0, y - 12, 0, y + 12);
    g.addColorStop(0,   'rgba(100,160,255,0)');
    g.addColorStop(0.5, `rgba(100,160,255,${r() * 0.18 + 0.05})`);
    g.addColorStop(1,   'rgba(100,160,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 12, W, 24);
  }
  // 大暗斑
  ctx.save();
  ctx.translate(W * 0.38, H * 0.44);
  const gds = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
  gds.addColorStop(0, 'rgba(8,18,80,0.65)');
  gds.addColorStop(1, 'rgba(8,18,80,0)');
  ctx.fillStyle = gds;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return new THREE.CanvasTexture(canvas);
}

// ── 月球：灰色 + 月海 + 陨石坑 ──────────────────────────
export function moonTexture() {
  const { canvas, ctx } = makeCtx();
  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(0, 0, W, H);
  const r = rng(10);
  // 月海（暗色玄武岩平原）
  [
    [180, 100, 62, 50], [305, 130, 46, 38], [130, 158, 36, 30],
    [420,  90, 30, 25],
  ].forEach(([x, y, rx, ry]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, 'rgba(65,65,75,0.58)');
    g.addColorStop(1, 'rgba(65,65,75,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // 陨石坑
  for (let i = 0; i < 85; i++) {
    const x = r() * W, y = r() * H, rad = r() * 22 + 2;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = r() > 0.5
      ? `rgba(48,48,52,${r() * 0.45 + 0.05})`
      : `rgba(188,188,192,${r() * 0.3 + 0.05})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}
