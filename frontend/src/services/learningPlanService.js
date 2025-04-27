import axios from 'axios';

const API_URL = 'http://localhost:8000/api/learning-plan';

const learningPlanService = {
  getPlans: async (userEmail) => {
    const response = await axios.get(API_URL, { params: { userEmail } });
    return response.data;
  },

  getPlanById: async (planId) => {
    const response = await axios.get(`${API_URL}/${planId}`);
    return response.data;
  },

  createPlan: async (userEmail, plan) => {
    const response = await axios.post(API_URL, plan, { params: { userEmail } });
    return response.data;
  },

  updatePlan: async (planId, plan) => {
    const response = await axios.put(`${API_URL}/${planId}`, plan);
    return response.data;
  },

  deletePlan: async (planId) => {
    const response = await axios.delete(`${API_URL}/${planId}`);
    return response.data;
  },
};

export default learningPlanService;