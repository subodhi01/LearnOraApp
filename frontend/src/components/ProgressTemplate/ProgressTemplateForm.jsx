import React, { useState, useEffect } from 'react';
import axios from 'axios';
import learningPlanService from '../../services/learningPlanService';
import './ProgressTemplate.css';

const ProgressTemplateForm = ({ template, onSubmit, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(template?.learningPlanId || '');
  const [topics, setTopics] = useState([]);
  const [customItems, setCustomItems] = useState(template?.customItems || []);
  const [newCustomItem, setNewCustomItem] = useState('');
  const [courseStatus, setCourseStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (template?.learningPlanId) {
      handleCourseSelect(template.learningPlanId);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await learningPlanService.getSharedPlans();
      console.log('Fetched courses:', coursesData);
      setCourses(coursesData);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    console.log('Selected course ID:', courseId);
    setSelectedCourse(courseId);
    try {
      const response = await axios.get(`/api/learning-plan/${courseId}`);
      console.log('Course details response:', response.data);
      setTopics(response.data.topics || []);
      setCourseStatus(response.data.status);
      setSelectedCourseDetails(response.data);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to fetch course details');
    }
  };

  const addCustomItem = () => {
    if (newCustomItem.trim()) {
      setCustomItems([...customItems, { name: newCustomItem, progress: 0 }]);
      setNewCustomItem('');
    }
  };

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const templateData = {
      learningPlanId: selectedCourse,
      topics: topics.map(topic => ({
        topicId: topic.id,
        topicName: topic.name,
        currentProgress: template?.topics.find(t => t.topicId === topic.id)?.currentProgress || 0
      })),
      customItems: customItems.map(item => ({
        name: item.name,
        currentProgress: item.currentProgress || 0
      }))
    };

    onSubmit(templateData);
  };

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
                <div key={topic.id} className="progress-template-topic">
                  <span>{topic.name}</span>
                  {template && (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={template.topics.find(t => t.topicId === topic.id)?.currentProgress || 0}
                      onChange={(e) => {
                        const newTopics = topics.map(t => 
                          t.id === topic.id 
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
                <button type="button" onClick={addCustomItem}>
                  Add
                </button>
              </div>

              {customItems.map((item, index) => (
                <div key={index} className="progress-template-custom-item">
                  <span>{item.name}</span>
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