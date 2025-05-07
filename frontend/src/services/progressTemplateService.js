import axios from 'axios';
import { getAuthHeaders } from './authService';

const API_URL = 'http://localhost:8000/api/progress-templates';

class ProgressTemplateError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ProgressTemplateError';
    this.status = status;
  }
}

<<<<<<< HEAD
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User from localStorage:', user);
  
  if (!user || !user.token) {
    console.error('No user or token found in localStorage');
    return {};
  }

  const token = user.token.startsWith('Bearer ') ? user.token : `Bearer ${user.token}`;
  console.log('Token being sent:', token);
  
  const headers = {
    'Authorization': token,
    'Content-Type': 'application/json'
  };
  console.log('Auth headers:', headers);
  return headers;
};

=======
>>>>>>> 08b40216d3445e3b60e7c6b8430a9ab8a5ea902e
const progressTemplateService = {
  async getTemplates() {
    try {
      console.log('Starting to fetch progress templates...');
      const headers = getAuthHeaders();
      console.log('Auth headers:', headers);
      
      if (!headers || !headers.Authorization) {
        console.error('No authorization headers found');
        throw new ProgressTemplateError('Authentication required', 401);
      }

      // First try to get from cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        console.log('Found cached templates, using them while fetching fresh data');
        // Return cached data immediately
        const parsedData = JSON.parse(cachedData);
        
        // Then fetch fresh data in the background
        this.fetchAndUpdateTemplates(headers);
        
        return parsedData;
      }

      // If no cache, fetch from API
      return await this.fetchAndUpdateTemplates(headers);
    } catch (error) {
      console.error('Error in getTemplates:', error);
      // If API call fails, try to get from cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        console.log('Using cached data after error:', JSON.parse(cachedData));
        return JSON.parse(cachedData);
      }
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch progress templates',
        error.response?.status
      );
    }
  },

  async fetchAndUpdateTemplates(headers) {
    try {
      console.log('Fetching fresh templates from API...');
      const response = await axios.get(API_URL, { headers });
      console.log('API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Storing templates in cache:', response.data.length, 'items');
        localStorage.setItem('progressTemplates', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching fresh templates:', error);
      throw error;
    }
  },

  async getTemplateById(id) {
    try {
      console.log('Fetching template by ID:', id);
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/${id}`, { headers });
      console.log('Template response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch template',
        error.response?.status
      );
    }
  },

  async createTemplate(templateData) {
    try {
<<<<<<< HEAD
      console.log('Creating new progress template:', template);
      const headers = getAuthHeaders();
      console.log('Request headers:', headers);
      
      const response = await axios.post(API_URL, template, { headers });
      console.log('Created progress template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating progress template:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
=======
      console.log('Creating template with data:', templateData);
      const headers = getAuthHeaders();
      console.log('Auth headers for create:', headers);
      
      const response = await axios.post(API_URL, templateData, { headers });
      console.log('Create template response:', response.data);
      
      // Update cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        templates.push(response.data);
        localStorage.setItem('progressTemplates', JSON.stringify(templates));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
>>>>>>> 08b40216d3445e3b60e7c6b8430a9ab8a5ea902e
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to create template',
        error.response?.status
      );
    }
  },

  async updateTemplate(id, templateData) {
    try {
      console.log('Updating template:', id, templateData);
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_URL}/${id}`, templateData, { headers });
      console.log('Update template response:', response.data);
      
      // Update cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        const index = templates.findIndex(t => t.id === id);
        if (index !== -1) {
          templates[index] = response.data;
          localStorage.setItem('progressTemplates', JSON.stringify(templates));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to update template',
        error.response?.status
      );
    }
  },

  async deleteTemplate(id) {
    try {
      console.log('Deleting template:', id);
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/${id}`, { headers });
      
      // Update cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        const filteredTemplates = templates.filter(t => t.id !== id);
        localStorage.setItem('progressTemplates', JSON.stringify(filteredTemplates));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to delete template',
        error.response?.status
      );
    }
  },

  // Clear cache when logging out
  clearCache() {
    localStorage.removeItem('progressTemplates');
  },

  async getTemplatesByLearningPlan(learningPlanId) {
    try {
      console.log('Fetching templates for learning plan:', learningPlanId);
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/learning-plan/${learningPlanId}`, { headers });
      console.log('Learning plan templates response:', response.data);
      
      // Update cache with learning plan specific templates
      if (response.data && Array.isArray(response.data)) {
        const cachedData = localStorage.getItem('progressTemplates');
        if (cachedData) {
          const templates = JSON.parse(cachedData);
          const updatedTemplates = templates.filter(t => t.learningPlanId !== learningPlanId);
          updatedTemplates.push(...response.data);
          localStorage.setItem('progressTemplates', JSON.stringify(updatedTemplates));
        } else {
          localStorage.setItem('progressTemplates', JSON.stringify(response.data));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plan templates:', error);
      // Try to get from cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        const learningPlanTemplates = templates.filter(t => t.learningPlanId === learningPlanId);
        if (learningPlanTemplates.length > 0) {
          console.log('Using cached learning plan templates');
          return learningPlanTemplates;
        }
      }
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch learning plan templates',
        error.response?.status
      );
    }
  }
};

export default progressTemplateService; 