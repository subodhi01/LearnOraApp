import React, { useState, useEffect, useRef } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId, updateComment, deleteComment, toggleCommentVisibility } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { reactionService } from '../../services/reactionService';
import ReactionSection from '../Reactions/ReactionSection';
import CommentSection from '../Comments/CommentSection';

const Courses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sharedPlans, setSharedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [comments, setComments] = useState({});
  const [errors, setErrors] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [reactionError, setReactionError] = useState(null);
  const { user } = useAuth();
  const commentRefs = useRef({});

  // Get comment ID and course ID from URL if present
  const searchParams = new URLSearchParams(location.search);
  const highlightCommentId = searchParams.get('commentId');
  const highlightCourseId = searchParams.get('courseId');

  // Load plans, comments, user progress, and reactions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrors({});
        
        if (!user || !user.token) {
          setErrors({ general: 'Please log in to view shared plans' });
          setLoading(false);
          return;
        }

        console.log('Fetching shared plans...');
        
        // Fetch shared plans with their enrolled users
        const plans = await learningPlanService.getSharedPlans();
        console.log('Received shared plans:', plans);
        
        if (!plans || plans.length === 0) {
          console.log('No shared plans found');
          setSharedPlans([]);
          setLoading(false);
          return;
        }
        
        // Ensure each plan has enrolledUsers array and fetch the latest count
        const plansWithEnrolledUsers = await Promise.all(plans.map(async (plan) => {
          try {
            // Get the latest plan data to ensure we have the current enrolled users count
            const latestPlan = await learningPlanService.getPlanById(plan.id);
            return {
              ...plan,
              enrolledUsers: latestPlan.enrolledUsers || []
            };
          } catch (error) {
            console.error(`Error fetching latest data for plan ${plan.id}:`, error);
            return {
              ...plan,
              enrolledUsers: plan.enrolledUsers || []
            };
          }
        }));

        console.log('Processed shared plans:', plansWithEnrolledUsers);
        setSharedPlans(plansWithEnrolledUsers);

        // Load user progress for each plan
        const progressPromises = plans.map(plan =>
          learningPlanService.getUserProgress(user.email, plan.id)
            .catch(error => {
              console.error(`Error fetching progress for plan ${plan.id}:`, error);
              return null;
            })
        );
        const progressResults = await Promise.all(progressPromises);
        const progressMap = {};
        progressResults.forEach((progress, index) => {
          if (progress) {
            progressMap[plans[index].id] = progress;
          }
        });
        setUserProgress(progressMap);

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

        // Load reactions
        const reactionsData = {};
        const userReactionsData = {};
        for (const plan of plans) {
          try {
            const counts = await reactionService.getReactionCounts('COURSE', plan.id);
            reactionsData[plan.id] = counts;
            if (user) {
              const userReaction = await reactionService.getUserReaction('COURSE', plan.id, user.email);
              userReactionsData[plan.id] = userReaction;
            }
          } catch (error) {
            console.error('Error loading reactions for plan:', plan.id, error);
            reactionsData[plan.id] = { likes: 0, dislikes: 0 };
            userReactionsData[plan.id] = null;
          }
        }
        setReactions(reactionsData);
        setUserReactions(userReactionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.email]);

  // Handle URL parameters for course and comment navigation
  useEffect(() => {
    if (highlightCourseId && !loading && sharedPlans.length > 0) {
      const scrollToCourse = () => {
        const courseElement = document.querySelector(`[data-course-id="${highlightCourseId}"]`);
        if (courseElement) {
          const headerOffset = 80;
          const elementPosition = courseElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          courseElement.classList.add('highlight-course');
          setTimeout(() => {
            courseElement.classList.remove('highlight-course');
          }, 2000);
        }
      };

      scrollToCourse();
      setTimeout(scrollToCourse, 100);
      setTimeout(scrollToCourse, 500);
    }
  }, [highlightCourseId, sharedPlans, loading]);

  const handleStartLearning = async (planId) => {
    try {
      if (!user?.email) {
        setErrors(prev => ({ ...prev, [planId]: 'Please log in to start learning' }));
        return;
      }

      // Start the learning plan for the user - this creates a new plan for the user
      const progress = await learningPlanService.startLearningPlan(user.email, planId);
      
      // Update user progress
      setUserProgress(prev => ({
        ...prev,
        [planId]: progress
      }));

      // Update the shared plan's enrolled users count in the UI
      setSharedPlans(prev => prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              enrolledUsers: [...(plan.enrolledUsers || []), user.email]
            }
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

  const handleUpdateTopicProgress = async (planId, topicIndex, completed) => {
    try {
      if (!user?.email) {
        setErrors(prev => ({ ...prev, [planId]: 'Please log in to update progress' }));
        return;
      }

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

      setUserProgress(prev => ({
        ...prev,
        [planId]: updatedProgress
      }));

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

      const updatedComments = await getCommentsByPostId(planId);
      setComments(prev => ({
        ...prev,
        [planId]: updatedComments
      }));

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

      const planWithComment = sharedPlans.find(plan => {
        const planComments = comments[plan.id] || [];
        return planComments.some(comment =>
          comment.id === commentId ||
          (comment.replies && comment.replies.some(reply => reply.id === commentId))
        );
      });

      if (planWithComment) {
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

  const handleReaction = async (planId, reactionType) => {
    try {
      setReactionError(null);
      const currentReaction = userReactions[planId];
      const plan = sharedPlans.find(p => p.id === planId);

      if (!plan) {
        throw new Error('Course not found');
      }

      if (!user || !user.token) {
        setReactionError('Please log in to react to courses');
        return;
      }

      // If clicking the same reaction type that's already active, remove it
      if (currentReaction === reactionType) {
        await reactionService.removeReaction('COURSE', planId, user.email, `${user.firstName} ${user.lastName}`);
        setUserReactions(prev => ({
          ...prev,
          [planId]: null
        }));
        // Update reaction counts after removal
        const updatedCounts = await reactionService.getReactionCounts('COURSE', planId);
        setReactions(prev => ({
          ...prev,
          [planId]: updatedCounts
        }));
        return;
      }

      // If user has a different reaction, remove it first
      if (currentReaction) {
        await reactionService.removeReaction('COURSE', planId, user.email, `${user.firstName} ${user.lastName}`);
      }

      // Add the new reaction
      await reactionService.addReaction('COURSE', planId, user.email, reactionType, `${user.firstName} ${user.lastName}`);
      setUserReactions(prev => ({
        ...prev,
        [planId]: reactionType
      }));

      // Update reaction counts after adding new reaction
      const updatedCounts = await reactionService.getReactionCounts('COURSE', planId);
      setReactions(prev => ({
        ...prev,
        [planId]: updatedCounts
      }));
    } catch (error) {
      console.error('Error handling reaction:', error);
      if (error.message === 'Authentication required') {
        setReactionError('Please log in to react to courses');
      } else {
        setReactionError('Failed to update reaction. Please try again.');
      }
    }
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
        <div className="no-courses">
          <p>No shared courses available yet.</p>
          <p className="sub-text">Courses will appear here when they are shared with you or when you share your own courses.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {sharedPlans.map((plan) => (
            <div
              key={plan.id}
              className="course-card"
              data-course-id={plan.id}
            >
              <div className="course-image">
                <img 
                  src={plan.imageUrl || '/images/default-plan.jpg'} 
                  alt={plan.title}
                  onError={(e) => {
                    e.target.src = '/images/default-plan.jpg';
                  }}
                />
              </div>
              <div className="course-header">
                <h3>{plan.title}</h3>
                <span className="course-creator">
                  Created by: {plan.userEmail === user?.email ? 'You' : plan.userEmail}
                </span>
              </div>

              <div className="course-content">
                <p className="course-description">{plan.description}</p>
                <div className="course-meta">
                  <div className="course-stats">
                    <span className="stat-item">
                      <i className="fas fa-book"></i>
                      {plan.topics?.length || 0} Topics
                    </span>
                    <span className="stat-item">
                      <i className="fas fa-users"></i>
                      {plan.enrolledUsers?.length || 0} Learners
                    </span>
                    <span className="stat-item">
                      <i className="fas fa-calendar"></i>
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="course-status">
                    Status: {userProgress[plan.id]?.status || plan.status}
                  </div>
                  <div className="course-progress">
                    Progress: {calculateProgress(userProgress[plan.id] || plan)}%
                  </div>
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

                <ReactionSection
                  contentId={plan.id}
                  contentType="COURSE"
                  reactions={reactions}
                  userReactions={userReactions}
                  onReaction={handleReaction}
                  error={reactionError}
                />

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