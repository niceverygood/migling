import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpGXULewwRPmUiljiFCZcZ25QPMYEVUn4",
  authDomain: "mingling-3f2d5.firebaseapp.com",
  projectId: "mingling-3f2d5",
  storageBucket: "mingling-3f2d5.firebasestorage.app",
  messagingSenderId: "127809706418",
  appId: "1:127809706418:web:186a15b6e16d89d886ecab",
  measurementId: "G-YS152BFG4C"
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