import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function GET(req: Request) {
  await initDB();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const rows = await sql`
    SELECT
      id,
      waste_type_id,
      waste_type_name,
      weight_kg,
      buy_price_per_kg,
      sell_price_per_kg,
      total_buy_value,
      sold_to_pengepul,
      sold_at,
      actual_sell_price_per_kg,
      surplus_to_kas,
      created_at
    FROM waste_transactions
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await initDB();
  const body = await req.json();
  const {
    waste_type_id,
    waste_type_name,
    weight_kg,
    buy_price_per_kg,
    sell_price_per_kg,
  } = body;

  if (!waste_type_name || !weight_kg || !buy_price_per_kg) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const total_buy_value = Math.round(buy_price_per_kg * weight_kg);

  const [row] = await sql`
    INSERT INTO waste_transactions
      (waste_type_id, waste_type_name, weight_kg, buy_price_per_kg, sell_price_per_kg, total_buy_value)
    VALUES
      (${waste_type_id ?? null}, ${waste_type_name}, ${weight_kg}, ${buy_price_per_kg}, ${sell_price_per_kg}, ${total_buy_value})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
