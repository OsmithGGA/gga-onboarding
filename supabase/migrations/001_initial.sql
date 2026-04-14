-- GGA Onboarding Platform — Initial Schema

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  company          TEXT,
  country          TEXT CHECK (country IN ('ireland', 'usa')),
  drive_folder_id  TEXT,
  drive_folder_url TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Step completions table
CREATE TABLE IF NOT EXISTS step_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  step_number  INT NOT NULL CHECK (step_number BETWEEN 1 AND 4),
  note         TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, step_number)
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_completions ENABLE ROW LEVEL SECURITY;

-- Clients: users can only read their own row
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT USING (auth.uid() = user_id);

-- Clients: service role can do everything (used by admin API)
CREATE POLICY "clients_service_all" ON clients
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Step completions: clients can read their own
CREATE POLICY "steps_select_own" ON step_completions
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Step completions: clients can insert their own
CREATE POLICY "steps_insert_own" ON step_completions
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Step completions: service role can do everything
CREATE POLICY "steps_service_all" ON step_completions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
