const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'apiUrl('';

export const apiUrl = (endpoint) => `${API_BASE}${endpoint}`;

export default API_BASE;
