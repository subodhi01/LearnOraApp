import React, { useState, useEffect } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId, updateComment, deleteComment } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';

const CommentInput = ({ initialValue = '', onSubmit, onCancel, placeholder }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };

  return (
    <div className="comment-input-container">
      <textarea
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="comment-input"
      />
      <div className="comment-actions">
        <button onClick={handleSubmit} className="submit-comment-button">
          {initialValue ? 'Save' : 'Post Comment'}
        </button>
        {onCancel && (
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const Courses = () => {
  const [sharedPlans, setSharedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchSharedPlans = async () => {
      try {
        const plans = await learningPlanService.getSharedPlans();
        setSharedPlans(Array.isArray(plans) ? plans : []);
        // Fetch comments for each plan
        plans.forEach(plan => fetchComments(plan.id));
      } catch (error) {
        console.error('Error fetching shared plans:', error);
        setSharedPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlans();
  }, []);

  const fetchComments = async (planId) => {
    try {
      const response = await getCommentsByPostId(planId);
      setComments(prev => ({ ...prev, [planId]: response }));
    } catch (error) {
      console.error(`Error fetching comments for plan ${planId}:`, error);
      setErrors(prev => ({ ...prev, [planId]: 'Failed to load comments' }));
    }
  };

  const handleCommentSubmit = async (planId, parentId = null, text) => {
    if (!user) return;

    if (!text.trim()) {
      setErrors(prev => ({ ...prev, [`${planId}-${parentId || 'new'}`]: 'Comment cannot be empty' }));
      return;
    }

    try {
      const commentData = {
        postId: planId,
        userId: user._id,
        username: `${user.firstName} ${user.lastName}`,
        text: text,
        parentId: parentId
      };
      const savedComment = await createComment(commentData);
      
      if (parentId) {
        setComments(prev => ({
          ...prev,
          [planId]: prev[planId].map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...(comment.replies || []), savedComment] }
              : comment
          )
        }));
      } else {
        setComments(prev => ({
          ...prev,
          [planId]: [...(prev[planId] || []), savedComment],
        }));
      }
      
      setErrors(prev => ({ ...prev, [`${planId}-${parentId || 'new'}`]: '' }));
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      setErrors(prev => ({ ...prev, [`${planId}-${parentId || 'new'}`]: error.message || 'Failed to post comment' }));
    }
  };

  const handleUpdateComment = async (planId, commentId, newText) => {
    if (!user) return;

    try {
      const updatedComment = await updateComment(commentId, { text: newText });
      
      setComments(prev => ({
        ...prev,
        [planId]: prev[planId].map(comment => {
          if (comment.id === commentId) {
            return { ...comment, text: newText };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? { ...reply, text: newText } : reply
              )
            };
          }
          return comment;
        })
      }));

      setEditingComment(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      setErrors(prev => ({ ...prev, [commentId]: error.message || 'Failed to update comment' }));
    }
  };

  const handleDeleteComment = async (planId, commentId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId, user._id);
      
      // Remove the comment from the state
      setComments(prev => ({
        ...prev,
        [planId]: prev[planId].map(comment => {
          if (comment.id === commentId) {
            return null; // Remove the comment
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        }).filter(Boolean) // Remove null entries
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrors(prev => ({ ...prev, [commentId]: error.message || 'Failed to delete comment' }));
    }
  };

  const CommentSection = ({ planId, comment, level = 0 }) => {
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;
    const isOwner = user && comment.userId === user._id;

    return (
      <div className={`comment-container level-${level}`}>
        <div className="comment">
          <div className="comment-header">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {isEditing ? (
            <CommentInput
              initialValue={comment.text}
              onSubmit={(text) => handleUpdateComment(planId, comment.id, text)}
              onCancel={() => setEditingComment(null)}
              placeholder="Edit your comment..."
            />
          ) : (
            <>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-actions">
                {user && (
                  <button
                    className="reply-button"
                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  >
                    {isReplying ? 'Cancel Reply' : 'Reply'}
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      className="edit-button"
                      onClick={() => setEditingComment(comment.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(planId, comment.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {isReplying && (
          <div className="reply-form">
            <CommentInput
              onSubmit={(text) => handleCommentSubmit(planId, comment.id, text)}
              onCancel={() => setReplyingTo(null)}
              placeholder="Write a reply..."
            />
            {errors[`${planId}-${comment.id}`] && (
              <span className="error-message">{errors[`${planId}-${comment.id}`]}</span>
            )}
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="replies-container">
            {comment.replies.map((reply) => (
              <CommentSection
                key={reply.id}
                planId={planId}
                comment={reply}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      {sharedPlans.length === 0 ? (
        <p className="no-courses">No shared courses available yet.</p>
      ) : (
        <div className="courses-grid">
          {sharedPlans.map((plan) => (
            <div key={plan.id} className="course-card">
              <div className="course-header">
                <h3>{plan.title}</h3>
                <span className="course-creator">
                  Created by: {plan.userEmail}
                </span>
              </div>
              
              <div className="course-content">
                <p className="course-description">{plan.description}</p>
                <div className="course-meta">
                  <span className="course-topics">
                    {plan.topics?.length || 0} Topics
                  </span>
                  <span className="course-status">
                    Status: {plan.status}
                  </span>
                  <span className="course-progress">
                    Progress: {calculateProgress(plan)}%
                  </span>
                </div>
                <div className="course-timeline">
                  <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>

                {/* Comments Section */}
                <div className="comments-section">
                  <h4>Comments</h4>
                  {comments[plan.id]?.length > 0 ? (
                    comments[plan.id].map((comment) => (
                      <CommentSection
                        key={comment.id}
                        planId={plan.id}
                        comment={comment}
                      />
                    ))
                  ) : (
                    <p>No comments yet. Be the first to comment!</p>
                  )}

                  {user ? (
                    <div className="comment-form">
                      <CommentInput
                        onSubmit={(text) => handleCommentSubmit(plan.id, null, text)}
                        placeholder="Add a comment..."
                      />
                      {errors[`${plan.id}-new`] && (
                        <span className="error-message">{errors[`${plan.id}-new`]}</span>
                      )}
                    </div>
                  ) : (
                    <p className="login-prompt">
                      Please <a href="/login">log in</a> to add a comment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const calculateProgress = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  const completedTopics = plan.topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

export default Courses; 