import React from 'react';
import './LearningPlan.css';

const LearningPlanList = ({ 
  plans, 
  onSelectPlan, 
  onEditPlan, 
  onDeletePlan, 
  onSharePlan 
}) => {
  return (
    <div className="learning-plan-list">
      {plans.length === 0 ? (
        <p className="no-plans">No learning plans created yet.</p>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
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
                  <button 
                    className="action-btn share"
                    onClick={() => onSharePlan(plan.id)}
                  >
                    Share
                  </button>
                </div>
              </div>
              
              <div className="plan-content" onClick={() => onSelectPlan(plan)}>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-meta">
                  <span className="plan-topics">
                    {plan.topics?.length || 0} Topics
                  </span>
                  <span className="plan-progress">
                    Progress: {plan.progress || 0}%
                  </span>
                </div>
                <div className="plan-timeline">
                  <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPlanList; 