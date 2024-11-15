// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (!token) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const processCode = async () => {
      if (user || loading) return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code && sessionStorage.getItem('processedCode') !== code) {
        await handleCallback(code);
      }
    };

    processCode();
  }, [user, loading]);

  const handleCallback = async (code) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      sessionStorage.setItem('processedCode', code);
      const response = await axios.post('http://localhost:5001/api/auth/callback', { code });
      
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('github_token', response.data.accessToken);
        window.history.pushState({}, null, '/');
      }
    } catch (error) {
      console.error('Authentication error:', error.response?.data?.error || error.message);
      setError(error.response?.data?.error || 'Authentication failed');
      sessionStorage.removeItem('processedCode');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    sessionStorage.removeItem('processedCode');
    window.location.href = 'http://localhost:5001/api/auth/github';
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('github_token');
      
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setError(null);
      setLoading(false);
      setShowLogoutConfirm(false);
      window.history.pushState({}, null, '/');

      if (token) {
        try {
          await axios.delete('https://api.github.com/applications/tokens/oauth', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.log('Error revoking token:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout properly');
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-container">
          <div className="loading-text">Loading...</div>
        </div>
      )}
      
      {error && (
        <div>
          <div className="error-message">{error}</div>
          <button onClick={handleLogin} className="login-button">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && !user && (
        <button onClick={handleLogin} className="login-button">
          Login with GitHub
        </button>
      )}

      {showLogoutConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-text">Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="confirm-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && user && (
        <div className="user-card">
          <img 
            src={user.avatar_url} 
            alt="Profile" 
            className="avatar"
          />
          <h2 className="welcome-text">
            Welcome, {user.name || user.login}!
          </h2>
          {user.bio && (
            <p className="bio-text">{user.bio}</p>
          )}
          
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">{user.public_repos}</div>
              <div className="stat-label">Repositories</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{user.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{user.following}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>

          <button 
            onClick={handleLogoutClick}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;