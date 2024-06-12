import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from "./assets/logo.png";
import "./css/App.css";
import "./css/style.css";

// Import pages
import Dashboard from './pages/Instructor/Dashboard';
import NotFound from './pages/NotFound';
import InstructorSignup from './pages/Instructor/Signup';
import Login from './pages/Instructor/Login';
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/")
      .then((res) => res.json())
      .then((res) => setMessage(res.message))
      .catch(console.error);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InstructorSignup />} />
           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/signup" element={<InstructorSignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
