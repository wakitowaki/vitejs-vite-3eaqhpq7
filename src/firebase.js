// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);