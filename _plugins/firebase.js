import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

import storeFirebase from '@imagina/qnotification/_store/firebase/index.ts'

export const firebaseConfig = {
  apiKey: "AIzaSyBKed8DEWi0Gk1-40_eas3Byr8Ln_WjEeQ",
  authDomain: "notifications-edc9c.firebaseapp.com",
  projectId: "notifications-edc9c",
  storageBucket: "notifications-edc9c.appspot.com",
  messagingSenderId: "626515463422",
  appId: "1:626515463422:web:5d74016b36dcbe4b6629af",
  measurementId: "G-F7FC44SSCV"
};

const app = initializeApp(firebaseConfig);

function requestPermission() {
  return new Promise((resolve) => {
    const permissionHandler = (permission) => {
      if (permission === "granted") {
        resolve(true);
      } else if (permission === "denied") {
        resolve(false);
      }
    };

    Notification.requestPermission().then(permissionHandler);
  });
}

export async function getTokenFirebase(userId) {
  let permissionGranted = false;

  permissionGranted = await requestPermission();

  if (permissionGranted) {
    const messaging = getMessaging(app);
    getToken(messaging, {
      vapidKey: "BF3U4fgT2TJgtkCVWsCYN2RCYcY2X_PsxqiLlE9sHPPPvzAWr0XWmRfJcJh12fizpzTtakHZkJEAkbZx-m-zaFM",
    }).then((currentToken) => {
      if (currentToken &&  storeFirebase.token !== currentToken) {
        storeFirebase.userId = userId;
        storeFirebase.token = currentToken;
        storeFirebase.sendDivice();
      }
    });
  } else {
    window.alert("Please activate notification permissions in your browser settings.");
  }
}

