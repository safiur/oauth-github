// frontend/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate,Navigate } from 'react-router-dom';
import axios from 'axios';


// frontend/src/components/Dashboard.js
function Dashboard({ user, setUser }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!user);
  
    useEffect(() => {
      const checkUser = async () => {
        if (!user && localStorage.getItem('github_token')) {
          try {
            const response = await axios.get('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('github_token')}`,
                Accept: 'application/json'
              }
            });
            setUser(response.data);
          } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('github_token');
            navigate('/', { replace: true });
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };
  
      checkUser();
    }, [user, setUser, navigate]);
  
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
  
    if (!user && !localStorage.getItem('github_token')) {
      return <Navigate to="/" replace />;
    }
   const handleLogout = () => {
    // Clear everything
    localStorage.removeItem('github_token');
    setUser(null);  // Update the user state in App.js
    navigate('/', { replace: true });  // Force navigation to root
  
    // Rest of the Dashboard component code...
  }

  return (
    <div className="dashboard-container">
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
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;