// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLpTusWvhexmkFV474i3fili3GYucPcrc",
  authDomain: "consentpro-e50f7.firebaseapp.com",
  projectId: "consentpro-e50f7",
  storageBucket: "consentpro-e50f7.firebasestorage.app",
  messagingSenderId: "672829634035",
  appId: "1:672829634035:web:6ea2153fb41567b23c4e86",
  measurementId: "G-4EHZSRNWCD",
  tenant: "orbit",
  region: "asia-south1",
  geminiApiKey: typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42S1I3aE02cHRnN3ZaUURDNEN2NWZwTl9raDBsYTRESWxmdWdoeDdIaGhZSmc=') : ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may be optional or blocked by client privacy shields
}

// Global bridge for ConsentPro Runtime & Adapter
if (typeof window !== "undefined") {
  window.CP_FIREBASE_CONFIG = firebaseConfig;
  window.firebaseConfig = firebaseConfig;
  window.firebaseApp = app;
  window.firebaseAnalytics = analytics;
}

export { firebaseConfig, app, analytics };
export default app;
