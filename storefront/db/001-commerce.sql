CREATE TABLE IF NOT EXISTS commerce_orders (
 id UUID PRIMARY KEY, public_token TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL,
 email TEXT NOT NULL, provider TEXT NOT NULL CHECK(provider IN ('paddle','stripe','paypal','crypto')), crypto_token TEXT,
 amount INTEGER NOT NULL CHECK(amount > 0), currency TEXT NOT NULL, bundle_version TEXT NOT NULL, pdf_sha256 TEXT NOT NULL, archive_sha256 TEXT,
 mode TEXT NOT NULL CHECK(mode IN ('live','sandbox')), status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','expired','attention')),
 risk_status TEXT, provider_checkout_id TEXT, provider_payment_id TEXT, checkout_url TEXT,
 create_state TEXT NOT NULL DEFAULT 'new' CHECK(create_state IN ('new','creating','ready','ambiguous')), create_lease TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), paid_at TIMESTAMPTZ,
 UNIQUE(provider,provider_checkout_id), UNIQUE(provider,provider_payment_id)
);
CREATE TABLE IF NOT EXISTS commerce_events (
 id BIGSERIAL PRIMARY KEY, provider TEXT NOT NULL, event_id TEXT NOT NULL, order_id UUID REFERENCES commerce_orders(id),
 event_type TEXT NOT NULL, payment_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(provider,event_id)
);
CREATE TABLE IF NOT EXISTS commerce_fulfillments (
 id BIGSERIAL PRIMARY KEY, order_id UUID NOT NULL REFERENCES commerce_orders(id), bundle_version TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','delivered','bounced','attention')),
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(), lease_until TIMESTAMPTZ,
 first_send_at TIMESTAMPTZ, payload JSONB, resend_id TEXT UNIQUE, last_error TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(order_id,bundle_version)
);
CREATE INDEX IF NOT EXISTS commerce_fulfillment_pending ON commerce_fulfillments (next_attempt) WHERE state IN ('pending','sending');
CREATE INDEX IF NOT EXISTS commerce_order_pending ON commerce_orders(created_at) WHERE status='pending';
CREATE TABLE IF NOT EXISTS commerce_rate_limits (key TEXT NOT NULL, bucket TIMESTAMPTZ NOT NULL, requests INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(key,bucket));
CREATE TABLE IF NOT EXISTS commerce_email_events (event_id TEXT PRIMARY KEY, resend_id TEXT NOT NULL, event_type TEXT NOT NULL, payment_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

ALTER TABLE commerce_events ADD COLUMN IF NOT EXISTS payment_id TEXT;
CREATE INDEX IF NOT EXISTS commerce_payment_risk ON commerce_events(provider,payment_id) WHERE event_type IN ('refund','dispute');

ALTER TABLE commerce_fulfillments ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ;
ALTER TABLE commerce_fulfillments ADD COLUMN IF NOT EXISTS queue_lease TIMESTAMPTZ;
ALTER TABLE commerce_fulfillments ADD COLUMN IF NOT EXISTS queue_message_id TEXT;
