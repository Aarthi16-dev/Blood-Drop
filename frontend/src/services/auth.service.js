import api from './api';

const login = (email, password) => {
    return api.post('/auth/authenticate', { email, password });
};

const register = (userData) => {
    return api.post('/auth/register', userData);
};

const getProfile = () => {
    return api.get('/auth/me');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export default {
    login,
    register,
    getProfile,
    getCurrentUser,
    logout,
};
