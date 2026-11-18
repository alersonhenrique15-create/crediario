/* Service worker: deixa o painel abrir como aplicativo e funcionar sem internet.
   Estrategia: busca na internet primeiro (para sempre pegar a versao nova)
   e usa o cache apenas quando a rede falha. */
var CACHE = "crediario-v1";
var BASICO = ["./", "index.html", "painel.html", "config.js",
              "assets/estilo.css", "assets/comum.js", "assets/painel.js", "assets/supabase.js",
              "assets/logo.png", "assets/icone-192.png", "assets/icone-512.png",
              "manifest.webmanifest"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(BASICO).catch(function () {});
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; })
                         .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          // Supabase e CDN: sempre direto
  e.respondWith(
    fetch(req).then(function (r) {
      if (r && r.ok) {
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copia).catch(function () {}); });
      }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (c) {
        return c || caches.match("painel.html");
      });
    })
  );
});
