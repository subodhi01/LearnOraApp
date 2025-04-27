import React, { useState, useEffect } from 'react';
import './LearningPlan.css';
import LearningPlanList from './LearningPlanList';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanDetail from './LearningPlanDetail';

const LearningPlan = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch learning plans
  useEffect(() => {
    // TODO: Implement API call to fetch learning plans
    const fetchPlans = async () => {
      try {
        // const response = await learningPlanService.getPlans();
        // setPlans(response.data);
      } catch (error) {
        console.error('Error fetching learning plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const handleCreatePlan = (newPlan) => {
    // TODO: Implement API call to create plan
    setPlans([...plans, newPlan]);
    setIsCreating(false);
  };

  const handleUpdatePlan = (updatedPlan) => {
    // TODO: Implement API call to update plan
    setPlans(plans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    ));
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = (planId) => {
    // TODO: Implement API call to delete plan
    setPlans(plans.filter(plan => plan.id !== planId));
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
    }
  };

  const handleSharePlan = (planId) => {
    // TODO: Implement sharing functionality
    console.log('Sharing plan:', planId);
  };

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