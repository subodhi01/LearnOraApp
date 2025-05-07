import React, { useState, useEffect } from 'react';
import axios from 'axios';
import learningPlanService from '../../services/learningPlanService';
import progressTemplateService from '../../services/progressTemplateService';
import { useAuth } from '../../context/AuthContext';
import './ProgressTemplate.css';

const ProgressTemplateForm = ({ template, onSubmit, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(template?.learningPlanId || '');
  const [topics, setTopics] = useState([]);
  const [customItems, setCustomItems] = useState(template?.customItems || []);
  const [newCustomItem, setNewCustomItem] = useState('');
  const [newCustomItemDate, setNewCustomItemDate] = useState('');
  const [customItemError, setCustomItemError] = useState('');
  const [courseStatus, setCourseStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (!user) {
      setError('Please log in to access this feature');
      return;
    }
    fetchCourses();
    if (template?.learningPlanId) {
      handleCourseSelect(template.learningPlanId);
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await learningPlanService.getSharedPlans();
      console.log('Fetched courses:', coursesData);
      setCourses(coursesData);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (err.status === 401) {
        setError('Please log in to view courses');
      } else {
        setError('Failed to fetch courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    console.log('Selected course ID:', courseId);
    setSelectedCourse(courseId);
    try {
      const response = await axios.get(`http://localhost:8000/api/learning-plan/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      console.log('Course details response:', response.data);
      if (response.data && response.data.topics) {
        setTopics(response.data.topics);
        setCourseStatus(response.data.status);
        setSelectedCourseDetails(response.data);
      } else {
        console.error('No topics found in response:', response.data);
        setError('No topics found for this course');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view course details');
      } else {
        setError('Failed to fetch course details');
      }
      setTopics([]);
      setCourseStatus(null);
      setSelectedCourseDetails(null);
    }
  };

  const validateDate = (date) => {
    if (!selectedCourseDetails) return false;
    const targetDate = new Date(date);
    const startDate = new Date(selectedCourseDetails.startDate);
    const endDate = new Date(selectedCourseDetails.endDate);
    return targetDate >= startDate && targetDate <= endDate;
  };

  const isDuplicateTopic = (topicTitle) => {
    return topics.some(topic => topic.title.toLowerCase() === topicTitle.toLowerCase());
  };

  const isDuplicateCustomItem = (itemName, topicId) => {
    return customItems.some(item => 
      item.name.toLowerCase() === itemName.toLowerCase() && 
      item.topicId === topicId
    );
  };

  const addCustomItem = () => {
    if (!selectedTopic) {
      setCustomItemError('Please select a topic first');
      return;
    }
    if (!newCustomItem.trim()) {
      setCustomItemError('Please enter a target name');
      return;
    }
    if (!newCustomItemDate) {
      setCustomItemError('Please select a finish date');
      return;
    }
    if (!validateDate(newCustomItemDate)) {
      setCustomItemError('Finish date must be between course start and end dates');
      return;
    }
    if (isDuplicateCustomItem(newCustomItem.trim(), selectedTopic.title)) {
      setCustomItemError('This learning target already exists for this topic');
      return;
    }
    setCustomItems([...customItems, { 
      name: newCustomItem, 
      progress: 0,
      finishDate: newCustomItemDate,
      topicId: selectedTopic.title
    }]);
    setNewCustomItem('');
    setNewCustomItemDate('');
    setCustomItemError('');
  };

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const templateData = {
      learningPlanId: selectedCourse,
      topics: topics.map(topic => ({
        topicId: topic.title,
        topicName: topic.title,
        currentProgress: template?.topics.find(t => t.topicId === topic.title)?.currentProgress || 0
      })),
      customItems: customItems.map(item => ({
        name: item.name,
        currentProgress: item.currentProgress || 0,
        finishDate: item.finishDate
      }))
    };

    try {
      if (template) {
        await progressTemplateService.updateTemplate(template.id, templateData);
      } else {
        await progressTemplateService.createTemplate(templateData);
      }
      onSubmit(templateData);
    } catch (err) {
      console.error('Error saving template:', err);
      if (err.status === 401) {
        setError('Please log in to save the template');
      } else {
        setError('Failed to save template');
      }
    }
  };

  if (!user) {
    return <div className="progress-template-error">Please log in to access this feature</div>;
  }

  if (loading) {
    return <div className="progress-template-loading">Loading courses...</div>;
  }

  return (
    <form className="progress-template-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{template ? 'Edit Progress Template' : 'Create Progress Template'}</h3>
      </div>

      {error && (
        <div className="progress-template-error">
          {error}
        </div>
      )}

      {courseStatus && courseStatus.status === 'NOT_STARTED' && (
        <div className="progress-template-info">
          Your course will start on {new Date(courseStatus.startDate).toLocaleDateString()}. 
          Until then, you cannot track progress.
        </div>
      )}

      <div className="form-group">
        <label>Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseSelect(e.target.value)}
          disabled={courseStatus?.status === 'NOT_STARTED'}
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseDetails && (
        <div className="course-details-summary">
          <h4>Course Details</h4>
          <div className="course-info">
            <p><strong>Title:</strong> {selectedCourseDetails.title}</p>
            <p><strong>Description:</strong> {selectedCourseDetails.description}</p>
            <p><strong>Status:</strong> {selectedCourseDetails.status}</p>
            <p><strong>Start Date:</strong> {new Date(selectedCourseDetails.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(selectedCourseDetails.endDate).toLocaleDateString()}</p>
            <p><strong>Total Topics:</strong> {selectedCourseDetails.topics?.length || 0}</p>
          </div>
        </div>
      )}

      {selectedCourse && (
        <>
          <div className="form-group">
            <label>Course Topics</label>
            <div className="progress-template-topics">
              {topics.map((topic, index) => (
                <div key={`${topic.title}-${index}`} className="progress-template-topic">
                  <div className="topic-info">
                    <span>{topic.title}</span>
                    {topics.filter(t => t.title.toLowerCase() === topic.title.toLowerCase()).length > 1 && (
                      <span className="duplicate-warning">(Duplicate)</span>
                    )}
                  </div>
                  <div className="topic-actions">
                    {template && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={template.topics.find(t => t.topicId === topic.title)?.currentProgress || 0}
                        onChange={(e) => {
                          const newTopics = topics.map(t => 
                            t.title === topic.title 
                              ? { ...t, currentProgress: parseInt(e.target.value) || 0 }
                              : t
                          );
                          setTopics(newTopics);
                        }}
                      />
                    )}
                    <button 
                      type="button" 
                      className={`select-topic-btn ${selectedTopic?.title === topic.title ? 'selected' : ''}`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {selectedTopic?.title === topic.title ? 'Selected' : 'Select for Targets'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Custom Learning Targets</label>
            {selectedTopic ? (
              <div className="selected-topic-info">
                <p>Adding targets for topic: <strong>{selectedTopic.title}</strong></p>
              </div>
            ) : (
              <p className="select-topic-message">Select a topic above to add custom learning targets</p>
            )}
            <div className="progress-template-custom-items">
              <div className="custom-item-input">
                <input
                  type="text"
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                  placeholder="Add custom target"
                  disabled={!selectedTopic}
                />
                <input
                  type="date"
                  value={newCustomItemDate}
                  onChange={(e) => setNewCustomItemDate(e.target.value)}
                  min={selectedCourseDetails?.startDate?.split('T')[0]}
                  max={selectedCourseDetails?.endDate?.split('T')[0]}
                  disabled={!selectedTopic}
                />
                <button 
                  type="button" 
                  onClick={addCustomItem}
                  disabled={!selectedTopic}
                >
                  Add
                </button>
              </div>
              {customItemError && (
                <div className="error-message">{customItemError}</div>
              )}

              {topics.map(topic => {
                const topicItems = customItems.filter(item => item.topicId === topic.title);
                if (topicItems.length === 0) return null;

                return (
                  <div key={topic.title} className="topic-custom-items">
                    <div className="topic-custom-header">
                      <h4>{topic.title}</h4>
                      <span className="item-count">{topicItems.length} target{topicItems.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="topic-custom-list">
                      {topicItems.map((item, index) => (
                        <div key={index} className="progress-template-custom-item">
                          <div className="custom-item-info">
                            <div className="custom-item-header">
                              <span>{item.name}</span>
                            </div>
                            <span className="custom-item-date">
                              Finish by: {new Date(item.finishDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="custom-item-actions">
                            {template && (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.currentProgress || 0}
                                onChange={(e) => {
                                  const newItems = customItems.map((i, idx) => 
                                    idx === index 
                                      ? { ...i, currentProgress: parseInt(e.target.value) || 0 }
                                      : i
                                  );
                                  setCustomItems(newItems);
                                }}
                              />
                            )}
                            <button type="button" onClick={() => removeCustomItem(index)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" disabled={courseStatus?.status === 'NOT_STARTED'}>
          {template ? 'Update Template' : 'Create Template'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProgressTemplateForm; 