PRAGMA foreign_keys = ON;

CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE,
    UNIQUE (shop_id, name)
);

CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    category_id INTEGER,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL
);

CREATE INDEX idx_product_shop ON product (shop_id);

CREATE TABLE product_price (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
    price REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE,
    UNIQUE (product_id, currency_code)
);

CREATE INDEX idx_product_price_currency ON product_price (currency_code);
