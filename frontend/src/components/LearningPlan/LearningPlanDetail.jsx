import React from 'react';
import './LearningPlan.css';

const LearningPlanDetail = ({ plan, onClose }) => {
  const calculateProgress = () => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    const completedTopics = plan.topics.filter(topic => topic.completed).length;
    return Math.round((completedTopics / plan.topics.length) * 100);
  };

  return (
    <div className="learning-plan-detail">
      <div className="detail-header">
        <h3>{plan.title}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="detail-content">
        <div className="detail-description">
          <h4>Description</h4>
          <p>{plan.description}</p>
        </div>

        <div className="detail-timeline">
          <h4>Timeline</h4>
          <div className="timeline-info">
            <span>Start Date: {new Date(plan.startDate).toLocaleDateString()}</span>
            <span>End Date: {new Date(plan.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="detail-progress">
          <h4>Progress</h4>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <span className="progress-text">{calculateProgress()}% Complete</span>
        </div>

        <div className="detail-topics">
          <h4>Topics</h4>
          {plan.topics.map((topic, index) => (
            <div 
              key={index} 
              className={`topic-item ${topic.completed ? 'completed' : ''}`}
            >
              <div className="topic-header">
                <h5>{topic.title}</h5>
                <span className="topic-status">
                  {topic.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="topic-resources">
                <h6>Resources</h6>
                <p>{topic.resources || 'No resources added'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPlanDetail; 