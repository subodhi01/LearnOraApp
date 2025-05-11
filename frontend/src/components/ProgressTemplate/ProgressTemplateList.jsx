import React from 'react';
import './ProgressTemplate.css';
import './ProgressTemplatelist.css';

const ProgressTemplateList = ({ templates, onEdit, onDelete }) => {
  if (!templates || templates.length === 0) {
    return (
      <div className="progress-template-empty">
        <p>No progress templates found. Create one to start tracking your learning journey!</p>
      </div>
    );
  }

  return (
    <div className="progress-template-list">
      {templates.map((template) => (
        <div key={template.id} className="template-card-wrapper">
          <div className="progress-template-card">
            <div className="template-header">
              <div className="template-title">
                <h4>{template.learningPlanName || 'Untitled Template'}</h4>
                <span className="template-subtitle">Course: {template.courseName || 'Unknown Course'}</span>
              </div>
              <div className="template-actions">
                <button onClick={() => onEdit(template)}>Edit</button>
                <button onClick={() => onDelete(template.id)}>Delete</button>
              </div>
            </div>

            <div className="template-content">
              {template.topics && template.topics.length > 0 && (
                <div className="template-section">
                  <h5>Course Progress</h5>
                  <div className="progress-items">
                    {template.topics.map((topic) => (
                      <div key={topic.topicId} className="progress-item">
                        <div className="progress-item-header">
                          <h6>{topic.topicName}</h6>
                          <div className="progress-info">
                            <span className="percentage-label">
                              {topic.percentage?.toFixed(1)}%
                            </span>
                            {topic.currentProgress > 0 && (
                              <span className="tracking-indicator">●</span>
                            )}
                          </div>
                        </div>

                        {/* Learning Targets under this topic */}
                        {template.customItems && template.customItems
                          .filter(item => item.topicId === topic.topicId)
                          .map((item, index) => (
                            <div key={index} className="learning-target-item">
                              <div className="target-header">
                                <span>{item.name}</span>
                                <div className="progress-info">
                                  <span className="percentage-label">
                                    {item.percentage?.toFixed(1)}%
                                  </span>
                                  {item.currentProgress > 0 && (
                                    <span className="tracking-indicator">●</span>
                                  )}
                                </div>
                              </div>
                              <div className="target-date">
                                Finish by: {new Date(item.finishDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="template-footer">
              <div className="total-progress">
                <span>Total Progress: {template.totalProgress?.toFixed(1)}%</span>
              </div>
              <span className="template-date">
                Last updated: {new Date(template.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressTemplateList;
