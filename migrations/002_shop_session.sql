PRAGMA foreign_keys = ON;

CREATE TABLE shop (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE shop_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'employee')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES shop_user (id) ON DELETE CASCADE,
    UNIQUE (shop_id, user_id)
);

CREATE TABLE session (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES shop_user (id) ON DELETE CASCADE
);

CREATE INDEX idx_shop_member_user_id ON shop_member (user_id);
CREATE INDEX idx_session_user_id ON session (user_id);