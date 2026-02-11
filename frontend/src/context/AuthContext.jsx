import { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = AuthService.getCurrentUser();
        if (u) {
            setUser(u);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Decode token or fetch user details if needed. For now, simple user object
                const userData = { email }; // In real app, decode JWT or fetch /me
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
        return false;
    };

    const register = async (userData) => {
        try {
            const response = await AuthService.register(userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                const user = { email: userData.email, name: `${userData.firstname} ${userData.lastname}` };
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return true;
            }
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
        return false;
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
