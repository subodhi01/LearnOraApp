import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import progressTemplateService from '../../services/progressTemplateService';
import './ProgressTracker.css';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [inProgressTemplates, setInProgressTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchInProgressTemplates();
    }
  }, [user?.email]);

  const fetchInProgressTemplates = async () => {
    try {
      setLoading(true);
      const allTemplates = await progressTemplateService.getTemplates();
      console.log('All templates:', allTemplates);

      // Filter templates that have at least one topic or custom item with progress > 0 but < 100
      const inProgress = allTemplates.filter(template => {
        const hasInProgressTopics = template.topics?.some(topic => 
          topic.currentProgress > 0 && topic.currentProgress < 100
        );
        const hasInProgressTargets = template.customItems?.some(item => 
          item.currentProgress > 0 && item.currentProgress < 100
        );
        return hasInProgressTopics || hasInProgressTargets;
      });

      console.log('Filtered in-progress templates:', inProgress);
      setInProgressTemplates(inProgress);
      setError('');
    } catch (err) {
      console.error('Error fetching in-progress templates:', err);
      setError('Failed to fetch in-progress templates');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (templateId, topicId, progress) => {
    try {
      const template = inProgressTemplates.find(t => t.id === templateId);
      if (!template) return;

      const updatedTemplate = {
        ...template,
        topics: template.topics.map(topic => 
          topic.topicId === topicId 
            ? { ...topic, currentProgress: progress }
            : topic
        ),
        customItems: template.customItems.map(item =>
          item.topicId === topicId
            ? { ...item, currentProgress: progress }
            : item
        )
      };

      console.log('Updating template with:', updatedTemplate);
      await progressTemplateService.updateTemplate(templateId, updatedTemplate);
      
      // Refresh the templates list
      await fetchInProgressTemplates();
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress');
    }
  };

  if (loading) {
    return <div className="progress-tracker-loading">Loading...</div>;
  }

  return (
    <div className="progress-tracker-container">
      <div className="progress-tracker-header">
        <h2>In-Progress Courses</h2>
        <p>Track your ongoing learning progress</p>
      </div>

      {error && (
        <div className="progress-tracker-error">
          {error}
        </div>
      )}

      {inProgressTemplates.length === 0 ? (
        <div className="progress-tracker-empty">
          <p>No in-progress courses found. Start tracking your progress in the Progress Templates section!</p>
        </div>
      ) : (
        <div className="progress-tracker-grid">
          {inProgressTemplates.map((template) => (
            <div key={template.id} className="progress-tracker-card">
              <div className="tracker-card-header">
                <h3>{template.courseName || 'Untitled Template'}</h3>
                <span className="course-name">{template.learningPlanName}</span>
              </div>

              <div className="tracker-card-content">
                {template.topics?.map((topic) => (
                  <div key={topic.topicId} className="topic-progress">
                    <div className="topic-header">
                      <h4>{topic.topicName}</h4>
                      <span className="progress-percentage">{topic.currentProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${topic.currentProgress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={topic.currentProgress}
                      onChange={(e) => updateProgress(template.id, topic.topicId, parseInt(e.target.value))}
                      className="progress-slider"
                    />
                  </div>
                ))}
              </div>

              <div className="tracker-card-footer">
                <div className="total-progress">
                  <span>Total Progress:</span>
                  <span className="total-percentage">
                    {template.topics?.reduce((acc, topic) => acc + (topic.currentProgress || 0), 0) / 
                    (template.topics?.length || 1)}%
                  </span>
                </div>
                <div className="last-updated">
                  Last updated: {new Date(template.updatedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker; 