import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get("deb-role")?.value ?? null;
  const validRoles = ["plts", "bank_sampah", "admin"];
  return NextResponse.json({ role: validRoles.includes(role ?? "") ? role : null });
}
