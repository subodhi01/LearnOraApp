import React, { useState } from 'react';
import './LearningPlan.css';

const calculateProgress = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  const completedTopics = plan.topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

const LearningPlanList = ({ 
  plans, 
  onEditPlan, 
  onDeletePlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  const renderPlanModal = () => {
    if (!selectedPlan) return null;

    return (
      <div className="plan-modal-overlay" onClick={handleCloseModal}>
        <div className="plan-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedPlan.title}</h2>
            <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
          </div>
          
          <div className="modal-content">
            <div className="modal-image">
              <img 
                src={selectedPlan.imageUrl || '/images/default-plan.jpg'} 
                alt={selectedPlan.title}
                onError={(e) => {
                  e.target.src = '/images/default-plan.jpg';
                }}
              />
            </div>

            <div className="modal-details">
              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedPlan.description}</p>
              </div>

              <div className="detail-section">
                <h3>Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgress(selectedPlan)}%` }}
                    />
                  </div>
                  <span className="progress-text">{calculateProgress(selectedPlan)}% Complete</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timeline</h3>
                <div className="timeline-info">
                  <div className="timeline-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Start Date: {new Date(selectedPlan.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="timeline-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>End Date: {new Date(selectedPlan.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="timeline-item">
                    <i className="fas fa-clock"></i>
                    <span>Status: {selectedPlan.status}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Topics</h3>
                <div className="topics-list">
                  {selectedPlan.topics?.map((topic, index) => (
                    <div key={index} className="topic-item">
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
          </div>

          <div className="modal-footer">
            <button 
              className="action-btn edit"
              onClick={() => {
                onEditPlan(selectedPlan);
                handleCloseModal();
              }}
            >
              Edit Plan
            </button>
            <button 
              className="action-btn delete"
              onClick={() => {
                onDeletePlan(selectedPlan.id);
                handleCloseModal();
              }}
            >
              Delete Plan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanCard = (plan) => {
    const handleImageError = (e) => {
      console.error('Error loading image:', plan.imageUrl);
      e.target.src = '/images/default-plan.jpg';
    };

    return (
      <div key={plan.id} className="plan-card">
        <div className="plan-image">
          <img 
            src={plan.imageUrl || '/images/default-plan.jpg'} 
            alt={plan.title}
            onError={handleImageError}
          />
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
        
        <div className="plan-content">
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
          <button 
            className="view-plan-btn" 
            onClick={() => handleViewPlan(plan)}
          >
            View Plan
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="learning-plan-list">
      {plans.length === 0 ? (
        <p className="no-plans">No learning plans created yet.</p>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id}>
              {renderPlanCard(plan)}
            </div>
          ))}
        </div>
      )}
      {showModal && renderPlanModal()}
    </div>
  );
};

export default LearningPlanList;
