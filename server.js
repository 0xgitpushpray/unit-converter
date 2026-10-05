const http = require('http');
const fs = require('fs');
const path = require('path');
const { categories, convert, format } = require('./converters');

const PORT = process.env.PORT || 3000;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderPage(key, form = {}, result = null, error = null) {
  const cat = categories[key];
  const names = Object.keys(cat.units);
  const from = names.includes(form.from) ? form.from : names[0];
  const to = names.includes(form.to) ? form.to : names[1];
  const options = (selected) =>
    names.map((u) => `<option value="${u}"${u === selected ? ' selected' : ''}>${u}</option>`).join('');

  const nav = Object.entries(categories)
    .map(([k, c]) => `<a href="/${k}"${k === key ? ' class="active"' : ''}>${c.title}</a>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cat.title} Converter</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <h1>Unit Converter</h1>
    <nav>${nav}</nav>
    <h2>${cat.title}</h2>
    <form method="POST" action="/${key}" target="_self">
      <label>Value
        <input type="number" name="value" step="any" required value="${escapeHtml(form.value ?? '')}">
      </label>
      <label>From <select name="from">${options(from)}</select></label>
      <label>To <select name="to">${options(to)}</select></label>
      <button type="submit">Convert</button>
    </form>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    ${result !== null ? `<p class="result">${escapeHtml(form.value)} ${escapeHtml(from)} = <strong>${escapeHtml(result)} ${escapeHtml(to)}</strong></p>` : ''}
  </main>
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
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/') {
    res.writeHead(302, { Location: '/length' });
    return res.end();
  }
  if (pathname === '/style.css' && req.method === 'GET') {
    return send(res, 200, fs.readFileSync(path.join(__dirname, 'public', 'style.css')), 'text/css');
  }

  const key = pathname.slice(1);
  if (!Object.hasOwn(categories, key)) return send(res, 404, 'Not found', 'text/plain');

  if (req.method === 'GET') return send(res, 200, renderPage(key));
  if (req.method !== 'POST') return send(res, 405, 'Method not allowed', 'text/plain');

  let form;
  try {
    form = await readBody(req);
  } catch {
    return send(res, 400, 'Bad request', 'text/plain');
  }
  try {
    const raw = (form.value || '').trim();
    const value = raw === '' ? NaN : Number(raw);
    const result = format(convert(key, value, form.from, form.to));
    send(res, 200, renderPage(key, form, result));
  } catch (err) {
    send(res, 400, renderPage(key, form, null, err.message));
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Unit converter running at http://localhost:${PORT}`));
}
module.exports = server;
