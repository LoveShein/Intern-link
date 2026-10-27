-- Additions required by the auth backend. Safe to run more than once.
-- Your original schema (shema.sql) is NOT modified.

-- Used to invalidate old login tokens after a password reset.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Single-use password reset tokens. Only a SHA-256 hash of the token is stored.
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id    SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash  CHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
