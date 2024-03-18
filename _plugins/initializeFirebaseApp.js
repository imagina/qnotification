import { initializeApp } from "firebase/app";
import axios from 'axios';
import moment from 'moment'
import CryptoJS from 'crypto-js';

export const initFirebaseApp = async () => {
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        const md5Hash = CryptoJS.MD5(`https://one.allianceground.com${currentDate}firebase`).toString();
        const response = await axios.get(`https://staging-siembra-coffe.ozonohosting.com/api/notification/v1/providers/firebase?filter={%22field%22:%20%22system_name%22}&token=${md5Hash}`)
        const json = response.data;
        if (json.errors === 'Unauthorized') {
            return
        }

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
        
        return { app, firebaseWebPushCertificateKeyPair: json.data.fields.firebaseWebPushCertificateKeyPair }
    } catch (err) {
        console.log('Error initializing Firebase', err);
    }
}