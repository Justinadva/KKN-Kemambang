import { NextResponse } from "next/server";

// ── HMAC helpers ──────────────────────────────────────────────────────────
async function signHMAC(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret).buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value).buffer as ArrayBuffer);
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── PIN map ───────────────────────────────────────────────────────────────
const PIN_MAP: Record<string, string> = {
  [process.env.PIN_PLTS        ?? "1111"]: "plts",
  [process.env.PIN_BANK_SAMPAH ?? "2222"]: "bank_sampah",
  [process.env.PIN_ADMIN       ?? "0000"]: "admin",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { pin } = body as { pin?: string };

  if (!pin || pin.length !== 4) {
    return NextResponse.json({ error: "PIN harus 4 digit" }, { status: 400 });
  }

  const role = PIN_MAP[pin];
  if (!role) {
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  const secret = process.env.SESSION_SECRET ?? "fallback-secret";
  const sig = await signHMAC(role, secret);

  const res = NextResponse.json({ ok: true, role });

  // Set cookies HttpOnly, Secure, SameSite=Strict — 8 jam
  const maxAge = 60 * 60 * 8;
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set("deb-role", role, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge, path: "/" });
  res.cookies.set("deb-sig",  sig,  { httpOnly: true, secure: isProd, sameSite: "strict", maxAge, path: "/" });

  return res;
}
