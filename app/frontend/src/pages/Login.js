import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from "react-router-dom";
import '../css/Login.css';
import logo from '../assets/logo.png';
const Login = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  // Redirect authenticated users to the dashboard
  return (
    <div className="container">
      <style>
        {`
          body {
            justify-content: center;
          }
        `}
      </style>
      <div className="form-box">
        <div>
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="content">
          <div className="copy">
            <div className="text-wrapper">Log in to your account</div>
          </div>
          <button
            onClick={() => loginWithRedirect() }
            className="button"
            aria-label="login"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
