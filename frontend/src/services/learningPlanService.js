import axios from 'axios';
import { getAuthHeaders, checkAndRefreshToken } from './authService';

const API_URL = 'http://localhost:8000/api/learning-plan';

class LearningPlanError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'LearningPlanError';
    this.status = status;
  }
}

const learningPlanService = {
  getPlans: async (userEmail) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to view your learning plans', 401);
      }

      console.log('Fetching learning plans for user:', userEmail);
      const response = await axios.get(API_URL, { 
        params: { userEmail },
        headers: getAuthHeaders()
      });
      console.log('Received learning plans:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to view your learning plans', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch learning plans',
        error.response?.status
      );
    }
  },

  getPlanById: async (planId) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to view this learning plan', 401);
      }

      console.log('Fetching learning plan by ID:', planId);
      const response = await axios.get(`${API_URL}/${planId}`, {
        headers: getAuthHeaders()
      });
      console.log('Received learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to view this learning plan', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch learning plan',
        error.response?.status
      );
    }
  },

  createPlan: async (userEmail, plan) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to create a learning plan', 401);
      }

      console.log('Creating new learning plan:', { userEmail, plan });
      const response = await axios.post(API_URL, plan, { 
        params: { userEmail },
        headers: getAuthHeaders()
      });
      console.log('Created learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating learning plan:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to create a learning plan', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to create learning plan',
        error.response?.status
      );
    }
  },

  updatePlan: async (plan, userEmail) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to update this learning plan', 401);
      }

      console.log('Updating learning plan:', { plan, userEmail });
      const response = await axios.put(API_URL, plan, { 
        params: { userEmail },
        headers: getAuthHeaders()
      });
      console.log('Updated learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating learning plan:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to update this learning plan', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to update learning plan',
        error.response?.status
      );
    }
  },

  deletePlan: async (planId) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to delete this learning plan', 401);
      }

      console.log('Deleting learning plan:', planId);
      const response = await axios.delete(`${API_URL}/${planId}`, {
        headers: getAuthHeaders()
      });
      console.log('Deleted learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to delete this learning plan', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to delete learning plan',
        error.response?.status
      );
    }
  },

  getSharedPlans: async () => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to view shared plans', 401);
      }

      console.log('Fetching shared learning plans from:', `${API_URL}/shared`);
      const response = await axios.get(`${API_URL}/shared`, {
        headers: {
          ...getAuthHeaders(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Shared plans response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching shared plans:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to view shared plans', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch shared plans',
        error.response?.status
      );
    }
  },

  startLearningPlan: async (userEmail, planId) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to start learning', 401);
      }

      console.log('Starting learning plan:', { userEmail, planId });
      const response = await axios.post(`${API_URL}/start`, {
        userEmail,
        planId
      }, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Started learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting learning plan:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to start learning', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to start learning plan',
        error.response?.status
      );
    }
  },

  getUserProgress: async (userEmail, planId) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to view progress', 401);
      }

      console.log('Fetching user progress:', { userEmail, planId });
      const response = await axios.get(`${API_URL}/progress`, {
        params: { userEmail, planId },
        headers: getAuthHeaders()
      });
      console.log('User progress:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      if (error.response?.status === 404) {
        return null; // No progress found for this user and plan
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to view progress', error.response.status);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to fetch user progress',
        error.response?.status
      );
    }
  },

  updateTopicProgress: async (userEmail, planId, topicIndex, completed) => {
    try {
      if (!checkAndRefreshToken()) {
        throw new LearningPlanError('Please log in to update progress', 401);
      }

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
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new LearningPlanError('Please log in to update progress', error.response.status);
      }
      if (error.response?.status === 404) {
        throw new LearningPlanError('Learning plan or topic not found', 404);
      }
      throw new LearningPlanError(
        error.response?.data || 'Failed to update topic progress. Please try again.',
        error.response?.status
      );
    }
  }
};

export default learningPlanService;