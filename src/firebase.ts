// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4V07q7oHa-XW3zphEP09jxLZvrGQ-EYg",
  authDomain: "expensetracker-cf63d.firebaseapp.com",
  projectId: "expensetracker-cf63d",
  storageBucket: "expensetracker-cf63d.firebasestorage.app",
  messagingSenderId: "882533461979",
  appId: "1:882533461979:web:04e49715f3ad33e35581fe",
  measurementId: "G-0WHMHXGDW6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);