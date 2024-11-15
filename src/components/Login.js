// frontend/src/components/Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing tokens on login page
    localStorage.removeItem('github_token');
  }, []);
  useEffect(() => {
    // Check if we have a valid token
    const token = localStorage.getItem('github_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5001/api/auth/github');
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to initiate login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      <button 
        onClick={handleLogin} 
        className="login-button"
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Login with GitHub'}
      </button>
    </div>
  );
}

export default Login;