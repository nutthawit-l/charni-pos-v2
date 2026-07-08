PRAGMA foreign_keys = ON;

CREATE TABLE event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    booth_cost REAL NOT NULL DEFAULT 0,
    travel_cost REAL NOT NULL DEFAULT 0,
    hotel_cost REAL NOT NULL DEFAULT 0,
    food_cost REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE
);

CREATE INDEX idx_event_shop_id ON event (shop_id);
CREATE INDEX idx_event_start_at ON event (start_at);
CREATE INDEX idx_event_end_at ON event (end_at);

CREATE TABLE event_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('creator', 'collaborator', 'assistant')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES shop_user (id) ON DELETE CASCADE,
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_member_user_id ON event_member (user_id);
CREATE INDEX idx_event_member_event_id ON event_member (event_id);

CREATE TABLE shop_order (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
    total_income REAL NOT NULL,
    total_product_sold INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE RESTRICT
);

CREATE INDEX idx_shop_order_event_id ON shop_order (event_id);
CREATE INDEX idx_shop_order_created_at ON shop_order (created_at);

CREATE TABLE order_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit REAL NOT NULL CHECK (price_per_unit >= 0),
    FOREIGN KEY (order_id) REFERENCES shop_order (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_item_order_id ON order_item (order_id);
CREATE INDEX idx_order_item_product_id ON order_item (product_id);
