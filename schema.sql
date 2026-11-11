-- Goal Groups shared board. D1 (SQLite). Emails are stored but never returned by the public API.
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  edit_hash TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  cat TEXT NOT NULL,
  by_name TEXT NOT NULL,
  email TEXT NOT NULL,
  town TEXT,
  start_date TEXT,
  due_date TEXT NOT NULL,
  cap INTEGER NOT NULL DEFAULT 1,
  lock_at INTEGER NOT NULL DEFAULT 1,
  fill_days INTEGER NOT NULL DEFAULT 7,
  vis TEXT NOT NULL DEFAULT 'board',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS goals_email ON goals(email);
CREATE INDEX IF NOT EXISTS goals_created ON goals(created_at);

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('witness','crew')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (goal_id, role, email)
);
CREATE INDEX IF NOT EXISTS people_goal ON people(goal_id);

CREATE TABLE IF NOT EXISTS checkins (
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('saw','missed')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (goal_id, person_id)
);

CREATE TABLE IF NOT EXISTS rate (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  exp INTEGER NOT NULL
);
