// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('/__/firebase/5.2.0/firebase-app.js');
importScripts('/__/firebase/5.2.0/firebase-messaging.js');
importScripts('/__/firebase/init.js');

var messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 */
 // importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
 // importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 // firebase.initializeApp({
   // 'messagingSenderId': 'YOUR-SENDER-ID'
   // 'messagingSenderId': '560030126238'
 // });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 // const messaging = firebase.messaging();
 /*
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  // var notificationTitle = 'Background Message Title';
  // var notificationOptions = {
  //   body: 'Background Message body.',
  //   icon: '/firebase-logo.png'
  // };

  // return self.registration.showNotification(notificationTitle, notificationOptions);

  var { title, icon, body } = payload.notification;

  return self.registration.showNotification(title, {
    icon,
    body ,
    vibrate: [300, 100, 400, 100, 300],
    badge: icon
  }).then(event => {
    event.notification.onclick = () => {
      event.notification.close();

      // event.waitUntil(self.clients.openWindow('https://ez-js-101.firebaseapp.com/'))

      event.waitUntil(self.clients.matchAll({ type: "window" }).then(clientList =>  {
        for (var i = 0; i < clientList.length; i++)
          if (clientList[i].url == '/' && 'focus' in clientList[i])
            return clientList[i].focus();
        if ('openWindow' in self.clients) return self.clients.openWindow('/');
      }));
    };
  });
});
// [END background_handler]
