-- Gereply multi-tenant PostgreSQL foundation. Run with psql before enabling
-- DATABASE_URL in a production deployment. All tenant-owned tables retain an
-- explicit business_id; application queries must always bind it.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE membership_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE conversation_state AS ENUM ('AI_ACTIVE', 'NEEDS_HUMAN', 'HUMAN_ACTIVE', 'RESOLVED');
CREATE TYPE message_direction AS ENUM ('incoming', 'outgoing', 'system');
CREATE TYPE connection_state AS ENUM ('pending', 'connected', 'disconnected', 'error');
CREATE TYPE follow_up_state AS ENUM ('scheduled', 'sent', 'cancelled', 'failed');

CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), google_subject text UNIQUE NOT NULL, email text UNIQUE NOT NULL, name text NOT NULL, picture_url text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE businesses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text, timezone text NOT NULL DEFAULT 'UTC', contact_phone text, location text, opening_hours jsonb NOT NULL DEFAULT '[]', booking_rules text, cancellation_policy text, custom_instructions text, subscription_status text NOT NULL DEFAULT 'trial', plan text NOT NULL DEFAULT 'trial', trial_started_at timestamptz NOT NULL DEFAULT now(), trial_ends_at timestamptz NOT NULL DEFAULT now() + interval '7 days', grace_period_ends_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK (trial_ends_at = trial_started_at + interval '7 days'));
CREATE TABLE memberships (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, role membership_role NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, user_id));
CREATE TABLE business_hours (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), is_open boolean NOT NULL DEFAULT false, open_time time, close_time time, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, day_of_week), CHECK ((is_open AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time) OR (NOT is_open AND open_time IS NULL AND close_time IS NULL)));
CREATE TABLE whatsapp_connections (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, provider text NOT NULL CHECK (provider = 'meta'), phone_number_id text UNIQUE NOT NULL, waba_id text, display_phone_number text, encrypted_access_token bytea NOT NULL, token_key_version smallint NOT NULL DEFAULT 1, status connection_state NOT NULL DEFAULT 'pending', last_webhook_received_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, provider));
CREATE TABLE customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, phone text NOT NULL, name text, notes text, tags text[] NOT NULL DEFAULT '{}', opted_out_at timestamptz, last_interaction_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, phone));
CREATE TABLE conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE, whatsapp_connection_id uuid REFERENCES whatsapp_connections(id) ON DELETE SET NULL, state conversation_state NOT NULL DEFAULT 'AI_ACTIVE', unread_count integer NOT NULL DEFAULT 0 CHECK (unread_count >= 0), last_message_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX conversations_tenant_recent_idx ON conversations (business_id, last_message_at DESC);
CREATE TABLE messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, direction message_direction NOT NULL, sender_type text NOT NULL, body text NOT NULL, provider_message_id text, delivery_status text NOT NULL DEFAULT 'pending', error_code text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, provider_message_id));
CREATE INDEX messages_tenant_conversation_idx ON messages (business_id, conversation_id, created_at);
CREATE TABLE knowledge_base_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, kind text NOT NULL CHECK (kind IN ('service','faq','pricing','hours','policy','contact','instruction')), title text NOT NULL, content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE appointments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE, conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL, starts_at timestamptz, status text NOT NULL DEFAULT 'requested', details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE human_handoffs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, requested_at timestamptz NOT NULL DEFAULT now(), assigned_user_id uuid REFERENCES users(id) ON DELETE SET NULL, resolved_at timestamptz, reason text);
CREATE TABLE follow_ups (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE, kind text NOT NULL, scheduled_for timestamptz NOT NULL, timezone text NOT NULL, template_name text, status follow_up_state NOT NULL DEFAULT 'scheduled', idempotency_key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (business_id, idempotency_key));
CREATE TABLE subscriptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE, provider_customer_id text, provider_subscription_id text, status text NOT NULL DEFAULT 'trial', plan text NOT NULL DEFAULT 'trial', current_period_ends_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL, action text NOT NULL, entity_type text NOT NULL, entity_id text, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());

-- Defense in depth: production repository should SET LOCAL app.business_id on
-- every transaction. RLS prevents a missed WHERE clause becoming a tenant leak.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_customers ON customers USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_conversations ON conversations USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_messages ON messages USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_knowledge ON knowledge_base_items USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_appointments ON appointments USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_handoffs ON human_handoffs USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_followups ON follow_ups USING (business_id = current_setting('app.business_id', true)::uuid);
CREATE POLICY tenant_audit_logs ON audit_logs USING (business_id = current_setting('app.business_id', true)::uuid);
