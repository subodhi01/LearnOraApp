import React, { useState, useEffect } from 'react';
import './Courses.css';
import learningPlanService from '../../services/learningPlanService';

const Courses = () => {
  const [sharedPlans, setSharedPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPlans = async () => {
      try {
        const plans = await learningPlanService.getSharedPlans();
        setSharedPlans(Array.isArray(plans) ? plans : []);
      } catch (error) {
        console.error('Error fetching shared plans:', error);
        setSharedPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlans();
  }, []);

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      {sharedPlans.length === 0 ? (
        <p className="no-courses">No shared courses available yet.</p>
      ) : (
        <div className="courses-grid">
          {sharedPlans.map((plan) => (
            <div key={plan.id} className="course-card">
              <div className="course-header">
                <h3>{plan.title}</h3>
                <span className="course-creator">
                  Created by: {plan.userEmail}
                </span>
              </div>
              
              <div className="course-content">
                <p className="course-description">{plan.description}</p>
                <div className="course-meta">
                  <span className="course-topics">
                    {plan.topics?.length || 0} Topics
                  </span>
                  <span className="course-status">
                    Status: {plan.status}
                  </span>
                  <span className="course-progress">
                    Progress: {calculateProgress(plan)}%
                  </span>
                </div>
                <div className="course-timeline">
                  <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const calculateProgress = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  const completedTopics = plan.topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

export default Courses; 