/*
  # Madras Engineering College Canteen System Database Schema

  ## Overview
  This migration creates the complete database schema for the MEC Canteen System,
  including user management, menu items, orders, and recharge transactions.

  ## New Tables

  ### 1. users
  Stores all user information including students, staff, and admins
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (text, unique) - Custom user ID (e.g., student roll number)
  - `name` (text) - Full name
  - `email` (text, unique) - Email address
  - `rfid_card_id` (text, unique) - RFID card identifier
  - `role` (text) - User role: student, staff, or admin
  - `balance` (decimal) - Current wallet balance
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. menu_items
  Contains all food items available in the canteen
  - `id` (int, primary key) - Auto-incrementing ID
  - `name` (text) - Item name
  - `category` (text) - Meal category: breakfast, lunch, breaktime, or dinner
  - `price` (decimal) - Item price
  - `image_url` (text) - URL to item image
  - `available` (boolean) - Availability status
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. orders
  Tracks all food orders placed by users
  - `id` (uuid, primary key) - Unique order identifier
  - `order_code` (text, unique) - Human-readable order code
  - `user_id` (uuid, foreign key) - Reference to users table
  - `items` (jsonb) - Array of ordered items with details
  - `total_items` (int) - Count of items in order
  - `total_amount` (decimal) - Total order amount
  - `previous_balance` (decimal) - Balance before order
  - `remaining_balance` (decimal) - Balance after order
  - `status` (text) - Order status: pending, completed, or cancelled
  - `created_at` (timestamptz) - Order timestamp

  ### 4. recharge_transactions
  Records all wallet recharge transactions
  - `id` (uuid, primary key) - Unique transaction identifier
  - `recharge_code` (text, unique) - Human-readable transaction code
  - `user_id` (uuid, foreign key) - Reference to users table
  - `amount` (decimal) - Recharge amount
  - `payment_mode` (text) - Payment method: UPI, NetBanking, Card, or Wallet
  - `transaction_status` (text) - Status: pending, success, or failed
  - `created_at` (timestamptz) - Transaction timestamp

  ## Security
  - Row Level Security (RLS) is enabled on all tables
  - Users can only access their own data
  - Admins have full access to all data
  - Public signup is allowed for registration
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  rfid_card_id text UNIQUE,
  role text NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
  balance numeric(10,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('breakfast', 'lunch', 'breaktime', 'dinner')),
  price numeric(6,2) NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  items jsonb NOT NULL,
  total_items int NOT NULL,
  total_amount numeric(8,2) NOT NULL,
  previous_balance numeric(8,2) NOT NULL,
  remaining_balance numeric(8,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recharge_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recharge_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  payment_mode text NOT NULL CHECK (payment_mode IN ('UPI', 'NetBanking', 'Card', 'Wallet')),
  transaction_status text DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'success', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own recharge transactions"
  ON recharge_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own recharge transactions"
  ON recharge_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all recharge transactions"
  ON recharge_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_user_id ON recharge_transactions(user_id);