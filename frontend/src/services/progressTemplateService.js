import axios from 'axios';

const API_URL = 'http://localhost:8000/api/progress-template';

class ProgressTemplateError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ProgressTemplateError';
    this.status = status;
  }
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? { 'Authorization': `Bearer ${user.token}` } : {};
};

const progressTemplateService = {
  getTemplates: async () => {
    try {
      console.log('Fetching progress templates');
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });
      console.log('Received progress templates:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress templates:', error);
      if (error.response?.status === 401) {
        throw new ProgressTemplateError('Please log in to view your progress templates', 401);
      }
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch progress templates',
        error.response?.status
      );
    }
  },

  getTemplateById: async (templateId) => {
    try {
      console.log('Fetching progress template by ID:', templateId);
      const response = await axios.get(`${API_URL}/${templateId}`, {
        headers: getAuthHeaders()
      });
      console.log('Received progress template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch progress template',
        error.response?.status
      );
    }
  },

  createTemplate: async (template) => {
    try {
      console.log('Creating new progress template:', template);
      const response = await axios.post(API_URL, template, {
        headers: getAuthHeaders()
      });
      console.log('Created progress template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating progress template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to create progress template',
        error.response?.status
      );
    }
  },

  updateTemplate: async (templateId, template) => {
    try {
      console.log('Updating progress template:', { templateId, template });
      const response = await axios.put(`${API_URL}/${templateId}`, template, {
        headers: getAuthHeaders()
      });
      console.log('Updated progress template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating progress template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to update progress template',
        error.response?.status
      );
    }
  },

  deleteTemplate: async (templateId) => {
    try {
      console.log('Deleting progress template:', templateId);
      const response = await axios.delete(`${API_URL}/${templateId}`, {
        headers: getAuthHeaders()
      });
      console.log('Deleted progress template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting progress template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to delete progress template',
        error.response?.status
      );
    }
  },

  getTemplatesByLearningPlan: async (learningPlanId) => {
    try {
      console.log('Fetching progress templates for learning plan:', learningPlanId);
      const response = await axios.get(`${API_URL}/learning-plan/${learningPlanId}`, {
        headers: getAuthHeaders()
      });
      console.log('Received progress templates for learning plan:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress templates for learning plan:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch progress templates for learning plan',
        error.response?.status
      );
    }
  }
};

export default progressTemplateService; 