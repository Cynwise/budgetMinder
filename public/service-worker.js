const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/styles.css",
    "icons/icon-192x192.png"
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener("install" , function (evt) {
    // evt.waitUntil(
    //     caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
    // );

    evt.waitUntil(
        caches.open(PRECACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener('active', evt => {
  const currentCaches = [PRECACHE, RUNTIME];
  evt.waitUntil(
    cache.keys()
    .then(cache => {
      return cache.filter(cache => !currentCaches.includes(cachesName));
    })
    .then(cacheToDelete => {
      return Promise.all(
        cacheToDelete.map(cacheToDelete => {
          return cache.delete(cacheToDelete);
        })
      );
    })
    .then(() => self.ClientRectList.claim())
  );
});

self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch((err) => {
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(evt.request).then((response) => {
            return response || fetch(evt.request);
          });
        })
      );
    });
