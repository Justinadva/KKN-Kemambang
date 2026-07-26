import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  const body = await req.json();
  const { name, emoji, color, buy_price_per_kg, sell_price_per_kg } = body;

  const [row] = await sql`
    UPDATE waste_types
    SET
      name              = COALESCE(${name}, name),
      emoji             = COALESCE(${emoji}, emoji),
      color             = COALESCE(${color}, color),
      buy_price_per_kg  = COALESCE(${buy_price_per_kg}, buy_price_per_kg),
      sell_price_per_kg = COALESCE(${sell_price_per_kg}, sell_price_per_kg)
    WHERE id = ${id}
    RETURNING *
  `;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  await sql`DELETE FROM waste_types WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
