import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createComment, getCommentsByPostId, updateComment, deleteComment } from '../services/commentService';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [errors, setErrors] = useState({});

  // Hardcoded posts
  const posts = [
    {
      postId: 'post1',
      title: 'Welcome to LearnOra Community',
      content: 'Join our vibrant community to share knowledge and learn from others. What are your learning goals for 2025?',
    },
    {
      postId: 'post2',
      title: 'Tips for Effective Online Learning',
      content: "Share your best tips for staying focused and productive while learning online. Let's help each other succeed!"
    },
    {
      postId: 'post3',
      title: 'Favorite Learning Resources',
      content: 'What are your go-to resources for learning new skills? Books, websites, or courses—share them here!'
    },
    {
      postId: 'post4',
      title: 'Community Q&A',
      content: "Have a question about learning or a specific topic? Ask away, and let's see how we can help each other."
    },
  ];

  // Fetch comments for all posts on mount
  useEffect(() => {
    posts.forEach((post) => {
      fetchComments(post.postId);
    });
  }, []);

  const fetchComments = async (postId) => {
    try {
      const response = await getCommentsByPostId(postId);
      setComments((prev) => ({ ...prev, [postId]: response }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      setErrors((prev) => ({ ...prev, [postId]: 'Failed to load comments' }));
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) return;

    if (!newComment[postId]?.trim()) {
      setErrors((prev) => ({ ...prev, [postId]: 'Comment cannot be empty' }));
      return;
    }

    try {
      const commentData = {
        postId,
        userId: user.email,
        username: `${user.firstName} ${user.lastName}`,
        text: newComment[postId],
      };
      const savedComment = await createComment(commentData);
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), savedComment],
      }));
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      setErrors((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error creating comment:', error);
      setErrors((prev) => ({ ...prev, [postId]: error.message || 'Failed to post comment' }));
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleUpdateComment = async (commentId, postId) => {
    if (!editText.trim()) {
      setErrors((prev) => ({ ...prev, [postId]: 'Comment cannot be empty' }));
      return;
    }

    try {
      const updatedComment = await updateComment(commentId, { text: editText });
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((c) => (c.id === commentId ? updatedComment : c)),
      }));
      setEditingComment(null);
      setEditText('');
      setErrors((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error updating comment:', error);
      setErrors((prev) => ({ ...prev, [postId]: error.message || 'Failed to update comment' }));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    try {
      await deleteComment(commentId, user.email);
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== commentId),
      }));
      setErrors((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrors((prev) => ({ ...prev, [postId]: error.message || 'Failed to delete comment' }));
    }
  };

  return (
    <div className="community-container">
      <h1>LearnOra Community</h1>
      <p className="subtitle">Connect, share, and learn with others</p>

      {posts.map((post) => (
        <div key={post.postId} className="post-container">
          <h2>{post.title}</h2>
          <p>{post.content}</p>

          <div className="comments-section">
            <h3>Comments</h3>
            {comments[post.postId]?.length > 0 ? (
              comments[post.postId].map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-date">27/4/2025</span>
                  </div>
                  {editingComment === comment.id ? (
                    <div className="edit-comment-form">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-comment-input"
                      />
                      <div className="edit-comment-buttons">
                        <button
                          onClick={() => handleUpdateComment(comment.id, post.postId)}
                          className="save-button"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-text">{comment.text}</p>
                  )}
                  {user && user.email === comment.userId && editingComment !== comment.id && (
                    <div className="comment-actions">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id, post.postId)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}

            {user ? (
              <div className="comment-form">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment[post.postId] || ''}
                  onChange={(e) =>
                    setNewComment((prev) => ({ ...prev, [post.postId]: e.target.value }))
                  }
                  className="comment-input"
                />
                <button
                  onClick={() => handleCommentSubmit(post.postId)}
                  className="submit-comment-button"
                >
                  Post Comment
                </button>
                {errors[post.postId] && (
                  <span className="error-message">{errors[post.postId]}</span>
                )}
              </div>
            ) : (
              <p className="login-prompt">
                <Link to="/login">Log in</Link> to add a comment.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Community;