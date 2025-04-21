import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Auth API
export const authAPI = {
  getLinkedInAuthUrl: async () => {
    const response = await api.get('/auth/linkedin/connect');
    return response.data.authUrl;
  },
  
  checkAuthStatus: async (userId: string) => {
    const response = await api.get(`/auth/status?userId=${userId}`);
    return response.data;
  },
};

// OpenAI API
export const openaiAPI = {
  generateText: async (data: {
    prompt: string;
    topic?: string;
    toneOfVoice?: string;
    contentType?: string;
    maxTokens?: number;
  }) => {
    const response = await api.post('/openai/generate-text', data);
    return response.data;
  },
  
  generateImage: async (data: {
    prompt: string;
    n?: number;
    size?: string;
  }) => {
    const response = await api.post('/openai/generate-image', data);
    return response.data;
  },
};

export const userAPI = {
  getUserById: async (userId: string) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },
};

// LinkedIn API
export const linkedinAPI = {
  postContent: async (data: {
    userId: string;
    text: string;
    imageUrl?: string;
    scheduleTime?: string;
  }) => {
    console.log('Posting to LinkedIn:', data);
    const response = await api.post('/linkedin/post', data);
    return response.data;
  },
  
  getScheduledPosts: async (userId: string) => {
    const response = await api.get(`/linkedin/scheduled?userId=${userId}`);
    return response.data;
  },
  
  cancelScheduledPost: async (postId: string, userId: string) => {
    const response = await api.delete(`/linkedin/scheduled/${postId}?userId=${userId}`);
    return response.data;
  },
};

export default api;