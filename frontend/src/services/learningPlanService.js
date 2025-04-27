import axios from 'axios';

const API_URL = 'http://localhost:8000/api/learning-plans';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Add timestamp to prevent caching
        if (config.method === 'get') {
            config.params = { ...config.params, _t: new Date().getTime() };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request Error:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

const learningPlanService = {
    getAllLearningPlans: async () => {
        try {
            const response = await api.get('/');
            return response.data;
        } catch (error) {
            console.error('Error fetching learning plans:', error);
            throw error;
        }
    },

    getLearningPlanById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching learning plan ${id}:`, error);
            throw error;
        }
    },

    getLearningPlansByUser: async (userId) => {
        try {
            const response = await api.get(`/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching learning plans for user ${userId}:`, error);
            throw error;
        }
    },

    getPublicLearningPlans: async () => {
        try {
            const response = await api.get('/public');
            return response.data;
        } catch (error) {
            console.error('Error fetching public learning plans:', error);
            throw error;
        }
    },

    getTopRatedPublicPlans: async () => {
        try {
            const response = await api.get('/top-rated');
            return response.data;
        } catch (error) {
            console.error('Error fetching top rated learning plans:', error);
            throw error;
        }
    },

    createLearningPlan: async (learningPlan) => {
        try {
            const formattedPlan = {
                ...learningPlan,
                topics: Array.isArray(learningPlan.topics) ? learningPlan.topics : [],
                resources: Array.isArray(learningPlan.resources) ? learningPlan.resources : [],
                expectedCompletionDate: learningPlan.expectedCompletionDate || null,
                isPublic: learningPlan.isPublic || false,
                rating: 0,
                totalRatings: 0
            };
            const response = await api.post('/', formattedPlan);
            return response.data;
        } catch (error) {
            console.error('Error creating learning plan:', error);
            throw error;
        }
    },

    updateLearningPlan: async (id, learningPlan) => {
        try {
            const formattedPlan = {
                ...learningPlan,
                topics: Array.isArray(learningPlan.topics) ? learningPlan.topics : [],
                resources: Array.isArray(learningPlan.resources) ? learningPlan.resources : [],
                expectedCompletionDate: learningPlan.expectedCompletionDate || null,
                isPublic: learningPlan.isPublic || false
            };
            const response = await api.put(`/${id}`, formattedPlan);
            return response.data;
        } catch (error) {
            console.error(`Error updating learning plan ${id}:`, error);
            throw error;
        }
    },

    deleteLearningPlan: async (id) => {
        try {
            await api.delete(`/${id}`);
        } catch (error) {
            console.error(`Error deleting learning plan ${id}:`, error);
            throw error;
        }
    },

    rateLearningPlan: async (id, rating) => {
        try {
            const response = await api.post(`/${id}/rate`, null, {
                params: { rating }
            });
            return response.data;
        } catch (error) {
            console.error(`Error rating learning plan ${id}:`, error);
            throw error;
        }
    },

    searchLearningPlans: async (query) => {
        try {
            const response = await api.get('/search', {
                params: { query }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching learning plans:', error);
            throw error;
        }
    }
};

export default learningPlanService; 