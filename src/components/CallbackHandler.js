// frontend/src/components/CallbackHandler.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CallbackHandler({ setUser }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        setError('No code received');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5001/api/auth/callback', { code });
        if (response.data.accessToken && response.data.user) {
          localStorage.setItem('github_token', response.data.accessToken);
          setUser(response.data.user);
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication failed');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return <div className="loading">Processing login...</div>;
}

export default CallbackHandler;