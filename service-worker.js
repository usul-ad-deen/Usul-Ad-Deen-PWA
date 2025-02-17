self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("usul-ad-deen-cache").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/styles.css",
                "/script.js",
                "/icons/icon-192x192.png",
                "/icons/icon-512x512.png",
                "/manifest.json"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
