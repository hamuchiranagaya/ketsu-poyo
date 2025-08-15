const CACHE_NAME = 'hamketsu-poyo-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './ketsupoyo.png',
  './assets/ham_01.png',
  './assets/ham_02.png',
  './assets/ham_03.png',
  './assets/ham_04.png',
  './assets/ham_05.png',
  './assets/ham_06.png'
];

// サービスワーカーのインストール
self.addEventListener('install', (event) => {
  console.log('サービスワーカーをインストールしています...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ファイルをキャッシュしています');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('キャッシュエラー:', error);
      })
  );
});

// サービスワーカーのアクティベーション
self.addEventListener('activate', (event) => {
  console.log('サービスワーカーがアクティベートされました');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあれば返す、なければネットワークから取得
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // オフライン時のフォールバック
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});