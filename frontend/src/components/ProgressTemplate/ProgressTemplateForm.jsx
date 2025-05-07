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

  const addCustomItem = () => {
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
    setCustomItems([...customItems, { 
      name: newCustomItem, 
      progress: 0,
      finishDate: newCustomItemDate 
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
              {topics.map((topic) => (
                <div key={topic.title} className="progress-template-topic">
                  <span>{topic.title}</span>
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
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Custom Learning Targets</label>
            <div className="progress-template-custom-items">
              <div className="custom-item-input">
                <input
                  type="text"
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                  placeholder="Add custom target"
                />
                <input
                  type="date"
                  value={newCustomItemDate}
                  onChange={(e) => setNewCustomItemDate(e.target.value)}
                  min={selectedCourseDetails?.startDate?.split('T')[0]}
                  max={selectedCourseDetails?.endDate?.split('T')[0]}
                />
                <button type="button" onClick={addCustomItem}>
                  Add
                </button>
              </div>
              {customItemError && (
                <div className="error-message">{customItemError}</div>
              )}

              {customItems.map((item, index) => (
                <div key={index} className="progress-template-custom-item">
                  <div className="custom-item-info">
                    <span>{item.name}</span>
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