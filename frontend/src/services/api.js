const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Récupérer le token JWT du localStorage
const getToken = () => localStorage.getItem('token');

// Sauvegarder le token JWT
const setToken = (token) => localStorage.setItem('token', token);

// Supprimer le token JWT
const removeToken = () => localStorage.removeItem('token');

// Sauvegarder les données utilisateur
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Récupérer les données utilisateur
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Supprimer les données utilisateur
const removeUser = () => localStorage.removeItem('user');

// Fonction de base pour les requêtes API
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }

  return data;
};

// ============ AUTH API ============

export const authAPI = {
  // Inscription
  register: async (name, email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
    }

    return data;
  },

  // Connexion
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
    }

    return data;
  },

  // Déconnexion
  logout: () => {
    removeToken();
    removeUser();
  },

  // Récupérer le profil
  getProfile: async () => {
    return await apiRequest('/auth/me');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!getToken();
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: () => {
    return getUser();
  },
};

// ============ SPAM API ============

export const spamAPI = {
  // Analyser un texte
  analyze: async (text) => {
    return await apiRequest('/spam/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Récupérer l'historique
  getHistory: async (page = 1, perPage = 20) => {
    return await apiRequest(`/spam/history?page=${page}&per_page=${perPage}`);
  },

  // Récupérer une analyse spécifique
  getAnalysis: async (id) => {
    return await apiRequest(`/spam/history/${id}`);
  },

  // Supprimer une analyse
  deleteAnalysis: async (id) => {
    return await apiRequest(`/spam/history/${id}`, {
      method: 'DELETE',
    });
  },

  // Effacer tout l'historique
  clearHistory: async () => {
    return await apiRequest('/spam/history/clear', {
      method: 'DELETE',
    });
  },

  // Récupérer les statistiques
  getStats: async () => {
    return await apiRequest('/spam/stats');
  },
};

// ============ HEALTH CHECK ============

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  auth: authAPI,
  spam: spamAPI,
  healthCheck,
};
