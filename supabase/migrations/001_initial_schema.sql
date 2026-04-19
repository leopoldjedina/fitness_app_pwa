-- LeoFit Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── User Profile ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  name TEXT NOT NULL DEFAULT 'Leopold',
  alter_jahre INTEGER NOT NULL DEFAULT 45,
  groesse_cm INTEGER NOT NULL DEFAULT 180,
  startgewicht_kg NUMERIC(5,1) NOT NULL DEFAULT 71.1,
  start_bauchumfang_cm NUMERIC(5,1) NOT NULL DEFAULT 84.0,
  ziel_bauchumfang_cm NUMERIC(5,1) NOT NULL DEFAULT 78.0,
  ziel_kfa_prozent NUMERIC(4,1) NOT NULL DEFAULT 11,
  kcal_trainingstag INTEGER NOT NULL DEFAULT 2200,
  kcal_ruhetag INTEGER NOT NULL DEFAULT 2000,
  protein_ziel_g INTEGER NOT NULL DEFAULT 135,
  vo2max_start NUMERIC(4,1) DEFAULT 41.1,
  vo2max_ziel NUMERIC(4,1) DEFAULT 45,
  hf_max_bpm INTEGER DEFAULT 188,
  standort TEXT NOT NULL DEFAULT 'Berlin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Daily Tracking ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_tracking (
  id TEXT PRIMARY KEY,
  datum DATE NOT NULL UNIQUE,
  gewicht_kg NUMERIC(5,1),
  bauchumfang_cm NUMERIC(5,1),
  schlaf_h NUMERIC(4,2),
  schlafindex INTEGER,
  ruhepuls_bpm INTEGER,
  vo2max NUMERIC(4,1),
  energielevel INTEGER CHECK (energielevel BETWEEN 1 AND 5),
  training_typ TEXT,
  kcal_soll INTEGER NOT NULL DEFAULT 2000,
  kcal_ist INTEGER,
  protein_soll_g INTEGER NOT NULL DEFAULT 135,
  protein_ist_g INTEGER,
  durchschnitts_hf_zone2_bpm INTEGER,
  notizen TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_tracking_datum ON daily_tracking(datum);

-- ─── Training Sessions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_sessions (
  id TEXT PRIMARY KEY,
  datum DATE NOT NULL,
  trainingstyp TEXT NOT NULL,
  dauer_min INTEGER,
  durchschnitts_hf_bpm INTEGER,
  feedback TEXT,
  abgeschlossen BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_datum ON training_sessions(datum);

-- ─── Exercise Logs ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercise_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  standort TEXT,
  uebungsname TEXT NOT NULL,
  reihenfolge INTEGER NOT NULL DEFAULT 0,
  gewicht_kg TEXT NOT NULL DEFAULT '',
  sets INTEGER NOT NULL DEFAULT 3,
  reps_ziel TEXT NOT NULL DEFAULT '3×10',
  reps_ist TEXT,
  erledigt BOOLEAN NOT NULL DEFAULT false,
  notizen TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON exercise_logs(session_id);

-- ─── Week Plans ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS week_plans (
  id TEXT PRIMARY KEY,
  kw INTEGER NOT NULL,
  jahr INTEGER NOT NULL,
  start_datum DATE NOT NULL,
  tage JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(jahr, kw)
);

-- ─── Meal Plans ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  datum DATE NOT NULL UNIQUE,
  typ TEXT NOT NULL DEFAULT 'Trainingstag',
  kcal_gesamt INTEGER NOT NULL DEFAULT 0,
  protein_gesamt_g INTEGER NOT NULL DEFAULT 0,
  mahlzeiten JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_datum ON meal_plans(datum);

-- ─── Custom Foods ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  portion_menge NUMERIC(8,2) NOT NULL DEFAULT 100,
  portion_einheit TEXT NOT NULL DEFAULT 'g',
  kcal INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(5,1) NOT NULL DEFAULT 0,
  kategorie TEXT NOT NULL DEFAULT 'Sonstiges',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── RLS (Row Level Security) ───────────────────────────────────────────────
-- Single-user app: allow full access for anon role

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- Policies: full access for anon (single-user personal app)
CREATE POLICY "anon_full_access" ON user_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON daily_tracking FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON training_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON exercise_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON week_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON custom_foods FOR ALL USING (true) WITH CHECK (true);

-- ─── Updated_at Trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profile_updated_at BEFORE UPDATE ON user_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_daily_tracking_updated_at BEFORE UPDATE ON daily_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_exercise_logs_updated_at BEFORE UPDATE ON exercise_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_week_plans_updated_at BEFORE UPDATE ON week_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_custom_foods_updated_at BEFORE UPDATE ON custom_foods FOR EACH ROW EXECUTE FUNCTION update_updated_at();
