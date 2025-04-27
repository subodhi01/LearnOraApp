import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddPlan.css';

const AddPlan = () => {
  const [plan, setPlan] = useState({
    name: '',
    courses: [],
    completionRate: 0
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/courses')
      .then(response => setCourses(response.data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlan({ ...plan, [name]: value });
  };

  const handleCourseAdd = () => {
    if (selectedCourse && !plan.courses.includes(selectedCourse)) {
      setPlan({ ...plan, courses: [...plan.courses, selectedCourse] });
      setSelectedCourse('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/learning-plans', plan)
      .then(response => {
        alert('Learning Plan created successfully!');
        setPlan({ name: '', courses: [], completionRate: 0 });
      })
      .catch(error => console.error('Error creating plan:', error));
  };

  return (
    <div className="add-plan-container">
      <h2>Create Learning Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Plan Name</label>
          <input
            type="text"
            name="name"
            value={plan.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Add Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <button type="button" onClick={handleCourseAdd}>Add Course</button>
        </div>

        <div className="form-group">
          <label>Selected Courses</label>
          <ul>
            {plan.courses.map(courseId => {
              const course = courses.find(c => c._id === courseId);
              return course ? <li key={courseId}>{course.name}</li> : null;
            })}
          </ul>
        </div>

        <div className="form-group">
          <label>Completion Rate (%)</label>
          <input
            type="number"
            name="completionRate"
            value={plan.completionRate}
            onChange={handleInputChange}
            min="0"
            max="100"
            required
          />
        </div>

        <button type="submit">Create Plan</button>
      </form>
    </div>
  );
};

export default AddPlan;