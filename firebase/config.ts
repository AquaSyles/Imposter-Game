import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmaqh-dtHThNnkGdsr8lrNym8Gx1d_eAI",
  authDomain: "imposter-game-53363.firebaseapp.com",
  projectId: "imposter-game-53363",
  storageBucket: "imposter-game-53363.firebasestorage.app",
  messagingSenderId: "384946961506",
  appId: "1:384946961506:web:598c91bdd8fc85516c653b",
  measurementId: "G-0NSBZRJ14H"
};
// Initialize Firebase
let app: FirebaseApp;

// Check if Firebase is already initialized to avoid initializing multiple times
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
