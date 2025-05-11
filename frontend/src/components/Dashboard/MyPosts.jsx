import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import './MyPosts.css';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'communityPosts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched posts:', postsData); // Debug log
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        content: editContent,
        editedAt: serverTimestamp()
      });

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            content: editContent,
            editedAt: new Date()
          };
        }
        return post;
      }));

      setEditingPost(null);
      setEditContent('');
      setSuccessMessage('Post updated successfully!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error editing post:', error);
      setError('Failed to edit post. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const postRef = doc(db, 'communityPosts', postId);
      await deleteDoc(postRef);
      
      setPosts(posts.filter(post => post.id !== postId));
      setSuccessMessage('Post deleted successfully!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return moment(timestamp.toDate()).format('YYYY-MM-DD HH:mm');
      }
      // Handle regular Date object
      if (timestamp instanceof Date) {
        return moment(timestamp).format('YYYY-MM-DD HH:mm');
      }
      // Handle timestamp number
      if (typeof timestamp === 'number') {
        return moment(timestamp).format('YYYY-MM-DD HH:mm');
      }
      // Handle string date
      return moment(timestamp).format('YYYY-MM-DD HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="loading">Loading your posts...</div>;
  }

  return (
    <div className="my-posts-container">
      <h2>My Posts</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>You haven't made any posts yet.</p>
          <a href="/community" className="create-post-btn">
            Create Your First Post
          </a>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              {post.mediaUrl && (
                <div className="post-media">
                  {post.mediaType === 'image' ? (
                    <img src={post.mediaUrl} alt="Post media" />
                  ) : (
                    <video controls>
                      <source src={post.mediaUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
              <div className="post-content">
                {editingPost === post.id ? (
                  <div className="edit-post-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button 
                        onClick={() => handleEditPost(post.id)}
                        className="save-btn"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPost(null);
                          setEditContent('');
                        }}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{post.content}</p>
                    <div className="post-actions">
                      <button 
                        onClick={() => {
                          setEditingPost(post.id);
                          setEditContent(post.content);
                        }}
                        className="edit-btn"
                        disabled={isUpdating}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="delete-btn"
                        disabled={isDeleting}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
                <div className="post-meta">
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                    {post.editedAt && ' (edited)'}
                  </span>
                  <div className="post-stats">
                    <span><i className="fas fa-heart"></i> {post.likes || 0}</span>
                    <span><i className="fas fa-comment"></i> {post.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts; 