-- ============================================================
-- Migration 002: V2 Schema — GGA Onboarding Portal
-- ============================================================

-- 1. Extend country check to include United Kingdom
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_country_check;
ALTER TABLE clients ADD CONSTRAINT clients_country_check
  CHECK (country IN ('ireland', 'united_kingdom', 'usa'));

-- 2. Add new columns to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS first_name                TEXT,
  ADD COLUMN IF NOT EXISTS last_name                 TEXT,
  ADD COLUMN IF NOT EXISTS business_name             TEXT,
  ADD COLUMN IF NOT EXISTS currency                  TEXT DEFAULT '€',
  ADD COLUMN IF NOT EXISTS contract_length           INT DEFAULT 90,
  ADD COLUMN IF NOT EXISTS deposit_amount            NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS month1_remainder          NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS month2_amount             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS month3_amount             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS daily_ad_budget           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS payment_due_date          INT CHECK (payment_due_date BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS drive_assets_folder_url   TEXT,
  ADD COLUMN IF NOT EXISTS drive_contracts_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_sheet_url           TEXT,
  ADD COLUMN IF NOT EXISTS pandadoc_notes            TEXT,
  ADD COLUMN IF NOT EXISTS contract_start_date       DATE,
  ADD COLUMN IF NOT EXISTS onboarding_complete_at    TIMESTAMPTZ;

-- 3. Backfill first/last name from existing name column
UPDATE clients
  SET first_name = split_part(name, ' ', 1),
      last_name  = NULLIF(substring(name FROM position(' ' IN name) + 1), '')
  WHERE first_name IS NULL AND name IS NOT NULL;

-- 4. Extend step_completions to include Step 0
ALTER TABLE step_completions DROP CONSTRAINT IF EXISTS step_completions_step_number_check;
ALTER TABLE step_completions ADD CONSTRAINT step_completions_step_number_check
  CHECK (step_number BETWEEN 0 AND 4);

-- 5. Add admin override tracking + contract signature fields to step_completions
ALTER TABLE step_completions
  ADD COLUMN IF NOT EXISTS completed_by   TEXT DEFAULT 'client' CHECK (completed_by IN ('client', 'admin')),
  ADD COLUMN IF NOT EXISTS signature_name TEXT,
  ADD COLUMN IF NOT EXISTS signature_ip   TEXT,
  ADD COLUMN IF NOT EXISTS pdf_drive_url  TEXT;

-- 6. Contract templates table (master template editable by GGA admin)
CREATE TABLE IF NOT EXISTS contract_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL DEFAULT 'Master Contract',
  body       TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default template placeholder
INSERT INTO contract_templates (name, body) VALUES (
  'Master Contract',
  '<p>Paste your contract HTML here. Use the following variables which will be auto-populated for each client:</p>
<ul>
  <li><strong>{ClientName}</strong> — Full client name</li>
  <li><strong>{BusinessName}</strong> — Business name</li>
  <li><strong>{Country}</strong> — Country</li>
  <li><strong>{StartDate}</strong> — Contract start date</li>
  <li><strong>{ContractEndDate}</strong> — Start date + 90 days</li>
  <li><strong>{SignatureDate}</strong> — Date signed (auto-filled on signing)</li>
  <li><strong>{SignatureIP}</strong> — IP address at time of signing</li>
  <li><strong>{Currency}</strong> — Currency symbol (€/£/$)</li>
  <li><strong>{DailyAdBudget}</strong> — Daily ad budget</li>
  <li><strong>{DepositAmount}</strong> — Deposit amount</li>
  <li><strong>{Month1Remainder}</strong> — Month 1 remainder</li>
  <li><strong>{Month2Amount}</strong> — Month 2 amount</li>
  <li><strong>{Month3Amount}</strong> — Month 3 amount</li>
  <li><strong>{PaymentDueDate}</strong> — Day of month payment is due</li>
</ul>'
) ON CONFLICT DO NOTHING;

-- 7. RLS on contract_templates
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ct_service_all" ON contract_templates;
CREATE POLICY "ct_service_all" ON contract_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "ct_client_read" ON contract_templates;
CREATE POLICY "ct_client_read" ON contract_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Client activity log table
CREATE TABLE IF NOT EXISTS client_activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "log_service_all" ON client_activity_log;
CREATE POLICY "log_service_all" ON client_activity_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "log_client_read" ON client_activity_log;
CREATE POLICY "log_client_read" ON client_activity_log
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_activity_client ON client_activity_log(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_step_completions_client_step ON step_completions(client_id, step_number);
