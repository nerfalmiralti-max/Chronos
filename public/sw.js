/* global self, caches, Response */

const CACHE = 'kronos-world-v4';
const SHELL_ROUTES = ['/', '/today', '/goals', '/calendar', '/analytics', '/timer'];
const CORE_ASSETS = ['/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

function extractAssets(text, baseUrl, contentType) {
  const assets = new Set();
  const staticPattern = /(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g;
  for (const match of text.matchAll(staticPattern)) {
    try { assets.add(new URL(match[1], baseUrl).href); } catch { /* Ignore malformed authored URLs. */ }
  }
  if (contentType.includes('text/css')) {
    const cssPattern = /url\((?:["']?)([^"')]+)(?:["']?)\)/g;
    for (const match of text.matchAll(cssPattern)) {
      try {
        const asset = new URL(match[1], baseUrl);
        if (asset.origin === self.location.origin) assets.add(asset.href);
      } catch { /* Ignore data URLs and malformed declarations. */ }
    }
  }
  return assets;
}

async function precacheWorld() {
  const cache = await caches.open(CACHE);
  const discovered = new Set();

  for (const path of [...SHELL_ROUTES, ...CORE_ASSETS]) {
    const response = await fetch(path, { cache: 'reload' });
    if (!response.ok) throw new Error(`Unable to precache ${path}`);
    const cacheCopy = response.clone();
    const inspectCopy = response.clone();
    await cache.put(response.url, cacheCopy);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('text/css')) {
      for (const asset of extractAssets(await inspectCopy.text(), response.url, contentType)) discovered.add(asset);
    }
  }

  const queue = [...discovered];
  const visited = new Set();
  while (queue.length) {
    const asset = queue.shift();
    if (!asset || visited.has(asset)) continue;
    visited.add(asset);
    const response = await fetch(asset, { cache: 'reload' });
    if (!response.ok) continue;
    const cacheCopy = response.clone();
    const inspectCopy = response.clone();
    await cache.put(response.url, cacheCopy);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/css')) {
      for (const nested of extractAssets(await inspectCopy.text(), response.url, contentType)) {
        if (!visited.has(nested)) queue.push(nested);
      }
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheWorld().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (!response.ok) return response;
  const copy = response.clone();
  const cache = await caches.open(CACHE);
  await cache.put(request, copy);
  return response;
}

async function networkFirst(request, fallbackPath) {
  try {
    return await fetchAndCache(request);
  } catch {
    return (await caches.match(request))
      || (fallbackPath ? await caches.match(fallbackPath) : undefined)
      || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, url.pathname === '/' ? '/' : url.pathname));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || CORE_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetchAndCache(request)));
    return;
  }

  event.respondWith(networkFirst(request));
});
