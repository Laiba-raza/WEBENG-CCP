import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import NoteEditor from "./components/NoteEditor";
import * as jwt_decode from "jwt-decode";

// Token validation function
const isTokenValid = (token) => {
  if (!token) return false;
  const decoded = jwt_decode(token);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

const PrivateRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");
  return token ? <Component /> : <Navigate to="/" />;
};

const App = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    window.location.href = "/"; // Redirect to login page
  };
  return (
    <div>
      <div className="title-bar">
        <h1>NOTES NEST</h1>
        {location.pathname === "/dashboard" && (
          <div className="logout-container">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={Dashboard} />}
        />
        <Route path="/note/new" element={<NoteEditor />} />
        <Route path="/note/edit/:id" element={<NoteEditor />} />
      </Routes>

      <footer className="footer">© 2025 NOTES NEST</footer>
    </div>
  );
};
export default App;
