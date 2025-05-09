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

const progressTemplateService = {
  async getTemplates() {
    try {
      console.log('Starting to fetch progress templates...');
      const headers = await getAuthHeaders();

      if (!headers || !headers.Authorization) {
        throw new ProgressTemplateError('Authentication required', 401);
      }

      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        console.log('Using cached templates...');
        const parsedData = JSON.parse(cachedData);
        this.fetchAndUpdateTemplates(headers); // background update
        return parsedData;
      }

      return await this.fetchAndUpdateTemplates(headers);
    } catch (error) {
      console.error('Error in getTemplates:', error);
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
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
      const response = await axios.get(API_URL, { headers });
      if (response.data && Array.isArray(response.data)) {
        localStorage.setItem('progressTemplates', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getTemplateById(id) {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/${id}`, { headers });
      return response.data;
    } catch (error) {
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch template',
        error.response?.status
      );
    }
  },

  async createTemplate(templateData) {
    try {
      console.log('Creating template with data:', templateData);
      const headers = await getAuthHeaders();
      
      if (!headers || !headers.Authorization) {
        throw new ProgressTemplateError('Authentication required', 401);
      }

      console.log('Sending request with headers:', headers);
      const response = await axios.post(API_URL, templateData, { 
        headers,
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });

      if (response.status === 403) {
        throw new ProgressTemplateError('Authentication failed', 403);
      }

      if (response.status !== 200 && response.status !== 201) {
        throw new ProgressTemplateError(
          response.data || 'Failed to create template',
          response.status
        );
      }

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
      if (error instanceof ProgressTemplateError) {
        throw error;
      }
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to create template',
        error.response?.status
      );
    }
  },

  async updateTemplate(id, templateData) {
    try {
      const headers = await getAuthHeaders();
      if (!headers || !headers.Authorization) {
        throw new ProgressTemplateError('Authentication required', 401);
      }

      const response = await axios.put(`${API_URL}/${id}`, templateData, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (response.status === 403) {
        throw new ProgressTemplateError('Authentication failed', 403);
      }

      if (response.status !== 200) {
        throw new ProgressTemplateError(
          response.data || 'Failed to update template',
          response.status
        );
      }

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
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to update template',
        error.response?.status
      );
    }
  },

  async deleteTemplate(id) {
    try {
      const headers = await getAuthHeaders();
      if (!headers || !headers.Authorization) {
        throw new ProgressTemplateError('Authentication required', 401);
      }

      const response = await axios.delete(`${API_URL}/${id}`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (response.status === 403) {
        throw new ProgressTemplateError('Authentication failed', 403);
      }

      if (response.status !== 200) {
        throw new ProgressTemplateError(
          response.data || 'Failed to delete template',
          response.status
        );
      }

      // Update cache
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        const filtered = templates.filter(t => t.id !== id);
        localStorage.setItem('progressTemplates', JSON.stringify(filtered));
      }
    } catch (error) {
      throw new ProgressTemplateError(
        error.response?.data || 'Failed to delete template',
        error.response?.status
      );
    }
  },

  clearCache() {
    localStorage.removeItem('progressTemplates');
  },

  async getTemplatesByLearningPlan(learningPlanId) {
    try {
      const headers = await getAuthHeaders();
      if (!headers || !headers.Authorization) {
        throw new ProgressTemplateError('Authentication required', 401);
      }

      const response = await axios.get(`${API_URL}/learning-plan/${learningPlanId}`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (response.status === 403) {
        throw new ProgressTemplateError('Authentication failed', 403);
      }

      if (response.status !== 200) {
        throw new ProgressTemplateError(
          response.data || 'Failed to fetch learning plan templates',
          response.status
        );
      }

      if (response.data && Array.isArray(response.data)) {
        const cachedData = localStorage.getItem('progressTemplates');
        if (cachedData) {
          const templates = JSON.parse(cachedData);
          const updated = templates.filter(t => t.learningPlanId !== learningPlanId);
          updated.push(...response.data);
          localStorage.setItem('progressTemplates', JSON.stringify(updated));
        } else {
          localStorage.setItem('progressTemplates', JSON.stringify(response.data));
        }
      }

      return response.data;
    } catch (error) {
      const cachedData = localStorage.getItem('progressTemplates');
      if (cachedData) {
        const templates = JSON.parse(cachedData);
        const filtered = templates.filter(t => t.learningPlanId === learningPlanId);
        if (filtered.length > 0) return filtered;
      }

      throw new ProgressTemplateError(
        error.response?.data || 'Failed to fetch learning plan templates',
        error.response?.status
      );
    }
  }
};

export default progressTemplateService;
