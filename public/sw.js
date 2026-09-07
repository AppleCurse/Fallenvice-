/*
 * Salim Gümüş — Manifesto · Service Worker
 *
 * Tasarım kararı: GitHub Pages'te en büyük risk bayat içerik servis etmektir.
 * Bu yüzden HTML her zaman önce ağdan denenir (network-first); yalnızca
 * çevrimdışıyken önbellekten verilir. İçerik-hash'li varlıklar değişmez
 * olduğu için cache-first alınır. Sürüm değişince eski cache'ler silinir.
 */

const VERSION = 'v1';
const SHELL_CACHE = `manifesto-shell-${VERSION}`;
const ASSET_CACHE = `manifesto-assets-${VERSION}`;
const FONT_CACHE = `manifesto-fonts-${VERSION}`;

const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE];

// Kabuk: uygulamanın açılması için gereken minimum küme.
// Hash'li JS/CSS burada yok — adları build'e göre değişir, çalışma
// zamanında yakalanırlar.
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './og.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // Tek bir varlık 404 verirse tüm kurulumu düşürmesin.
      .then((cache) =>
        Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url))),
      ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('manifesto-') && !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      // Gezinme isteklerini hızlandırır (destekleyen tarayıcılarda).
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

// Sayfa "yeni sürüme geç" dediğinde bekleyen worker devreye girer.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/** HTML: ağ önce, çevrimdışında önbellek. */
async function networkFirst(event) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(event.request));
    // Yalnızca sağlıklı yanıtları sakla.
    if (response && response.ok) {
      cache.put('./index.html', response.clone());
    }
    return response;
  } catch {
    const cached = (await cache.match(event.request)) || (await cache.match('./index.html'));
    if (cached) return cached;
    return new Response(
      '<meta charset="utf-8"><p style="color:#c5a26f;background:#040303;font-family:Georgia,serif;padding:2rem;text-align:center">Karanlık oda çevrimdışı ve önbellekte değil.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }
}

/** Hash'li varlıklar: önbellek önce, yoksa ağdan alıp sakla. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  // Opaque (cross-origin, no-cors) yanıtlar da saklanabilir; ok=false olur.
  if (response && (response.ok || response.type === 'opaque')) {
    cache.put(request, response.clone());
  }
  return response;
}

/** Fontlar: önbellekten ver, arka planda tazele. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Google Fonts (cross-origin)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // Diğer tüm cross-origin istekleri olduğu gibi geçir.
  if (url.origin !== self.location.origin) return;

  // Sayfa gezinmeleri
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event));
    return;
  }

  // Vite'ın içerik-hash'li çıktıları — değişmez kabul edilir.
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // Kalan aynı-origin statikler (ikonlar, og görseli, manifest)
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});
