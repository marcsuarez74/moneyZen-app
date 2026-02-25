// Firebase Messaging Service Worker
// This file handles background FCM messages when the app is closed or in background

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Initialize Firebase with configuration passed from main app or stored config
// The config will be injected during build or retrieved dynamically
firebase.initializeApp({
  // This will be replaced during build or config will be fetched
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'MoneyZen Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/assets/icons/icon-192x192.png',
    badge: payload.notification?.badge || '/assets/icons/icon-72x72.png',
    tag: payload.data?.tag || 'default',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      },
    ],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  event.notification.close();

  // Determine URL based on notification type
  let targetUrl = '/';
  const notificationData = event.notification.data;

  if (notificationData?.type === 'budget-alert') {
    targetUrl = '/budget';
  } else if (notificationData?.type === 'weekly-summary') {
    targetUrl = '/budget';
  } else if (notificationData?.type === 'daily-reminder') {
    targetUrl = '/budget';
  }

  // Open or focus the window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle push events (backup for non-FCM push)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('[firebase-messaging-sw.js] Push event received:', data);

    const options = {
      body: data.notification?.body || '',
      icon: data.notification?.icon || '/assets/icons/icon-192x192.png',
      badge: data.notification?.badge || '/assets/icons/icon-72x72.png',
      tag: data.tag || 'push-message',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(data.notification?.title || 'MoneyZen', options)
    );
  }
});
