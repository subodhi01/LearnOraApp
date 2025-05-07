import React, { useState, useEffect, useRef } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId, updateComment, deleteComment, toggleCommentVisibility } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const CommentInput = ({ initialValue = '', onSubmit, onCancel, placeholder }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };

  return (
    <div className="comment-input-container">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="comment-input"
        rows={3}
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
  const location = useLocation();
  const [sharedPlans, setSharedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [errors, setErrors] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [targetCommentId, setTargetCommentId] = useState(null);
  const [targetCourseId, setTargetCourseId] = useState(null);
  const { user } = useAuth();
  const commentRefs = useRef({});

  // Load plans and comments
  useEffect(() => {
    const loadData = async () => {
      try {
        const plans = await learningPlanService.getSharedPlans();
        setSharedPlans(Array.isArray(plans) ? plans : []);
        
        // Load comments for all plans
        for (const plan of plans) {
          try {
            const planComments = await getCommentsByPostId(plan.id);
            setComments(prev => ({ ...prev, [plan.id]: planComments }));
          } catch (error) {
            console.error(`Error loading comments for plan ${plan.id}:`, error);
            setComments(prev => ({ ...prev, [plan.id]: [] }));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle URL parameters for comment navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const commentId = params.get('commentId');
    const courseId = params.get('courseId');
    
    if (commentId && courseId) {
      setTargetCommentId(commentId);
      setTargetCourseId(courseId);
    }
  }, [location.search]);

  // Separate effect for handling target comment navigation
  useEffect(() => {
    const navigateToComment = async () => {
      if (!targetCommentId || !targetCourseId || !sharedPlans.length) return;

      // Wait for comments to be loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the target plan
      const targetPlan = sharedPlans.find(plan => plan.id === targetCourseId);
      if (!targetPlan) return;

      // Expand the comments section
      setExpandedComments(prev => ({ ...prev, [targetPlan.id]: true }));

      // Wait for the DOM to update
      setTimeout(() => {
        const commentElement = document.querySelector(`[data-comment-id="${targetCommentId}"]`);
        if (commentElement) {
          // Scroll the comment into view
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add highlight effect
          commentElement.classList.add('highlight-comment');
          
          // Remove highlight after animation
          setTimeout(() => {
            commentElement.classList.remove('highlight-comment');
          }, 2000);
        }
      }, 100);
    };

    navigateToComment();
  }, [targetCommentId, targetCourseId, sharedPlans, comments]);

  const handleCommentSubmit = async (planId, parentId = null, text) => {
    if (!user) {
      console.error('No user object found');
      return;
    }

    if (!text.trim()) {
      setErrors(prev => ({ ...prev, [`${planId}-${parentId || 'new'}`]: 'Comment cannot be empty' }));
      return;
    }

    try {
      const commentData = {
        postId: planId,
        userId: user.email,
        username: `${user.firstName} ${user.lastName}`,
        text: text,
        parentId: parentId
      };
      
      const savedComment = await createComment(commentData);
      
      // Refresh comments for this plan
      const updatedComments = await getCommentsByPostId(planId);
      setComments(prev => ({
        ...prev,
        [planId]: updatedComments
      }));
      
      // Clear any errors and reset reply state
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
      await deleteComment(commentId, user.email);
      
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

  const toggleComments = async (planId) => {
    if (!expandedComments[planId]) {
      // If comments are not loaded yet, fetch them
      if (!comments[planId]) {
        try {
          const planComments = await getCommentsByPostId(planId);
          setComments(prev => ({ ...prev, [planId]: planComments }));
        } catch (error) {
          console.error(`Error fetching comments for plan ${planId}:`, error);
          setErrors(prev => ({ ...prev, [planId]: 'Failed to load comments' }));
        }
      }
    }
    setExpandedComments(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const CommentSection = ({ planId, comment, level = 0 }) => {
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;
    const isOwner = user && comment.userId === user.email;
    const isCourseOwner = user && sharedPlans.find(plan => plan.id === planId)?.userEmail === user.email;

    const handleReplyClick = () => {
      setReplyingTo(isReplying ? null : comment.id);
      setErrors(prev => ({ ...prev, [`${planId}-${comment.id}`]: '' }));
    };

    const handleToggleVisibility = async () => {
      if (!user) return;

      try {
        await toggleCommentVisibility(comment.id, user.email);
        
        // Update the comment in the state
        setComments(prev => ({
          ...prev,
          [planId]: prev[planId].map(c => {
            if (c.id === comment.id) {
              return { ...c, hidden: !c.hidden };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(reply =>
                  reply.id === comment.id ? { ...reply, hidden: !reply.hidden } : reply
                )
              };
            }
            return c;
          })
        }));
      } catch (error) {
        console.error('Error toggling comment visibility:', error);
        setErrors(prev => ({ ...prev, [comment.id]: error.message || 'Failed to toggle comment visibility' }));
      }
    };

    // Don't render if the comment is hidden and user is not course owner
    if (comment.hidden && !isCourseOwner) {
      return null;
    }

    return (
      <div 
        className={`comment-container level-${level} ${comment.hidden ? 'hidden-comment' : ''}`}
        data-comment-id={comment.id}
      >
        <div className="comment">
          <div className="comment-header">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.hidden && isCourseOwner && (
              <span className="hidden-badge">Hidden</span>
            )}
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
                    onClick={handleReplyClick}
                    type="button"
                  >
                    {isReplying ? 'Cancel Reply' : 'Reply'}
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      className="edit-button"
                      onClick={() => setEditingComment(comment.id)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(planId, comment.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                )}
                {!isOwner && isCourseOwner && (
                  <>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(planId, comment.id)}
                      type="button"
                    >
                      Delete
                    </button>
                    <button
                      className={comment.hidden ? "unhide-button" : "hide-button"}
                      onClick={handleToggleVisibility}
                      type="button"
                    >
                      {comment.hidden ? "Unhide" : "Hide"}
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
                  <div className="comments-header">
                    <h4>Comments</h4>
                    <button
                      className="toggle-comments-button"
                      onClick={() => toggleComments(plan.id)}
                    >
                      {expandedComments[plan.id] ? 'Hide Comments' : 'Show Comments'}
                      <span className="comment-count">
                        {comments[plan.id]?.length || 0}
                      </span>
                    </button>
                  </div>

                  {expandedComments[plan.id] && (
                    <>
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
                    </>
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