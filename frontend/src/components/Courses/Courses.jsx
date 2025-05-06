import React, { useState, useEffect } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';
import { createComment, getCommentsByPostId } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';

const Courses = () => {
  const [sharedPlans, setSharedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
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

  const handleCommentSubmit = async (planId) => {
    if (!user) return;

    if (!newComment[planId]?.trim()) {
      setErrors(prev => ({ ...prev, [planId]: 'Comment cannot be empty' }));
      return;
    }

    try {
      const commentData = {
        postId: planId,
        userId: user._id,
        username: `${user.firstName} ${user.lastName}`,
        text: newComment[planId],
      };
      const savedComment = await createComment(commentData);
      setComments(prev => ({
        ...prev,
        [planId]: [...(prev[planId] || []), savedComment],
      }));
      setNewComment(prev => ({ ...prev, [planId]: '' }));
      setErrors(prev => ({ ...prev, [planId]: '' }));
    } catch (error) {
      console.error('Error creating comment:', error);
      setErrors(prev => ({ ...prev, [planId]: error.message || 'Failed to post comment' }));
    }
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
                      <div key={comment.id} className="comment">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet. Be the first to comment!</p>
                  )}

                  {user ? (
                    <div className="comment-form">
                      <textarea
                        placeholder="Add a comment..."
                        value={newComment[plan.id] || ''}
                        onChange={(e) =>
                          setNewComment(prev => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        className="comment-input"
                      />
                      <button
                        onClick={() => handleCommentSubmit(plan.id)}
                        className="submit-comment-button"
                      >
                        Post Comment
                      </button>
                      {errors[plan.id] && (
                        <span className="error-message">{errors[plan.id]}</span>
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