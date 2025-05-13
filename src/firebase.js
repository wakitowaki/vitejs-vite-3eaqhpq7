// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 AGGIUNTA

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBioFaWF3y-iF894QjCtnC7ldqqAd43pLI",
  authDomain: "cardcollection-ddea9.firebaseapp.com",
  projectId: "cardcollection-ddea9",
  storageBucket: "cardcollection-ddea9.firebasestorage.app",
  messagingSenderId: "546228252957",
  appId: "1:546228252957:web:d970e94fb5b280481af1f4",
  measurementId: "G-LMFEM9F3QE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 👈 AGGIUNTA

export { db, auth }; // 👈 ESPORTAZIONE CORRETTA
