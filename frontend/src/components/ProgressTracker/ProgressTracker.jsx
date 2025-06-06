import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import progressTemplateService from '../../services/progressTemplateService';
import './ProgressTracker.css';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [inProgressTemplates, setInProgressTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [localProgress, setLocalProgress] = useState({});

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
          topic.currentProgress > 0 && topic.currentProgress < (topic.percentage || 100)
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

  const handleUpdateClick = (template) => {
    setSelectedTemplate(template);
    // Initialize local progress state with current values
    const initialProgress = {};
    template.customItems?.forEach(item => {
      initialProgress[item.name] = item.currentProgress || 0;
    });
    console.log('Initial localProgress:', initialProgress);
    setLocalProgress(initialProgress);
    setShowUpdateForm(true);
  };

  const handleDelete = async (templateId) => {
    try {
      await progressTemplateService.deleteTemplate(templateId);
      setInProgressTemplates(prev => prev.filter(t => t.id !== templateId));
      console.log(`Deleted template with id: ${templateId}`);
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
    }
  };

  const isTargetExpired = (finishDate) => {
    const today = new Date();
    const targetDate = new Date(finishDate);
    return today > targetDate;
  };

  const calculateTopicProgress = (topicId, template) => {
    const topic = template.topics?.find(t => t.topicId === topicId);
    if (!topic) {
      console.warn(`Topic with topicId ${topicId} not found`);
      return 0;
    }

    const topicTargets = template.customItems?.filter(item => item.topicId === topicId) || [];
    console.log(`Topic ${topicId} targets:`, topicTargets);
    if (topicTargets.length === 0) return 0;

    // Calculate progress as a fraction of the topic's assigned percentage
    const totalWeightedProgress = topicTargets.reduce((sum, target) => {
      const targetProgress = localProgress[target.name] !== undefined ? localProgress[target.name] : (target.currentProgress || 0);
      const targetPercentage = target.percentage || 0;
      // Scale target progress (0-100) to its contribution to the topic's percentage
      return sum + (targetProgress / 100) * targetPercentage;
    }, 0);

    // Return progress as a percentage of topic.percentage
    return Math.min(totalWeightedProgress, topic.percentage || 100).toFixed(1);
  };

  const calculateTotalProgress = (template) => {
    const topics = template.topics || [];
    if (topics.length === 0) return 0;

    const totalProgress = topics.reduce((sum, topic) => {
      const topicProgress = parseFloat(calculateTopicProgress(topic.topicId, template)) || 0;
      return sum + topicProgress;
    }, 0);

    console.log('Total progress for template:', totalProgress);
    return totalProgress.toFixed(1);
  };

  const handleTargetChange = (templateId, topicId, targetName, isCompleted) => {
    setLocalProgress(prev => {
      const newProgress = {
        ...prev,
        [targetName]: isCompleted ? 100 : 0
      };
      console.log('Updated localProgress:', newProgress);
      return newProgress;
    });
  };

  const updateTargetProgress = async () => {
    try {
      if (!selectedTemplate) return;

      // Calculate new progress for each topic based on its targets
      const updatedTopics = selectedTemplate.topics.map(topic => {
        const topicProgress = parseFloat(calculateTopicProgress(topic.topicId, selectedTemplate)) || 0;
        return {
          ...topic,
          currentProgress: topicProgress
        };
      });

      // Update custom items with new progress values
      const updatedCustomItems = selectedTemplate.customItems.map(item => ({
        ...item,
        currentProgress: localProgress[item.name] !== undefined ? localProgress[item.name] : (item.currentProgress || 0)
      }));

      // Create the updated template
      const updatedTemplate = {
        ...selectedTemplate,
        topics: updatedTopics,
        customItems: updatedCustomItems
      };

      console.log('Updating template with:', updatedTemplate);
      const response = await progressTemplateService.updateTemplate(selectedTemplate.id, updatedTemplate);

      // Update the local state with the response from the server
      setInProgressTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? response : t)
      );

      handleCloseForm();
    } catch (error) {
      console.error('Error updating target progress:', error);
      setError('Failed to update target progress');
    }
  };

  const handleCloseForm = () => {
    setShowUpdateForm(false);
    setSelectedTemplate(null);
    setLocalProgress({});
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
          {inProgressTemplates.map((template) => {
            const totalProgress = parseFloat(calculateTotalProgress(template));
            const isCompleted = totalProgress >= 100;
            return (
              <div 
                key={template.id} 
                className={`progress-tracker-card ${isCompleted ? 'completed-card' : ''}`}
              >
                <div className="tracker-card-header">
                  <h3>
                    {template.courseName || 'Untitled Template'}
                    {isCompleted && <span className="golden-badge"></span>}
                  </h3>
                  <span className="course-name">{template.learningPlanName}</span>
                </div>

                <div className="tracker-card-content">
                  {isCompleted && (
                    <div className="completion-message">
                      Congratulations! You've successfully completed your course by mastering all targets!
                    </div>
                  )}
                  {template.topics?.map((topic) => {
                    const topicProgress = calculateTopicProgress(topic.topicId, template);
                    console.log(`Topic ${topic.topicId} progress:`, topicProgress); // Debug log
                    return (
                      <div key={topic.topicId} className="topic-progress">
                        <div className="topic-header">
                          <h4>{topic.topicName}</h4>
                          <span className="progress-percentage">
                            {topicProgress}% / {topic.percentage?.toFixed(1) || '100'}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${(topicProgress / 100) * 100}%`, // Simplified to use topicProgress directly
                              backgroundColor: topicProgress > 0 ? '#4CAF50' : '#e2e8f0'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="tracker-card-footer">
                  <div className="total-progress">
                    <span>Total Progress:</span>
                    <span className="total-percentage">
                      {totalProgress.toFixed(1)}% / 100%
                    </span>
                  </div>
                  <div className="last-updated">
                    Last updated: {new Date(template.updatedAt || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="card-actions">
                    {!isCompleted && (
                      <button 
                        className="update-progress-btn"
                        onClick={() => handleUpdateClick(template)}
                      >
                        Update Progress
                      </button>
                    )}
                    {isCompleted && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(template.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUpdateForm && selectedTemplate && (
        <div className="update-progress-modal">
          <div className="update-progress-content">
            <div className="modal-header">
              <h3>Update Progress: {selectedTemplate.courseName}</h3>
              <button className="close-btn" onClick={handleCloseForm}>×</button>
            </div>
            <div className="modal-body">
              {selectedTemplate.topics?.map((topic) => {
                const topicTargets = selectedTemplate.customItems?.filter(item => item.topicId === topic.topicId) || [];
                console.log(`Rendering targets for topic ${topic.topicId}:`, topicTargets);
                return (
                  <div key={topic.topicId} className="topic-update-section">
                    <div className="topic-header">
                      <h4>{topic.topicName}</h4>
                      <span className="progress-percentage">
                        {calculateTopicProgress(topic.topicId, selectedTemplate)}%
                      </span>
                    </div>
                    <div className="learning-targets">
                      {topicTargets.length === 0 ? (
                        <p>No learning targets found for this topic.</p>
                      ) : (
                        topicTargets.map((target, index) => {
                          const isExpired = isTargetExpired(target.finishDate);
                          const currentProgress = localProgress[target.name] ?? (target.currentProgress || 0);
                          return (
                            <div key={`${target.name}-${index}`} className="learning-target-item">
                              <label className="target-checkbox">
                                <input
                                  type="checkbox"
                                  checked={currentProgress === 100}
                                  onChange={(e) => handleTargetChange(
                                    selectedTemplate.id,
                                    topic.topicId,
                                    target.name,
                                    e.target.checked
                                  )}
                                  disabled={isExpired}
                                />
                                <div className="target-details">
                                  <span className="target-name">{target.name}</span>
                                  <span className="target-percentage">
                                    {target.percentage?.toFixed(1)}% of topic
                                  </span>
                                </div>
                              </label>
                              <div className="target-info">
                                <span className="target-date">
                                  Finish by: {new Date(target.finishDate).toLocaleDateString()}
                                </span>
                                {isExpired && (
                                  <span className="expired-warning">
                                    Target date has passed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <div className="modal-total-progress">
                Total Progress: {calculateTotalProgress(selectedTemplate)}%
              </div>
              <div className="modal-actions">
                <button className="save-progress-btn" onClick={updateTargetProgress}>
                  Save Progress
                </button>
                <button className="close-modal-btn" onClick={handleCloseForm}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;