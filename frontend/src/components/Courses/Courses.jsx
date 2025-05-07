import React, { useState, useEffect, useRef } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId, updateComment, deleteComment, toggleCommentVisibility } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { reactionService } from '../../services/reactionService';
import { createNotification } from '../../services/notificationService';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import ReactionSection from '../Reactions/ReactionSection';
import CommentSection from '../Comments/CommentSection';

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

  // Get comment ID from URL if present
  const searchParams = new URLSearchParams(location.search);
  const highlightCommentId = searchParams.get('commentId');

  // Add new state for user progress
  const [userProgress, setUserProgress] = useState({});

  // Load plans, comments, and user progress
  useEffect(() => {
    const loadData = async () => {
      try {
        const plans = await learningPlanService.getSharedPlans();
        setSharedPlans(Array.isArray(plans) ? plans : []);
        
        // Load user progress for each plan
        if (user?.email) {
          const progressPromises = plans.map(plan => 
            learningPlanService.getUserProgress(user.email, plan.id)
          );
          const progressResults = await Promise.all(progressPromises);
          const progressMap = {};
          progressResults.forEach((progress, index) => {
            if (progress) {
              progressMap[plans[index].id] = progress;
            }
          });
          setUserProgress(progressMap);
        }
        
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
  }, [user?.email]);

  // Separate effect for handling target comment navigation
  useEffect(() => {
    const navigateToComment = async () => {
      if (!targetCommentId || !sharedPlans.length) return;

      // Wait for comments to be loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the plan containing the target comment
      for (const plan of sharedPlans) {
        const planComments = comments[plan.id] || [];
        const hasComment = planComments.some(comment => 
          comment.id === targetCommentId || 
          (comment.replies && comment.replies.some(reply => reply.id === targetCommentId))
        );

        if (hasComment) {
          // Expand the comments section
          setExpandedComments(prev => ({ ...prev, [plan.id]: true }));

          // Wait for the DOM to update
          setTimeout(() => {
            const commentElement = document.querySelector(`[data-comment-id="${targetCommentId}"]`);
            if (commentElement) {
              commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              commentElement.classList.add('highlight-comment');
              setTimeout(() => {
                commentElement.classList.remove('highlight-comment');
              }, 2000);
            }
          }, 100);
          break;
        }
      }
    };

    navigateToComment();
  }, [targetCommentId, sharedPlans, comments]);

  // Handle URL parameters for comment navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const commentId = params.get('commentId');
    const courseId = params.get('courseId');
    
    if (courseId && !loading && sharedPlans.length > 0) {
      setTargetCourseId(courseId);
      
      if (commentId) {
        setTargetCommentId(commentId);
      }

      // Wait for the component to render and then scroll to the target course
      const scrollToCourse = () => {
        const courseElement = document.querySelector(`[data-course-id="${courseId}"]`);
        if (courseElement) {
          const headerOffset = 80;
          const elementPosition = courseElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Add highlight animation
          courseElement.classList.add('highlight-course');
          
          // Remove highlight after animation
          setTimeout(() => {
            courseElement.classList.remove('highlight-course');
          }, 2000);
        }
      };

      // Try scrolling immediately and after a short delay to ensure the element is rendered
      scrollToCourse();
      setTimeout(scrollToCourse, 100);
      setTimeout(scrollToCourse, 500); // Additional attempt after a longer delay
    }
  }, [location.search, sharedPlans, loading]);

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

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      console.error('No user object found');
      return;
    }

    if (!commentId) {
      console.error('Invalid comment ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId, user.email);
      
      // Find the plan that contains this comment
      const planWithComment = sharedPlans.find(plan => {
        const planComments = comments[plan.id] || [];
        return planComments.some(comment => 
          comment.id === commentId || 
          (comment.replies && comment.replies.some(reply => reply.id === commentId))
        );
      });

      if (planWithComment) {
        // Remove the comment from the state
        setComments(prev => ({
          ...prev,
          [planWithComment.id]: prev[planWithComment.id].map(comment => {
            if (comment.id === commentId) {
              return null;
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== commentId)
              };
            }
            return comment;
          }).filter(Boolean)
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrors(prev => ({ ...prev, [commentId]: error.message || 'Failed to delete comment' }));
    }
  };

  const handleToggleCommentVisibility = async (planId, commentId) => {
    if (!user) return;

    try {
      await toggleCommentVisibility(commentId, user.email);
      
      // Update the comment in the state
      setComments(prev => ({
        ...prev,
        [planId]: prev[planId].map(comment => {
          if (comment.id === commentId) {
            return { ...comment, hidden: !comment.hidden };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? { ...reply, hidden: !reply.hidden } : reply
              )
            };
          }
          return comment;
        })
      }));
    } catch (error) {
      console.error('Error toggling comment visibility:', error);
      setErrors(prev => ({ ...prev, [commentId]: error.message || 'Failed to toggle comment visibility' }));
    }
  };

  // Add function to start learning a plan
  const handleStartLearning = async (planId) => {
    try {
      if (!user?.email) {
        setErrors(prev => ({ ...prev, [planId]: 'Please log in to start learning' }));
        return;
      }

      const progress = await learningPlanService.startLearningPlan(user.email, planId);
      setUserProgress(prev => ({
        ...prev,
        [planId]: progress
      }));

      // Update the plan status in the UI
      setSharedPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { ...plan, status: 'In Progress' }
          : plan
      ));
    } catch (error) {
      console.error('Error starting learning plan:', error);
      setErrors(prev => ({ 
        ...prev, 
        [planId]: error.message || 'Failed to start learning plan' 
      }));
    }
  };

  // Add function to update topic progress
  const handleUpdateTopicProgress = async (planId, topicIndex, completed) => {
    try {
      if (!user?.email) {
        setErrors(prev => ({ ...prev, [planId]: 'Please log in to update progress' }));
        return;
      }

      // Clear any previous errors for this plan
      setErrors(prev => ({ ...prev, [planId]: '' }));

      const updatedProgress = await learningPlanService.updateTopicProgress(
        user.email,
        planId,
        topicIndex,
        completed
      );

      if (!updatedProgress) {
        throw new Error('Failed to update progress. Please try again.');
      }

      // Update the user progress state
      setUserProgress(prev => ({
        ...prev,
        [planId]: updatedProgress
      }));

      // Update the plan progress in the UI
      setSharedPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              topics: plan.topics.map((topic, idx) => 
                idx === topicIndex 
                  ? { ...topic, completed } 
                  : topic
              )
            }
          : plan
      ));
    } catch (error) {
      console.error('Error updating topic progress:', error);
      setErrors(prev => ({ 
        ...prev, 
        [planId]: error.message || 'Failed to update progress. Please try again.' 
      }));

      // Revert the checkbox state if the update failed
      setUserProgress(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          topics: prev[planId]?.topics.map((topic, idx) => 
            idx === topicIndex 
              ? { ...topic, completed: !completed }
              : topic
          )
        }
      }));
    }
  };

  const CommentSection = ({ planId, comment, level = 0 }) => {
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;
    const isOwner = user && comment.userId === user.email;

      if (!user || !user.token) {
        setReactionError('Please log in to react to courses');
        return;
      }

      if (currentReaction === reactionType) {
        // Remove reaction if clicking the same button
        await reactionService.removeReaction('COURSE', planId, user.email, `${user.firstName} ${user.lastName}`);
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
        await reactionService.addReaction('COURSE', planId, user.email, reactionType, `${user.firstName} ${user.lastName}`);
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

  // Load reactions
  useEffect(() => {
    const loadReactions = async () => {
      if (sharedPlans.length > 0) {
        const reactionsData = {};
        const userReactionsData = {};
        
        for (const plan of sharedPlans) {
          try {
            const counts = await reactionService.getReactionCounts('COURSE', plan.id);
            reactionsData[plan.id] = counts;
            
            if (user) {
              const userReaction = await reactionService.getUserReaction('COURSE', plan.id, user.email);
              userReactionsData[plan.id] = userReaction;
            }
          } catch (error) {
            console.error('Error loading reactions for plan:', plan.id, error);
            setReactionError('Unable to load reactions. Please make sure the backend server is running.');
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
            <div 
              key={plan.id} 
              className="course-card"
              data-course-id={plan.id}
            >
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
                    Status: {userProgress[plan.id]?.status || plan.status}
                  </span>
                  <span className="course-progress">
                    Progress: {calculateProgress(userProgress[plan.id] || plan)}%
                  </span>
                </div>
                <div className="course-timeline">
                  <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>

                {user ? (
                  !userProgress[plan.id] ? (
                    <button
                      className="start-learning-btn"
                      onClick={() => handleStartLearning(plan.id)}
                    >
                      Start Learning
                    </button>
                  ) : (
                    <div className="topics-progress">
                      <h4>Your Progress</h4>
                      {plan.topics.map((topic, index) => (
                        <div key={index} className="topic-progress-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={userProgress[plan.id]?.topics[index]?.completed || false}
                              onChange={(e) => handleUpdateTopicProgress(plan.id, index, e.target.checked)}
                            />
                            {topic.title}
                          </label>
                          <span className="topic-resources">{topic.resources}</span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="login-prompt">
                    Please <a href="/login">log in</a> to start learning.
                  </p>
                )}

                {errors[plan.id] && (
                  <div className="error-message">{errors[plan.id]}</div>
                )}

                {/* Comments Section */}
                <CommentSection
                  contentId={plan.id}
                  comments={comments[plan.id] || []}
                  onCommentSubmit={handleCommentSubmit}
                  onCommentUpdate={handleUpdateComment}
                  onCommentDelete={handleDeleteComment}
                  onCommentToggleVisibility={handleToggleCommentVisibility}
                  onReply={handleCommentSubmit}
                  isContentOwner={user && plan.userEmail === user.email}
                  errors={errors}
                  highlightCommentId={highlightCommentId}
                />
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