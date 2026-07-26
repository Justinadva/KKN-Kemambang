import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function GET() {
  await initDB();

  // 1. Total kg & value per waste type
  const perType = await sql`
    SELECT
      waste_type_name,
      SUM(weight_kg)::FLOAT       AS total_kg,
      SUM(total_buy_value)        AS total_buy_value,
      COUNT(*)                    AS transaction_count
    FROM waste_transactions
    GROUP BY waste_type_name
    ORDER BY total_kg DESC
  `;

  // 2. Overall totals
  const [totals] = await sql`
    SELECT
      COALESCE(SUM(weight_kg),0)::FLOAT   AS total_kg,
      COALESCE(SUM(total_buy_value),0)    AS total_buy_value,
      COUNT(*)                            AS transaction_count,
      COALESCE(SUM(CASE WHEN sold_to_pengepul THEN surplus_to_kas ELSE 0 END),0) AS total_surplus
    FROM waste_transactions
  `;

  // 3. Kas balance
  const [kas] = await sql`
    SELECT COALESCE(balance_after,0) AS kas_balance
    FROM kas_transactions
    ORDER BY id DESC
    LIMIT 1
  `;

  // 4. Pending (belum dijual ke pengepul)
  const pending = await sql`
    SELECT
      id,
      waste_type_name,
      weight_kg::FLOAT,
      sell_price_per_kg,
      buy_price_per_kg,
      total_buy_value,
      created_at
    FROM waste_transactions
    WHERE sold_to_pengepul = FALSE
    ORDER BY created_at DESC
  `;

  // 5. Kas history
  const kasHistory = await sql`
    SELECT
      k.id, k.type, k.amount, k.description, k.balance_after, k.created_at,
      t.waste_type_name, t.weight_kg::FLOAT
    FROM kas_transactions k
    LEFT JOIN waste_transactions t ON k.transaction_id = t.id
    ORDER BY k.created_at DESC
    LIMIT 20
  `;

  return NextResponse.json({
    perType,
    totals,
    kas_balance: kas?.kas_balance ?? 0,
    pending,
    kasHistory,
  });
}
