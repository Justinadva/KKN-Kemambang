import { NextResponse } from "next/server";
import webpush from "web-push";
import sql, { initDB } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:admin@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export async function POST(req: Request) {
  await initDB();
  const body = await req.json().catch(() => ({}));
  const { title, body: msgBody, icon, tag, url, targetRole } = body as {
    title?: string; body?: string; icon?: string; tag?: string; url?: string; targetRole?: string;
  };

  // Ambil subscribers sesuai role (atau semua jika tidak dispesifikasi)
  const subs = targetRole
    ? await sql`SELECT * FROM push_subscriptions WHERE role = ${targetRole} OR role = 'admin'`
    : await sql`SELECT * FROM push_subscriptions`;

  const payload = JSON.stringify({ title: title ?? "DEB Kembara", body: msgBody ?? "", icon: icon ?? "/logo-kknt.png", tag, url });

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, sent, failed, total: subs.length });
}
