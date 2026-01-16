const CACHE = 'kgenda-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/app.css',
  './core/bootstrap.js',
  './core/router.js',
  './core/state.js',
  './core/storage.js',
  './core/session.js',
  './core/crypto.js',
  './core/ai-engine.js',
  './screens/login.html',
  './screens/app.html',
  './screens/erp.html',
  './screens/login.js',
  './screens/app.js',
  './screens/erp.js',
  './modules/tasks.js',
  './modules/agenda.js',
  './modules/clients.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE ? caches.delete(k):null))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  const url = new URL(req.url);

  // Navegação: always serve index.html (p/ hash routing)
  if(req.mode === 'navigate'){
    e.respondWith(
      caches.match('./index.html').then(r=> r || fetch(req))
    );
    return;
  }

  // Cache-first p/ assets do app
  if(url.origin === location.origin){
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return res;
      }).catch(()=>cached))
    );
  }
});
