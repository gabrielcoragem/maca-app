// Service worker minimo: existe para o app ser instalavel na tela inicial.
// Nao guarda o index em cache — o conteudo dos modulos muda e o acesso e
// revalidado no Supabase a cada abertura, entao servir uma versao velha
// deixaria o comprador com a secao errada.
const CACHE = 'macaapp-v1';
const ESTATICOS = ['./icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESTATICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    const estatico = ESTATICOS.some(p => url.pathname.endsWith(p.replace('./', '')));

    if (estatico) {
        e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
        return;
    }
    // resto: sempre rede; cai no cache so se estiver offline
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
