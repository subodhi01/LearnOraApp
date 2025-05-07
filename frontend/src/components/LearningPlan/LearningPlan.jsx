import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LearningPlan.css';
import LearningPlanList from './LearningPlanList';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanDetail from './LearningPlanDetail';
import learningPlanService from '../../services/learningPlanService';
import { useAuth } from '../../context/AuthContext';

const LearningPlan = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchPlans();
    }
  }, [user?.email]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await learningPlanService.getPlans(user.email);
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      if (error.status === 401) {
        // Redirect to login if unauthorized
        navigate('/login');
      } else {
        setError(error.message || 'Failed to fetch learning plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (newPlan) => {
    try {
      setError(null);
      const createdPlan = await learningPlanService.createPlan(user.email, {
        ...newPlan,
        id: Date.now().toString(), // Temporary ID until backend assigns one
      });
      setPlans([...plans, createdPlan]);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      if (error.status === 401) {
        navigate('/login');
      } else {
        setError(error.message || 'Failed to create learning plan');
      }
    }
  };

  const handleUpdatePlan = async (updatedPlan) => {
    try {
      setError(null);
      const updated = await learningPlanService.updatePlan(updatedPlan, user.email);
      setPlans(plans.map(plan => (plan.id === updated.id ? updated : plan)));
      setIsEditing(false);
      setSelectedPlanId(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      if (error.status === 401) {
        navigate('/login');
      } else {
        setError(error.message || 'Failed to update learning plan');
      }
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setError(null);
      await learningPlanService.deletePlan(planId);
      setPlans(plans.filter(plan => plan.id !== planId));
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      if (error.status === 401) {
        navigate('/login');
      } else {
        setError(error.message || 'Failed to delete learning plan');
      }
    }
  };

  const handleSharePlan = async (planId) => {
    try {
      setError(null);
      const planToShare = plans.find(plan => plan.id === planId);
      if (!planToShare) {
        throw new Error('Plan not found');
      }
      
      const updatedPlan = {
        ...planToShare,
        shared: !planToShare.shared
      };
      
      await handleUpdatePlan(updatedPlan);
    } catch (error) {
      console.error('Error sharing plan:', error);
      if (error.status === 401) {
        navigate('/login');
      } else {
        setError(error.message || 'Failed to share learning plan');
      }
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan ? plan.id : null);
  };

  if (!user?.email) {
    return <div className="auth-message">Please log in to view your learning plans.</div>;
  }

  if (loading) {
    return <div className="loading-message">Loading your learning plans...</div>;
  }

  return (
    <div className="learning-plan-container">
      <div className="learning-plan-header">
        <h2>Learning Plans</h2>
        <button 
          className="create-plan-btn"
          onClick={() => setIsCreating(true)}
        >
          Create New Plan
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button 
            className="retry-btn"
            onClick={fetchPlans}
          >
            Retry
          </button>
        </div>
      )}

      {isCreating && (
        <LearningPlanForm
          onSubmit={handleCreatePlan}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {isEditing && selectedPlanId && (
        <LearningPlanForm
          plan={plans.find(p => p.id === selectedPlanId)}
          onSubmit={handleUpdatePlan}
          onCancel={() => {
            setIsEditing(false);
            setSelectedPlanId(null);
          }}
        />
      )}

      {!isCreating && !isEditing && (
        <LearningPlanList
          plans={plans}
          onSelectPlan={handleSelectPlan}
          onEditPlan={(plan) => {
            setSelectedPlanId(plan.id);
            setIsEditing(true);
          }}
          onDeletePlan={handleDeletePlan}
          onSharePlan={handleSharePlan}
          selectedPlanId={selectedPlanId}
        />
      )}
    </div>
  );
};

export default LearningPlan; 