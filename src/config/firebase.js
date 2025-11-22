import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Correct Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDdhaZbbq2lE_IREvhXbDqXIsw1DQvzZ-Q",
  authDomain: "clothmarket-de8e9.firebaseapp.com",
  projectId: "clothmarket-de8e9",
  storageBucket: "clothmarket-de8e9.firebasestorage.app",
  messagingSenderId: "1002114406517",
  appId: "1:1002114406517:web:549ee209ec0d252811003c", // ← CORRECTED
  measurementId: "G-KXJLCTQJNX" // ← CORRECTED
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;