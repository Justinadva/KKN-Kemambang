import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

/**
 * POST /api/transactions/[id]/sell
 * Body: { actual_sell_price_per_kg: number }
 *
 * Marks the transaction as sold to pengepul, calculates surplus,
 * and records it in kas_transactions.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  const body = await req.json();
  const { actual_sell_price_per_kg } = body;

  if (!actual_sell_price_per_kg) {
    return NextResponse.json({ error: "actual_sell_price_per_kg required" }, { status: 400 });
  }

  // Fetch the original transaction
  const [tx] = await sql`
    SELECT * FROM waste_transactions WHERE id = ${id}
  `;
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (tx.sold_to_pengepul) {
    return NextResponse.json({ error: "Already sold" }, { status: 400 });
  }

  const surplus_to_kas = Math.round(
    (actual_sell_price_per_kg - tx.buy_price_per_kg) * parseFloat(tx.weight_kg)
  );

  // Update transaction
  const [updated] = await sql`
    UPDATE waste_transactions SET
      sold_to_pengepul         = TRUE,
      sold_at                  = NOW(),
      actual_sell_price_per_kg = ${actual_sell_price_per_kg},
      surplus_to_kas           = ${surplus_to_kas}
    WHERE id = ${id}
    RETURNING *
  `;

  // Get current kas balance
  const [lastKas] = await sql`
    SELECT balance_after FROM kas_transactions ORDER BY id DESC LIMIT 1
  `;
  const currentBalance = lastKas ? lastKas.balance_after : 0;
  const newBalance = currentBalance + surplus_to_kas;

  // Record kas transaction
  await sql`
    INSERT INTO kas_transactions (type, amount, description, transaction_id, balance_after)
    VALUES (
      'pemasukan',
      ${surplus_to_kas},
      ${'Surplus jual ' + tx.waste_type_name + ' (' + tx.weight_kg + ' kg @ Rp ' + actual_sell_price_per_kg.toLocaleString('id-ID') + '/kg)'},
      ${id},
      ${newBalance}
    )
  `;

  return NextResponse.json({ transaction: updated, surplus_to_kas, new_kas_balance: newBalance });
}
