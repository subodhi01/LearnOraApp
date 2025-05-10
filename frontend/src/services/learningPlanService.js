import axios from 'axios';

const API_URL = 'http://localhost:8000/api/learning-plan';

class LearningPlanError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'LearningPlanError';
    this.status = status;
  }
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? { 'Authorization': `Bearer ${user.token}` } : {};
};

const learningPlanService = {
  getPlans: async (userEmail) => {
    try {
      console.log('Fetching learning plans for user:', userEmail);
      const response = await axios.get(API_URL, { 
        params: { userEmail },
        headers: getAuthHeaders()
      });
      console.log('Received learning plans:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      if (error.response?.status === 401) {
        throw new LearningPlanError('Please log in to view your learning plans', 401);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch learning plans',
        error.response?.status
      );
    }
  },

  getPlanById: async (planId) => {
    try {
      console.log('Fetching learning plan by ID:', planId);
      const response = await axios.get(`${API_URL}/${planId}`, {
        headers: getAuthHeaders()
      });
      console.log('Received learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch learning plan',
        error.response?.status
      );
    }
  },

  createPlan: async (userEmail, plan) => {
    try {
      console.log('Creating new learning plan:', { userEmail, plan });
      if (plan.imageUrl) {
        console.log('Image data present:', plan.imageUrl.substring(0, 100) + '...');
      }
      const response = await axios.post(API_URL, plan, { 
        params: { userEmail },
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Created learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating learning plan:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to create learning plan',
        error.response?.status
      );
    }
  },

  updatePlan: async (plan, userEmail) => {
    try {
      console.log('Updating learning plan:', { plan, userEmail });
      if (plan.imageUrl) {
        console.log('Image data present:', plan.imageUrl.substring(0, 100) + '...');
      }
      const response = await axios.put(API_URL, plan, { 
        params: { userEmail },
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Updated learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating learning plan:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to update learning plan',
        error.response?.status
      );
    }
  },

  deletePlan: async (planId) => {
    try {
      console.log('Deleting learning plan:', planId);
      const response = await axios.delete(`${API_URL}/${planId}`, {
        headers: getAuthHeaders()
      });
      console.log('Deleted learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to delete learning plan',
        error.response?.status
      );
    }
  },

  getSharedPlans: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new LearningPlanError('Please log in to view shared plans', 401);
      }

      console.log('Fetching shared learning plans from:', `${API_URL}/shared`);
      const response = await axios.get(`${API_URL}/shared`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Shared plans response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching shared plans:', error);
      if (error.response?.status === 401) {
        throw new LearningPlanError('Please log in to view shared plans', 401);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch shared plans',
        error.response?.status
      );
    }
  },

  getUserProgress: async (userEmail, planId) => {
    try {
      console.log('Fetching user progress for plan:', { userEmail, planId });
      const response = await axios.get(`${API_URL}/${planId}/progress`, {
        headers: getAuthHeaders()
      });
      console.log('Received user progress:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch user progress',
        error.response?.status
      );
    }
  },

  startLearningPlan: async (userEmail, planId) => {
    try {
      console.log('Starting learning plan:', { userEmail, planId });
      const response = await axios.post(`${API_URL}/start`, { planId }, {
        headers: getAuthHeaders()
      });
      console.log('Started learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting learning plan:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to start learning plan',
        error.response?.status
      );
    }
  },

  updateTopicProgress: async (userEmail, planId, topicIndex, completed) => {
    try {
      console.log('Updating topic progress:', { userEmail, planId, topicIndex, completed });
      const response = await axios.put(`${API_URL}/progress/topic`, {
        planId,
        topicIndex,
        completed
      }, {
        headers: getAuthHeaders()
      });
      console.log('Updated topic progress:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating topic progress:', error);
      throw new LearningPlanError(
        error.response?.data || 'Failed to update topic progress',
        error.response?.status
      );
    }
  }
};

export default learningPlanService;