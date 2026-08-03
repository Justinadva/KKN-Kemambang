import { NextResponse } from "next/server";
import sql, { initDB } from "@/lib/db";

export async function POST(req: Request) {
  await initDB();
  const body = await req.json().catch(() => ({}));
  const { subscription, role } = body as { subscription?: PushSubscriptionJSON; role?: string };

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  // Upsert subscription
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, role)
    VALUES (
      ${subscription.endpoint},
      ${(subscription.keys as Record<string, string>)?.p256dh ?? ""},
      ${(subscription.keys as Record<string, string>)?.auth ?? ""},
      ${role ?? "unknown"}
    )
    ON CONFLICT (endpoint) DO UPDATE
      SET p256dh = EXCLUDED.p256dh,
          auth   = EXCLUDED.auth,
          role   = EXCLUDED.role,
          updated_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
