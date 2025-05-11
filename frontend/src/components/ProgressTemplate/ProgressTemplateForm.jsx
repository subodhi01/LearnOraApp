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
  const [calculationMethod, setCalculationMethod] = useState(template?.calculationMethod || 'byTopics');
  const [topicPercentages, setTopicPercentages] = useState({});
  const [targetPercentages, setTargetPercentages] = useState({});
  const [showCalculationMethod, setShowCalculationMethod] = useState(false);

  useEffect(() => {
    console.log('Current user data:', user); // Debug log
    if (!user) {
      setError('Please log in to access this feature');
      return;
    }
    fetchCourses();
    if (template?.learningPlanId) {
      handleCourseSelect(template.learningPlanId);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      setShowCalculationMethod(true);
    } else {
      setShowCalculationMethod(false);
    }
  }, [selectedCourse]);

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

  const calculatePercentages = () => {
    if (calculationMethod === 'byTopics') {
      // Calculate by topics first
      const topicCount = topics.length;
      const baseTopicPercentage = 100 / topicCount;
      
      // Set topic percentages
      const newTopicPercentages = {};
      topics.forEach(topic => {
        newTopicPercentages[topic.title] = baseTopicPercentage;
      });
      setTopicPercentages(newTopicPercentages);

      // Calculate target percentages within each topic
      const newTargetPercentages = {};
      topics.forEach(topic => {
        const topicTargets = customItems.filter(item => item.topicId === topic.title);
        if (topicTargets.length > 0) {
          const targetPercentage = baseTopicPercentage / topicTargets.length;
          topicTargets.forEach(target => {
            newTargetPercentages[target.name] = targetPercentage;
          });
        }
      });
      setTargetPercentages(newTargetPercentages);
    } else {
      // Calculate by total targets
      const totalTargets = customItems.length;
      const baseTargetPercentage = 100 / totalTargets;
      
      // Set target percentages
      const newTargetPercentages = {};
      customItems.forEach(target => {
        newTargetPercentages[target.name] = baseTargetPercentage;
      });
      setTargetPercentages(newTargetPercentages);

      // Calculate topic percentages based on their targets
      const newTopicPercentages = {};
      topics.forEach(topic => {
        const topicTargets = customItems.filter(item => item.topicId === topic.title);
        newTopicPercentages[topic.title] = topicTargets.reduce((sum, target) => 
          sum + (newTargetPercentages[target.name] || 0), 0
        );
      });
      setTopicPercentages(newTopicPercentages);
    }
  };

  useEffect(() => {
    calculatePercentages();
  }, [topics, customItems, calculationMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const templateData = {
      userId: user.email,
      learningPlanId: selectedCourse,
  /* add*/   courseName: selectedCourseDetails?.title || 'Unknown Course',
      calculationMethod: calculationMethod,
      topics: topics.map(topic => ({
        topicId: topic.title,
        topicName: topic.title,
        currentProgress: template?.topics.find(t => t.topicId === topic.title)?.currentProgress || 0
      })),
      customItems: customItems.map(item => ({
        name: item.name,
        currentProgress: item.currentProgress || 0,
        finishDate: item.finishDate,
        topicId: item.topicId
      }))
    };

    try {
      console.log('Submitting template data:', templateData);
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
        <div className="user-greeting">
          <h2>👋 Hi, {user?.firstName || 'Student'}!</h2>
          <p className="greeting-message">📚 Let's create your progress report and plan your study journey effectively!</p>
        </div>
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

      {showCalculationMethod && (
        <div className="form-group">
          <label>Percentage Calculation Method</label>
          <div className="calculation-method-selector">
            <select 
              value={calculationMethod} 
              onChange={(e) => setCalculationMethod(e.target.value)}
              className="calculation-select"
            >
              <option value="byTopics">Calculate by Topics First</option>
              <option value="byTargets">Calculate by Total Targets</option>
            </select>
            <div className="calculation-info">
              {calculationMethod === 'byTopics' ? (
                <p>Each topic gets equal percentage, divided among its targets</p>
              ) : (
                <p>All targets get equal percentage, topics calculated based on their targets</p>
              )}
            </div>
          </div>
        </div>
      )}

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
            <label>Course Topics and Learning Targets</label>
            <div className="progress-template-topics">
              {topics.map((topic, index) => (
                <div key={`${topic.title}-${index}`} className="progress-template-topic">
                  <div className="topic-info">
                    <h4>{topic.title}</h4>
                    <span className="topic-percentage">
                      {topicPercentages[topic.title]?.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="topic-custom-items">
                    {customItems
                      .filter(item => item.topicId === topic.title)
                      .map((item, itemIndex) => (
                        <div key={itemIndex} className="progress-template-custom-item">
                          <div className="custom-item-info">
                            <div className="custom-item-header">
                              <span>{item.name}</span>
                              <span className="target-percentage">
                                {targetPercentages[item.name]?.toFixed(1)}%
                              </span>
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
                                    idx === itemIndex 
                                      ? { ...i, currentProgress: parseInt(e.target.value) || 0 }
                                      : i
                                  );
                                  setCustomItems(newItems);
                                }}
                              />
                            )}
                            <button type="button" onClick={() => removeCustomItem(itemIndex)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="topic-actions">
                    <button 
                      type="button" 
                      className={`select-topic-btn ${selectedTopic?.title === topic.title ? 'selected' : ''}`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {selectedTopic?.title === topic.title ? 'Selected' : 'Add Learning Target'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedTopic && (
            <div className="form-group">
              <label>Add Learning Target for {selectedTopic.title}</label>
              <div className="custom-item-input">
                <input
                  type="text"
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                  placeholder="Add learning target"
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
            </div>
          )}
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