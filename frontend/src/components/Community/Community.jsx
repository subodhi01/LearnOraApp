import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion, 
  increment,
  getFirestore,
  enableIndexedDbPersistence,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import './Community.css';

const Community = () => {
  const { user, currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [trendingTopics] = useState([
    'Learning Tips',
    'Study Groups',
    'Course Reviews',
    'Career Advice',
    'Tech News'
  ]);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Enable offline persistence
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        await enableIndexedDbPersistence(getFirestore());
        console.log('Offline persistence enabled');
      } catch (error) {
        console.error('Error enabling offline persistence:', error);
      }
    };
    enablePersistence();
  }, []);

  useEffect(() => {
    if (!user) {
      console.log('No user found in auth state');
      return;
    }

    try {
      const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPosts(postsData);
          setError(null);
        },
        (error) => {
          console.error('Error fetching posts:', error);
          setError('Failed to load posts. Please try again later.');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up posts listener:', error);
      setError('Failed to connect to the server. Please try again later.');
    }
  }, [user]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size should be less than 10MB');
        return;
      }
      setMediaFile(file);
      setError(null);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to create a post');
      return;
    }
    if (!newPost.trim() && !mediaFile) {
      setError('Please add some content or media to your post');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let mediaUrl = '';
      if (mediaFile) {
        const storageRef = ref(storage, `community/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      const postData = {
        title: newPost.substring(0, 50) + (newPost.length > 50 ? '...' : ''),
        content: newPost,
        mediaUrl: mediaUrl,
        mediaType: mediaUrl ? (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video') : null,
        userName: user.email || '',
        userEmail: user.email || '',
        userPhotoURL: user.photoURL || 'https://via.placeholder.com/40',
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), postData);
      console.log('Post created with ID:', docRef.id);

      setNewPost('');
      setMediaFile(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      setError('Please sign in to like posts');
      return;
    }

    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post. Please try again.');
    }
  };

  const handleComment = async (postId) => {
    if (!user) {
      setError('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: user.email || '',
          userEmail: user.email || '',
          userPhotoURL: user.photoURL || 'https://via.placeholder.com/40',
          comment: commentText,
          createdAt: serverTimestamp()
        })
      });
      setCommentText('');
      setSelectedPostId(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleEditPost = async (postId, currentContent) => {
    if (!user) {
      setError('Please sign in to edit posts');
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

      // Update the posts state immediately
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
      
      // Clear success message after 3 seconds
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
    if (!user) {
      setError('Please sign in to delete posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const postRef = doc(db, 'communityPosts', postId);
      await deleteDoc(postRef);
      
      // Update the posts state immediately
      setPosts(posts.filter(post => post.id !== postId));
      setSuccessMessage('Post deleted successfully!');
      
      // Clear success message after 3 seconds
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

  if (!user) {
    return (
      <div className="community-container">
        <div className="community-header">
          <h1>Community Hub</h1>
          <p>Please sign in to access the community features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community Hub</h1>
        <p>Connect with fellow learners, share experiences, and grow together</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

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
              {error && <p className="error-message">{error}</p>}
              {mediaFile && (
                <p className="file-info">
                  Selected file: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </form>
          </div>

          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <img src={post.userPhotoURL} alt={post.userEmail} />
                  <div className="post-info">
                    <h3>{post.userName}</h3>
                    <p>
                      {moment(post.createdAt?.toDate()).format('YYYY-MM-DD HH:mm')}
                      {post.editedAt && ' (edited)'}
                    </p>
                  </div>
                  {post.userEmail === user?.email && (
                    <div className="post-actions-menu">
                      <button 
                        onClick={() => {
                          setEditingPost(post.id);
                          setEditContent(post.content);
                        }}
                        className="edit-btn"
                        disabled={isUpdating}
                      >
                        {isUpdating && editingPost === post.id ? 'Updating...' : '✏️ Edit'}
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="delete-btn"
                        disabled={isDeleting}
                      >
                        {isDeleting && isDeleting === post.id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  )}
                </div>

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
                          onClick={() => handleEditPost(post.id, post.content)}
                          className="save-btn"
                        >
                          Save
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
                      <p className="text-sm text-blue-700 font-medium">#post #popular</p>
                      <p>{post.content}</p>
                      {post.mediaType === 'image' && post.mediaUrl && (
                        <img src={post.mediaUrl} alt="Post media" className="mt-4 rounded-xl w-full h-80 object-cover" />
                      )}
                      {post.mediaType === 'video' && post.mediaUrl && (
                        <video controls className="mt-4 rounded-xl w-full h-80 object-cover">
                          <source src={post.mediaUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </>
                  )}
                </div>

                <div className="post-actions">
                  <button onClick={() => handleLike(post.id)}>
                    ❤️ {post.likes}
                  </button>
                  <button onClick={() => setSelectedPostId(post.id)}>
                    💬 Comment
                  </button>
                  <button>↗️ Share</button>
                </div>

                {selectedPostId === post.id && (
                  <div className="mt-3 flex items-center gap-4">
                    <input
                      type="text"
                      value={commentText}
                      maxLength={20}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Comment..."
                      className="w-full h-10 px-4 text-sm rounded-full bg-slate-100 border border-gray-300"
                    />
                    <button
                      className="text-blue-600 font-medium"
                      onClick={() => handleComment(post.id)}
                    >
                      Post
                    </button>
                  </div>
                )}

                {post.comments && post.comments.length > 0 && (
                  <div className="bg-slate-100 rounded-xl mt-4 p-3">
                    <h4 className="text-sm text-gray-500 mb-2">Comments</h4>
                    <div className="max-h-24 overflow-y-auto scrollbar-thin pr-1">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                          <p className="text-[10px] text-gray-500">
                            {moment(comment.createdAt?.toDate()).fromNow()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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