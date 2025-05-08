import React, { useState } from 'react';
import './Course.css';

const CourseList = ({ 
  courses, 
  onEditCourse, 
  onDeleteCourse 
}) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const renderCourseModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="course-modal-overlay" onClick={handleCloseModal}>
        <div className="course-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedCourse.title}</h2>
            <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
          </div>
          
          <div className="modal-content">
            <div className="modal-image">
              <img 
                src={selectedCourse.imageUrl || '/images/default-course.jpg'} 
                alt={selectedCourse.title}
                onError={(e) => {
                  e.target.src = '/images/default-course.jpg';
                }}
              />
            </div>

            <div className="modal-details">
              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedCourse.description}</p>
              </div>

              <div className="detail-section">
                <h3>Course Details</h3>
                <div className="course-stats">
                  <div className="stat-item">
                    <i className="fas fa-clock"></i>
                    <span>Duration: {selectedCourse.duration}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-signal"></i>
                    <span>Level: {selectedCourse.level}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-users"></i>
                    <span>Students: {selectedCourse.studentsCount}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-star"></i>
                    <span>Rating: {selectedCourse.rating}/5</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>What You'll Learn</h3>
                <div className="learning-objectives">
                  {selectedCourse.objectives?.map((objective, index) => (
                    <div key={index} className="objective-item">
                      <i className="fas fa-check"></i>
                      <span>{objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Course Content</h3>
                <div className="course-content">
                  {selectedCourse.modules?.map((module, index) => (
                    <div key={index} className="module-item">
                      <div className="module-header">
                        <span className="module-title">{module.title}</span>
                        <span className="module-duration">{module.duration}</span>
                      </div>
                      <div className="module-lessons">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="lesson-item">
                            <i className="fas fa-play-circle"></i>
                            <span>{lesson.title}</span>
                            <span className="lesson-duration">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="action-btn edit"
              onClick={() => {
                onEditCourse(selectedCourse);
                handleCloseModal();
              }}
            >
              Edit Course
            </button>
            <button 
              className="action-btn delete"
              onClick={() => {
                onDeleteCourse(selectedCourse.id);
                handleCloseModal();
              }}
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseCard = (course) => {
    const handleImageError = (e) => {
      console.error('Error loading image:', course.imageUrl);
      e.target.src = '/images/default-course.jpg';
    };

    return (
      <div key={course.id} className="course-card">
        <div className="course-image">
          <img 
            src={course.imageUrl || '/images/default-course.jpg'} 
            alt={course.title}
            onError={handleImageError}
          />
          <div className="course-overlay">
            <span className="course-level">{course.level}</span>
            <span className="course-rating">
              <i className="fas fa-star"></i> {course.rating}
            </span>
          </div>
        </div>
        <div className="course-header">
          <h3>{course.title}</h3>
          <div className="course-actions">
            <button 
              className="action-btn edit"
              onClick={() => onEditCourse(course)}
            >
              Edit
            </button>
            <button 
              className="action-btn delete"
              onClick={() => onDeleteCourse(course.id)}
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="course-content">
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <div className="course-stats">
              <span className="stat-item">
                <i className="fas fa-clock"></i>
                {course.duration}
              </span>
              <span className="stat-item">
                <i className="fas fa-users"></i>
                {course.studentsCount} Students
              </span>
              <span className="stat-item">
                <i className="fas fa-book"></i>
                {course.modules?.length || 0} Modules
              </span>
            </div>
          </div>
          <div className="course-objectives">
            {course.objectives?.slice(0, 3).map((objective, index) => (
              <span key={index} className="objective-tag">
                {objective}
              </span>
            ))}
            {course.objectives?.length > 3 && (
              <span className="objective-tag more">+{course.objectives.length - 3} more</span>
            )}
          </div>
          <button 
            className="view-course-btn" 
            onClick={() => handleViewCourse(course)}
          >
            View Course
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="course-list">
      {courses.length === 0 ? (
        <p className="no-courses">No courses available yet.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id}>
              {renderCourseCard(course)}
            </div>
          ))}
        </div>
      )}
      {showModal && renderCourseModal()}
    </div>
  );
};

export default CourseList; 