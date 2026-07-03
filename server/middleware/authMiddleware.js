import { auth } from "../config/firebaseadmin.js";

/**
 * Express middleware to verify Firebase ID tokens.
 * Extracts the bearer token from the Authorization header,
 * verifies it with Firebase Admin SDK, and attaches the decoded
 * token payload (containing user UID and email) to req.user.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required (Bearer format)",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // Verify token using Firebase Admin auth module
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach decoded user info (including uid, email, name, etc.) to request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    
    // Handle specific token expiration/invalid errors if needed
    let errorMessage = "Unauthorized request";
    if (error.code === "auth/id-token-expired") {
      errorMessage = "Token has expired, please log in again";
    } else if (error.code === "auth/argument-error") {
      errorMessage = "Invalid authorization token format";
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};
