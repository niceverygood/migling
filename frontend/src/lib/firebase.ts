import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCpGXULewwRPmUiljiFCZcZ25QPMYEVUn4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mingling-3f2d5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mingling-3f2d5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mingling-3f2d5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "127809706418",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:127809706418:web:97eba244663b84a786ecab",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KYR28WQL23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);

export type { User }; 