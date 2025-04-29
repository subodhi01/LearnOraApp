import React, { useState, useEffect } from 'react';
import './LearningPlan.css';

const LearningPlanForm = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    shared: false,
    topics: [{ title: '', resources: '', completed: false }]
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        startDate: new Date(plan.startDate).toISOString().split('T')[0],
        endDate: new Date(plan.endDate).toISOString().split('T')[0],
        shared: plan.shared || false
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Form field changed:', name, type === 'checkbox' ? checked : value);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTopicChange = (index, field, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      topics: newTopics
    }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { title: '', resources: '', completed: false }]
    }));
  };

  const removeTopic = (index) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form with sharing status:', formData.shared);
    onSubmit(formData);
  };

  return (
    <div className="learning-plan-form">
      <h3>{plan ? 'Edit Learning Plan' : 'Create Learning Plan'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="shared"
              checked={formData.shared}
              onChange={handleChange}
            />
            Share this plan
          </label>
        </div>

        <div className="form-group date-group">
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="topics-section">
          <h4>Topics</h4>
          {formData.topics.map((topic, index) => (
            <div key={index} className="topic-item">
              <div className="form-group">
                <label htmlFor={`topic-title-${index}`}>Topic Title</label>
                <input
                  type="text"
                  id={`topic-title-${index}`}
                  value={topic.title}
                  onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`topic-resources-${index}`}>Resources</label>
                <textarea
                  id={`topic-resources-${index}`}
                  value={topic.resources}
                  onChange={(e) => handleTopicChange(index, 'resources', e.target.value)}
                  placeholder="Add resources, links, or notes for this topic"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={(e) => handleTopicChange(index, 'completed', e.target.checked)}
                  />
                  Completed
                </label>
              </div>

              <button
                type="button"
                className="remove-topic-btn"
                onClick={() => removeTopic(index)}
              >
                Remove Topic
              </button>
            </div>
          ))}

          <button
            type="button"
            className="add-topic-btn"
            onClick={addTopic}
          >
            Add Topic
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {plan ? 'Update Plan' : 'Create Plan'}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearningPlanForm; 