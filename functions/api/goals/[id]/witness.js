import { json, bad, readBody, clean, cleanEmail, randomId, sha256, rateLimit, loadGoal, decorate } from '../../../../lib/api.js';

// POST /api/goals/:id/witness : become a witness (role "witness") or join the crew (role "crew").
// Returns a per-person token kept on the device; it is what lets a witness check in later.
export async function onRequestPost({ request, env, params }) {
  let b;
  try { b = await readBody(request); } catch { return bad('Could not read that.'); }
  if (b.website) return bad('Could not save that.'); // honeypot
  if (!(await rateLimit(env, request, 'witness', 30, 3600))) return bad('Too many tries from here. Try again in an hour.', 429);
  const row = await loadGoal(env, params.id);
  if (!row) return bad('Goal not found.', 404);
  const role = b.role === 'crew' ? 'crew' : 'witness';
  const name = clean(b.name, 20);
  const email = cleanEmail(b.email);
  if (!name) return bad('Add your first name.');
  if (!email) return bad('Add a valid email.');
  if (email === row.email) return bad(role === 'crew' ? 'You already lead this crew.' : 'You can\u2019t spot your own goal.');
  if (role === 'crew') {
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM people WHERE goal_id = ?1 AND role = 'crew'").bind(row.id).first('n');
    if (row.cap <= 1) return bad('This goal has no crew to join.');
    if (1 + n >= row.cap) return bad('This crew is full.');
  }
  const id = randomId(9);
  const token = randomId(24);
  try {
    await env.DB.prepare(
      'INSERT INTO people (id, goal_id, role, name, email, token_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
    ).bind(id, row.id, role, name, email, await sha256(token), Date.now()).run();
  } catch (e) {
    if (String(e).includes('UNIQUE')) return bad(role === 'crew' ? 'That email is already in this crew.' : 'That email is already spotting this goal.', 409);
    throw e;
  }
  const [goal] = await decorate(env, [row]);
  return json({ personId: id, token, role, goal }, 201);
}
