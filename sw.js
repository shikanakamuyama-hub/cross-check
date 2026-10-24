/* 2点照合ツールを端末に保存し、ネットなしでも起動できるようにする。
   新しい版を置いたら CACHE の番号を上げる（ネットのある所で開くと入れ替わる）。 */
var CACHE = "niten-v1.0.7";
var FILES = ["./", "index.html", "jsQR.js", "zxing.min.js", "pako.min.js", "qrcode.js", "qrlink.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// 端末に保存したものを先に使う（ネットが無くても開ける）
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (e.request.mode === "navigate") {
        return caches.match("index.html").then(function (page) { return page || fetch(e.request); });
      }
      return fetch(e.request);
    })
  );
});
