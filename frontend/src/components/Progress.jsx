import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Progress.css';

const Progress = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [timeline, setTimeline] = useState('');
  const [description, setDescription] = useState('');
  const [templates, setTemplates] = useState([]);

  // Hardcoded course data
  const courses = [
    {
      id: 1,
      name: 'Web Development',
      overview: 'Learn modern web development',
      duration: '3 months',
      description: 'Comprehensive web development course covering HTML, CSS, JavaScript, and React',
      content: ['HTML Basics', 'CSS Styling', 'JavaScript Fundamentals', 'React Development']
    },
    {
      id: 2,
      name: 'Data Science',
      overview: 'Master data analysis and machine learning',
      duration: '4 months',
      description: 'Learn data analysis, statistics, and machine learning algorithms',
      content: ['Python Programming', 'Data Analysis', 'Machine Learning', 'Deep Learning']
    },
    {
      id: 3,
      name: 'Mobile Development',
      overview: 'Build mobile applications',
      duration: '3 months',
      description: 'Learn to develop mobile apps for iOS and Android',
      content: ['React Native', 'Mobile UI Design', 'State Management', 'API Integration']
    }
  ];

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    const newTemplate = {
      id: Date.now(),
      courses: selectedCourses.map(id => courses.find(course => course.id === id)),
      timeline,
      description,
      createdAt: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
    setShowForm(false);
    setSelectedCourses([]);
    setTimeline('');
    setDescription('');
  };

  return (
    <div className="progress-container">
      <h1>Progress Tracking</h1>
      
      {!showForm ? (
        <div className="instructions">
          <h2>How to Create a Progress Template</h2>
          <ol>
            <li>Click the "Create Template" button below</li>
            <li>Select the courses you want to track</li>
            <li>Set a timeline for progress updates</li>
            <li>Add a description of your learning goals</li>
            <li>Click "Create Progress Template" to save</li>
          </ol>
          <button 
            className="create-template-btn"
            onClick={() => setShowForm(true)}
          >
            Create Template
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateTemplate} className="template-form">
          <h2>Hi {user?.displayName || 'User'}, Welcome!</h2>
          
          <div className="course-selection">
            <h3>Select Courses</h3>
            {courses.map(course => (
              <div key={course.id} className="course-item">
                <input
                  type="checkbox"
                  id={`course-${course.id}`}
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleCourseSelection(course.id)}
                />
                <label htmlFor={`course-${course.id}`}>
                  <h4>{course.name}</h4>
                  <p>{course.overview}</p>
                  <p>Duration: {course.duration}</p>
                </label>
              </div>
            ))}
          </div>

          <div className="timeline-section">
            <h3>Set Timeline</h3>
            <select 
              value={timeline} 
              onChange={(e) => setTimeline(e.target.value)}
              required
            >
              <option value="">Select Timeline</option>
              <option value="1">1 Week</option>
              <option value="2">2 Weeks</option>
              <option value="4">1 Month</option>
              <option value="12">3 Months</option>
            </select>
            <p className="timeline-note">
              Note: You'll receive notifications if you don't update your progress within the selected timeline.
              Templates will be automatically deleted one day after the deadline.
            </p>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your learning goals and expectations..."
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="create-btn">Create Progress Template</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="templates-list">
        <h2>Your Progress Templates</h2>
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h3>Template Created: {new Date(template.createdAt).toLocaleDateString()}</h3>
              <button className="update-btn">Update Progress</button>
            </div>
            <div className="template-courses">
              {template.courses.map(course => (
                <div key={course.id} className="course-card">
                  <h4>{course.name}</h4>
                  <p>{course.description}</p>
                </div>
              ))}
            </div>
            <p className="template-timeline">
              Timeline: {template.timeline} {template.timeline === '1' ? 'Week' : 'Weeks'}
            </p>
            <p className="template-description">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress; 