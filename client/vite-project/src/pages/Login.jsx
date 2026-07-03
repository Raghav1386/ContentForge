import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  const isFirebaseConfigured = 
    import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_API_KEY !== "placeholder-api-key";

  // If already authenticated, redirect to Dashboard
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      // Clean up firebase error messages for presentation
      let friendlyMessage = "Failed to log in. Please check your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        friendlyMessage = "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-logo">
          <h2>🚀 ContentForge</h2>
          <p className="auth-subtitle">Welcome back! Log in to continue.</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="auth-warning-banner">
            ⚠️ <strong>Configuration Required:</strong> Please create a <code>.env</code> file under <code>client/vite-project/</code> and populate it with your Firebase Web App credentials (see <code>.env.example</code>).
          </div>
        )}

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button 
          type="button" 
          className="auth-google-btn" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.77z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"/>
            <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.49l4.11-3.25z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 6.51l4.11 3.25c.94-2.85 3.57-4.96 6.68-4.96z"/>
          </svg>
          Google
        </button>

        <div className="auth-footer-text">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
