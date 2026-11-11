import { json, bad, readBody, rateLimit, loadGoal, decorate, safeEqualHash, dueReached } from '../../../../lib/api.js';

// POST /api/goals/:id/checkin : a witness says "Saw it" or "Didn't happen", on or after the done-by date.
// One verdict per witness; they can change it by posting again.
export async function onRequestPost({ request, env, params }) {
  let b;
  try { b = await readBody(request); } catch { return bad('Could not read that.'); }
  if (!(await rateLimit(env, request, 'checkin', 60, 3600))) return bad('Too many tries from here. Try again in an hour.', 429);
  const row = await loadGoal(env, params.id);
  if (!row) return bad('Goal not found.', 404);
  const verdict = b.verdict === 'saw' ? 'saw' : b.verdict === 'missed' ? 'missed' : null;
  if (!verdict) return bad('Pick Saw it or Didn\u2019t happen.');
  const p = await env.DB.prepare("SELECT * FROM people WHERE id = ?1 AND goal_id = ?2 AND role = 'witness'").bind(String(b.personId || ''), row.id).first();
  if (!p || !(await safeEqualHash(b.token, p.token_hash))) return bad('Only this goal\u2019s spotters can check in, from the device they signed up on.', 403);
  if (!dueReached(row.due_date)) return bad('Check-ins open on the done-by date.', 409);
  await env.DB.prepare(
    `INSERT INTO checkins (goal_id, person_id, verdict, created_at) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(goal_id, person_id) DO UPDATE SET verdict = excluded.verdict, created_at = excluded.created_at`
  ).bind(row.id, p.id, verdict, Date.now()).run();
  const [goal] = await decorate(env, [row]);
  return json({ ok: true, verdict, goal });
}
