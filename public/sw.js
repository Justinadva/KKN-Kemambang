// Service Worker for Web Push Notifications
// File ini harus ada di /public/sw.js (root-level, bukan dalam src/)

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "DEB Kembara", body: event.data.text() };
  }

  const { title = "DEB Kembara", body = "", icon = "/logo-kknt.png", badge = "/logo-kknt.png", tag, url = "/" } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: tag || "deb-notif",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
