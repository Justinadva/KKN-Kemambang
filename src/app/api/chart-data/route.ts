import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function GET(req: Request) {
  await initDB();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "daily"; // daily | weekly | monthly

  // Setoran (transaksi masuk dari warga) per periode
  let groupExpr: string;
  if (period === "monthly") {
    groupExpr = "month";
  } else if (period === "weekly") {
    groupExpr = "week";
  } else {
    groupExpr = "day";
  }

  const setoran = await sql`
    SELECT
      date_trunc(${groupExpr}, created_at AT TIME ZONE 'Asia/Jakarta') AS period_start,
      SUM(weight_kg)::FLOAT                AS total_kg,
      SUM(total_buy_value)                 AS total_dibayar,
      COUNT(*)                             AS jumlah_transaksi
    FROM waste_transactions
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const penjualan = await sql`
    SELECT
      date_trunc(${groupExpr}, sold_at AT TIME ZONE 'Asia/Jakarta') AS period_start,
      SUM(weight_kg)::FLOAT                                          AS total_kg,
      SUM(actual_sell_price_per_kg::FLOAT * weight_kg)::INT          AS total_penjualan,
      SUM(surplus_to_kas)                                            AS total_surplus,
      COUNT(*)                                                       AS jumlah_penjualan
    FROM waste_transactions
    WHERE sold_to_pengepul = TRUE
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const perJenis = await sql`
    SELECT
      date_trunc(${groupExpr}, created_at AT TIME ZONE 'Asia/Jakarta') AS period_start,
      waste_type_name,
      SUM(weight_kg)::FLOAT AS total_kg
    FROM waste_transactions
    GROUP BY 1, waste_type_name
    ORDER BY 1 ASC
  `;

  return NextResponse.json({ setoran, penjualan, perJenis });
}
