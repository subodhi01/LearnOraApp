import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reactions';

// Get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? { 'Authorization': `Bearer ${user.token}` } : {};
};

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const headers = getAuthHeaders();
        config.headers = { ...config.headers, ...headers };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.error('Authentication failed. Please check if you are logged in.');
        }
        return Promise.reject(error);
    }
);

export const reactionService = {
    testConnection: async () => {
        try {
            const response = await api.get('/test');
            console.log('Test connection response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Test connection error:', error);
            throw error;
        }
    },

    addReaction: async (contentType, contentId, userId, reactionType, username) => {
        try {
            console.log('Adding reaction:', { contentType, contentId, userId, reactionType, username });
            const response = await api.post(`/${contentType}/${contentId}`, null, {
                params: { userId, reactionType, username }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding reaction:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            throw new Error(error.response?.data?.message || 'Failed to add reaction');
        }
    },

    getReactionCounts: async (contentType, contentId) => {
        try {
            console.log('Getting reaction counts:', { contentType, contentId });
            const response = await api.get(`/${contentType}/${contentId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting reaction counts:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            return { likes: 0, dislikes: 0 }; // Return default values on error
        }
    },

    getUserReaction: async (contentType, contentId, userId) => {
        try {
            console.log('Getting user reaction:', { contentType, contentId, userId });
            const response = await api.get(`/user/${contentType}/${contentId}`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting user reaction:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            return null; // Return null on error
        }
    },

    removeReaction: async (contentType, contentId, userId, username) => {
        try {
            console.log('Removing reaction:', { contentType, contentId, userId, username });
            await api.delete(`/${contentType}/${contentId}`, {
                params: { userId, username }
            });
        } catch (error) {
            console.error('Error removing reaction:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            throw new Error(error.response?.data?.message || 'Failed to remove reaction');
        }
    }
}; 