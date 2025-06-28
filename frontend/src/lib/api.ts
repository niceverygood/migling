import axios from 'axios';

// 환경별 API URL 자동 설정
const API_BASE_URL = (() => {
  // 운영 환경에서는 환경변수 우선, 없으면 배포된 백엔드 URL 사용
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || 'http://52.63.124.130:3001';
  }
  // 개발 환경에서는 로컬 백엔드 사용
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';
})();

console.log('🌐 API Base URL:', API_BASE_URL, '| Environment:', import.meta.env.MODE);

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
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  // Send Firebase user info to backend to get JWT token
  loginWithFirebase: async (firebaseUser: any) => {
    const { data } = await api.post('/api/auth/firebase', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    return data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const { data } = await api.get('/api/auth/me');
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
  // Get all characters with optional filters
  getAllCharacters: async (filters?: {
    category?: string;
    gender?: string;
    user_id?: number;
    is_private?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.is_private !== undefined) params.append('is_private', filters.is_private.toString());
    
    const url = `/api/characters${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await api.get(url);
    return data;
  },

  // Create new character with full form data
  createCharacter: async (characterData: {
    name: string;
    description?: string;
    personality?: string;
    avatar_url?: string;
    age?: number | null;
    occupation?: string;
    one_liner?: string;
    category?: string;
    gender?: 'male' | 'female' | 'unspecified';
    background_info?: string;
    habits?: string;
    hashtags?: string[];
    first_scene_setting?: string;
    chat_ending?: string;
    is_private?: boolean;
    chat_room_code?: string;
  }) => {
    const { data } = await api.post('/api/characters', characterData);
    return data;
  },

  // Get character by ID
  getCharacter: async (id: string) => {
    const { data } = await api.get(`/api/characters/${id}`);
    return data;
  },

  // Chat with character (with persona and affection)
  chatWithCharacter: async (id: string, message: string, personaId?: number) => {
    const { data } = await api.post(`/api/characters/${id}/chat`, { 
      message, 
      personaId 
    });
    return data;
  },

  // Get affection between persona and character
  getAffection: async (characterId: string, personaId: number) => {
    const { data } = await api.get(`/api/characters/${characterId}/affection/${personaId}`);
    return data;
  },

  // Get chat history between persona and character
  getChatHistory: async (characterId: string, personaId: number, limit = 50) => {
    const { data } = await api.get(`/api/characters/${characterId}/history/${personaId}?limit=${limit}`);
    return data;
  },
};

export const personaAPI = {
  // Get all personas for current user
  getAllPersonas: async () => {
    const { data } = await api.get('/api/personas');
    return data;
  },

  // Get or create default persona
  getDefaultPersona: async () => {
    const { data } = await api.get('/api/personas/default');
    return data;
  },

  // Create new persona
  createPersona: async (personaData: any) => {
    const { data } = await api.post('/api/personas', personaData);
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

export const uploadAPI = {
  // Upload avatar image
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const { data } = await api.post('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Delete avatar image
  deleteAvatar: async (filename: string) => {
    const { data } = await api.delete(`/api/upload/avatar/${filename}`);
    return data;
  }
}; 