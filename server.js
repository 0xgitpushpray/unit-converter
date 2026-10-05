const http = require('http');
const fs = require('fs');
const path = require('path');
const { categories, convert, format } = require('./converters');

const PORT = process.env.PORT || 3000;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Static files the pages load. Anything else under /public is not served.
const STATIC = {
  '/style.css': ['public/style.css', 'text/css; charset=utf-8'],
  '/app.js': ['public/app.js', 'text/javascript; charset=utf-8'],
  '/favicon.svg': ['public/favicon.svg', 'image/svg+xml'],
  '/converters.js': ['converters.js', 'text/javascript; charset=utf-8'],
};

// Convert a form ({value, from, to}) for a category. Returns { result } or { error }.
function run(key, form) {
  const raw = String(form.value ?? '').trim();
  const value = raw === '' ? NaN : Number(raw);
  try {
    return { result: format(convert(key, value, form.from, form.to)) };
  } catch (err) {
    return { error: err.message };
  }
}

function renderPage(key, form = {}, outcome = {}) {
  const cat = categories[key];
  const names = Object.keys(cat.units);
  const sym = (u) => cat.symbols[u] || u;
  const from = names.includes(form.from) ? form.from : names[0];
  const to = names.includes(form.to) ? form.to : names[1];
  const { result = null, error = null } = outcome;
  const value = form.value ?? '1';

  const options = (selected) =>
    names.map((u) => `<option value="${escapeHtml(u)}"${u === selected ? ' selected' : ''}>${escapeHtml(u)} (${escapeHtml(sym(u))})</option>`).join('');

  const tabs = Object.entries(categories)
    .map(([k, c]) => `<a href="/${k}"${k === key ? ' class="active" aria-current="page"' : ''}>${c.title}</a>`)
    .join('');

  // Every unit of the category, for the value as entered. Only meaningful when it converts.
  const rows = result === null ? '' : names
    .map((u) => {
      const r = run(key, { value, from, to: u });
      const shown = r.error ? '–' : r.result;
      return `<tr${u === to ? ' class="is-target"' : ''}><th scope="row"><button type="button" class="pick" data-unit="${escapeHtml(u)}">${escapeHtml(u)}</button></th><td class="sym">${escapeHtml(sym(u))}</td><td class="num">${escapeHtml(shown)}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cat.title} converter | Unit Converter</title>
  <meta name="description" content="Convert ${cat.title.toLowerCase()} units instantly: ${names.slice(0, 4).join(', ')} and more. No ads, no sign-up.">
  <meta name="theme-color" content="#14120d">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap">
  <link rel="stylesheet" href="/style.css">
  <script>document.documentElement.classList.add('js');</script>
</head>
<body data-category="${key}">
  <a class="skip" href="#convert">Skip to converter</a>
  <header class="bar">
    <div class="wrap bar-inner">
      <a class="brand" href="/length"><svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="9" width="28" height="14" rx="2" fill="currentColor"/><path d="M7 9v6M12 9v4M17 9v6M22 9v4M27 9v6" stroke="#14120d" stroke-width="2"/></svg>Unit Converter</a>
      <nav class="tabs" aria-label="Categories">${tabs}</nav>
    </div>
  </header>

  <main class="wrap">
    <h1>${cat.title}</h1>
    <div class="layout">
      <section class="rule" aria-label="${cat.title} converter">
        <form id="convert" method="POST" action="/${key}" target="_self" novalidate>
          <label class="f-value">Value
            <input type="number" name="value" step="any" required inputmode="decimal" autocomplete="off" value="${escapeHtml(value)}"${error ? ' aria-invalid="true" aria-describedby="err"' : ''}>
          </label>
          <label class="f-from">From <select name="from">${options(from)}</select></label>
          <button type="button" class="swap" aria-label="Swap units" hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <label class="f-to">To <select name="to">${options(to)}</select></label>
          <button class="convert-btn" type="submit">Convert</button>
        </form>

        <div class="reading" aria-live="polite">
          <p id="err" class="error"${error ? '' : ' hidden'}>${error ? escapeHtml(error) : ''}</p>
          <div class="answer"${result === null ? ' hidden' : ''}>
            <p class="eq"><span class="eq-in">${escapeHtml(value)} ${escapeHtml(sym(from))}</span> =</p>
            <p class="out"><output id="result" for="convert">${result === null ? '' : escapeHtml(result)}</output> <span class="out-unit">${escapeHtml(sym(to))}</span></p>
            <p class="out-name">${escapeHtml(to)}</p>
            <button type="button" class="copy" hidden>Copy result</button>
          </div>
        </div>

        <div class="scale" id="scale" aria-hidden="true"></div>
      </section>

      <section class="all" aria-label="All ${cat.title.toLowerCase()} units"${result === null ? ' hidden' : ''}>
        <h2>All units for ${escapeHtml(value)} ${escapeHtml(sym(from))}</h2>
        <table>
          <thead><tr><th scope="col">Unit</th><th scope="col">Symbol</th><th scope="col" class="num">Value</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </div>
  </main>

  <footer class="wrap foot">Unit Converter &middot; length, weight, temperature, area, volume, speed and time</footer>

  <script src="/converters.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e5) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(data))));
    req.on('error', reject);
  });
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (pathname === '/') {
    res.writeHead(302, { Location: '/length' });
    return res.end();
  }
  if (Object.hasOwn(STATIC, pathname) && req.method === 'GET') {
    const [file, type] = STATIC[pathname];
    return send(res, 200, fs.readFileSync(path.join(__dirname, file)), type);
  }

  const key = pathname.slice(1);
  if (!Object.hasOwn(categories, key)) return send(res, 404, 'Not found', 'text/plain');

  if (req.method === 'GET') {
    // /length?value=12&from=inch&to=foot is a shareable link; no query shows the default "1".
    const q = Object.fromEntries(url.searchParams);
    const form = { value: q.value ?? '1', from: q.from, to: q.to };
    const names = Object.keys(categories[key].units);
    const resolved = { ...form, from: names.includes(form.from) ? form.from : names[0], to: names.includes(form.to) ? form.to : names[1] };
    const out = run(key, resolved);
    return send(res, out.error ? 400 : 200, renderPage(key, resolved, out));
  }
  if (req.method !== 'POST') return send(res, 405, 'Method not allowed', 'text/plain');

  let form;
  try {
    form = await readBody(req);
  } catch {
    return send(res, 400, 'Bad request', 'text/plain');
  }
  const out = run(key, form);
  send(res, out.error ? 400 : 200, renderPage(key, form, out));
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Unit converter running at http://localhost:${PORT}`));
}
module.exports = server;
