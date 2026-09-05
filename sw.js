const CACHE = 'arac-bakim-v3';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Push bildirimi al ve göster
self.addEventListener('push', e => {
  let data = { title: 'Araç Bakım', body: 'Yeni hatırlatma var!' };
  try { data = JSON.parse(e.data.text()); } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.png',
      badge: './icon.png',
      vibrate: [200, 100, 200],
      data: { url: self.location.origin + self.location.pathname.replace('sw.js','') }
    })
  );
});

// Bildirime tıklanınca uygulamayı aç
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(list => {
      const url = e.notification.data?.url || '/';
      for(const client of list){
        if(client.url===url && 'focus' in client) return client.focus();
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});
