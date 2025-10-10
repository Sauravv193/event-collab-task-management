// Service Worker registration and management

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker.'
          );
        });
      } else {
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('SW registered: ', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available and will be used when all tabs for this page are closed.'
              );
              
              // Show update available notification
              showUpdateAvailableNotification();
            } else {
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Offline queue management
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  add(request) {
    if (!this.isOnline) {
      this.queue.push(request);
      this.saveToStorage();
      return Promise.reject(new Error('Offline - request queued'));
    }
    return fetch(request);
  }
  
  async processQueue() {
    if (this.queue.length === 0) return;
    
    const requests = [...this.queue];
    this.queue = [];
    
    for (const request of requests) {
      try {
        await fetch(request);
        console.log('Synced offline request:', request.url);
      } catch (error) {
        console.error('Failed to sync request:', error);
        this.queue.push(request); // Re-add failed requests
      }
    }
    
    this.saveToStorage();
  }
  
  saveToStorage() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(
        this.queue.map(req => ({
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
          body: req.body
        }))
      ));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }
  
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        const requests = JSON.parse(stored);
        this.queue = requests.map(req => new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }
}

export const offlineQueue = new OfflineQueue();

// Background sync
export function requestBackgroundSync(tag = 'background-sync') {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register(tag);
    }).catch(error => {
      console.error('Background sync registration failed:', error);
    });
  }
}

// Push notifications
export async function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
      });
      
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function showUpdateAvailableNotification() {
  // You can integrate this with your notification system
  if (window.confirm('A new version is available. Refresh to update?')) {
    window.location.reload();
  }
}