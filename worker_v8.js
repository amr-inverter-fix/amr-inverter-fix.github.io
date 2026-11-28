/**
 * Inverter Fix — Gemini vision proxy (Cloudflare Worker, module syntax).
 *
 * Holds the Gemini API key as a Worker secret; the public page never sees it.
 * Contract with the app:
 *   POST /read  { image: "<base64, no data: prefix>", mime: "image/jpeg" }
 *   200 -> { readable, code, message, confidence, model }
 *   error -> { error: "<code>", message: "<human text>" } with a 4xx/5xx status
 *
 * Secrets / vars (Cloudflare dashboard -> Settings -> Variables):
 *   GEMINI_KEY      secret, required
 *   MODEL           var, default "gemini-3.8-flash", the current flagship Flash model
 *   ALLOWED_ORIGIN  var, default https://amr-inverter-fix.github.io
 *
 * Limits: 1 request / 6 s per IP, 30 requests / day per IP, 3.5 MB body,
 * images only, JSON output forced by a response schema.
 */

const PROMPT = [
  'You read photos of solar inverter display screens.',
  'Reply with JSON only.',
  'Copy the characters exactly as displayed, character by character.',
  'Never guess, complete or correct a code from your own knowledge.',
  'If any character of the code is unclear, or the image is not an inverter display,',
  'set readable to false and leave code and message empty.',
  'For multi-field 7-segment panels (several green numbers, an AC/INV, CHG and FAULT label row, a small warning triangle icon): ',
  'only a number next to a lit warning triangle, or shown while the FAULT indicator is lit, is a fault code; ',
  'the other numbers are voltages, currents, power or settings and must never be returned as a code. ',
  'If the panel shows no fault (no lit FAULT indicator, no triangle, no error text), set readable to false and leave code and message empty. ',
  'Read a small number carefully, do not confuse 1 and 7, 0 and 8, 5 and 6. ',
  'If the screen lists several different fault codes (an alarm or error list), put the first listed one in code and message and every other distinct code in others (at most 5), copied exactly; otherwise others is an empty array. ',
  'For multi-field 7-segment panels also fill panel: fault_lit is yes if the FAULT indicator is lit, including a bright red glow or glare at it, no if it is dark, unclear otherwise; fields lists every number you can read on the screen with its position (top_left, top_center, top_right, bottom_left, bottom_center, bottom_right), copied exactly; for other screens panel.fields is an empty array and fault_lit is unclear. ',
  'Also fill device: brand and model only if the manufacturer name, logo or model text is clearly printed and legible in the image (on the front panel, a label or a sticker); otherwise leave them empty strings. Never infer the brand from the panel layout, colors or code style, and never guess. evidence is a few words saying where you saw it. ',
  'No translation, no commentary.'
].join(' ');

const SCHEMA = {
  type: 'object',
  properties: {
    readable: { type: 'boolean' },
    code: { type: 'string' },
    message: { type: 'string' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    panel: { type: 'object', properties: { fault_lit: { type: 'string', enum: ['yes', 'no', 'unclear'] }, fields: { type: 'array', items: { type: 'object', properties: { pos: { type: 'string', enum: ['top_left', 'top_center', 'top_right', 'bottom_left', 'bottom_center', 'bottom_right'] }, value: { type: 'string' } }, required: ['pos', 'value'] } } }, required: ['fault_lit', 'fields'] },
    device: { type: 'object', properties: { brand: { type: 'string' }, model: { type: 'string' }, evidence: { type: 'string' } }, required: ['brand', 'model', 'evidence'] },
    others: { type: 'array', items: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } }, required: ['code', 'message'] } }
  },
  required: ['readable', 'code', 'message', 'confidence']
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });
}

// Fixed-window counters kept in the edge cache. Best effort, not exact:
// enough to stop casual abuse and runaway loops without needing KV.
async function bump(key, windowSeconds, limit) {
  const cache = caches.default;
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const url = new URL('https://rate-limit.internal/' + encodeURIComponent(key) + '/' + bucket);
  const hit = await cache.match(url);
  let n = 0;
  if (hit) {
    n = parseInt(await hit.text(), 10) || 0;
  }
  n += 1;
  if (n > limit) return n;
  await cache.put(url, new Response(String(n), { headers: { 'Cache-Control': 'max-age=' + windowSeconds } }));
  return n;
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function chatReply(body, env, cors, ip) {
  if ((await bump('cday:' + ip, 86400, 60)) > 60) return json({ error: 'daily_limit' }, 429, cors);
  const system = clean(body && body.system, 20000);
  const msgs = Array.isArray(body && body.messages) ? body.messages.slice(-8) : [];
  const contents = [];
  for (const m of msgs) {
    const role = m && m.role === 'assistant' ? 'model' : m && m.role === 'user' ? 'user' : '';
    const text = String(m && m.content || '').slice(0, 12000);
    if (!role || !text.trim()) continue;
    contents.push({ role, parts: [{ text }] });
  }
  if (!contents.length || contents[contents.length - 1].role !== 'user') return json({ error: 'bad_messages' }, 400, cors);
  const model = env.MODEL || 'gemini-3.8-flash';
  const api = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
  const payload = JSON.stringify({
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents,
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
  });
  let upstream;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      upstream = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY }, body: payload });
    } catch (e) {
      return json({ error: 'upstream_unreachable' }, 502, cors);
    }
    if (upstream.status !== 503) break;
    await new Promise((r) => setTimeout(r, 1200));
  }
  if (!upstream.ok) {
    const detail = clean(await upstream.text(), 300);
    return json({ error: 'upstream_' + upstream.status, message: detail }, upstream.status === 429 ? 429 : 502, cors);
  }
  let data;
  try { data = await upstream.json(); } catch (e) { return json({ error: 'upstream_bad_json' }, 502, cors); }
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content && cand.content.parts || [];
  const text = parts.map((p) => p && p.text || '').join('').trim();
  if (!text) return json({ error: 'empty_reply' }, 502, cors);
  return json({ text, model }, 200, cors);
}


// ---- Anonymous usage counters (optional). Needs a KV binding named STATS; without it everything below is a no-op.
// Stores: a random device id (first-seen date only) and aggregate counts. No IP, no names, no personal data.
const DEVRE = /^[a-f0-9]{16,40}$/;
function todayKey() { return new Date().toISOString().slice(0, 10); }
async function loadStats(env) {
  let s = null;
  try { s = await env.STATS.get('stats', 'json'); } catch (e) {}
  return s && typeof s === 'object' ? s : { dev: 0, o: 0, d: 0, r: 0, days: {} };
}
async function record(env, ev, dev) {
  if (!env.STATS) return false;
  try {
    const s = await loadStats(env);
    const t = todayKey();
    const day = s.days[t] || (s.days[t] = { o: 0, d: 0, r: 0, n: 0 });
    if (dev && DEVRE.test(dev)) {
      const dk = 'dev:' + dev;
      if (!(await env.STATS.get(dk))) { await env.STATS.put(dk, t); s.dev = (s.dev || 0) + 1; day.n++; }
    }
    if (ev === 'open') { s.o++; day.o++; } else if (ev === 'diag') { s.d++; day.d++; } else if (ev === 'read') { s.r++; day.r++; }
    const keys = Object.keys(s.days).sort();
    while (keys.length > 60) delete s.days[keys.shift()];
    await env.STATS.put('stats', JSON.stringify(s));
    return true;
  } catch (e) { return false; }
}

export default {
  async fetch(request, env, ctx) {
    const origin = env.ALLOWED_ORIGIN || 'https://amr-inverter-fix.github.io';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true }, 200, cors);
    if (url.pathname === '/stats' && request.method === 'GET') {
      if (!env.STATS) return json({ ok: false, reason: 'no_store' }, 200, cors);
      const s = await loadStats(env);
      const ds = Object.keys(s.days).sort().slice(-14).map((k) => ({ day: k, opens: s.days[k].o, diagnoses: s.days[k].d, reads: s.days[k].r, new_devices: s.days[k].n }));
      return json({ ok: true, devices: s.dev || 0, sessions: s.o || 0, diagnoses: s.d || 0, photo_reads: s.r || 0, days: ds }, 200, cors);
    }
    if (url.pathname === '/ping' && request.method === 'POST') {
      const reqO = request.headers.get('Origin') || '';
      if (reqO && reqO !== origin) return json({ error: 'forbidden_origin' }, 403, cors);
      if (!env.STATS) return json({ ok: false, reason: 'no_store' }, 200, cors);
      const ipp = request.headers.get('CF-Connecting-IP') || 'unknown';
      if ((await bump('ping:' + ipp, 86400, 120)) > 120) return json({ ok: false, reason: 'limit' }, 200, cors);
      let pb = null;
      try { pb = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400, cors); }
      const ev = pb && pb.e === 'diag' ? 'diag' : pb && pb.e === 'open' ? 'open' : '';
      if (!ev) return json({ error: 'bad_event' }, 400, cors);
      const ok = await record(env, ev, String(pb.d || ''));
      return json({ ok }, 200, cors);
    }
    if (url.pathname !== '/read' && url.pathname !== '/chat') return json({ error: 'not_found' }, 404, cors);
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors);

    // Only the app's own pages may call this, from a browser.
    const reqOrigin = request.headers.get('Origin') || '';
    if (reqOrigin && reqOrigin !== origin) return json({ error: 'forbidden_origin' }, 403, cors);

    if (!env.GEMINI_KEY) return json({ error: 'not_configured' }, 503, cors);

    const len = Number(request.headers.get('content-length') || 0);
    if (len > 3500000) return json({ error: 'too_large' }, 413, cors);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if ((await bump('min:' + ip, 6, 1)) > 1) return json({ error: 'rate_limited' }, 429, cors);
    if ((await bump('day:' + ip, 86400, 150)) > 150) return json({ error: 'daily_limit' }, 429, cors);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'bad_json' }, 400, cors);
    }

    if (url.pathname === '/chat') return chatReply(body, env, cors, ip);

    const mime = String(body && body.mime || '');
    const image = String(body && body.image || '');
    if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ error: 'bad_type' }, 415, cors);
    if (!image || image.length < 100 || image.length > 3200000) return json({ error: 'bad_image' }, 400, cors);
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(image)) return json({ error: 'bad_image' }, 400, cors);

    const model = env.MODEL || 'gemini-3.8-flash';
    const api = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';

    let upstream;
    try {
      upstream = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: image } }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
            responseSchema: SCHEMA
          }
        })
      });
    } catch (e) {
      return json({ error: 'upstream_unreachable' }, 502, cors);
    }

    if (!upstream.ok) {
      const detail = clean(await upstream.text(), 300);
      // Never echo the key; the URL is not included in this message.
      return json({ error: 'upstream_' + upstream.status, message: detail }, upstream.status === 429 ? 429 : 502, cors);
    }

    let data;
    try {
      data = await upstream.json();
    } catch (e) {
      return json({ error: 'upstream_bad_json' }, 502, cors);
    }

    const cand = data && data.candidates && data.candidates[0];
    const parts = cand && cand.content && cand.content.parts || [];
    const text = parts.map((p) => p && p.text || '').join('').trim();
    if (!text) {
      const blocked = data && data.promptFeedback && data.promptFeedback.blockReason;
      return json({ error: blocked ? 'blocked' : 'empty_reply' }, 502, cors);
    }

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/^```[a-z]*\s*/i, '').replace(/```$/, '').trim());
    } catch (e) {
      return json({ error: 'unparsable_reply', message: clean(text, 200) }, 502, cors);
    }

    const conf = ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low';
    if (ctx && ctx.waitUntil) ctx.waitUntil(record(env, 'read', ''));
    return json({
      readable: parsed.readable !== false,
      code: clean(parsed.code, 40),
      message: clean(parsed.message, 200),
      confidence: conf,
      panel: { fault_lit: ['yes', 'no', 'unclear'].includes(parsed.panel && parsed.panel.fault_lit) ? parsed.panel.fault_lit : 'unclear', fields: (Array.isArray(parsed.panel && parsed.panel.fields) ? parsed.panel.fields : []).slice(0, 6).map((x) => ({ pos: clean(x && x.pos, 20), value: clean(x && x.value, 20) })).filter((x) => x.value) },
      others: (Array.isArray(parsed.others) ? parsed.others : []).slice(0, 5).map((x) => ({ code: clean(x && x.code, 40), message: clean(x && x.message, 200) })).filter((x) => x.code),
      device: { brand: clean(parsed.device && parsed.device.brand, 40), model: clean(parsed.device && parsed.device.model, 40), evidence: clean(parsed.device && parsed.device.evidence, 80) },
      model: 'ai'
    }, 200, cors);
  }
};
