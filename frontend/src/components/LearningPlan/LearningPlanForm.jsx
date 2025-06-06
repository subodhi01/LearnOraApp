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
    topics: [{ title: '', resources: '', completed: false }],
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        startDate: new Date(plan.startDate).toISOString().split('T')[0],
        endDate: new Date(plan.endDate).toISOString().split('T')[0],
        shared: plan.shared || false,
        imageUrl: plan.imageUrl || ''
      });
      if (plan.imageUrl) {
        setImagePreview(plan.imageUrl);
      }
    }
  }, [plan]);

  const validateDates = (startDate, endDate) => {
    const errors = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      errors.startDate = 'Start date cannot be in the past';
    }
    if (end < start) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Form field changed:', name, type === 'checkbox' ? checked : value);
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Validate dates when either date changes
    if (name === 'startDate' || name === 'endDate') {
      const dateErrors = validateDates(
        name === 'startDate' ? value : formData.startDate,
        name === 'endDate' ? value : formData.endDate
      );
      setErrors(prev => ({ ...prev, ...dateErrors }));
    }

    setFormData(newFormData);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please upload an image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Update form data with the base64 image
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form data
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Log the form data being submitted
      console.log('Submitting form data:', {
        ...formData,
        imageUrl: formData.imageUrl ? 'Image data present' : 'No image'
      });

      if (plan) {
        await onSubmit(formData);
      } else {
        await onSubmit(formData);
      }
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save learning plan'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    // Implement form validation logic here
    return {};
  };

  return (
    <div className="learning-plan-form">
      <h3>{plan ? 'Edit Learning Plan' : 'Create Learning Plan'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group image-upload">
          <label htmlFor="image">Cover Image</label>
          <div className="image-upload-container">
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, imageUrl: '' }));
                  }}
                >
                  ×
                </button>
              </div>
            )}
            <div className="upload-input">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              <label htmlFor="image" className="upload-label">
                {isUploading ? (
                  <span>Uploading...</span>
                ) : imagePreview ? (
                  <span>Change Image</span>
                ) : (
                  <span>Choose Image</span>
                )}
              </label>
            </div>
            {errors.image && (
              <span className="error-message">{errors.image}</span>
            )}
          </div>
        </div>

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
            {errors.startDate && (
              <span className="error-message">{errors.startDate}</span>
            )}
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
            {errors.endDate && (
              <span className="error-message">{errors.endDate}</span>
            )}
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
                {errors[`topic-${index}`] && (
                  <span className="error-message">{errors[`topic-${index}`]}</span>
                )}
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
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
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