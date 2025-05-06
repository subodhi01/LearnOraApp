import axios from 'axios';

const API_URL = '/api/progress-templates';

const progressTemplateService = {
    // Create a new progress template
    createTemplate: async (templateData) => {
        try {
            const response = await axios.post(API_URL, templateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing template
    updateTemplate: async (id, templateData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, templateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a template
    deleteTemplate: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all templates for a user
    getUserTemplates: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get template for specific user and course
    getTemplateByUserAndCourse: async (userId, courseId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}/course/${courseId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default progressTemplateService; 