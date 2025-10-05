import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5UDFqu7fEeWVNlu3ymKhWJghVoVSxC6E",
  authDomain: "reactchat-a3930.firebaseapp.com",
  projectId: "reactchat-a3930",
  storageBucket: "reactchat-a3930.firebasestorage.app",
  messagingSenderId: "434877378576",
  appId: "1:434877378576:web:af58eb9b5918082f74da95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
