// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCP1TS4Y4ry6ebXcy2HdjN4QonpyxxQ5Os",
  authDomain: "secrets-du-concours.firebaseapp.com",
  projectId: "secrets-du-concours",
  storageBucket: "secrets-du-concours.firebasestorage.app",
  messagingSenderId: "1096812875621",
  appId: "1:1096812875621:web:003d998b5ab0faf88e9b8c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set authentication persistence to local
setPersistence(auth, browserLocalPersistence);


export { app, auth, db, storage };
