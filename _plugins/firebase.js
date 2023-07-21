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

export function getTokenFirebase() {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const app = initializeApp(firebaseConfig);

      const messaging = getMessaging(app);
      getToken(messaging, {
        vapidKey:
          "BF3U4fgT2TJgtkCVWsCYN2RCYcY2X_PsxqiLlE9sHPPPvzAWr0XWmRfJcJh12fizpzTtakHZkJEAkbZx-m-zaFM",
      }).then((currentToken) => {
        if (currentToken) {
          console.log("currentToken: ", currentToken);
          storeFirebase.token = currentToken;
        } else {
          console.log("Can not get token");
        }
      });
    } else {
      console.log("Do not have permission!");
    }
  });
}

