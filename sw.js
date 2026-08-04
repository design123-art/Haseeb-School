const CACHE = 'hs-attendance-v1';
const SHELL = ['./', './index.html', './style.css', './manifest.json',
  './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// App shell (HTML/CSS/icons) works offline. Firebase calls always
// go to the network — attendance itself needs internet to submit.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // let Firebase requests pass through untouched
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
