import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace with your actual Firebase project configuration
// and store these values in environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyCP1TS4Y4ry6ebXcy2HdjN4QonpyxxQ5Os",
  authDomain: "secrets-du-concours.firebaseapp.com",
  projectId: "secrets-du-concours",
  storageBucket: "secrets-du-concours.appspot.com",
  messagingSenderId: "1096812875621",
  appId: "1:1096812875621:web:003d998b5ab0faf88e9b8c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
