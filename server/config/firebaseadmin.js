import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error);
    throw error;
  }
} else {
  const filePath = path.join(__dirname, "../serviceAccountKey.json");
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else {
    throw new Error(
      "Firebase service account key file is missing, and FIREBASE_SERVICE_ACCOUNT environment variable is not set."
    );
  }
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;