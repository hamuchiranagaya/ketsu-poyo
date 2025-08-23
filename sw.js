// バージョン管理：HTMLファイルが更新されたら必ずこの値を変更してください
const CACHE_NAME = 'hamketsu-poyo-v20250124-001';

// ネットワークファーストでチェックするファイル（即座に更新を反映したいファイル）
const NETWORK_FIRST_FILES = [
  './',
  './index.html'
];

// キャッシュファーストでも良いファイル（更新頻度が低いファイル）
const CACHE_FIRST_FILES = [
  './manifest.json',
  './ketsupoyo.png'
];

// 画像ファイル（キャッシュファーストで良い）
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

const allFilesToCache = [...NETWORK_FIRST_FILES, ...CACHE_FIRST_FILES, ...imageFiles];

self.addEventListener('install', (event) => {
  console.log('Service Worker インストール中...', CACHE_NAME);
  
  // 新しいService Workerを即座にアクティベート
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 基本ファイルをキャッシュ
      return cache.addAll([...NETWORK_FIRST_FILES, ...CACHE_FIRST_FILES]).then(() => {
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
  console.log('Service Worker アクティベート:', CACHE_NAME);
  
  // 既存のクライアントを即座に制御下に置く
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('古いキャッシュ削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 既存のクライアントを即座に制御
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // HTML系ファイルは常にネットワークファースト（即座に更新を反映）
  if (NETWORK_FIRST_FILES.some(file => pathname.endsWith(file.replace('./', '')))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 成功した場合はキャッシュを更新
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラーの場合のみキャッシュから返す
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // その他のファイルは従来通りキャッシュファースト
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

// Service Worker更新通知（オプション）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 定期的にキャッシュをクリーンアップ（オプション）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // 現在のキャッシュ以外で、古いバージョンのキャッシュを削除
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('hamketsu-poyo-v') && cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('期限切れキャッシュ削除:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});
