import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './CommunityFeed.css';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="community-feed">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <span className="user-name">{post.userName}</span>
            <span className="post-time">
              {post.createdAt?.toDate().toLocaleDateString()}
            </span>
          </div>
          <div className="post-content">
            <p>{post.content}</p>
            {post.mediaUrl && (
              <div className="post-media">
                {post.mediaType === 'image' ? (
                  <img src={post.mediaUrl} alt="Post media" />
                ) : (
                  <video src={post.mediaUrl} controls />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed; 