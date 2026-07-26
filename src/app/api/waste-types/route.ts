import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function GET() {
  await initDB();
  const rows = await sql`
    SELECT id, name, emoji, color, buy_price_per_kg, sell_price_per_kg, created_at
    FROM waste_types
    ORDER BY id ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await initDB();
  const body = await req.json();
  const { name, emoji, color, buy_price_per_kg, sell_price_per_kg } = body;

  if (!name || !buy_price_per_kg || !sell_price_per_kg) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO waste_types (name, emoji, color, buy_price_per_kg, sell_price_per_kg)
    VALUES (${name}, ${emoji ?? "♻️"}, ${color ?? "#003E87"}, ${buy_price_per_kg}, ${sell_price_per_kg})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
