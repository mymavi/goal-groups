// Shared helpers for Goal Groups Pages Functions. Emails never leave this module in responses.
export const KINDS = ['Looking for spotters', 'Looking for witnesses', 'Trying to achieve', 'Looking for', 'In need of'];
export const CATS = ['outdoors', 'running', 'fitness', 'build', 'habits', 'creative', 'learn'];
const DAY = 864e5;
const EMAIL_RE = /^[^\s@<>()"',;:]{1,64}@[^\s@<>()"',;:]{1,190}\.[a-z]{2,24}$/i;

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...extra },
  });
}
export const bad = (msg, status = 400) => json({ error: msg }, status);

export async function readBody(request) {
  const len = +(request.headers.get('content-length') || 0);
  if (len > 8000) throw new Error('too big');
  const text = await request.text();
  if (text.length > 8000) throw new Error('too big');
  return text ? JSON.parse(text) : {};
}

export const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export function cleanEmail(s) {
  const e = String(s ?? '').trim().toLowerCase();
  return e.length <= 254 && EMAIL_RE.test(e) ? e : null;
}
export const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z'));

// "Today" in Colorado time, as YYYY-MM-DD.
export function todayMT(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
}

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function randomId(n = 9) { return b64url(crypto.getRandomValues(new Uint8Array(n))); }
export async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function safeEqualHash(token, hash) {
  if (!token || typeof token !== 'string' || token.length > 100) return false;
  const h = await sha256(token);
  if (h.length !== hash.length) return false;
  let r = 0;
  for (let i = 0; i < h.length; i++) r |= h.charCodeAt(i) ^ hash.charCodeAt(i);
  return r === 0;
}

// Fixed-window rate limit stored in D1. Keyed by a salted, daily-rotating hash of the IP (raw IPs are never stored).
export async function rateLimit(env, request, action, max, windowSec) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const ipHash = (await sha256('gg:' + todayMT(now) + ':' + ip)).slice(0, 24);
  const k = `${action}:${ipHash}:${bucket}`;
  const row = await env.DB.prepare(
    'INSERT INTO rate (k, n, exp) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n'
  ).bind(k, now + windowSec * 1000).first();
  if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM rate WHERE exp < ?1').bind(now).run();
  return (row?.n ?? 1) <= max;
}

export function dueReached(due, now = Date.now()) { return todayMT(now) >= due; }

// Reputation for one goal-setter, keyed by their (private) email.
export function tierFor(goalsTotal, resolved, showed) {
  if (!resolved) return { label: goalsTotal > 1 ? `New \u00b7 ${goalsTotal} goals posted` : 'New \u00b7 first goal', tier: 'New', rate: null };
  const rate = Math.round((showed / resolved) * 100);
  let t = resolved < 2 ? 'New' : 'C';
  if (resolved >= 10 && rate >= 90) t = 'S';
  else if (resolved >= 4 && rate >= 85) t = 'A';
  else if (resolved >= 2 && rate >= 70) t = 'B';
  const g = `${resolved} goal${resolved === 1 ? '' : 's'}`;
  return { label: `${t === 'New' ? 'New' : t + '-tier'} \u00b7 ${g} \u00b7 ${rate}% show-up rate`, tier: t, rate };
}

// Load goals (rows from `goals`) and decorate with counts, check-ins and the owner's reputation.
export async function decorate(env, rows) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const emails = [...new Set(rows.map((r) => r.email))];
  const ph = (a) => a.map((_, i) => '?' + (i + 1)).join(',');
  const [people, checks, owned] = await Promise.all([
    env.DB.prepare(`SELECT goal_id, role, name FROM people WHERE goal_id IN (${ph(ids)}) ORDER BY created_at`).bind(...ids).all(),
    env.DB.prepare(`SELECT goal_id, verdict, COUNT(*) AS n FROM checkins WHERE goal_id IN (${ph(ids)}) GROUP BY goal_id, verdict`).bind(...ids).all(),
    // Every goal by the same owners, with their check-in tallies, to compute show-up rate.
    env.DB.prepare(
      `SELECT g.email, g.id, g.due_date,
        SUM(CASE WHEN c.verdict='saw' THEN 1 ELSE 0 END) AS saw,
        SUM(CASE WHEN c.verdict='missed' THEN 1 ELSE 0 END) AS missed
       FROM goals g LEFT JOIN checkins c ON c.goal_id = g.id
       WHERE g.email IN (${ph(emails)}) GROUP BY g.id`
    ).bind(...emails).all(),
  ]);
  const rep = {};
  for (const r of owned.results) {
    const x = (rep[r.email] ||= { total: 0, resolved: 0, showed: 0 });
    x.total++;
    // A goal resolves once its done-by date is reached and witnesses lean one way. Ties wait for more check-ins.
    if (dueReached(r.due_date) && r.saw !== r.missed) {
      x.resolved++;
      if (r.saw > r.missed) x.showed++;
    }
  }
  const by = {};
  for (const p of people.results) {
    const x = (by[p.goal_id] ||= { witness: [], crew: [] });
    x[p.role].push(p.name);
  }
  const ck = {};
  for (const c of checks.results) (ck[c.goal_id] ||= { saw: 0, missed: 0 })[c.verdict] = c.n;
  return rows.map((r) => {
    const p = by[r.id] || { witness: [], crew: [] };
    const c = ck[r.id] || { saw: 0, missed: 0 };
    const x = rep[r.email] || { total: 1, resolved: 0, showed: 0 };
    const t = tierFor(x.total, x.resolved, x.showed);
    return {
      id: r.id, kind: r.kind === 'Looking for witnesses' ? 'Looking for spotters' : r.kind, title: r.title, cat: r.cat, by: r.by_name, town: r.town || '',
      start: r.start_date || null, due: r.due_date, cap: r.cap, lockAt: r.lock_at, fillDays: r.fill_days,
      vis: r.vis, created: r.created_at, fillDeadline: r.created_at + r.fill_days * DAY,
      joined: Math.min(r.cap, 1 + p.crew.length), witnesses: p.witness.length,
      witnessNames: p.witness.slice(0, 12), crewNames: p.crew.slice(0, 12),
      checkins: c, dueReached: dueReached(r.due_date),
      tier: t.label, rep: { tier: t.tier, rate: t.rate, goals: x.total, resolved: x.resolved },
    };
  });
}

export async function loadGoal(env, id) {
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id || '')) return null;
  return env.DB.prepare('SELECT * FROM goals WHERE id = ?1').bind(id).first();
}
