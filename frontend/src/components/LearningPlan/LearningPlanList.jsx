import React from 'react';
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
  selectedPlanId 
}) => {
  return (
    <div className="learning-plan-list">
      {plans.length === 0 ? (
        <p className="no-plans">No learning plans created yet.</p>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id}>
              <div className="plan-card">
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
                </div>
                
                <div className="plan-content" onClick={() => onSelectPlan(plan)}>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-meta">
                    <span className="plan-topics">
                      {plan.topics?.length || 0} Topics
                    </span>
                    <span className="plan-status">
                      Status: {plan.status}
                    </span>
                    <span className="plan-progress">
                      Progress: {calculateProgress(plan)}%
                    </span>
                  </div>
                  <div className="plan-timeline">
                    <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                    <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedPlanId === plan.id && (
                <div className="expanded-plan">
                  <div className="expanded-header">
                    <h3>{plan.title}</h3>
                    <button 
                      className="action-btn delete"
                      onClick={() => onSelectPlan(null)}
                    >
                      Close
                    </button>
                  </div>

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
                              className={`topic-item ${topic.completed ? 'completed' : ''}`}
                            >
                              <div className="topic-header">
                                <span className="topic-title">{topic.title}</span>
                                <span className="topic-status">
                                  {topic.completed ? 'Completed' : 'In Progress'}
                                </span>
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
                            style={{ width: `${calculateProgress(plan)}%` }}
                          />
                        </div>
                        <div className="progress-stats">
                          <span>{calculateProgress(plan)}% Complete</span>
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
