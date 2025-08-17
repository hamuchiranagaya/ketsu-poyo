const CACHE_NAME = 'hamketsu-poyo-v' + Date.now();

// 自動でファイルを検出してキャッシュ
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './ketsupoyo.png'
];

// 画像ファイルも自動で追加（存在する場合のみ）
const imageFiles = [
  './assets/ham_01.png', './assets/ham_02.png', './assets/ham_03.png',
  './assets/ham_04.png', './assets/ham_05.png', './assets/ham_06.png',
  './assets/ham_07.png', './assets/ham_08.png', './assets/ham_09.png',
  './assets/ham_10.png', './assets/ham_11.png', './assets/ham_12.png',
  './assets/ham_13.png', './assets/ham_14.png', './assets/ham_15.png',
  './assets/ham_16.png', './assets/ham_17.png', './assets/ham_18.png',
  './assets/ham_19.png', './assets/ham_20.png', './assets/ham_21.png',
  './assets/ham_22.png', './assets/ham_23.png', './assets/ham_24.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Workerインストール中...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 基本ファイルをキャッシュ
      return cache.addAll(urlsToCache).then(() => {
        // 画像ファイルは存在するもののみキャッシュ（エラーを無視）
        return Promise.allSettled(
          imageFiles.map(file => 
            fetch(file)
              .then(response => response.ok ? cache.put(file, response) : null)
              .catch(() => console.log('画像スキップ:', file))
          )
        );
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Workerアクティベート');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュ削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
