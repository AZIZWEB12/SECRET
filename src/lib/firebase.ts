import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCP1TS4Y4ry6ebXcy2HdjN4QonpyxxQ5Os",
  authDomain: "gagnetonconcours-app.firebaseapp.com",
  projectId: "gagnetonconcours-app",
  storageBucket: "gagnetonconcours-app.appspot.com",
  messagingSenderId: "934255734262",
  appId: "1:934255734262:web:7573f3e1a8b1399436c6a4",
  measurementId: "G-L9E59C4BR9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
