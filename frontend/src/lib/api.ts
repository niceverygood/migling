import axios from 'axios';

const API_BASE_URL = 'http://52.63.124.130:3001';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setAuthToken = (token: string) => {
  localStorage.setItem('mingling_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('mingling_token');
  delete api.defaults.headers.common['Authorization'];
};

export const getStoredToken = () => {
  return localStorage.getItem('mingling_token');
};

// Initialize token from localStorage
const storedToken = getStoredToken();
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  // Send Firebase user info to backend to get JWT token
  loginWithFirebase: async (firebaseUser: any) => {
    const { data } = await api.post('/auth/firebase', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    return data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/user/profile', profileData);
    return data;
  },
};

export const characterAPI = {
  // Get user's characters
  getMyCharacters: async () => {
    const { data } = await api.get('/characters/my');
    return data;
  },

  // Create new character
  createCharacter: async (characterData: any) => {
    const { data } = await api.post('/characters', characterData);
    return data;
  },

  // Get character by ID
  getCharacter: async (id: string) => {
    const { data } = await api.get(`/characters/${id}`);
    return data;
  },
};

export const chatAPI = {
  // Get chat rooms
  getChatRooms: async () => {
    const { data } = await api.get('/chat/rooms');
    return data;
  },

  // Send message
  sendMessage: async (roomId: string, message: string) => {
    const { data } = await api.post(`/chat/rooms/${roomId}/messages`, { message });
    return data;
  },

  // Get messages
  getMessages: async (roomId: string) => {
    const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
    return data;
  },
}; 