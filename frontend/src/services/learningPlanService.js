import axios from 'axios';

const API_URL = 'http://localhost:8000/api/learning-plan';

const learningPlanService = {
  getPlans: async (userEmail) => {
    console.log('Fetching learning plans for user:', userEmail);
    const response = await axios.get(API_URL, { params: { userEmail } });
    console.log('Received learning plans:', response.data);
    return response.data;
  },

  getPlanById: async (planId) => {
    console.log('Fetching learning plan by ID:', planId);
    const response = await axios.get(`${API_URL}/${planId}`);
    console.log('Received learning plan:', response.data);
    return response.data;
  },

  createPlan: async (userEmail, plan) => {
    console.log('Creating new learning plan:', { userEmail, plan });
    const response = await axios.post(API_URL, plan, { params: { userEmail } });
    console.log('Created learning plan:', response.data);
    return response.data;
  },

  updatePlan: async (plan, userEmail) => {
    console.log('Updating learning plan:', { plan, userEmail });
    const response = await axios.put(API_URL, plan, { params: { userEmail } });
    console.log('Updated learning plan:', response.data);
    return response.data;
  },

  deletePlan: async (planId) => {
    console.log('Deleting learning plan:', planId);
    const response = await axios.delete(`${API_URL}/${planId}`);
    console.log('Deleted learning plan:', response.data);
    return response.data;
  },

  getSharedPlans: async () => {
    try {
      console.log('Fetching shared learning plans from:', `${API_URL}/shared`);
      const response = await axios.get(`${API_URL}/shared`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Shared plans response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching shared plans:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      return [];
    }
  },
};

export default learningPlanService;