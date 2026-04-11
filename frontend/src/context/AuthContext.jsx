import { createContext, useState } from 'react';
import AuthService from '../services/auth.service';

// eslint-disable-next-line react-refresh/only-export-components -- context + provider stay together for this app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return AuthService.getCurrentUser() ?? null;
        } catch {
            return null;
        }
    });
    const [loading] = useState(false);

    const login = async (email, password) => {
        try {
            console.log("Starting login for:", email);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            const response = await AuthService.login(email, password);
            console.log("Login response received:", response.status);
            
            if (response.data.token) {
                console.log("Token found, fetching profile...");
                localStorage.setItem('token', response.data.token);
                
                const userResponse = await AuthService.getProfile();
                console.log("Profile response received:", userResponse.data);
                
                if (!userResponse.data || !userResponse.data.id) {
                    console.error("CRITICAL: User ID is missing in profile response!", userResponse.data);
                }
                
                localStorage.setItem('user', JSON.stringify(userResponse.data));
                setUser(userResponse.data);
                return true;
            }
        } catch (error) {
            console.error("Login failed at AuthContext level:", error);
            console.error("Error details:", error.response?.data || error.message);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
        return false;
    };

    const register = async (userData) => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const response = await AuthService.register(userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                const userResponse = await AuthService.getProfile();
                console.log("Profile fetched:", userResponse.data);
                localStorage.setItem('user', JSON.stringify(userResponse.data));
                setUser(userResponse.data);
                return true;
            }
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
        return false;
    };

    const refreshUser = async () => {
        try {
            const userResponse = await AuthService.getProfile();
            localStorage.setItem('user', JSON.stringify(userResponse.data));
            setUser(userResponse.data);
        } catch (error) {
            console.error("Failed to refresh user profile", error);
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
