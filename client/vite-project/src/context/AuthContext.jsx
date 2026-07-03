import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email & Password Registration
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Email & Password Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Provider Login
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // Prompt the user to select their account
    provider.setCustomParameters({ prompt: "select_account" });
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Unsubscribe on unmount
  }, []);

  const value = {
    currentUser,
    register,
    login,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
