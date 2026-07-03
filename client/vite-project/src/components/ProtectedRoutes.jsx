import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // If authenticated, render nested child routes (e.g. DashboardLayout with Sidebar and Home)
  // Otherwise redirect to the login page
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
