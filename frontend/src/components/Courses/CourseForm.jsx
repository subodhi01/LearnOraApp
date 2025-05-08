import React, { useState, useEffect } from 'react';
import './Course.css';

const CourseForm = ({ course, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '',
    studentsCount: 0,
    rating: 0,
    objectives: [''],
    modules: [{ title: '', duration: '', lessons: [{ title: '', duration: '' }] }],
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        imageUrl: course.imageUrl || ''
      });
      if (course.imageUrl) {
        setImagePreview(course.imageUrl);
      }
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleModuleChange = (moduleIndex, field, value) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      modules: newModules
    }));
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons[lessonIndex] = {
      ...newModules[moduleIndex].lessons[lessonIndex],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      modules: newModules
    }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', duration: '', lessons: [{ title: '', duration: '' }] }]
    }));
  };

  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addLesson = (moduleIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons.push({ title: '', duration: '' });
    setFormData(prev => ({
      ...prev,
      modules: newModules
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData(prev => ({
      ...prev,
      modules: newModules
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
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save course'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="course-form">
      <h3>{course ? 'Edit Course' : 'Create Course'}</h3>
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
          <label htmlFor="level">Level</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 8 weeks, 24 hours"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentsCount">Number of Students</label>
          <input
            type="number"
            id="studentsCount"
            name="studentsCount"
            value={formData.studentsCount}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            required
          />
        </div>

        <div className="objectives-section">
          <h4>Learning Objectives</h4>
          {formData.objectives.map((objective, index) => (
            <div key={index} className="objective-item">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                placeholder="Enter learning objective"
                required
              />
              <button
                type="button"
                className="remove-objective-btn"
                onClick={() => removeObjective(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-objective-btn"
            onClick={addObjective}
          >
            Add Objective
          </button>
        </div>

        <div className="modules-section">
          <h4>Course Modules</h4>
          {formData.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="module-item">
              <div className="module-header">
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                  placeholder="Module Title"
                  required
                />
                <input
                  type="text"
                  value={module.duration}
                  onChange={(e) => handleModuleChange(moduleIndex, 'duration', e.target.value)}
                  placeholder="Duration"
                  required
                />
                <button
                  type="button"
                  className="remove-module-btn"
                  onClick={() => removeModule(moduleIndex)}
                >
                  Remove Module
                </button>
              </div>

              <div className="lessons-list">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="lesson-item">
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                      placeholder="Lesson Title"
                      required
                    />
                    <input
                      type="text"
                      value={lesson.duration}
                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'duration', e.target.value)}
                      placeholder="Duration"
                      required
                    />
                    <button
                      type="button"
                      className="remove-lesson-btn"
                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-lesson-btn"
                  onClick={() => addLesson(moduleIndex)}
                >
                  Add Lesson
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="add-module-btn"
            onClick={addModule}
          >
            Add Module
          </button>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {course ? 'Update Course' : 'Create Course'}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm; 