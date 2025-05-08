import React, { useState } from 'react';
import './Course.css';

const CourseCard = ({ course, onEdit, onDelete, onView }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image';
  };

  // Log the course data for debugging
  console.log('Course data:', course);

  return (
    <div className="course-card">
      <div className="course-image">
        <img
          src={!imageError && course.imageUrl ? course.imageUrl : 'https://via.placeholder.com/300x200?text=Course+Image'}
          alt={course.title}
          onError={handleImageError}
        />
        <div className="course-level">{course.level}</div>
        <div className="course-rating">
          <span>★</span> {course.rating}
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-header">
          <h3>{course.title}</h3>
          <div className="course-actions">
            <button onClick={() => onEdit(course)} className="edit-btn">
              Edit
            </button>
            <button onClick={() => onDelete(course._id)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>
        
        <p className="course-description">{course.description}</p>
        
        <div className="course-stats">
          <div className="stat">
            <span className="stat-label">Duration:</span>
            <span className="stat-value">{course.duration}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Students:</span>
            <span className="stat-value">{course.studentsCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Modules:</span>
            <span className="stat-value">{course.modules?.length || 0}</span>
          </div>
        </div>

        <div className="course-objectives">
          <h4>Learning Objectives:</h4>
          <ul>
            {course.objectives?.slice(0, 3).map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
            {course.objectives?.length > 3 && (
              <li className="more-objectives">+{course.objectives.length - 3} more</li>
            )}
          </ul>
        </div>

        <div className="course-actions-bottom">
          <button onClick={() => onView(course)} className="view-course-btn">
            View Course
          </button>
          <button className="start-learning-btn">
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 