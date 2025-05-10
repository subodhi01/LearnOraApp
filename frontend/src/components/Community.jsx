import React from 'react';
import { useAuth } from '../context/AuthContext';
import CommunityPost from './CommunityPost';
import CommunityFeed from './CommunityFeed';
import './Community.css';

const Community = () => {
  const { user, currentUser } = useAuth();
  const isAuthenticated = user || currentUser;

  return (
    <div className="community-container">
      <h1>Community</h1>
      {isAuthenticated && <CommunityPost />}
      <CommunityFeed />
    </div>
  );
};

export default Community;