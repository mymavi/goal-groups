import { json, bad, readBody, clean, cleanEmail, isDate, todayMT, randomId, sha256, rateLimit, decorate, KINDS, CATS } from '../../../lib/api.js';

// GET /api/goals : public board (only goals posted as "Anyone on the board"). Never returns emails.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM goals WHERE vis = 'board' ORDER BY created_at DESC LIMIT 200"
  ).all();
  return json({ goals: await decorate(env, results) });
}

// POST /api/goals : create a goal. Returns the goal plus a one-time edit token for the poster's device.
export async function onRequestPost({ request, env }) {
  let b;
  try { b = await readBody(request); } catch { return bad('Could not read that.'); }
  if (b.website) return bad('Could not post that.'); // honeypot
  if (!(await rateLimit(env, request, 'post', 8, 3600))) return bad('Too many posts from here. Try again in an hour.', 429);

  const kind = KINDS.includes(b.kind) ? b.kind : null;
  const cat = CATS.includes(b.cat) ? b.cat : null;
  const title = clean(b.title, 90);
  const by = clean(b.by, 20);
  const town = clean(b.town, 32);
  const email = cleanEmail(b.email);
  const today = todayMT();
  const start = isDate(b.start) ? b.start : null;
  const due = isDate(b.due) ? b.due : null;
  if (!kind || !cat) return bad('Pick a type and a category.');
  if (title.length < 4) return bad('Add your goal.');
  if (!by) return bad('Add your first name.');
  if (!email) return bad('Add a valid email.');
  if (!due) return bad('Add a done-by date.');
  if (due < today) return bad('Your done-by date is in the past.');
  if (due > String(+today.slice(0, 4) + 2) + today.slice(4)) return bad('Pick a done-by date within two years.');
  if (start && start > due) return bad('Your start date is after your done-by date.');

  const crew = !!b.crew;
  const cap = crew ? Math.max(2, Math.min(12, parseInt(b.cap, 10) || 8)) : 1;
  const lockAt = crew ? Math.max(2, Math.min(cap, parseInt(b.lockAt, 10) || cap)) : 1;
  const fillDays = [3, 7, 14].includes(+b.fillDays) ? +b.fillDays : 7;
  const vis = b.vis === 'link' ? 'link' : 'board';

  const id = randomId(9);
  const editToken = randomId(24);
  await env.DB.prepare(
    `INSERT INTO goals (id, edit_hash, kind, title, cat, by_name, email, town, start_date, due_date, cap, lock_at, fill_days, vis, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
  ).bind(id, await sha256(editToken), kind, title, cat, by, email, town || null, start, due, cap, lockAt, fillDays, vis, Date.now()).run();

  const row = await env.DB.prepare('SELECT * FROM goals WHERE id = ?1').bind(id).first();
  const [goal] = await decorate(env, [row]);
  return json({ goal, editToken }, 201);
}
