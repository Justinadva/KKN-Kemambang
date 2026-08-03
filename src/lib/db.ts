import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default sql;

/**
 * Run once on startup to create tables if they don't exist.
 */
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS waste_types (
      id        SERIAL PRIMARY KEY,
      name      VARCHAR(100)  NOT NULL,
      emoji     VARCHAR(10)   NOT NULL DEFAULT '♻️',
      color     VARCHAR(7)    NOT NULL DEFAULT '#003E87',
      buy_price_per_kg  INTEGER NOT NULL,   -- harga beli dari warga (Rp/kg)
      sell_price_per_kg INTEGER NOT NULL,   -- harga jual ke pengepul (Rp/kg)
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS waste_transactions (
      id                SERIAL PRIMARY KEY,
      waste_type_id     INTEGER REFERENCES waste_types(id) ON DELETE SET NULL,
      waste_type_name   VARCHAR(100) NOT NULL,
      weight_kg         DECIMAL(10,2) NOT NULL,
      buy_price_per_kg  INTEGER NOT NULL,
      sell_price_per_kg INTEGER NOT NULL,
      total_buy_value   INTEGER NOT NULL,     -- dibayar ke warga
      sold_to_pengepul  BOOLEAN NOT NULL DEFAULT FALSE,
      sold_at           TIMESTAMPTZ,
      actual_sell_price_per_kg INTEGER,       -- bisa berbeda saat dijual (fluktuatif)
      surplus_to_kas    INTEGER,              -- (actual_sell - buy) * kg, diisi saat dijual
      created_at        TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kas_transactions (
      id             SERIAL PRIMARY KEY,
      type           VARCHAR(20) NOT NULL CHECK (type IN ('pemasukan','pengeluaran')),
      amount         INTEGER NOT NULL,
      description    TEXT,
      transaction_id INTEGER REFERENCES waste_transactions(id) ON DELETE SET NULL,
      balance_after  INTEGER NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         SERIAL PRIMARY KEY,
      endpoint   TEXT NOT NULL UNIQUE,
      p256dh     TEXT NOT NULL,
      auth       TEXT NOT NULL,
      role       VARCHAR(20) NOT NULL DEFAULT 'unknown',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed default waste types if empty
  const existing = await sql`SELECT id FROM waste_types LIMIT 1`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO waste_types (name, emoji, color, buy_price_per_kg, sell_price_per_kg) VALUES
        ('Plastik',        '🧴', '#003E87', 3500,  4000),
        ('Kertas / Kardus','📦', '#8B5CF6', 2000,  2500),
        ('Logam / Besi',   '⚙️', '#6B7280', 8000,  9500),
        ('Kaca / Botol',   '🍶', '#06B6D4', 1500,  1800),
        ('Organik',        '🌿', '#22C55E',  500,   700)
    `;
  }
}
