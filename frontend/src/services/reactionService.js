import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reactions';

// Get auth headers like other services
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? { 'Authorization': `Bearer ${user.token}` } : {};
};

// Add axios interceptor for logging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

export const reactionService = {
    testConnection: async () => {
        try {
            const response = await axios.get(`${API_URL}/test`, {
                headers: getAuthHeaders()
            });
            console.log('Test connection response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Test connection error:', error);
            throw error;
        }
    },

    addReaction: async (contentType, contentId, userId, reactionType) => {
        try {
            console.log('Adding reaction:', { contentType, contentId, userId, reactionType });
            const response = await axios.post(`${API_URL}/${contentType}/${contentId}`, null, {
                params: { userId, reactionType },
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error adding reaction:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            throw error;
        }
    },

    getReactionCounts: async (contentType, contentId) => {
        try {
            console.log('Getting reaction counts:', { contentType, contentId });
            const response = await axios.get(`${API_URL}/${contentType}/${contentId}`, {
                headers: getAuthHeaders()
            });
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
            const response = await axios.get(`${API_URL}/user/${contentType}/${contentId}`, {
                params: { userId },
                headers: getAuthHeaders()
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

    removeReaction: async (contentType, contentId, userId) => {
        try {
            console.log('Removing reaction:', { contentType, contentId, userId });
            await axios.delete(`${API_URL}/${contentType}/${contentId}`, {
                params: { userId },
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Error removing reaction:', error.message);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Unable to connect to the server. Please make sure the backend is running.');
            }
            throw error;
        }
    }
}; 