/* @ds-bundle: {"format":4,"namespace":"CureHome","components":[{"name":"GlassPanel"},{"name":"Button"},{"name":"StatusChip"},{"name":"FreshnessChip"},{"name":"Sparkline"},{"name":"VitalCard"},{"name":"RingProgress"},{"name":"FaceOrb"},{"name":"ReadingIsland"},{"name":"Dock"},{"name":"FamilyAvatar"},{"name":"MedicineCard"},{"name":"VisitCard"},{"name":"WeatherCard"},{"name":"AmbientClock"},{"name":"Banner"},{"name":"PinPad"},{"name":"OrbitView"}]} */
(function () {
  var R = window.React;
  var h = R.createElement;
  var F = R.Fragment;
  function cx() { var a = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) a.push(arguments[i]); return a.join(' '); }
  function assign(t) { for (var i = 1; i < arguments.length; i++) { var s = arguments[i]; if (s) for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k]; } return t; }

  var VITAL = {
    weight: { label: 'Weight', color: 'var(--vital-weight)' },
    bp: { label: 'Blood pressure', color: 'var(--vital-bp)' },
    sugar: { label: 'Glucose', color: 'var(--vital-sugar)' },
    pulse: { label: 'Heart rate', color: 'var(--vital-pulse)' },
    spo2: { label: 'SpO₂', color: 'var(--vital-spo2)' },
    temp: { label: 'Temperature', color: 'var(--vital-temp)' }
  };
  var TONE_SYM = { good: '●', watch: '▲', attention: '!', unknown: '?' };

  /* GlassPanel — the surface every card and sheet is built on */
  function GlassPanel(p) {
    var material = p.material || 'glass', radius = p.radius || 'card';
    var style = assign({}, p.padding != null ? { padding: p.padding } : null, p.style);
    return h('div', { className: cx('ch-glass', 'ch-glass--' + material, 'ch-r-' + radius, p.className), style: style, role: p.role, 'aria-label': p['aria-label'] }, p.children);
  }

  /* Button */
  function Button(p) {
    var rest = assign({}, p); delete rest.variant; delete rest.size; delete rest.className; delete rest.children; delete rest.icon;
    return h('button', assign(rest, { type: p.type || 'button', className: cx('ch-btn', 'ch-btn--' + (p.variant || 'primary'), 'ch-btn--' + (p.size || 'md'), 'button', p.className) }),
      p.icon ? h('span', { className: 'ch-btn__icon', 'aria-hidden': 'true' }, p.icon) : null, p.children);
  }

  /* StatusChip — always symbol + words */
  function StatusChip(p) {
    var tone = p.tone || 'good';
    return h('span', { className: cx('ch-chip', 'ch-chip--' + tone, 'chip') }, h('span', { 'aria-hidden': 'true' }, TONE_SYM[tone]), ' ', p.children);
  }

  /* FreshnessChip — how old the reading is */
  function FreshnessChip(p) {
    var st = p.state || 'fresh';
    return h('span', { className: cx('ch-fresh', 'ch-fresh--' + st, 'chip') }, h('i', { className: 'ch-fresh__dot', 'aria-hidden': 'true' }), p.children);
  }

  /* Sparkline — smooth line through the last readings, never overshooting a point */
  function sparkPath(vals, w, hgt) {
    if (!vals || vals.length < 2) return { d: '', end: null };
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), r = (mx - mn) || 1, pad = 3;
    var pts = vals.map(function (v, i) { return [i * w / (vals.length - 1), hgt - pad - (v - mn) / r * (hgt - pad * 2)]; });
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], m = (a[0] + b[0]) / 2; d += ' C' + m.toFixed(1) + ' ' + a[1].toFixed(1) + ',' + m.toFixed(1) + ' ' + b[1].toFixed(1) + ',' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); }
    return { d: d, end: pts[pts.length - 1] };
  }
  function Sparkline(p) {
    var w = p.width || 96, hh = p.height || 34, sp = sparkPath(p.values || [], w, hh), col = p.color || 'var(--cure-blue)';
    return h('svg', { className: 'ch-spark', width: w, height: hh, viewBox: '0 0 ' + w + ' ' + hh, role: 'img', 'aria-label': p['aria-label'] || 'Trend' },
      sp.d ? h('path', { d: sp.d, fill: 'none', stroke: col, strokeWidth: 2.4, strokeLinecap: 'round' }) : h('line', { x1: 0, x2: w, y1: hh / 2, y2: hh / 2, stroke: col, strokeDasharray: '3 5', strokeOpacity: 0.5 }),
      sp.end && p.endDot !== false ? h('circle', { cx: sp.end[0], cy: sp.end[1], r: 3.6, fill: col }) : null);
  }

  /* VitalCard — one reading in the orbit */
  function VitalCard(p) {
    var v = VITAL[p.kind] || VITAL.weight, col = v.color;
    var shown = p.discreet ? '•••' : p.value;
    return h('div', { className: cx('ch-glass', 'ch-glass--glass', 'ch-r-card', 'ch-vital', p.highlight && 'is-highlight', p.stale && 'is-stale'), style: p.style, role: 'group', 'aria-label': (p.label || v.label) + ' ' + p.value + ' ' + (p.unit || '') },
      h('div', { className: 'ch-vital__top' },
        h('span', { className: 'ch-vital__ic', style: { background: 'color-mix(in srgb, ' + col + ' 20%, transparent)' } }, h('i', { style: { background: col } })),
        h('span', { className: 'label ch-vital__label' }, p.label || v.label)),
      h('div', { className: 'ch-vital__row' },
        h('div', { className: 'ch-vital__val' }, h('b', { className: cx('value', p.discreet && 'ch-discreet') }, shown), p.unit ? h('span', { className: 'unit' }, p.unit) : null),
        p.series && !p.discreet ? h(Sparkline, { values: p.series, color: col, width: 88, height: 34 }) : null),
      h('div', { className: 'meta ch-vital__meta' }, p.meta),
      p.status ? h('div', { className: 'ch-vital__status' }, h(StatusChip, { tone: p.status.tone }, p.status.text)) : null);
  }

  /* RingProgress — enrolment capture, breathing timer, family progress */
  function RingProgress(p) {
    var size = p.size || 120, sw = p.stroke || 6, r = (size - sw) / 2, c = 2 * Math.PI * r, val = Math.max(0, Math.min(1, p.value == null ? 0 : p.value));
    return h('div', { className: 'ch-ring', style: { width: size, height: size }, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(val * 100), 'aria-label': p['aria-label'] || 'Progress' },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size },
        h('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: 'var(--glass-edge)', strokeWidth: sw }),
        h('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: p.color || 'var(--cure-blue)', strokeWidth: sw, strokeLinecap: 'round', strokeDasharray: c.toFixed(2), strokeDashoffset: (c * (1 - val)).toFixed(2), transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' })),
      p.children ? h('div', { className: 'ch-ring__in' }, p.children) : null);
  }

  /* FaceOrb — circular face crop (live camera in the product; privacy silhouette here) */
  function FaceOrb(p) {
    var size = p.size || 320, st = p.state || 'recognized', prog = st === 'recognized' ? 1 : (p.progress == null ? 0.6 : p.progress);
    var ringCol = st === 'recognized' ? 'var(--cure-green)' : (st === 'unknown' ? 'var(--status-unknown)' : 'var(--cure-blue)');
    var R0 = size / 2 + 18, C = 2 * Math.PI * R0, box = size + 48;
    return h('div', { className: cx('ch-orb', 'ch-orb--' + st), style: { width: size, height: size }, role: 'img', 'aria-label': p['aria-label'] || (st === 'recognized' ? 'Recognised' : st === 'unknown' ? 'Guest' : 'Identifying') },
      h('div', { className: 'ch-orb__face' }, h(DefaultAvatar)),
      h('svg', { className: 'ch-orb__ring', width: box, height: box, viewBox: '0 0 ' + box + ' ' + box, 'aria-hidden': 'true' },
        h('circle', { cx: box / 2, cy: box / 2, r: R0, fill: 'none', stroke: 'var(--glass-edge)', strokeWidth: 4 }),
        h('circle', { cx: box / 2, cy: box / 2, r: R0, fill: 'none', stroke: ringCol, strokeWidth: 4, strokeLinecap: 'round', strokeDasharray: C.toFixed(1), strokeDashoffset: (C * (1 - prog)).toFixed(1), transform: 'rotate(-90 ' + box / 2 + ' ' + box / 2 + ')' })),
      st === 'recognized' ? h('span', { className: 'ch-orb__ok', 'aria-hidden': 'true' }, '✓') : null);
  }

  /* ReadingIsland — the transient "saved" pill */
  function ReadingIsland(p) {
    return h('div', { className: cx('ch-island', 'chip'), role: 'status' }, h('span', { className: 'ch-island__tick', 'aria-hidden': 'true' }, '✓'), p.children);
  }

  /* Dock — up to five pills at the bottom of Orbit View */
  function Dock(p) {
    var items = (p.items || []).slice(0, 5);
    return h('nav', { className: 'ch-dock', 'aria-label': 'Shortcuts' }, items.map(function (it, i) {
      return h('button', { key: i, type: 'button', className: cx('ch-pill', 'button') }, h('span', null, it.label),
        it.detail ? h('small', { className: 'meta' }, it.detail) : null,
        it.badge != null ? h('span', { className: 'ch-pill__badge' }, it.badge) : null);
    }));
  }

  /* DefaultAvatar — the default profile picture (no Cure photo): a plain grey person on white */
  function DefaultAvatar() {
    return h('svg', { className: 'ch-default-avatar', viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' },
      h('rect', { width: 100, height: 100, fill: '#ffffff' }),
      h('ellipse', { cx: 50, cy: 38, rx: 16, ry: 18.5, fill: '#bdbec0' }),
      h('path', { d: 'M19 104 V78 C19 67.5 27 61 38 61 H62 C73 61 81 67.5 81 78 V104 Z', fill: '#bdbec0' }));
  }

  /* FamilyAvatar */
  function FamilyAvatar(p) {
    var size = p.size || 104;
    return h('div', { className: 'ch-member' },
      h(RingProgress, { size: size + 16, stroke: 4, value: p.progress || 0, color: p.tone === 'watch' ? 'var(--status-watch)' : 'var(--cure-green)', 'aria-label': (p.name || '') + ' progress today' },
        h('div', { className: cx('ch-avatar', p.add && 'ch-avatar--add'), style: { width: size, height: size } }, p.add ? '+' : h(DefaultAvatar))),
      h('b', { className: 'body' }, p.name), p.note ? h('small', { className: 'meta ch-member__note' }, p.note) : null);
  }

  /* MedicineCard */
  function MedicineCard(p) {
    return h('div', { className: cx('ch-glass', 'ch-glass--strong', 'ch-r-card', 'ch-row-card') },
      h('div', { className: 'ch-row-card__ico ch-ico--med', 'aria-hidden': 'true' }, h('svg', { width: 32, height: 32, viewBox: '0 0 34 34' }, h('rect', { x: 5, y: 12, width: 24, height: 11, rx: 5.5, fill: 'none', stroke: 'var(--vital-sugar)', strokeWidth: 2.4, transform: 'rotate(-35 17 17)' }), h('path', { d: 'M12.4 10.6l9.2 12.8', stroke: 'var(--vital-sugar)', strokeWidth: 2.4 }))),
      h('div', { className: 'ch-row-card__txt' }, h('div', { className: 'title' }, p.name), h('div', { className: 'body ch-muted' }, p.detail)),
      p.taken ? h('span', { className: cx('ch-taken', 'chip') }, '✓ Taken', p.takenAt ? ' · ' + p.takenAt : '') : h(Button, { variant: 'confirm', size: 'md', onClick: p.onTake }, 'Mark as taken'));
  }

  /* VisitCard — next visit and live queue */
  function VisitCard(p) {
    var token = p.token || 0, now = p.nowServing || 0, ahead = Math.max(0, token - now - 1), dots = [];
    for (var i = 1; i <= Math.min(token, 14); i++) dots.push(h('i', { key: i, className: cx('ch-q', i <= now && 'is-done', i === token && 'is-you') }));
    return h('div', { className: cx('ch-glass', 'ch-glass--strong', 'ch-r-card', 'ch-row-card') },
      h('div', { className: 'ch-row-card__ico ch-ico--visit', 'aria-hidden': 'true' }, h('svg', { width: 32, height: 32, viewBox: '0 0 34 34' }, h('rect', { x: 5, y: 7, width: 24, height: 22, rx: 5, fill: 'none', stroke: 'var(--action)', strokeWidth: 2.4 }), h('path', { d: 'M5 14h24M12 4v6M22 4v6', stroke: 'var(--action)', strokeWidth: 2.4, strokeLinecap: 'round' }))),
      h('div', { className: 'ch-row-card__txt' }, h('div', { className: 'title' }, p.doctor, p.specialty ? ' · ' + p.specialty : ''), h('div', { className: 'body ch-muted' }, p.when, p.place ? ' · ' + p.place : ''), token ? h('div', { className: 'ch-qbar', 'aria-hidden': 'true' }, dots) : null),
      token ? h('div', { className: 'ch-queue' }, h('div', { className: 'value' }, '#' + token), h('small', { className: 'meta' }, 'Now serving ' + now + ' · ' + ahead + ' ahead')) : null);
  }

  /* WeatherCard */
  function WeatherCard(p) {
    return h('div', { className: cx('ch-glass', 'ch-glass--glass', 'ch-r-card', 'ch-weather') },
      h('div', { className: 'label' }, p.place || 'Weather'),
      h('div', { className: 'ch-weather__row' },
        h('svg', { width: 78, height: 62, viewBox: '0 0 78 62', 'aria-hidden': 'true' }, h('circle', { cx: 28, cy: 24, r: 15, fill: 'var(--vital-sugar)' }), h('path', { d: 'M20 52h40a13 13 0 0 0 0-26 18 18 0 0 0-34 4A11 11 0 0 0 20 52Z', fill: 'var(--text-2)' })),
        h('div', null, h('div', { className: 'ch-weather__t' }, p.temp), h('div', { className: 'body ch-muted' }, p.summary))),
      p.detail ? h('div', { className: 'meta ch-muted3' }, p.detail) : null);
  }

  /* AmbientClock */
  function AmbientClock(p) {
    return h('div', { className: 'ch-clock' }, h('div', { className: 'clock' }, p.time || '6:42', h('span', { className: 'ch-clock__ampm' }, p.ampm || 'AM')), h('div', { className: 'body-lg ch-muted' }, p.date || 'Wednesday, 21 October'));
  }

  /* Banner — offline, sync waiting, escalation */
  function Banner(p) {
    var tone = p.tone || 'info';
    return h('div', { className: cx('ch-banner', 'ch-banner--' + tone), role: tone === 'attention' ? 'alert' : 'status' },
      h('span', { className: 'ch-banner__sym', 'aria-hidden': 'true' }, tone === 'attention' ? '!' : tone === 'offline' ? '○' : 'i'),
      h('div', { className: 'ch-banner__txt' }, h('b', { className: 'body' }, p.title), p.children ? h('div', { className: 'meta' }, p.children) : null),
      p.action ? h(Button, { variant: tone === 'attention' ? 'danger' : 'secondary', size: 'md' }, p.action) : null);
  }

  /* PinPad */
  function PinPad(p) {
    var len = p.length || 4, filled = p.filled || 0, dots = [], keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    for (var i = 0; i < len; i++) dots.push(h('i', { key: i, className: cx('ch-pin__dot', i < filled && 'is-on') }));
    return h('div', { className: 'ch-pin' }, h('div', { className: 'title' }, p.title || 'Enter your PIN'), h('div', { className: 'ch-pin__dots', 'aria-label': filled + ' of ' + len + ' digits' }, dots),
      h('div', { className: 'ch-pin__grid' }, keys.map(function (k, i) { return k === '' ? h('span', { key: i }) : h('button', { key: i, type: 'button', className: 'ch-pin__key', 'aria-label': k === '⌫' ? 'Delete' : k }, k); })));
  }

  /* OrbitView — the member screen composition at 1280 × 800 */
  var SLOTS = [[72, 120], [32, 316], [72, 512], [948, 120], [988, 316], [948, 512]];
  function OrbitView(p) {
    var vit = (p.vitals || []).slice(0, 6), cxm = 640, cym = 412;
    var conns = vit.map(function (v, i) {
      var s = SLOTS[i], left = i < 3, x0 = left ? s[0] + 260 : s[0], y0 = s[1] + 84, ang = [-0.62, 0, 0.62][i % 3], x1 = cxm + (left ? -1 : 1) * 160 * Math.cos(ang), y1 = cym + 160 * Math.sin(ang);
      var col = (VITAL[v.kind] || VITAL.weight).color;
      return h('g', { key: i }, h('path', { d: 'M' + x0 + ' ' + y0 + ' Q' + ((x0 + x1) / 2) + ' ' + y0 + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1), fill: 'none', stroke: col, strokeOpacity: v.stale ? 0.2 : 0.55, strokeWidth: 1.4, strokeDasharray: '5 5' }), h('circle', { cx: x1, cy: y1, r: 4, fill: col, opacity: v.stale ? 0.35 : 1 }));
    });
    return h('div', { className: 'ch-orbit' },
      h('div', { className: 'ch-aurora' }),
      h('div', { className: 'ch-orbit__status meta' }, h('span', null, p.time || '6:43 AM'), h('span', null, p.weather || '27° · Colombo', h('span', { className: 'ch-camdot' }, h('i', null), 'Camera on device only'))),
      h('div', { className: 'ch-orbit__greet' }, h('div', { className: p.script === 'ta' ? 'ta-greeting' : p.script === 'si' ? 'si-greeting' : 'greeting' }, p.greeting || 'Good morning, Amma'), p.subtitle ? h('div', { className: 'body ch-muted' }, p.subtitle) : null),
      h('svg', { className: 'ch-orbit__lines', width: 1280, height: 800, viewBox: '0 0 1280 800', 'aria-hidden': 'true' },
        h('ellipse', { cx: cxm, cy: cym, rx: 236, ry: 214, fill: 'none', stroke: 'var(--orbit-line)', strokeWidth: 1.2 }),
        h('ellipse', { cx: cxm, cy: cym, rx: 340, ry: 280, fill: 'none', stroke: 'var(--orbit-line)', strokeDasharray: '2 7' }),
        h('circle', { cx: cxm + 340 * Math.cos(-0.9), cy: cym + 280 * Math.sin(-0.9), r: 4, fill: 'var(--cure-lime)' }),
        h('circle', { cx: cxm + 236 * Math.cos(2.5), cy: cym + 214 * Math.sin(2.5), r: 3, fill: 'var(--cure-blue)' }), conns),
      h('div', { className: 'ch-orbit__orb' }, h(FaceOrb, { state: p.state || 'recognized', size: 320 })),
      vit.map(function (v, i) { return h('div', { key: i, className: 'ch-orbit__slot', style: { left: SLOTS[i][0], top: SLOTS[i][1] } }, h(VitalCard, v)); }),
      p.island ? h('div', { className: 'ch-orbit__island' }, h(ReadingIsland, null, p.island)) : null,
      h('div', { className: 'ch-orbit__dock' }, h(Dock, { items: p.dock || [] })));
  }

  var api = { GlassPanel: GlassPanel, Button: Button, StatusChip: StatusChip, FreshnessChip: FreshnessChip, Sparkline: Sparkline, VitalCard: VitalCard, RingProgress: RingProgress, FaceOrb: FaceOrb, ReadingIsland: ReadingIsland, Dock: Dock, FamilyAvatar: FamilyAvatar, MedicineCard: MedicineCard, VisitCard: VisitCard, WeatherCard: WeatherCard, AmbientClock: AmbientClock, Banner: Banner, PinPad: PinPad, OrbitView: OrbitView };
  window.CureHome = window.CureHome || {};
  assign(window.CureHome, api);
})();
