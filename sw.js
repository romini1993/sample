// Naikkan versi ini SETIAP kali kamu deploy perubahan (v2, v3, v4, ...)
// Ini yang memaksa browser membuang cache lama dan ambil aset baru.
const CACHE_VERSION = 'trade-app-v2';
const STATIC_ASSETS = ['./', './index.html', './manifest.json'];

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

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // JANGAN campur tangan sama sekali untuk request ke luar (Google Apps Script,
  // Binance API, dll). Biarkan browser handle langsung apa adanya, supaya
  // data trading & kurs selalu diambil fresh, tidak pernah ke-cache oleh SW.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first untuk aset sendiri (index.html, manifest, dll):
  // coba ambil versi terbaru dulu, kalau offline baru fallback ke cache.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
