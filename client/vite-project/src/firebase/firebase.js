import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "placeholder-auth-domain.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "contentforge-61fed",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "placeholder-storage-bucket.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "placeholder-sender-id",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "placeholder-app-id",
};

// Warning if env variables are missing
if (
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === "placeholder-api-key"
) {
  console.warn(
    "⚠️ Firebase configuration is missing. Check your .env file."
  );
}

const app = initializeApp(firebaseConfig);

// Export Auth
export const auth = getAuth(app);

// Export Firestore
export const db = getFirestore(app);

// Export app
export default app;