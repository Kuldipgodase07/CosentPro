// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCLpTusWvhexmkFV474i3fili3GYucPcrc",
  authDomain: "consentpro-e50f7.firebaseapp.com",
  projectId: "consentpro-e50f7",
  storageBucket: "consentpro-e50f7.firebasestorage.app",
  messagingSenderId: "672829634035",
  appId: "1:672829634035:web:6ea2153fb41567b23c4e86",
  measurementId: "G-4EHZSRNWCD",
  tenant: "orbit",
  region: "asia-south1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Graceful degradation when analytics is blocked or unsupported
}

if (typeof window !== "undefined") {
  window.CP_FIREBASE_CONFIG = firebaseConfig;
  window.firebaseConfig = firebaseConfig;
  window.firebaseApp = app;
  window.firebaseAnalytics = analytics;
}

export default app;
