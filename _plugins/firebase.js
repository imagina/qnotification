import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import axios from 'axios';
import moment from 'moment'
import CryptoJS from 'crypto-js';

import storeFirebase from '@imagina/qnotification/_store/firebase/index.ts'

export async function getTokenFirebase(userId) {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if(registrations.length === 0) {
      return;
    }
  }
  const currentDate = moment().format('YYYY-MM-DD');
  const md5Hash = CryptoJS.MD5(`https://one.allianceground.com${currentDate}firebase`).toString();
  axios.get(`https://staging-siembra-coffe.ozonohosting.com/api/notification/v1/providers/firebase?filter={%22field%22:%20%22system_name%22}&token=${md5Hash}`)
    .then(response => {
      const json = response.data;
      if (json.errors === 'Unauthorized') {
        return
      };
      const firebaseConfig = {
        apiKey: json.data.fields.firebaseApiKey,
        authDomain: json.data.fields.firebaseAuthDomain,
        projectId: json.data.fields.firebaseProjectId,
        storageBucket: json.data.fields.firebaseStorageBucket,
        messagingSenderId: json.data.fields.firebaseMessagingSenderId,
        appId: json.data.fields.firebaseAppId,
        measurementId: json.data.fields.firebaseMeasurementId
      }

      const app = initializeApp(firebaseConfig);
      notificationToken(app, json.data.fields.firebaseWebPushCertificateKeyPair, userId);
    });
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

