const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

export const apiUrl = (endpoint) => `${API_BASE}${endpoint}`;

export default API_BASE;