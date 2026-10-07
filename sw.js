// Naikkan versi ini SETIAP kali kamu deploy perubahan (v2, v3, v4, ...)
// Ini yang memaksa browser membuang cache lama dan ambil aset baru.
const CACHE_VERSION = 'trade-app-v3';
const STATIC_ASSETS = ['./', './index.html', './manifest.json'];

// Library dari CDN yang dipakai aplikasi (Tailwind, flatpickr, SweetAlert, font).
// Disimpan juga supaya aplikasi bisa tampil walau jaringan HP lagi "tidur".
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

// Kalau jaringan belum menjawab sampai batas ini, pakai salinan tersimpan.
const NETWORK_TIMEOUT_MS = 1500;

self.addEventListener('install', (e) => {
  // Langsung aktifkan SW baru tanpa nunggu semua tab ditutup
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION) // buang cache versi lama
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim()) // langsung ambil alih kontrol tab yang sedang terbuka
  );
});

// Aset sendiri: network-first, tapi tidak menunggu jaringan terlalu lama.
// Online normal -> selalu versi terbaru. Jaringan lambat/offline -> salinan tersimpan.
function networkFirstWithTimeout(e) {
  const req = e.request;
  const network = fetch(req).then((res) => {
    if (res && res.ok) {
      const resClone = res.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
    }
    return res;
  });
  e.waitUntil(network.catch(() => {})); // biar tetap ke-update di belakang walau sudah pakai salinan

  return caches.match(req).then((cached) => {
    if (!cached) return network;
    const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NETWORK_TIMEOUT_MS));
    return Promise.race([network, timeout]).catch(() => cached);
  });
}

// Library CDN: pakai salinan tersimpan dulu (instan), diperbarui diam-diam di belakang.
function staleWhileRevalidate(e) {
  const req = e.request;
  return caches.open(CACHE_VERSION).then((cache) =>
    cache.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      e.waitUntil(network.catch(() => {}));
      return cached || network;
    })
  );
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.origin === self.location.origin) {
    e.respondWith(networkFirstWithTimeout(e));
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(e));
    return;
  }

  // JANGAN campur tangan sama sekali untuk request ke luar lainnya (Google Apps Script,
  // Binance API, dll). Biarkan browser handle langsung apa adanya, supaya
  // data trading & kurs selalu diambil fresh, tidak pernah ke-cache oleh SW.
});
