"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  role: string;
}

type PermState = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotificationManager({ role }: Props) {
  const [permState, setPermState] = useState<PermState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermState("unsupported");
      return;
    }
    setPermState(Notification.permission as PermState);

    // Register service worker
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (existing) setSubscribed(true);
    }).catch(console.error);
  }, []);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermState(permission as PermState);
      if (permission !== "granted") {
        toast("Izin notifikasi ditolak. Aktifkan di pengaturan browser.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
        ).buffer as ArrayBuffer,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), role }),
      });

      setSubscribed(true);
      toast("✅ Notifikasi aktif! Anda akan menerima update real-time.");
    } catch (err) {
      console.error(err);
      toast("Gagal mengaktifkan notifikasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setSubscribed(false);
      toast("Notifikasi dimatikan.");
    } catch {
      toast("Gagal mematikan notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  if (permState === "unsupported") return null;

  return (
    <>
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading || permState === "denied"}
        title={
          permState === "denied"
            ? "Notifikasi diblokir di browser"
            : subscribed
            ? "Matikan notifikasi"
            : "Aktifkan notifikasi"
        }
        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          permState === "denied"
            ? "text-gray-300 cursor-not-allowed"
            : subscribed
            ? "text-[#003E87] bg-[#003E87]/10 hover:bg-[#003E87]/20"
            : "text-[#6B7280] hover:text-[#003E87] hover:bg-black/5"
        } ${loading ? "opacity-50" : ""}`}
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-[#003E87] border-t-transparent rounded-full animate-spin" />
        ) : subscribed ? (
          <BellRing className="w-4 h-4" />
        ) : permState === "denied" ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {subscribed && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#22C55E] rounded-full" />
        )}
      </motion.button>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[9999] bg-[#000000] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl max-w-[90vw] text-center"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
