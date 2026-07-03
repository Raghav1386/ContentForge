import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";

// Layout for the authenticated workspace
function DashboardLayout() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container">
      <Sidebar 
        onSelect={setSelectedItem} 
        selectedItem={selectedItem} 
        refreshTrigger={refreshTrigger} 
      />
      <div className="main">
        <Home 
          selectedItem={selectedItem} 
          onGenerationSuccess={triggerRefresh} 
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<DashboardLayout />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}