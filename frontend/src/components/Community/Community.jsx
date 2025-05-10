import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trendingTopics] = useState([
    'Learning Tips',
    'Study Groups',
    'Course Reviews',
    'Career Advice',
    'Tech News'
  ]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !mediaFile) return;

    setLoading(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'posts'), {
        content: newPost,
        mediaUrl,
        userId: user.uid,
        userEmail: user.email,
        userPhotoURL: user.photoURL || 'https://via.placeholder.com/40',
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      });

      setNewPost('');
      setMediaFile(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community Hub</h1>
        <p>Connect with fellow learners, share experiences, and grow together</p>
      </div>

      <div className="community-content">
        <div className="posts-section">
          <div className="create-post">
            <form onSubmit={handlePostSubmit}>
              <textarea
                placeholder="Share your thoughts, questions, or experiences..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="post-actions">
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    style={{ display: 'none' }}
                  />
                  📷 Upload Media
                </label>
                <button type="submit" className="post-btn" disabled={loading}>
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>

          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <img src={post.userPhotoURL} alt={post.userEmail} />
                  <div className="post-info">
                    <h3>{post.userEmail}</h3>
                    <p>{new Date(post.createdAt?.toDate()).toLocaleString()}</p>
                  </div>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.mediaUrl && (
                    post.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={post.mediaUrl} alt="Post media" />
                    ) : (
                      <video src={post.mediaUrl} controls />
                    )
                  )}
                </div>
                <div className="post-actions">
                  <button>❤️ {post.likes}</button>
                  <button>💬 Comment</button>
                  <button>↗️ Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Trending Topics</h3>
            <ul className="trending-topics">
              {trendingTopics.map((topic, index) => (
                <li key={index}>#{topic}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Community Guidelines</h3>
            <ul className="trending-topics">
              <li>Be respectful and supportive</li>
              <li>Share valuable insights</li>
              <li>Help others learn</li>
              <li>Stay on topic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 