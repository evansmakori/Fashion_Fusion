// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeMe2T_Pt4RolzTGSvwTIrHDm1yYyqEsI",
  authDomain: "fashion-fussion-app.firebaseapp.com",
  projectId: "fashion-fussion-app",
  storageBucket: "fashion-fussion-app.firebasestorage.app",
  messagingSenderId: "540443930758",
  appId: "1:540443930758:web:7c78b9f72bdfba3d592107",
  measurementId: "G-QEQB50Q4ES"
};

// Initialize Firebase
console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyLength: firebaseConfig.apiKey?.length
});

const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized successfully');

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log('Firebase Auth initialized successfully');

export const googleProvider = new GoogleAuthProvider();
console.log('Google Auth Provider initialized successfully');

// Enable console logging for debugging
auth.languageCode = 'en';
console.log('Firebase Auth language set to:', auth.languageCode);

export default app;
