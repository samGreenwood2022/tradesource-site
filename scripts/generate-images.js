// Generates the original SVG artwork used by the TradeSource practice site
// (logos, product illustrations, category art, hero banner, favicon) into
// public/images/. Everything is simple geometry invented for this course, so
// there is nothing to license. Re-run after changing data.js or the palettes:
//
//   node scripts/generate-images.js

const fs = require('fs');
const path = require('path');
const data = require('../public/data.js');

const OUT = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(OUT, { recursive: true });

// --- colour helpers --------------------------------------------------------
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
function mix(hex, other, amount) {
  const a = hex.replace('#', ''), b = other.replace('#', '');
  const c = [0, 2, 4].map((i) => clamp(parseInt(a.slice(i, i + 2), 16) * (1 - amount) + parseInt(b.slice(i, i + 2), 16) * amount));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
const lighten = (hex, amt) => mix(hex, '#ffffff', amt);
const darken = (hex, amt) => mix(hex, '#000000', amt);

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const write = (name, svg) => fs.writeFileSync(path.join(OUT, name), svg.trim() + '\n');
const svgOpen = (w, h, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${extra}>`;

// --- manufacturer logos (square marks) ------------------------------------
const LOGO_MARKS = {
  // concentric rings with a swirl
  vortix: (c) => `<circle cx="60" cy="60" r="34" fill="none" stroke="#fff" stroke-width="7" opacity=".35"/>
    <circle cx="60" cy="60" r="22" fill="none" stroke="#fff" stroke-width="7" opacity=".6"/>
    <path d="M60 38a22 22 0 1 1-22 22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
  // hexagon bolt head
  ferroline: () => `<polygon points="60,28 88,44 88,76 60,92 32,76 32,44" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="60" cy="60" r="10" fill="#fff"/>`,
  // sun burst
  brightcore: () => `<circle cx="60" cy="60" r="16" fill="#fff"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="60" y1="${60 - 26}" x2="60" y2="${60 - 38}" stroke="#fff" stroke-width="7" stroke-linecap="round" transform="rotate(${a} 60 60)"/>`).join('')}`,
  // keyhole
  'halden-locks-uk': () => `<circle cx="60" cy="52" r="15" fill="#fff"/>
    <path d="M52 62h16l5 26H47z" fill="#fff"/>`,
};
data.manufacturers.forEach((m) => {
  const mark = (LOGO_MARKS[m.slug] || (() => ''))(m.color);
  write(`logo-${m.slug}.svg`, `${svgOpen(120, 120, 'role="img"')}
  <title>${esc(m.name)} logo</title>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(m.color, 0.15)}"/><stop offset="1" stop-color="${darken(m.color, 0.25)}"/></linearGradient></defs>
  <rect width="120" height="120" rx="26" fill="url(#g)"/>
  ${mark}
</svg>`);
});

// --- product illustrations ------------------------------------------------
// Line glyphs (drawn on a 48x48 grid) shown large on a colourful backdrop.
const GLYPHS = {
  vacuum: '<rect x="20" y="6" width="8" height="22" rx="3"/><path d="M14 28h20l4 10H10z"/><circle cx="16" cy="40" r="3"/><circle cx="32" cy="40" r="3"/>',
  dryer: '<rect x="12" y="8" width="24" height="30" rx="4"/><path d="M18 38v4M30 38v4"/><circle cx="24" cy="20" r="5"/>',
  tower: '<rect x="16" y="4" width="16" height="40" rx="6"/><path d="M20 14h8M20 22h8M20 30h8"/>',
  bolt: '<path d="M14 10h20l4 6-4 6H14l-4-6z"/><rect x="22" y="22" width="4" height="18"/>',
  collar: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="7"/>',
  panel: '<rect x="6" y="14" width="36" height="20" rx="2"/><path d="M6 20h36M6 28h36M16 14v20M32 14v20"/>',
  lock: '<rect x="12" y="20" width="24" height="20" rx="3"/><path d="M17 20v-6a7 7 0 0 1 14 0v6"/><circle cx="24" cy="30" r="2"/>',
  closer: '<rect x="8" y="16" width="32" height="10" rx="3"/><path d="M40 21l-6 14M8 21h-4"/>',
};
data.products.forEach((p, i) => {
  const m = data.manufacturers.find((x) => x.slug === p.manufacturerSlug);
  const c = m.color;
  const shift = (i % 3) * 40;
  write(`product-${p.slug}.svg`, `${svgOpen(400, 300, 'role="img"')}
  <title>${esc(p.name)}</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c, 0.55)}"/><stop offset="1" stop-color="${lighten(c, 0.15)}"/></linearGradient>
    <linearGradient id="disc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c, 0.1)}"/><stop offset="1" stop-color="${darken(c, 0.3)}"/></linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="${60 + shift}" cy="50" r="90" fill="#fff" opacity=".18"/>
  <circle cx="${360 - shift}" cy="270" r="110" fill="${c}" opacity=".18"/>
  <rect x="-20" y="214" width="440" height="100" fill="${darken(c, 0.15)}" opacity=".12"/>
  <circle cx="200" cy="140" r="86" fill="url(#disc)"/>
  <circle cx="200" cy="140" r="86" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
  <g transform="translate(110 50) scale(3.75)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[p.icon] || ''}</g>
</svg>`);
});

// --- category art ----------------------------------------------------------
// A cohesive family of greens and teals, matching the site's green header.
const CATEGORY_STYLES = {
  'cleaning-and-hygiene': { c: '#0e7490', pattern: 'circles' },
  'fixings-and-fasteners': { c: '#0f766e', pattern: 'grid' },
  lighting: { c: '#5a7d2a', pattern: 'rays' },
  'door-hardware': { c: '#2f855a', pattern: 'stripes' },
};
function pattern(kind, c) {
  switch (kind) {
    case 'circles':
      return [0, 1, 2, 3, 4].map((i) => `<circle cx="${60 + i * 70}" cy="${70 + (i % 2) * 90}" r="${40 + (i % 3) * 14}" fill="#fff" opacity="${0.12 + (i % 3) * 0.05}"/>`).join('');
    case 'grid':
      return Array.from({ length: 6 }, (_, i) => `<line x1="${i * 70}" y1="0" x2="${i * 70}" y2="300" stroke="#fff" stroke-opacity=".18" stroke-width="3"/><line x1="0" y1="${i * 60}" x2="400" y2="${i * 60}" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`).join('')
        + `<circle cx="280" cy="110" r="46" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="10"/>`;
    case 'rays':
      return `<circle cx="300" cy="90" r="46" fill="#fff" opacity=".55"/>` + Array.from({ length: 12 }, (_, i) => `<line x1="300" y1="90" x2="300" y2="-120" stroke="#fff" stroke-opacity=".22" stroke-width="22" transform="rotate(${i * 30} 300 90)"/>`).join('');
    default:
      return Array.from({ length: 9 }, (_, i) => `<rect x="${-40 + i * 62}" y="-20" width="26" height="360" fill="#fff" opacity=".14" transform="rotate(18 200 150)"/>`).join('');
  }
}
data.categories.forEach((cat) => {
  const st = CATEGORY_STYLES[cat.slug] || { c: '#475569', pattern: 'stripes' };
  write(`category-${cat.slug}.svg`, `${svgOpen(400, 300, 'role="img"')}
  <title>${esc(cat.name)}</title>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(st.c, 0.1)}"/><stop offset="1" stop-color="${darken(st.c, 0.35)}"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#g)"/>
  ${pattern(st.pattern, st.c)}
</svg>`);
});

// --- hero banner (skyline at dusk) ----------------------------------------
// Kept low so the page's headline text sits clear of the skyline.
const towers = [
  [40, 150, 70], [120, 100, 60], [190, 170, 80], [280, 80, 70], [360, 140, 90], [460, 110, 60],
  [530, 160, 80], [620, 90, 70], [700, 150, 70], [780, 120, 60], [850, 180, 90], [950, 100, 70], [1030, 150, 80], [1120, 120, 60],
];
write('hero.svg', `${svgOpen(1200, 320, 'role="img" preserveAspectRatio="xMidYMid slice"')}
  <title>Illustration of a city skyline at dusk</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3d2e"/><stop offset=".6" stop-color="#2f8f6b"/><stop offset="1" stop-color="#cfe3b4"/></linearGradient>
  </defs>
  <rect width="1200" height="320" fill="url(#sky)"/>
  <circle cx="980" cy="110" r="46" fill="#fff6d6" opacity=".9"/>
  ${towers.map(([x, fullH, w], i) => { const h = Math.round(fullH * 0.6); return `<rect x="${x}" y="${320 - h}" width="${w}" height="${h}" fill="${i % 2 ? '#0a2e23' : '#0f4f3b'}"/>${Array.from({ length: Math.floor(h / 24) }, (_, r) => `<rect x="${x + 10}" y="${320 - h + 10 + r * 24}" width="${w - 20}" height="8" fill="#ffe9a8" opacity="${(r + i) % 3 ? 0.35 : 0.8}"/>`).join('')}`; }).join('')}
</svg>`);

// --- favicon ---------------------------------------------------------------
write('favicon.svg', `${svgOpen(64, 64)}
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#g)"/>
  <rect x="12" y="13" width="15" height="12" rx="3" fill="#fff"/>
  <rect x="29" y="13" width="15" height="12" rx="3" fill="#fff"/>
  <rect x="46" y="13" width="6" height="12" rx="3" fill="#fff" opacity=".55"/>
  <rect x="25" y="28" width="14" height="24" rx="3" fill="#fff"/>
  <path d="M12 54h40" stroke="#d1fae5" stroke-width="4" stroke-linecap="round"/>
</svg>`);

console.log(`Wrote ${fs.readdirSync(OUT).length} images to public/images`);
