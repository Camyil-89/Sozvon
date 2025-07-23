// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // <-- Добавлено здесь

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth', { withCredentials: true });
            if (response.status == 200) {
                setIsAuthenticated(true);
                setUser(response.data);
            }

        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth(); // Только один раз при загрузке приложения
    }, []);

    const login = async (credentials) => {
        try {
            // При логине устанавливаем куку через бэкенд
            const response = await axios.post('/api/auth/login', credentials, {
                withCredentials: true // Важно для работы с куками
            });
            setIsAuthenticated(true);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            // Вызываем эндпоинт для очистки куки
            await axios.get('/api/auth/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);