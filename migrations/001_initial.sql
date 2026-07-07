PRAGMA foreign_keys = ON;

CREATE TABLE shop_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone TEXT,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TRIGGER shop_user_set_updated_at
AFTER UPDATE ON shop_user
FOR EACH ROW
BEGIN
    UPDATE shop_user
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE id = OLD.id;
END;

CREATE UNIQUE INDEX idx_shop_user_phone_unique ON shop_user (phone) WHERE phone IS NOT NULL;

-- Email unique only when present and Apple may use private relay or omit on first sign-in
CREATE UNIQUE INDEX idx_shop_user_email_unique ON shop_user (email) WHERE email IS NOT NULL;

CREATE TABLE user_auth_identity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('phone', 'apple', 'google', 'facebook')),
    provider_subject_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES shop_user (id) ON DELETE CASCADE,
    UNIQUE (provider, provider_subject_id)
);

CREATE INDEX idx_user_auth_identity_user_id ON user_auth_identity(user_id);

CREATE TABLE otp_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
