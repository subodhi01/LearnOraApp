import React, { useState, useEffect, useRef } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId, updateComment, deleteComment, toggleCommentVisibility } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { reactionService } from '../../services/reactionService';
import { createNotification } from '../../services/notificationService';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

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
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [reactionError, setReactionError] = useState(null);

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

  const loadReactions = async (plan) => {
    try {
      setReactionError(null);
      const counts = await reactionService.getReactionCounts('COURSE', plan.id);
      const userReaction = await reactionService.getUserReaction('COURSE', plan.id, user.email);
      
      setReactions(prev => ({
        ...prev,
        [plan.id]: counts
      }));
      
      setUserReactions(prev => ({
        ...prev,
        [plan.id]: userReaction
      }));
    } catch (error) {
      console.error('Error loading reactions:', error);
      setReactionError('Failed to load reactions');
      // Set default values on error
      setReactions(prev => ({
        ...prev,
        [plan.id]: { likes: 0, dislikes: 0 }
      }));
      setUserReactions(prev => ({
        ...prev,
        [plan.id]: null
      }));
    }
  };

  const handleReaction = async (planId, reactionType) => {
    try {
      setReactionError(null);
      const currentReaction = userReactions[planId];
      const plan = sharedPlans.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Course not found');
      }

      // Check if user is authenticated
      if (!user || !user.token) {
        setReactionError('Please log in to react to courses');
        return;
      }
      
      if (currentReaction === reactionType) {
        // Remove reaction if clicking the same button
        await reactionService.removeReaction('COURSE', planId, user.email);
        setUserReactions(prev => ({
          ...prev,
          [planId]: null
        }));
        setReactions(prev => ({
          ...prev,
          [planId]: {
            likes: prev[planId].likes - (reactionType === 'LIKE' ? 1 : 0),
            dislikes: prev[planId].dislikes - (reactionType === 'DISLIKE' ? 1 : 0)
          }
        }));
      } else {
        // Add new reaction
        await reactionService.addReaction('COURSE', planId, user.email, reactionType);
        setUserReactions(prev => ({
          ...prev,
          [planId]: reactionType
        }));
        setReactions(prev => ({
          ...prev,
          [planId]: {
            likes: prev[planId].likes + (reactionType === 'LIKE' ? 1 : 0) - (currentReaction === 'LIKE' ? 1 : 0),
            dislikes: prev[planId].dislikes + (reactionType === 'DISLIKE' ? 1 : 0) - (currentReaction === 'DISLIKE' ? 1 : 0)
          }
        }));
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      if (error.message === 'Authentication required') {
        setReactionError('Please log in to react to courses');
      } else {
        setReactionError('Failed to update reaction. Please try again.');
      }
    }
  };

  // Add this useEffect to test the connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await reactionService.testConnection();
        console.log('Reaction service connection successful');
      } catch (error) {
        console.error('Reaction service connection failed:', error);
        setReactionError('Unable to connect to the reaction service. Please make sure the backend is running.');
      }
    };

    testConnection();
  }, []);

  // Update the loadReactions function
  useEffect(() => {
    const loadReactions = async () => {
      if (sharedPlans.length > 0) {
        const reactionsData = {};
        const userReactionsData = {};
        
        for (const plan of sharedPlans) {
          try {
            console.log('Loading reactions for plan:', plan.id);
            const counts = await reactionService.getReactionCounts('COURSE', plan.id);
            console.log('Reaction counts:', counts);
            reactionsData[plan.id] = counts;
            
            if (user) {
              const userReaction = await reactionService.getUserReaction('COURSE', plan.id, user.email);
              console.log('User reaction:', userReaction);
              userReactionsData[plan.id] = userReaction;
            }
          } catch (error) {
            console.error('Error loading reactions for plan:', plan.id, error);
            setReactionError('Unable to load reactions. Please make sure the backend server is running.');
            // Set default values for this plan
            reactionsData[plan.id] = { likes: 0, dislikes: 0 };
            userReactionsData[plan.id] = null;
          }
        }
        
        setReactions(reactionsData);
        setUserReactions(userReactionsData);
      }
    };

    loadReactions();
  }, [sharedPlans, user]);

  const CommentSection = ({ planId, comment, level = 0 }) => {
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;
    const isOwner = user && comment.userId === user.email;
    const isCourseOwner = user && sharedPlans.find(plan => plan.id === planId)?.userEmail === user.email;
    const planReactions = reactions[planId] || { likes: 0, dislikes: 0 };
    const userReaction = userReactions[planId];

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

        {sharedPlans.find(plan => plan.id === planId)?.isShared && (
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => handleReaction(planId, 'LIKE')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                userReaction === 'LIKE' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaThumbsUp />
              <span>{planReactions.likes}</span>
            </button>
            
            <button
              onClick={() => handleReaction(planId, 'DISLIKE')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                userReaction === 'DISLIKE' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaThumbsDown />
              <span>{planReactions.dislikes}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderReactionError = () => {
    if (reactionError) {
      return (
        <div className="reaction-error">
          <p>{reactionError}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      {renderReactionError()}
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

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {comments[plan.id]?.length || 0} comments
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReaction(plan.id, 'LIKE')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                        userReactions[plan.id] === 'LIKE'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaThumbsUp />
                      <span>{reactions[plan.id]?.likes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReaction(plan.id, 'DISLIKE')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                        userReactions[plan.id] === 'DISLIKE'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaThumbsDown />
                      <span>{reactions[plan.id]?.dislikes || 0}</span>
                    </button>
                  </div>
                </div>
                {reactionError && (
                  <p className="mt-2 text-sm text-red-600">{reactionError}</p>
                )}
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