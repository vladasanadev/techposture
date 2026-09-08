-- Safe for existing orders: preserve legacy provider identities and PDF-only versions.
ALTER TABLE commerce_orders DROP CONSTRAINT IF EXISTS commerce_orders_provider_check;
ALTER TABLE commerce_orders ADD CONSTRAINT commerce_orders_provider_check CHECK(provider IN ('paddle','stripe','paypal','crypto'));
ALTER TABLE commerce_orders ADD COLUMN IF NOT EXISTS archive_sha256 TEXT;
