import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
import logo from "./assets/logo.png";
import "./css/App.css";
import "./css/style.css";
import NavBar from "./NavBar";
import ProtectedRoute from "./ProtectedRoute";
// Import pages
import Dashboard from "./pages/Instructor/Dashboard";
import NotFound from "./pages/NotFound";
import InstructorSignup from "./pages/Instructor/Signup";
import Login from "./pages/Instructor/Login";
import AccountSettings from "./pages/Instructor/AccountSettings";
import Classes from "./pages/Instructor/Classes";
import ClassManagement from "./pages/Instructor/ClassManagement";
import NewExam from "./pages/Instructor/NewExam";
import ExamBoard from "./pages/Instructor/Examboard";
import ExamControls from "./pages/Instructor/ExamControls";
import ManualExamKey from "./pages/Instructor/ManualExamKey";
import NotificationPreferences from "./pages/Instructor/NotificationPreferences";
import UploadExamKey from "./pages/Instructor/UploadExamKey";

// Layout component to conditionally render NavBar
const Layout = ({ children }) => {
  const location = useLocation();
  const shouldDisplayNavBar =
    location.pathname !== "/" && location.pathname !== "/login";

  return (
    <>
      {shouldDisplayNavBar && <NavBar />}
      {children}
    </>
  );
};

function App() {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/session-info")
      .then((res) => res.json())
      .then((data) => {
        if (data.userName) {
          setUserName(data.userName);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<InstructorSignup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<InstructorSignup />} />
            <Route path="/AccountSettings" element={<AccountSettings />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/ClassManagement" element={<ClassManagement />} />
            <Route path="/NewExam" element={<NewExam />} />
            <Route path="/ExamBoard" element={<ExamBoard />} />
            <Route path="/ExamControls" element={<ExamControls />} />
            <Route path="/ManualExamKey" element={<ManualExamKey />} />
            <Route
              path="/NotificationPreferences"
              element={<NotificationPreferences />}
            />
            <Route path="/UploadExamKey" element={<UploadExamKey />} />
            {/* <Route path="/Schedule" element={<Schedule />} /> Schedule plugin is brocken ->will fix */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}
export default App;
