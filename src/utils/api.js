const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

export const apiUrl = () => API_BASE;

export default API_BASE;