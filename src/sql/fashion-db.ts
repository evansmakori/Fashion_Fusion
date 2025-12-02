// SQL Schema for fashion-db

export const schema = `
-- Users Table (deprecated - now using Firebase Auth)
-- Kept for backwards compatibility, but Firebase is the source of truth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE INDEX idx_users_email ON users(email);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  preferences TEXT NOT NULL, -- JSON string with user preferences
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Activity Table
CREATE TABLE IF NOT EXISTS user_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- e.g., 'image_generated', 'style_viewed', 'product_added'
  activity_data TEXT, -- JSON string with activity details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_activity_type ON user_activity(activity_type);
CREATE INDEX idx_activity_created_at ON user_activity(created_at);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

CREATE TABLE IF NOT EXISTS saved_products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_data TEXT,
  analysis_metadata TEXT,
  total_estimated_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_products_category_id ON saved_products(category_id);

CREATE TABLE IF NOT EXISTS deconstructed_items (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_category TEXT,
  estimated_price REAL NOT NULL,
  confidence_score REAL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES saved_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_deconstructed_items_product_id ON deconstructed_items(product_id);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount REAL NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_transaction_id TEXT,
  estimated_delivery_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  item_id TEXT,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES saved_products(id) ON DELETE SET NULL,
  FOREIGN KEY (item_id) REFERENCES deconstructed_items(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_transaction_id TEXT,
  gateway_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- AI Fashion Descriptions Table
CREATE TABLE IF NOT EXISTS fashion_descriptions (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  description TEXT NOT NULL,
  styling_tips TEXT,
  occasions TEXT,
  color_palette TEXT,
  trend_tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES saved_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_fashion_descriptions_product_id ON fashion_descriptions(product_id);
CREATE INDEX idx_fashion_descriptions_style ON fashion_descriptions(style);

-- User Fashion Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favorite_styles TEXT,
  favorite_colors TEXT,
  size_info TEXT,
  budget_range TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Fashion Trends Table
CREATE TABLE IF NOT EXISTS fashion_trends (
  id TEXT PRIMARY KEY,
  trend_name TEXT NOT NULL,
  trend_description TEXT,
  season TEXT,
  year INTEGER,
  popularity_score REAL DEFAULT 0,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fashion_trends_season ON fashion_trends(season, year);

-- Color Analysis Table
CREATE TABLE IF NOT EXISTS color_analysis (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  primary_colors TEXT NOT NULL,
  secondary_colors TEXT,
  color_harmony TEXT,
  season_match TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES saved_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_color_analysis_product_id ON color_analysis(product_id);
`;
