import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGr2vtTAhm845CGEy04ZCpgFXe0bQL63o",
  authDomain: "classmate-ai-63d5b.firebaseapp.com",
  projectId: "classmate-ai-63d5b",
  storageBucket: "classmate-ai-63d5b.appspot.com",
  messagingSenderId: "409753939807",
  appId: "1:409753939807:web:a4a3be93002e74a55b90ea",
  measurementId: "G-MQYMGHWFY6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // Make sure this is named correctly

export { auth, googleProvider }; // Export googleProvider instead of provider
