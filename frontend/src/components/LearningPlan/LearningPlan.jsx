import React, { useState, useEffect } from 'react';
import './LearningPlan.css';
import LearningPlanList from './LearningPlanList';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanDetail from './LearningPlanDetail';
import learningPlanService from '../../services/learningPlanService';
import { useAuth } from '../../context/AuthContext';

const LearningPlan = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      const fetchPlans = async () => {
        try {
          const plansData = await learningPlanService.getPlans(user.email);
          setPlans(plansData);
        } catch (error) {
          console.error('Error fetching learning plans:', error);
        }
      };
      fetchPlans();
    }
  }, [user?.email]);

  const handleCreatePlan = async (newPlan) => {
    try {
      const createdPlan = await learningPlanService.createPlan(user.email, {
        ...newPlan,
        id: Date.now().toString(), // Temporary ID until backend assigns one
      });
      setPlans([...plans, createdPlan]);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleUpdatePlan = async (updatedPlan) => {
    try {
      const updated = await learningPlanService.updatePlan(updatedPlan, user.email);
      setPlans(plans.map(plan => (plan.id === updated.id ? updated : plan)));
      setIsEditing(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await learningPlanService.deletePlan(planId);
      setPlans(plans.filter(plan => plan.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleSharePlan = (planId) => {
    // Implement sharing logic (e.g., generate shareable link)
    console.log('Sharing plan:', planId);
  };

  if (!user?.email) {
    return <div>Please log in to view your learning plans.</div>;
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

      {isCreating && (
        <LearningPlanForm
          onSubmit={handleCreatePlan}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {isEditing && selectedPlan && (
        <LearningPlanForm
          plan={selectedPlan}
          onSubmit={handleUpdatePlan}
          onCancel={() => {
            setIsEditing(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {!isCreating && !isEditing && (
        <>
          <LearningPlanList
            plans={plans}
            onSelectPlan={setSelectedPlan}
            onEditPlan={(plan) => {
              setSelectedPlan(plan);
              setIsEditing(true);
            }}
            onDeletePlan={handleDeletePlan}
            onSharePlan={handleSharePlan}
          />
          
          {selectedPlan && (
            <LearningPlanDetail
              plan={selectedPlan}
              onClose={() => setSelectedPlan(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LearningPlan; 