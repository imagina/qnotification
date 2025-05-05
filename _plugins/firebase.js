import { getMessaging, getToken } from "firebase/messaging";
import { initFirebaseApp } from './initializeFirebaseApp'

import storeFirebase from 'modules/qnotification/_store/firebase/index.ts'

export async function getTokenFirebase(userId) {
  if(storeFirebase.token.length > 0) return;
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if(registrations.length === 0) return;
  }
   const { app, firebaseWebPushCertificateKeyPair } = await initFirebaseApp();
   if(!firebaseWebPushCertificateKeyPair) return;
   notificationToken(app, firebaseWebPushCertificateKeyPair, userId);
}


function notificationToken(app, firebaseWebPushCertificateKeyPair, userId) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const messaging = getMessaging(app);
      getToken(messaging, {
        vapidKey: firebaseWebPushCertificateKeyPair,
      }).then((currentToken) => {
        if (currentToken) {
          if (currentToken &&  storeFirebase.token !== currentToken) {
            console.log("currentToken: ", currentToken);
            storeFirebase.userId = userId;
            storeFirebase.token = currentToken;
            storeFirebase.sendDivice();
            storeFirebase.getMessaging();
          }
        } else {
          console.log("Can not get token");
        }
      });
    } else {
      console.log("Do not have permission!");
    }
  });
}

