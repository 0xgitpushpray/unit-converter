// Progressive enhancement: the page already works as a plain form (POST, server-rendered).
// This adds instant conversion, unit swap, copy, a log/linear ruler, and shareable URLs.
(() => {
  const api = window.Converters;
  if (!api) return;
  const { categories, convert, format } = api;
  const key = document.body.dataset.category;
  const cat = categories[key];
  const isTemp = key === 'temperature';

  const $ = (s) => document.querySelector(s);
  const form = $('#convert');
  const input = form.elements.value;
  const fromSel = form.elements.from;
  const toSel = form.elements.to;
  const swapBtn = $('.swap');
  const copyBtn = $('.copy');
  const errEl = $('#err');
  const answer = $('.answer');
  const outEl = $('#result');
  const eqIn = $('.eq-in');
  const outUnit = $('.out-unit');
  const outName = $('.out-name');
  const all = $('.all');
  const allTitle = $('.all h2');
  const tbody = $('.all tbody');
  const scale = $('#scale');
  const sym = (u) => cat.symbols[u] || u;

  swapBtn.hidden = false;
  copyBtn.hidden = false;
  const activeTab = $('.tabs a.active');
  if (activeTab) activeTab.scrollIntoView({ inline: 'center', block: 'nearest' });

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = !msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', 'err'); else input.removeAttribute('aria-describedby');
  }

  function showNothing() {
    answer.hidden = true;
    all.hidden = true;
    scale.hidden = true;
  }

  function renderTable(value, from) {
    tbody.textContent = '';
    for (const u of Object.keys(cat.units)) {
      let shown;
      try { shown = format(convert(key, value, from, u)); } catch { shown = '–'; }
      const tr = document.createElement('tr');
      if (u === toSel.value) tr.className = 'is-target';
      const th = document.createElement('th');
      th.scope = 'row';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pick';
      b.dataset.unit = u;
      b.textContent = u;
      th.append(b);
      const s = document.createElement('td');
      s.className = 'sym';
      s.textContent = sym(u);
      const n = document.createElement('td');
      n.className = 'num';
      n.textContent = shown;
      tr.append(th, s, n);
      tbody.append(tr);
    }
    allTitle.textContent = `All units for ${input.value.trim()} ${sym(from)}`;
  }

  // Ruler: a log decade for positive magnitudes, a linear 100-wide window otherwise.
  let scaleKey = '';
  let pin;
  function renderScale(r, toUnit) {
    const log = !isTemp && r > 0 && Number.isFinite(r);
    let lo, hi, pos, ticks, caption;
    if (log) {
      let d = Math.floor(Math.log10(r));
      const m = r / 10 ** d;
      if (m >= 10) d += 1; else if (m < 1) d -= 1;
      const base = 10 ** d;
      lo = base; hi = base * 10;
      pos = Math.log10(r / base) * 100;
      ticks = [];
      for (let n = 1; n <= 10; n++) {
        const major = [1, 2, 3, 5, 10].includes(n);
        ticks.push({ at: Math.log10(n) * 100, major, label: major ? format(n * base) : '' });
      }
      caption = `Log scale, ${format(lo)} to ${format(hi)} ${sym(toUnit)}`;
    } else if (Number.isFinite(r)) {
      lo = Math.floor(r / 100) * 100; hi = lo + 100;
      pos = r - lo;
      ticks = [];
      for (let i = 0; i <= 10; i++) ticks.push({ at: i * 10, major: i % 5 === 0, label: i % 5 === 0 ? format(lo + i * 10) : '' });
      caption = `Linear scale, ${format(lo)} to ${format(hi)} ${sym(toUnit)}`;
    } else {
      scale.hidden = true;
      return;
    }
    scale.hidden = false;
    const sk = `${log ? 'log' : 'lin'}|${lo}|${sym(toUnit)}`;
    if (sk !== scaleKey || !pin || !pin.isConnected) {
      scaleKey = sk;
      scale.textContent = '';
      const track = document.createElement('div');
      track.className = 'track';
      for (const t of ticks) {
        const el = document.createElement('span');
        el.className = t.major ? 'tick major' : 'tick';
        el.style.left = `${t.at}%`;
        if (t.label) el.dataset.label = t.label;
        track.append(el);
      }
      pin = document.createElement('span');
      pin.className = 'pin';
      track.append(pin);
      const cap = document.createElement('p');
      cap.className = 'scale-cap';
      cap.textContent = caption;
      scale.append(track, cap);
    }
    pin.style.left = `${Math.max(0, Math.min(100, pos))}%`;
  }

  function syncUrl(raw) {
    const q = new URLSearchParams({ value: raw, from: fromSel.value, to: toSel.value });
    try { history.replaceState(null, '', `${location.pathname}?${q}`); } catch { /* sandboxed */ }
  }

  let lastShown = '';
  function update() {
    const raw = input.value.trim();
    if (input.validity.badInput) { showError('Please enter a valid number'); showNothing(); return; }
    if (raw === '') { showError(''); showNothing(); return; }
    const value = Number(raw);
    let r;
    try {
      r = convert(key, value, fromSel.value, toSel.value);
    } catch (e) {
      showError(e.message);
      showNothing();
      return;
    }
    showError('');
    const text = format(r);
    eqIn.textContent = `${raw} ${sym(fromSel.value)}`;
    outEl.textContent = text;
    outUnit.textContent = sym(toSel.value);
    outName.textContent = toSel.value;
    answer.hidden = false;
    all.hidden = false;
    if (text !== lastShown) {
      lastShown = text;
      outEl.classList.remove('bump');
      void outEl.offsetWidth; // restart the animation
      outEl.classList.add('bump');
    }
    renderTable(value, fromSel.value);
    renderScale(r, toSel.value);
    syncUrl(raw);
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => { e.preventDefault(); update(); });

  swapBtn.addEventListener('click', () => {
    const a = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = a;
    // carry the answer across: 12 in -> 30.48 cm becomes 30.48 cm -> 12 in
    if (!answer.hidden && outEl.textContent) input.value = outEl.textContent;
    update();
  });

  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('.pick');
    if (!b) return;
    toSel.value = b.dataset.unit;
    update();
  });

  let copyTimer;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outEl.textContent);
      copyBtn.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(outEl);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyBtn.textContent = 'Press Ctrl+C';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyBtn.textContent = 'Copy result'; }, 1600);
  });

  update();
})();
