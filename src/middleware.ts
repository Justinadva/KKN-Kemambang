import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes yang tidak perlu auth
const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico", "/logo-kknt", "/sw.js", "/icons"];

// API bank sampah — hanya bank_sampah & admin
const BANK_SAMPAH_APIS = ["/api/transactions", "/api/waste-types", "/api/summary", "/api/chart-data"];

// API PLTS — hanya plts & admin  
const PLTS_APIS = ["/api/iot-data"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Ambil role dari cookie
  const roleRaw = request.cookies.get("deb-role")?.value;
  const sigRaw  = request.cookies.get("deb-sig")?.value;

  // Tidak ada session → redirect ke login
  if (!roleRaw || !sigRaw) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized", redirect: "/login" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validasi signature HMAC (Web Crypto — edge-compatible)
  const secret = process.env.SESSION_SECRET ?? "fallback-secret";
  const valid = await verifyHMAC(roleRaw, sigRaw, secret);

  if (!valid || !["plts", "bank_sampah", "admin"].includes(roleRaw)) {
    const resp = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid session" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    resp.cookies.delete("deb-role");
    resp.cookies.delete("deb-sig");
    return resp;
  }

  const role = roleRaw as "plts" | "bank_sampah" | "admin";

  // Guard API bank sampah dari role PLTS
  if (role === "plts" && BANK_SAMPAH_APIS.some((p) => pathname.startsWith(p))) {
    return NextResponse.json({ error: "Forbidden: Akses ditolak untuk role PLTS" }, { status: 403 });
  }

  // Guard API PLTS dari role bank_sampah
  if (role === "bank_sampah" && PLTS_APIS.some((p) => pathname.startsWith(p))) {
    return NextResponse.json({ error: "Forbidden: Akses ditolak untuk role Bank Sampah" }, { status: 403 });
  }

  // Teruskan request + tambahkan header role untuk dipakai di API
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-role", role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// ── HMAC Web Crypto helper ────────────────────────────────────────────────
async function verifyHMAC(value: string, signature: string, secret: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(secret).buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false, ["sign", "verify"]
    );
    const sigBytes = hexToBytes(signature);
    return await crypto.subtle.verify("HMAC", key, sigBytes.buffer as ArrayBuffer, enc.encode(value).buffer as ArrayBuffer);
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-kknt.png|logo-kknt.svg|sw.js|icons).*)"],
};
