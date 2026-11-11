import { json, bad, loadGoal, decorate, safeEqualHash } from '../../../../lib/api.js';

// GET /api/goals/:id : one goal (works for link-only goals too). Never returns emails.
export async function onRequestGet({ env, params }) {
  const row = await loadGoal(env, params.id);
  if (!row) return bad('Goal not found.', 404);
  const [goal] = await decorate(env, [row]);
  return json({ goal });
}

// DELETE /api/goals/:id : poster removes their goal (needs the edit token from their device).
export async function onRequestDelete({ request, env, params }) {
  const row = await loadGoal(env, params.id);
  if (!row) return bad('Goal not found.', 404);
  if (!(await safeEqualHash(request.headers.get('x-edit-token'), row.edit_hash))) return bad('Only the person who posted this can remove it.', 403);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM checkins WHERE goal_id = ?1').bind(row.id),
    env.DB.prepare('DELETE FROM people WHERE goal_id = ?1').bind(row.id),
    env.DB.prepare('DELETE FROM goals WHERE id = ?1').bind(row.id),
  ]);
  return json({ ok: true });
}
