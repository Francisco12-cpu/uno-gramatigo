// UNO Gramática — service worker: tudo funciona offline (menos o modo online)
const CACHE = 'unogramatica-v4';
const BASE = ['./', './index.html', './css/app.css', './js/core.js', './js/app.js', './js/video.js', './manifest.webmanifest',
  './icons/icone.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE))); });
// a página pede pra trocar de versão quando a pessoa toca no aviso
self.addEventListener('message', e => { if (e.data === 'atualizar') self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // o servidor de conexão online e a biblioteca dele nunca vão pro cache
  if (url.hostname.endsWith('peerjs.com')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // arquivos do jogo: cache primeiro (rápido e offline); fontes do Google também ficam guardadas
  e.respondWith(caches.match(req, { ignoreSearch: url.origin === location.origin }).then(hit => {
    const rede = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; }).catch(() => hit);
    return hit || rede;
  }));
});
