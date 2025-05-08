import React, { useState } from 'react';
import './LearningPlan.css';

const calculateProgress = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  const completedTopics = plan.topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

const LearningPlanList = ({ 
  plans, 
  onSelectPlan, 
  onEditPlan, 
  onDeletePlan, 
  onSharePlan,
  selectedPlanId,
  onUpdatePlanProgress
}) => {
  // Track enrollment and topic completion per plan (local state for demo)
  const [enrolledPlans, setEnrolledPlans] = useState({}); // { [planId]: true/false }
  const [topicCompletion, setTopicCompletion] = useState({}); // { [planId]: [bool, ...] }

  const handleEnroll = (planId, topics) => {
    setEnrolledPlans(prev => ({ ...prev, [planId]: true }));
    setTopicCompletion(prev => ({ ...prev, [planId]: topics.map(t => !!t.completed) }));
  };

  const handleToggleTopic = (planId, topicIdx) => {
    setTopicCompletion(prev => {
      const updated = [...(prev[planId] || [])];
      updated[topicIdx] = !updated[topicIdx];
      // Find the plan and update topics
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        const updatedTopics = plan.topics.map((t, i) => ({ ...t, completed: updated[i] }));
        // Calculate new progress
        const completed = updated.filter(Boolean).length;
        const progress = Math.round((completed / updatedTopics.length) * 100);
        // Set status to Finished if 100%
        const newStatus = progress === 100 ? 'Finished' : plan.status === 'Finished' ? 'In Progress' : plan.status;
        const updatedPlan = { ...plan, topics: updatedTopics, status: newStatus };
        if (onUpdatePlanProgress) onUpdatePlanProgress(updatedPlan);
      }
      return { ...prev, [planId]: updated };
    });
  };

  const calculateProgressLocal = (plan) => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    if (!enrolledPlans[plan.id]) return calculateProgress(plan);
    const completed = (topicCompletion[plan.id] || []).filter(Boolean).length;
    return Math.round((completed / plan.topics.length) * 100);
  };

  return (
    <div className="learning-plan-list">
      {plans.length === 0 ? (
        <p className="no-plans">No learning plans created yet.</p>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id}>
              <div className="plan-card">
                <div className="plan-image">
                  {plan.imageUrl && plan.imageUrl.startsWith('data:image') ? (
                    <img 
                      src={plan.imageUrl}
                      alt={plan.title}
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
                      }}
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                      alt={plan.title}
                    />
                  )}
                  <div className="plan-overlay">
                    <span className="plan-duration">
                      {Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24 * 7))} Weeks
                    </span>
                    <span className="plan-level">
                      {plan.topics?.length > 10 ? 'Advanced' : plan.topics?.length > 5 ? 'Intermediate' : 'Beginner'}
                    </span>
                  </div>
                </div>
                <div className="plan-header">
                  <h3>{plan.title}</h3>
                  <div className="plan-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => onEditPlan(plan)}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => onDeletePlan(plan.id)}
                    >
                      Delete
                    </button>
                    {plan.shared && (
                      <span className="share-indicator" title="Shared Plan">
                        ✓
                      </span>
                    )}
                  </div>
                  {plan.status === 'Finished' && (
                    <span style={{ color: '#388e3c', fontWeight: 700, marginLeft: 12, fontSize: 15, background: '#e8f5e9', borderRadius: 8, padding: '2px 10px' }}>Finished ✓</span>
                  )}
                </div>
                
                <div className="plan-content" onClick={() => onSelectPlan(plan)}>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-meta">
                    <div className="plan-stats">
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
                    <div className="plan-progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${calculateProgress(plan)}%` }}
                        />
                      </div>
                      <span className="progress-text">{calculateProgress(plan)}% Complete</span>
                    </div>
                  </div>
                  <div className="plan-topics">
                    {plan.topics?.slice(0, 4).map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic.title}
                      </span>
                    ))}
                    {plan.topics?.length > 4 && (
                      <span className="topic-tag more">+{plan.topics.length - 4} more</span>
                    )}
                  </div>
                  <button className="view-plan-btn" onClick={() => onSelectPlan(plan)}>
                    View Plan
                  </button>
                </div>
              </div>

              {selectedPlanId === plan.id && (
                <div className="expanded-plan">
                  <div className="expanded-header">
                    <h3>{plan.title}</h3>
                    {enrolledPlans[plan.id] && calculateProgressLocal(plan) === 100 && (
                      <span style={{ color: '#388e3c', fontWeight: 700, marginLeft: 16, fontSize: 18, background: '#e8f5e9', borderRadius: 8, padding: '4px 12px' }}>Finished ✓</span>
                    )}
                    <button 
                      className="action-btn delete"
                      onClick={() => onSelectPlan(null)}
                    >
                      Close
                    </button>
                  </div>

                  {/* Enroll button or Enrolled status */}
                  {!enrolledPlans[plan.id] ? (
                    <button
                      className="create-plan-btn"
                      style={{ marginBottom: 16 }}
                      onClick={() => handleEnroll(plan.id, plan.topics || [])}
                    >
                      Enroll
                    </button>
                  ) : (
                    <div style={{ marginBottom: 16, color: '#4CAF50', fontWeight: 600 }}>
                      Enrolled ✓
                    </div>
                  )}

                  <div className="expanded-content">
                    <div className="expanded-main">
                      <div className="expanded-description">
                        <h4>Description</h4>
                        <p>{plan.description}</p>
                      </div>

                      <div className="expanded-topics">
                        <h4>Topics</h4>
                        <div className="topic-list">
                          {plan.topics?.map((topic, index) => (
                            <div 
                              key={index} 
                              className={`topic-item ${(enrolledPlans[plan.id] ? topicCompletion[plan.id]?.[index] : topic.completed) ? 'completed' : ''}`}
                            >
                              <div className="topic-header">
                                <span className="topic-title">{topic.title}</span>
                                {enrolledPlans[plan.id] ? (
                                  <span className="topic-status" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                      type="checkbox"
                                      checked={!!topicCompletion[plan.id]?.[index]}
                                      onChange={() => handleToggleTopic(plan.id, index)}
                                      style={{ marginRight: 6 }}
                                    />
                                    {topicCompletion[plan.id]?.[index] ? 'Completed' : 'In Progress'}
                                  </span>
                                ) : (
                                  <span className="topic-status">
                                    {topic.completed ? 'Completed' : 'In Progress'}
                                  </span>
                                )}
                              </div>
                              {topic.resources && (
                                <div className="topic-resources">
                                  {topic.resources}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="expanded-sidebar">
                      <div className="expanded-progress">
                        <h4>Progress Overview</h4>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${calculateProgressLocal(plan)}%` }}
                          />
                        </div>
                        <div className="progress-stats">
                          <span>{calculateProgressLocal(plan)}% Complete</span>
                          <span>{plan.topics?.length || 0} Total Topics</span>
                        </div>
                      </div>

                      <div className="expanded-timeline">
                        <h4>Timeline</h4>
                        <div className="timeline-info">
                          <div className="timeline-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Start Date: {new Date(plan.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="timeline-item">
                            <i className="fas fa-calendar-check"></i>
                            <span>End Date: {new Date(plan.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="timeline-item">
                            <i className="fas fa-clock"></i>
                            <span>Status: {plan.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPlanList;
