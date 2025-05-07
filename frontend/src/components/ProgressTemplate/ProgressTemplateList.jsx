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
              <h4>{template.learningPlanName}</h4>
              <div className="template-actions">
                <button onClick={() => onEdit(template)}>Edit</button>
                <button onClick={() => onDelete(template.id)}>Delete</button>
              </div>
            </div>

            <div className="template-content">
              <div className="template-section">
                <h5>Course Topics</h5>
                <div className="progress-items">
                  {template.topics.map((topic) => (
                    <div key={topic.topicId} className="progress-item">
                      <span>{topic.topicName}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${topic.currentProgress}%` }}
                        />
                        <span className="progress-text">{topic.currentProgress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {template.customItems && template.customItems.length > 0 && (
                <div className="template-section">
                  <h5>Custom Learning Targets</h5>
                  <div className="progress-items">
                    {template.customItems.map((item, index) => (
                      <div key={index} className="progress-item">
                        <span>{item.name}</span>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${item.currentProgress}%` }}
                          />
                          <span className="progress-text">{item.currentProgress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="template-footer">
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